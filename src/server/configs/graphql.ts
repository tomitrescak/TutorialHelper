import { createApolloServer } from 'meteor/apollo';
import { schemas, resolvers } from 'meteor/tomi:apollo-mantra';
import createSchemas from '../data/schemas/index';

declare global {
  namespace Apollo {
    export interface IApolloContext {
      user: Cs.Accounts.SystemUser;
      userId: string;
    }
  }
}

export default function() {
  createSchemas();

  console.log()

  // const schema = `{\n${schemas().join('').replace(/\\n/g, '\n')}\n}`;

  // let m = schema.split('\n');
  // let i = 0;
  // m = m.map((n) => i++ + ': ' + n);
  // console.log(m.join('\n'));


  createApolloServer({
    graphiql: true,
    pretty: true,
    schema: schemas(),
    resolvers: resolvers(),
  });
}
