import { reducer as accountsReducer } from 'meteor/tomi:accountsui-semanticui-redux';
const augmentation = function (defaultUser) {
    return {};
};
export default function reducer(state, action) {
    // augument user with system specific properties
    if (action.type === 'ACCOUNTS: Assign User') {
        action.user = Object.assign(action.user, augmentation(action.user));
    }
    return accountsReducer(state, action);
}
