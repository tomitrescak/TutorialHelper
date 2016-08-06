import * as actions from './marking_actions';
import update from 'react-addons-update';
export default function reducer(state = { showMarked: false, showPending: false }, action) {
    switch (action.type) {
        case actions.TOGGLE_MARKED:
            return update(state, { showMarked: { $set: !state.showMarked } });
        case actions.TOGGLE_PENDING:
            return update(state, { showPending: { $set: !state.showPending } });
    }
    return state;
}
