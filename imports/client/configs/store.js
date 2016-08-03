import { createStore, compose, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';
import { browserHistory } from 'react-router';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from './reducers';
import client from './apollo';
// create an object for the default data
const defaultState = {};
// middlewares
const middleware = [
    reduxThunk,
    client.middleware(),
    routerMiddleware(browserHistory)
];
// redux tool
const enhancers = compose(applyMiddleware(...middleware), window['devToolsExtension'] ? window['devToolsExtension']() : f => f);
// initialise store
const store = createStore(rootReducer, defaultState, enhancers);
export default store;
// hot reload
if (module.hot) {
    module.hot.accept('./reducers', () => {
        const nextRootReducer = require('./reducers').default;
        store.replaceReducer(nextRootReducer);
    });
}
