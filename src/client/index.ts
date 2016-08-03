import { createApp } from 'apollo-mantra';

import initJss from './configs/jss';
import initContext from './configs/context';
import initAccounts from './configs/accounts';
import initSemantic from './configs/semantic-ui';

import Loading from './modules/core/components/loading_view';
import client from './configs/apollo';
import initRouter from './configs/router';


// init context
const context = initContext();
const a = 1;
// create app and prepare context that will be injected in all other components
const app = createApp(context, { loadingComponent: Loading, apolloClient: client, store: context.Store });

// load module
// app.init();


// init app
initJss();
initAccounts();
initSemantic();
initRouter(null, context);
