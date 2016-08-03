import { Mongo } from 'meteor/mongo';
import { Exercises } from './exercise_schema';
export const Practicals = new Mongo.Collection('practicals');
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
    practical(root, { id }, { userId }) {
        if (!userId) {
            return;
        }
        return Practicals.findOne({ _id: id });
    }
};
const resolvers = {
    Practical: {
        exercises(practical) {
            return Exercises.find({ _id: { $in: practical.exercises } }).fetch();
        }
    }
};
const definition = {
    schema,
    resolvers,
    queries,
    queryText
};
export default definition;
