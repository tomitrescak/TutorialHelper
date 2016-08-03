import ApolloClient from 'apollo-client';
import { meteorClientConfig } from 'meteor/apollo';

declare global {
  namespace Apollo {
    interface IGraphqlQuery {
      [name: string]: {
        query: any,
        forceFetch?: boolean,
        pollInterval?: number;
        variables?: Object
      };
    }

    interface IGraphQlProps<T> {
      state: Cs.IState;
      ownProps: T;
    }

    interface IComponentMutations<T> {
      mutations: T;
    }
  }
}

export const client = new ApolloClient(meteorClientConfig());

export default client;
