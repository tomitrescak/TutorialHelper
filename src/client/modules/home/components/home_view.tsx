import React from 'react';
import Helmet from 'react-helmet';

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Grid, Column, Segment, Image } from 'semanticui-react';

import jss from 'jss';

import { AccountsView } from 'meteor/tomi:accountsui-semanticui-redux';
import PracticalView from '../../practicals/practical_list_view';

// styles

const { classes } = jss.createStyleSheet({
  container: {
    'padding-bottom': '5rem',
    '& .information': {
      margin: '5em 1em 1em 0em'
    },
    '& h1': {
      'font-size': '3em!important',
      'margin-bottom': '1em!important'
    },
    '& .login': {
      'margin-top': '60px'
    }
  }
}).attach();

// component

interface IProps extends Cs.Accounts.IAuthContainerProps {
  context: Cs.IContext,
  data: {
    semesters: Cs.Collections.ISemester[]
  }
}

const Home = ({ user, data, context }: IProps) => (
  <div className={classes.container}>
    <Helmet title="Home" />
    <If condition={user}>
      <div>
        {/* LOGGED IN */}
        <If condition={data.semesters}>
          <Choose>
            <When condition={data.semesters.length > 1}>
              Many semesters ...
            </When>
            <Otherwise>
              <PracticalView context={context} semesterId={data.semesters[0]._id} practicals={data.semesters[0].practicals} />
            </Otherwise>
          </Choose>
        </If>
      </div>
      <Else />
      <Grid stackable columns={2}>
        <Column width={6} classes="computer only tablet only">
          Something
        </Column>
        <Column width={10}>
          <div id="login" className="ui login">
            <AccountsView />
          </div>
        </Column>
      </Grid>
    </If>
  </div>
);

export default Home;