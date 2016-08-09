import { getQuery, copyQuery } from 'apollo-mantra';
import * as actions from './marking_actions';
import update from 'react-addons-update';

export interface IMarkingState {
  showMarked: boolean;
  showPending: boolean;
  solutions: Cs.Entities.ISolution[]
}

export default function reducer(state: IMarkingState = { showMarked: false, showPending: false, solutions: [] }, action: any) {
  // take care of query copies
  switch (getQuery(action)) {
    case 'markingSolutions':
      return update(state, { solutions: { $set : action.result.data.markingSolutions }});
  }

  switch (action.type) {
    case actions.TOGGLE_MARKED:
      return update(state, { showMarked: { $set: !state.showMarked } });
    case actions.TOGGLE_PENDING:
      return update(state, { showPending: { $set: !state.showPending } });
  }
  return state;
}
