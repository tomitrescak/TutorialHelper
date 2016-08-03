import { Mongo } from 'meteor/mongo';
import { Practicals } from './practical_schema';
export const Semesters = new Mongo.Collection('semesters');
const schema = `
  type Semester {
    _id: String
    name: String
    practicals: [Practical]
  }
`;
const queryText = `
  semesters(userId: String): [Semester]
  semester(id: String): Semester
`;
const queries = {
    semester(root, { id }, { userId }) {
        if (!userId) {
            return null;
        }
        return Semesters.findOne({ _id: id });
    },
    semesters(root, props, { userId }) {
        if (!userId) {
            return null;
        }
        return Semesters.find().fetch();
    }
};
const resolvers = {
    Semester: {
        practicals(semester) {
            return Practicals.find({ _id: { $in: semester.practicals } }, { fields: { _id: 1, name: 1, description: 1 } }).fetch();
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
