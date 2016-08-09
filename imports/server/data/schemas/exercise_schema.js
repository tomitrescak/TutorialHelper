import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { ioSchema } from 'apollo-mantra/server';
export const Exercises = new Mongo.Collection('exercises');
export const Questions = new Mongo.Collection('questions');
export const Possibilities = new Mongo.Collection('possibilities');
export const Solutions = new Mongo.Collection('solutions');
const schema = `
  ${ioSchema(`Exercise$Input {
    _id: String
    name: String
    instructions: String
    questions: [Question$Input]
  }`)}

  ${ioSchema(`Question$Input {
    _id: String
    description: String
    question: String
    expectedAnswer: String
    validation: String
    control: String
    possibilities: [Possibility$Input]
    points: Float
  }`)}

  ${ioSchema(`Possibility$Input {
    question: String
    answer: String
  }`)}

  type Solution {
    _id: String
    userId: String
    user: String
    semesterId: String
    practicalId: String
    exerciseId: String
    questionId: String
    userQuestion: String
    expectedAnswer: String
    userAnswer: String
    mark: Float
    created: Date
    modified: Date
    finished: Boolean
    tutorComment: String
  }
`;
const queryText = `
  exercise(id: String, userId: String): Exercise
  solutions(semesterId: String, practicalId: String, exerciseId: String, userId: String): [Solution]
  markingSolutions(semesterId: String, practicalId: String, lastModification: Date, userId: String): [Solution]
`;
const queries = {
    exercise(root, { id }, { user, userId }) {
        if (!user) {
            return null;
        }
        return Exercises.findOne({ _id: id });
    },
    markingSolutions(root, { semesterId, practicalId, lastModification }, { user }) {
        if (!user || user.roles.indexOf('tutor') === -1) {
            return [];
        }
        return Solutions.find({ semesterId, practicalId, modified: { $gt: lastModification } }).fetch();
    },
    solutions(root, { semesterId, practicalId, exerciseId }, { userId, user }) {
        if (!userId) {
            return [];
        }
        const options = { fields: { expectedAnswer: 0 } };
        let solutions = Solutions.find({ userId, semesterId, practicalId, exerciseId }, options).fetch();
        // if there are no attempted solutions pre create ones
        if (solutions.length === 0) {
            const exercise = Exercises.findOne({ _id: exerciseId });
            const questions = Questions.find({ _id: { $in: exercise.questions } }).fetch();
            const created = new Date();
            for (let question of questions) {
                // randomly choose an option
                let userQuestion = null;
                let expectedAnswer = null;
                if (question.possibilitiesGroupId) {
                    const group = Possibilities.findOne({ _id: question.possibilitiesGroupId });
                    const possibility = Random.choice(group.possibilities);
                    userQuestion = possibility.question;
                    expectedAnswer = possibility.answer;
                }
                const solution = {
                    userId: userId,
                    user: user.profile.name,
                    exerciseId: exerciseId,
                    questionId: question._id,
                    semesterId,
                    practicalId,
                    userQuestion,
                    expectedAnswer,
                    userAnswer: '',
                    created
                };
                Solutions.insert(solution);
            }
            // refetch data from db
            solutions = Solutions.find({ userId, semesterId, exerciseId }, options).fetch();
        }
        // return the user option, now for sure there are some
        return solutions;
    }
};
const mutationText = `
  answers(solutionIds: [String]!, userAnswers: [String]!, finished: Boolean): [Float]
  mark(solutionIds: [String]!, comments: [String]!, marks: [Float]!): Boolean
  save(exercise: ExerciseInput): Boolean
`;
const mutations = {
    mark(root, { solutionIds, comments, marks }, { user, userId }) {
        // check for tutor
        if (!user.roles.find((r) => r === 'tutor')) {
            return;
        }
        let total = 0;
        for (let i = 0; i < solutionIds.length; i++) {
            let cm = marks[i] ? marks[i] : 0;
            Solutions.update({ _id: solutionIds[i] }, {
                $set: {
                    mark: cm,
                    tutorComment: comments[i]
                }
            });
        }
    },
    save(root, { exercise }, { user }) {
        if (!user.roles.find((r) => r === 'tutor')) {
            return;
        }
        // first update the exercise 
        Exercises.update({ _id: exercise._id }, {
            $set: {
                name: exercise.name,
                instructions: exercise.instructions,
                questions: exercise.questions.map((e) => e._id)
            }
        });
        // then update all questions
        for (let question of exercise.questions) {
            Questions.upsert({ _id: question._id }, { $set: question });
        }
    },
    answers(root, { solutionIds, userAnswers, finished }, { user, userId }) {
        if (!solutionIds || !userAnswers || solutionIds.length !== userAnswers.length) {
            console.error('Unexpected input for "answers"');
            return;
        }
        try {
            let answers = [];
            const modified = new Date;
            for (let i = 0; i < solutionIds.length; i++) {
                const solutionId = solutionIds[i];
                const userAnswer = userAnswers[i]; // .replace(/ /g, '').toLowerCase();
                const solution = Solutions.findOne({ _id: solutionId, userId });
                if (!solution) {
                    throw new Error('Access violation!');
                }
                // const exercise = Exercises.findOne(solution.exerciseId);
                // const question = Questions.findOne(solution.questionId);
                // // we either have to check according to custom question (from possibilities) or default question (from question)
                // let expectedAnswer: string = solution.expectedAnswer ? solution.expectedAnswer : question.expectedAnswer;
                // let mark: number = null;
                // if (expectedAnswer) {
                //   // remove spacen and put all to lowercas
                //   expectedAnswer = expectedAnswer.replace(/ /g, '').toLowerCase();
                //   // question can contain a validation script
                //   // validation script returns function
                //   if (question.validation) {
                //     let validationText = `function (exercise, question, expectedAnswer, userAnswer) { ${question.validation} }`;
                //     let validation = eval(validationText);
                //     if (validation(exercise, question, expectedAnswer, userAnswer)) {
                //       mark = question.points;
                //     }
                //   } else {
                //     if (expectedAnswer && userAnswer) {
                //       mark = expectedAnswer === userAnswer ? question.points : 0;
                //     }
                //   }
                //}
                answers[i] = 0;
                console.log(userAnswer);
                Solutions.update({ _id: solution._id }, { $set: { userAnswer, finished, modified } });
            }
            return answers;
        }
        catch (ex) {
            console.log(ex.message);
            console.log(ex.stack);
        }
    }
};
const resolvers = {
    Exercise: {
        questions(exercise, params, { user }) {
            let options = {};
            if (!user.roles || user.roles.indexOf('tutor') === -1) {
                options = { fields: { expectedAnswer: 0, validation: 0, possibilities: 0 } };
            }
            return Questions.find({ _id: { $in: exercise.questions } }, options).fetch();
        }
    },
    Question: {
        possibilities(question) {
            if (question.possibilitiesGroupId) {
                return Possibilities.findOne({ _id: question.possibilitiesGroupId }).possibilities;
            }
            else {
                return null;
            }
        }
    }
};
const definition = {
    schema,
    resolvers,
    queries,
    queryText,
    mutationText,
    mutations
};
export default definition;
