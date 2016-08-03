import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { ioSchema } from 'meteor/tomi:apollo-mantra';

declare global {
  namespace Cs.Entities {
    interface ISolution {
      _id?: string;
      userId: string;
      semesterId: string;
      exerciseId: string;
      questionId: string;
      userQuestion?: string;
      expectedAnswer?: string;
      userAnswer?: string;
      userAnswerValid?: boolean;
      mark?: number;
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
  exercise(root: any, { id }: any, { user }: Apollo.IApolloContext): Cs.Collections.IExerciseDAO {
    if (!user) {
      return null;
    }
    return Exercises.findOne({ _id: id });
  },
  solutions(root: any, { semesterId, exerciseId }: any, { userId }: Apollo.IApolloContext): Cs.Collections.ISolutionDAO[] {
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

interface IActionAnswer {
  solutionIds: string[];
  userAnswers: string[];
}

interface IActionMark {
  solutionId: string;
  mark: number;
  userAnswerValid: boolean;
}

interface IActionSave {
  exercise: Cs.Entities.IExercise;
}

const mutations = {
  mark(root: any, { solutionId, mark, userAnswerValid}: IActionMark, { user, userId }: Apollo.IApolloContext) {
    // check for tutor
    if (!user.roles.find((r) => r === 'tutor')) {
      return;
    }

    Solutions.update({ _id: solutionId }, { $set: { mark, userAnswerValid } });
  },
  save(root: any, { exercise }: IActionSave, { user }: Apollo.IApolloContext) {
    if (!user.roles.find((r) => r === 'tutor')) {
      return;
    }

    console.log(JSON.stringify(exercise, null, 2));

    // first update the exercise 
    Exercises.update({_id: exercise._id}, { $set: {
      name: exercise.name,
      instruction: exercise.instructions,
      questions: exercise.questions.map((e) => e._id)
    }});

    // then update all questions
    for (let question of exercise.questions) {
      Questions.upsert({_id: question._id}, { $set: question });
    }
  },
  answers(root: any, { solutionIds, userAnswers}: IActionAnswer, { user, userId }: Apollo.IApolloContext): boolean[] {
    if (!solutionIds || !userAnswers || solutionIds.length !== userAnswers.length) {
      console.error('Unexpected input for "answers"');
      return;
    }

    let answers: boolean[] = [];

    for (let i = 0; i < solutionIds.length; i++) {
      const solutionId = solutionIds[i];
      const userAnswer = userAnswers[i].replace(/ /g, '').toLowerCase();

      const solution = Solutions.findOne({_id: solutionId, userId });
      if (!solution) {
        throw new Error('Access violation!');
      }
      const exercise = Exercises.findOne(solution.exerciseId);
      const question = Questions.findOne(solution.questionId);

      // we either have to check according to custom question (from possibilities) or default question (from question)
      let expectedAnswer: string = solution.expectedAnswer ? solution.expectedAnswer : question.expectedAnswer;
      let userAnswerValid: boolean = null;

      if (expectedAnswer) {
        // remove spacen and put all to lowercas
        expectedAnswer = expectedAnswer.replace(/ /g, '').toLowerCase();

        // question can contain a validation script
        // validation script returns function
        if (question.validation) {
          let validationText = `function (exercise, question, expectedAnswer, userAnswer) { ${question.validation} }`;
          let validation = eval(validationText);
          userAnswerValid = validation(exercise, question, expectedAnswer, userAnswer);
        } else {
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
    questions(exercise: Cs.Collections.IExerciseDAO, params: any, { user }: Apollo.IApolloContext): Cs.Collections.IQuestionDAO[] {
      let options = {};
      if (!user.roles || user.roles.indexOf('tutor') === -1) {
        options = { fields: { expectedAnswer: 0, validation: 0, possibilities: 0 } };
      }
      return Questions.find({ _id: { $in: exercise.questions } }, options).fetch();
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
