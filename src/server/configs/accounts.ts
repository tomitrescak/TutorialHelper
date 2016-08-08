import { Accounts } from 'meteor/accounts-base';

Accounts.emailTemplates['resetPassword'].subject = () => '[SCEM] Computer Security Lab - Verification';
Accounts.emailTemplates['verifyEmail'].subject = () => '[SCEM] Computer Security Lab - Reset Password';

export default function() {

  Accounts.config({
    sendVerificationEmail: false
  });
};
