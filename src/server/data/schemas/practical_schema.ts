import { Mongo } from 'meteor/mongo';
import { Exercises } from './exercise_schema';

declare global {
  namespace Cs.Collections {
    interface IPracticalEntity {
      _id?: string;
      name: string;
      description: string;
    }
    interface IPracticalDAO extends IPracticalEntity {
      
      exercises: string[];
    }

    interface IPractical extends IPracticalEntity {
      exercises: IExerciseDAO[];
    }
  }
}

export const Practicals = new Mongo.Collection<Cs.Collections.IPracticalDAO>('practicals');

const schema = `
  type Practical {
    _id: String
    name: String
    description: String
    exercises: [Exercise]
  }
`;

const queryText = `
  practical(id: String, userId: String): Practical
`;

const queries = {
  practical(root: any, { id }: any, { userId }: Apollo.IApolloContext): Cs.Collections.IPracticalDAO {
    if (!userId) {
      return;
    }
    return Practicals.findOne({_id: id});
  }
}

const resolvers = {
  Practical: {
    exercises(practical: Cs.Collections.IPracticalDAO) {
      return Exercises.find({_id: { $in: practical.exercises}}).fetch();
    }
  }
}

const definition: IApolloDefinition = {
  schema,
  resolvers,
  queries,
  queryText
}

export default definition;