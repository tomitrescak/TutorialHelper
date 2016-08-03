import { getQuery, copyQuery } from 'apollo-mantra';
import { bindingReducer } from '../../../helpers/redux_binding';
import * as Actions from './questions_actions';
const binder = bindingReducer(Actions.UPDATE);
export default function reducer(state = { questions: {} }, action) {
    // take care of binding calls
    const bindingResult = binder(state, action);
    if (bindingResult) {
        return bindingResult;
    }
    // take care of query copies
    switch (getQuery(action)) {
        case 'exercise':
            return copyQuery(state, 'solutions', action.result.data.solutions);
    }
    return state;
}
