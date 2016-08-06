import * as actions from './marking_actions';
import update from 'react-addons-update';

export interface IMarkingState {
  showMarked: boolean;
  showPending: boolean;
}

export default function reducer(state: IMarkingState = { showMarked: false, showPending: false }, action: any) {
  switch (action.type) {
    case actions.TOGGLE_MARKED:
      return update(state, { showMarked: { $set: !state.showMarked } });
    case actions.TOGGLE_PENDING:
      return update(state, { showPending: { $set: !state.showPending } });
  }
  return state;
}
