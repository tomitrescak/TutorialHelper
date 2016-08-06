import * as React from 'react';
import { Header2, Header5, TextArea, Input, Button, Segment, Grid, Column, Items, Item, List, ListItem, Divider, Label, Link, Message } from 'semanticui-react';

import * as actions from '../../solution/actions/solution_actions';
import MarkingQuestionView from '../containers/marking_question_container';

export interface IContainerProps {
  params: {
    name: string,
    userId: string,
    exerciseId: string,
    practicalId: string,
    semesterId: string,
  }
}


export interface IComponentProps {
  context: Cs.IContext;
  userId: string;
  showMarked: boolean;
  showPending: boolean;
  practicalData?: {
    practical: Cs.Entities.IPractical;
  },
  solutionData?: {
    markingSolutions: Cs.Collections.ISolutionDAO[];
    refetch: Function;
    loading: boolean;
  },
  mutations?: {
    markMutation(solutionIds: string[], comments: string[], marks: number[]): void;
  }
}
export interface IComponentActions {
  toggleMarked: Function;
  togglePending: Function;
}
export interface IComponent extends IContainerProps, IComponentProps, IComponentActions { }

let user: Cs.Entities.Group<Cs.Entities.ISolution>
let index: number;

const MarkingView = ({ context, params, showMarked, showPending, toggleMarked, togglePending,
  mutations: { markMutation },
  practicalData: { practical },
  solutionData, solutionData: { markingSolutions }}: IComponent) => {
  const groupBy = context.Utils.Class.groupByArray;
  let users = groupBy<Cs.Entities.ISolution>(markingSolutions, 'user');

  // sort by modification date
  users = users.sort((a, b) => {
    // find max date in a
    let aDate = 0;
    a.values.forEach((av) => aDate = ((av.modified && (aDate < av.modified)) ? av.modified : aDate));
    // find max date in b
    let bDate = 0;
    b.values.forEach((av) => bDate = ((av.modified && (bDate < av.modified)) ? av.modified : bDate));

    return aDate < bDate ? 1 : -1;
  })

  return (
    <Grid columns={2}>
      <Column width={10}>
        <Choose>
          <When condition={params.userId}>
            <MarkingExerciseView context={context}
              markMutation={markMutation}
              practical={practical}
              exerciseId={params.exerciseId}
              userSolutions={markingSolutions.filter((s) => s.userId === params.userId && s.exerciseId === params.exerciseId)} />
          </When>
          <Otherwise>
            <Message>Please select a user exercise</Message>
          </Otherwise>
        </Choose>
        <If condition={params.userId}></If>
      </Column>
      <Column width={6}>
        <div style={{ height: '30px'}}>
        <Button toggle={showMarked ? "active" : "inactive"} text="Show Marked" floated="right" onClick={toggleMarked} />
        <Button toggle={showPending ? "active" : "inactive"} text="Show Pending" floated="right" onClick={togglePending} />
        </div>
        <Items>
          <For each="user" of={users} index="index">
            <Item.Main key={user.key}>
              <ExercisesView userSolutions={user.values} 
                context={context} 
                practical={practical} 
                semesterId={params.semesterId} 
                userName={user.key} 
                showMarked={showMarked}
                showPending={showPending}
                />
            </Item.Main>
            <Divider />
          </For>
        </Items>
      </Column>
    </Grid>
  )
};

interface IMarkingExerciseView {
  context: Cs.IContext;
  userSolutions: Cs.Entities.ISolution[];
  practical: Cs.Entities.IPractical;
  exerciseId: string;
  markMutation: Function;
}

let solution: Cs.Entities.ISolution;

const MarkingExerciseView = ({ userSolutions, context, practical, exerciseId, markMutation }: IMarkingExerciseView) => {
  const exercise = practical.exercises.find((e) => e._id === exerciseId);
  const user = userSolutions[0].user;
  return (
    <div className="ui form">
      <Header2 text={`${user}: ${exercise.name}`} />
      <List>
        <For each="solution" of={userSolutions} index="index">
          <ListItem key={index}>
            <MarkingQuestionView context={context} solution={solution} question={exercise.questions.find((q) => q._id === solution.questionId)} />
          </ListItem>
        </For>
      </List>
      <Button text="Save Marks" icon="save" labeled="left"
        floated="right" color="primary"
        onClick={() => {
          var solutions = context.Store.getState().solution.solutions;

          const ids: string[] = [];
          const comments: string[] = [];
          const marks: number[] = [];

          userSolutions.forEach((s) => {
            ids.push(s._id);
            comments.push(solutions[s._id].tutorComment);
            marks.push(solutions[s._id].mark ? solutions[s._id].mark : 0);
          })

          markMutation(ids, comments, marks).then((result: any) => {
            if (result.errors) {
              alert(JSON.stringify(result.errors));
              console.error(result.errors);
              console.error(result.errors.stack);
            }
            if (result.data) {
              context.Utils.Ui.alert('Life is good!');
              // solutionData.refetch();
            };
          });
        } }
        />
    </div>
  )
}

interface IExercisesView {
  context: Cs.IContext;
  userSolutions: Cs.Entities.ISolution[];
  practical: Cs.Entities.IPractical;
  semesterId: string;
  userName: string;
  showMarked: boolean;
  showPending: boolean;
  
}

let exercise: Cs.Entities.Group<Cs.Entities.ISolution>;

const ExercisesView = ({userSolutions, userName, context, practical, semesterId, showMarked, showPending }: IExercisesView) => {
  let exercises = context.Utils.Class.groupByArray(userSolutions, 'exerciseId');
  if (!showMarked) {
    exercises = exercises.filter((e) => e.values.find((v) => v.mark == null));  
  }
  if (!showPending) {
    exercises = exercises.filter((e) => e.values.find((v) => v.finished));  
  }
  exercises = exercises.sort((a, b) => {
    const ea = practical.exercises.find((e) => e._id === a.key);
    const eb = practical.exercises.find((e) => e._id === b.key);
    return ea.name < eb.name ? -1 : 1
  });

  let total = 0;
  userSolutions.forEach((s) => total += s.mark ? s.mark : 0);
  total = Math.round(total / userSolutions.length);
  return (
    <Item.Content>
      <Item.Header>
        <Label color="blue" style={{marginRight: '12px'}}>{total}%</Label> 
        {userName} 
      </Item.Header>
      <Item.Description>
        <List>
          <For each="exercise" of={exercises} index="index">
            <ListItem key={index}>
              <ExerciseView userSolutions={exercise.values} context={context} practical={practical} exerciseId={exercise.key} semesterId={semesterId} />
            </ListItem>
          </For>
        </List>
      </Item.Description>
    </Item.Content>

  )
}


interface IExerciseView {
  context: Cs.IContext;
  semesterId: string;
  exerciseId: string;
  userSolutions: Cs.Entities.ISolution[];
  practical: Cs.Entities.IPractical;
}

const ExerciseView = ({userSolutions, context, practical, exerciseId, semesterId }: IExerciseView) => {
  const exercise = practical.exercises.find((e) => e._id === exerciseId);
  const finished = userSolutions.filter((s) => s.finished);
  let total = 0;
  userSolutions.forEach((s) => total += s.mark ? s.mark : 0);
  total = Math.round(total / userSolutions.length);

  return (
    <div>
      <Label color="blue">{total}%</Label>
      <Choose>
        <When condition={finished.length === userSolutions.length}>
          <Label color="green">Finished</Label>
        </When>
        <Otherwise>
          <Label color="orange">Pending</Label>
        </Otherwise>
      </Choose>
      <span style={{ marginLeft: '12px' }}>
        <Link link={`/marking/${context.Utils.Router.encodeUrlName(practical.name)}/${context.Utils.Router.encodeUrlName(userSolutions[0].user)}/${userSolutions[0].userId}/${exerciseId}/${practical._id}/${semesterId}`}>{exercise.name}</Link>
      </span>

    </div>
  )
}

export default MarkingView;