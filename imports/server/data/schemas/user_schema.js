import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
// only on server!!!
export let Secrets = new Mongo.Collection('secrets');
const queryText = `
  userSecret: String
`;
// const mutationText = `
// `
const schema = `
  type Subscription {
    scheduleId: String
    tutorId: String
    tutorName: String
  }
`;
const queries = {
    userSecret(root, params, { userId }) {
        if (!userId) {
            // check if the user has privileges
            throw new Meteor.Error('403', 'Not authorised! You need to be logged in!');
        }
        Secrets.remove({ user: userId });
        return Secrets.insert({ user: userId, date: new Date() });
    }
};
const mutations = {};
const defintion = {
    schema,
    //  mutations,
    //  mutationText,
    queryText,
    queries
};
export default defintion;
