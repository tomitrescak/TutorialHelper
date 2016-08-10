import { getQuery, copyQuery } from 'apollo-mantra';
export default function reducer(state = { practicals: {} }, action) {
    Object.assign;
    // take care of query copies
    switch (getQuery(action)) {
        case 'practical':
            return copyQuery(state, 'practicals', action.result.data.practical);
    }
    return state;
}
