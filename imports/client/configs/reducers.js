// here we import all reducers from modules
// this is the root for all reducers so that we can hot reload them
import apolloClient from './apollo';
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import accountsReducer from '../modules/user/actions/user_reducer';
import solutionReducer from '../modules/solution/actions/solution_reducer';
import exerciseReducer from '../modules/exercise/actions/exercise_reducer';
import markingReducer from '../modules/marking/actions/marking_reducer';
// import all other reducers
const rootReducer = combineReducers({
    accounts: accountsReducer,
    apollo: apolloClient.reducer(),
    routing: routerReducer,
    solution: solutionReducer,
    exercise: exerciseReducer,
    marking: markingReducer
});
export default rootReducer;
