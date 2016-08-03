import { Accounts } from 'meteor/accounts-base';

export default function() {
  Accounts.config({
    sendVerificationEmail: false
  });
};
