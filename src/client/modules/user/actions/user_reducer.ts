import { Meteor } from 'meteor/meteor';
import { AccountsUiUser, reducer as accountsReducer } from 'meteor/tomi:accountsui-semanticui-redux';

import { IState as IAccountsState } from 'meteor/tomi:accountsui-semanticui-redux';
import store from '../../../configs/store';

declare global {
  namespace Cs.Accounts {
    interface SystemUser extends AccountsUiUser {
      profile: {
        name: string,
      };
    }
  }
}

const augmentation = function(defaultUser: Meteor.User) {
  return {
    // add actions and properties
  };
};

export default function reducer(state: IAccountsState<Cs.Accounts.SystemUser>, action: any) {
  // augument user with system specific properties
  if (action.type === 'ACCOUNTS: Assign User') {
    action.user = Object.assign(action.user, augmentation(action.user));
  }
  return accountsReducer(state, action);
}
