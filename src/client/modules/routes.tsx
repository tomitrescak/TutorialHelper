import React from 'react';
import {Router, Route, IndexRoute } from 'react-router';

// Layouts
import MainLayout from './layouts/containers/main_layout_container';

// Components
import HomePage from './home/containers/home_container';

import Practical from './practicals/practical_container';
import Exercise from './exercise/containers/exercise_container';
import ExerciseAdmin from './exercise/containers/exercise_edit_container';

const AppRoutes = ({ history, injectDeps }: any) => {
  // const MainLayoutCtx = injectDeps(MainLayout);
 
  return (
    <Router history={history}>
      <Route path="/" component={MainLayout}>
        <IndexRoute component={HomePage} />
        <Route path="practical/:name/:practicalId/:semesterId" component={Practical} />
        <Route path="exercise/:name/:exerciseId/:semesterId" component={Exercise} />
        <Route path="admin/exercise/:name/:exerciseId/:semesterId" component={ExerciseAdmin} />
      </Route>
    </Router>
  );
};

console.log('loading routes ...')

export default AppRoutes;