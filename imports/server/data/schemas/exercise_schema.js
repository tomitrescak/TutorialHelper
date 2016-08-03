import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { ioSchema } from 'meteor/tomi:apollo-mantra';
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
    semesterId: String
    exerciseId: String
    questionId: String
    userQuestion: String
    expectedAnswer: String
    userAnswer: String
    userAnswerValid: Boolean
    mark: Float
  }
`;
const queryText = `
  exercise(id: String, userId: String): Exercise
  solutions(semesterId: String, exerciseId: String): [Solution]
`;
const queries = {
    exercise(root, { id }, { user }) {
        if (!user) {
            return null;
        }
        return Exercises.findOne({ _id: id });
    },
    solutions(root, { semesterId, exerciseId }, { userId }) {
        if (!userId) {
            return null;
        }
        const options = { fields: { expectedAnswer: 0 } };
        let solutions = Solutions.find({ userId, semesterId, exerciseId }, options).fetch();
        // if there are no attempted solutions pre create ones
        if (solutions.length === 0) {
            const exercise = Exercises.findOne({ _id: exerciseId });
            const questions = Questions.find({ _id: { $in: exercise.questions } }).fetch();
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
                    exerciseId: exerciseId,
                    questionId: question._id,
                    semesterId: semesterId,
                    userQuestion,
                    expectedAnswer,
                    userAnswer: '',
                    userAnswerValid: null
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
  answers(solutionIds: [String], userAnswers: [String]): [Boolean]
  mark(solutionId: String, mark: Float, answerValid: Boolean): Boolean
  save(exercise: ExerciseInput): Boolean
`;
const mutations = {
    mark(root, { solutionId, mark, userAnswerValid }, { user, userId }) {
        // check for tutor
        if (!user.roles.find((r) => r === 'tutor')) {
            return;
        }
        Solutions.update({ _id: solutionId }, { $set: { mark, userAnswerValid } });
    },
    save(root, { exercise }, { user }) {
        if (!user.roles.find((r) => r === 'tutor')) {
            return;
        }
        console.log(JSON.stringify(exercise, null, 2));
        // first update the exercise 
        Exercises.update({ _id: exercise._id }, { $set: {
                name: exercise.name,
                instruction: exercise.instructions,
                questions: exercise.questions.map((e) => e._id)
            } });
        // then update all questions
        for (let question of exercise.questions) {
            Questions.upsert({ _id: question._id }, { $set: question });
        }
    },
    answers(root, { solutionIds, userAnswers }, { user, userId }) {
        if (!solutionIds || !userAnswers || solutionIds.length !== userAnswers.length) {
            console.error('Unexpected input for "answers"');
            return;
        }
        let answers = [];
        for (let i = 0; i < solutionIds.length; i++) {
            const solutionId = solutionIds[i];
            const userAnswer = userAnswers[i].replace(/ /g, '').toLowerCase();
            const solution = Solutions.findOne({ _id: solutionId, userId });
            if (!solution) {
                throw new Error('Access violation!');
            }
            const exercise = Exercises.findOne(solution.exerciseId);
            const question = Questions.findOne(solution.questionId);
            // we either have to check according to custom question (from possibilities) or default question (from question)
            let expectedAnswer = solution.expectedAnswer ? solution.expectedAnswer : question.expectedAnswer;
            let userAnswerValid = null;
            if (expectedAnswer) {
                // remove spacen and put all to lowercas
                expectedAnswer = expectedAnswer.replace(/ /g, '').toLowerCase();
                // question can contain a validation script
                // validation script returns function
                if (question.validation) {
                    let validationText = `function (exercise, question, expectedAnswer, userAnswer) { ${question.validation} }`;
                    let validation = eval(validationText);
                    userAnswerValid = validation(exercise, question, expectedAnswer, userAnswer);
                }
                else {
                    userAnswerValid = expectedAnswer === userAnswer;
                }
            }
            answers[i] = userAnswerValid;
            Solutions.update({ _id: solution._id }, { $set: { userAnswer, userAnswerValid } });
        }
        return answers;
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
