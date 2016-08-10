import { getQuery } from 'apollo-mantra';
import * as actions from './marking_actions';
import update from 'react-addons-update';
import { bindingReducer } from '../../../helpers/redux_binding';
const binder = bindingReducer(actions.UPDATE);
export default function reducer(state = { showMarked: false, showPending: false, solutions: [], current: null }, action) {
    // take care of binding calls
    const bindingResult = binder(state, action);
    if (bindingResult) {
        return bindingResult;
    }
    // take care of query copies
    switch (getQuery(action)) {
        case 'markingSolutions':
            const res = action.result.data.markingSolutions;
            const eliminateDuplicates = (s) => !res.find((r) => r._id === s._id);
            if (res && res.length) {
                let output = res.concat(state.solutions.filter(eliminateDuplicates));
                return update(state, { solutions: { $set: output } });
            }
            return state;
    }
    switch (action.type) {
        case actions.INIT:
            const act = {};
            action.solutions.forEach((s) => act[s._id] = s);
            return update(state, { current: { $set: act } });
        case actions.TOGGLE_MARKED:
            return update(state, { showMarked: { $set: !state.showMarked } });
        case actions.TOGGLE_PENDING:
            return update(state, { showPending: { $set: !state.showPending } });
        case actions.UPDATE_MARKS:
            // copy current into array
            let a = [];
            for (let id in state.current) {
                let mark = state.current[id].mark ? parseInt(state.current[id].mark.toString(), 10) : 0;
                state.current[id].mark = mark;
                a.push(state.current[id]);
            }
            // copy all other elements into array
            const eliminateDuplicates = (s) => !a.find((r) => r._id === s._id);
            let output = a.concat(state.solutions.filter(eliminateDuplicates));
            return update(state, { solutions: { $set: output } });
    }
    return state;
}
