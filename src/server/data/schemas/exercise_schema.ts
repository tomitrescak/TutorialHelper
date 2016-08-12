import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { ioSchema } from 'apollo-mantra/server';

declare global {
  namespace Cs.Entities {
    interface ISolution {
      _id?: string;
      userId: string;
      user: string;
      semesterId: string;
      practicalId: string;
      exerciseId: string;
      questionId: string;
      userQuestion?: string;
      expectedAnswer?: string;
      userAnswer?: string;
      mark?: number;
      created?: Date;
      modified?: number;
      finished?: boolean;
      tutorComment?: string;
    }

    interface IQuestionPossibilities {
      _id?: string;
      possibilities: IQuestionPossibility[];
    }

    interface IQuestionPossibility {
      question: string;
      answer: string;
    }

    interface IQuestionBase {
      _id?: string;
      description?: string;
      question?: string;
      expectedAnswer?: string;
      control?: "input" | "textbox";
      validation?: string;
      points?: number;
    }

    interface IQuestion extends IQuestionBase {
      possibilities?: IQuestionPossibilities;
    }

    interface IExerciseBase {
      _id?: string;
      name: string;
      instructions: string;
      group?: string;
      points: number;
    }

    interface IExercise extends IExerciseBase {
      questions: IQuestion[];
    }
  }

  namespace Cs.Collections {
    interface IExerciseDAO extends Cs.Entities.IExerciseBase {
      questions: string[];
    }

    interface IQuestionDAO extends Cs.Entities.IQuestionBase {
      possibilitiesGroupId?: string;
    }

    interface IQuestionPossibilitiesDAO extends Cs.Entities.IQuestionPossibilities {
    }

    interface IQuestionPossibilityDAO extends Cs.Entities.IQuestionPossibility {
    }

    interface ISolutionDAO extends Cs.Entities.ISolution {
    }
  }
}

export const Exercises = new Mongo.Collection<Cs.Collections.IExerciseDAO>('exercises');
export const Questions = new Mongo.Collection<Cs.Collections.IQuestionDAO>('questions');
export const Possibilities = new Mongo.Collection<Cs.Collections.IQuestionPossibilitiesDAO>('possibilities');
export const Solutions = new Mongo.Collection<Cs.Collections.ISolutionDAO>('solutions');

const schema = `
  ${ioSchema(`Exercise$Input {
    _id: String
    name: String
    instructions: String
    group: String
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
  practicalSolutions(semesterId: String, practicalId: String, userId: String): [Solution]
  solutions(semesterId: String, practicalId: String, exerciseId: String, userId: String): [Solution]
  markingSolutions(semesterId: String, practicalId: String, lastModification: Date, userId: String): [Solution]
`;

const queries = {
  exercise(root: any, { id }: any, { user, userId }: Apollo.IApolloContext): Cs.Collections.IExerciseDAO {
    if (!user) {
      return null;
    }
    return Exercises.findOne({ _id: id });
  },
  markingSolutions(root: any, { semesterId, practicalId, lastModification }: any, { user }: Apollo.IApolloContext): Cs.Collections.ISolutionDAO[] {
    if (!user || user.roles.indexOf('tutor') === -1) {
      return [];
    }
    console.log(lastModification);
    return Solutions.find({ semesterId, practicalId, modified: { $gt: lastModification } }).fetch();
  },
  practicalSolutions(root: any, { semesterId, practicalId }: any, { userId, user }: Apollo.IApolloContext): Cs.Collections.ISolutionDAO[] {
    const options = { fields: { expectedAnswer: 0 } };
    return Solutions.find({ userId, semesterId, practicalId }, options).fetch();
  },
  solutions(root: any, { semesterId, practicalId, exerciseId }: any, { userId, user }: Apollo.IApolloContext): Cs.Collections.ISolutionDAO[] {
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
        let userQuestion: string = null;
        let expectedAnswer: string = null;
        if (question.possibilitiesGroupId) {
          const group = Possibilities.findOne({ _id: question.possibilitiesGroupId });
          const possibility = <Cs.Collections.IQuestionPossibilityDAO>Random.choice(group.possibilities);
          userQuestion = possibility.question;
          expectedAnswer = possibility.answer;
        }

        const solution: Cs.Collections.ISolutionDAO = {
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

interface IActionAnswer {
  solutionIds: string[];
  userAnswers: string[];
  finished: boolean;
}

interface IActionMark {
  solutionIds: string[];
  comments: string[];
  marks: number[];
}

interface IActionSave {
  exercise: Cs.Entities.IExercise;
}

const mutations = {
  mark(root: any, { solutionIds, comments, marks }: IActionMark, { user, userId }: Apollo.IApolloContext) {
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
  save(root: any, { exercise }: IActionSave, { user }: Apollo.IApolloContext) {
    if (!user.roles.find((r) => r === 'tutor')) {
      return;
    }

    // first update the exercise 
    Exercises.update({ _id: exercise._id }, {
      $set: {
        name: exercise.name,
        instructions: exercise.instructions,
        group: exercise.group,
        questions: exercise.questions.map((e) => e._id)
      }
    });

    // then update all questions
    for (let question of exercise.questions) {
      Questions.upsert({ _id: question._id }, { $set: question });
    }
  },
  answers(root: any, { solutionIds, userAnswers, finished }: IActionAnswer, { user, userId }: Apollo.IApolloContext): number[] {
    if (!solutionIds || !userAnswers || solutionIds.length !== userAnswers.length) {
      console.error('Unexpected input for "answers"');
      return;
    }

    try {
      let answers: number[] = [];
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
        console.log(userAnswer)
        Solutions.update({ _id: solution._id }, { $set: { userAnswer, finished, modified } });
      }
      return answers;
    } catch (ex) {
      console.log(ex.message);
      console.log(ex.stack);
    }
  }
};

const resolvers = {
  Exercise: {
    questions(exercise: Cs.Collections.IExerciseDAO, params: any, { user }: Apollo.IApolloContext): Cs.Collections.IQuestionDAO[] {
      let options = {};
      if (!user.roles || user.roles.indexOf('tutor') === -1) {
        options = { fields: { expectedAnswer: 0, validation: 0, possibilities: 0 } };
      }

      const questions = Questions.find({ _id: { $in: exercise.questions } }, options).fetch();
      const resultQuestions: Cs.Collections.IQuestionDAO[] = [];

      for (let i = 0; i < exercise.questions.length; i++) {
        const q = questions.find(q => q._id === exercise.questions[i]);
        console.log(exercise.questions[i]);
        console.log("Adding: " + q.question);
        resultQuestions.push(q);
      }
      return resultQuestions;
    }
  },
  Question: {
    possibilities(question: Cs.Collections.IQuestionDAO): Cs.Collections.IQuestionPossibilityDAO[] {
      if (question.possibilitiesGroupId) {
        return Possibilities.findOne({ _id: question.possibilitiesGroupId }).possibilities;
      } else {
        return null;
      }
    }
  }
};

const definition: IApolloDefinition = {
  schema,
  resolvers,
  queries,
  queryText,
  mutationText,
  mutations
};

export default definition;
