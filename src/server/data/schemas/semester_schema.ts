import { Mongo } from 'meteor/mongo';
import { Practicals } from './practical_schema';
declare global {
  namespace Cs.Collections {
    interface ISemesterDAO {
      _id?: string;
      name: string;
      practicals: string[];
    }

    interface ISemester {
      _id?: string;
      name: string;
      practicals: IPracticalDAO[];
    }
  }
}

export const Semesters = new Mongo.Collection<Cs.Collections.ISemesterDAO>('semesters');

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
  semester(root: any, { id }: any, { userId }: Apollo.IApolloContext): Cs.Collections.ISemesterDAO {
    // if (!userId) {
    //   return null;
    // }
    return Semesters.findOne({_id: id});
  },
  semesters(root: any, props: any, { userId }: Apollo.IApolloContext): Cs.Collections.ISemesterDAO[] {
    if (!userId) {
      return null;
    }
    return Semesters.find().fetch();
  }
}

const resolvers = {
  Semester: {
    practicals(semester: Cs.Collections.ISemesterDAO) {
      return Practicals.find({ _id: { $in: semester.practicals }}, { fields: { _id: 1, name: 1, description: 1 }}).fetch();
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