import { Meteor } from 'meteor/meteor';

// graphiql

import configGraphQL from './configs/graphql';
import accounts from './configs/accounts';
import fixtures from './data/fixtures';

configGraphQL();

accounts();
fixtures();