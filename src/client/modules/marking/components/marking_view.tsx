import * as React from 'react';
import { Grid, Column, Items, Item, List, ListItem, Divider } from 'semanticui-react';

export interface IContainerProps {
  params: {
    name: string,
    practicalId: string,
    semesterId: string
  }
}


export interface IComponentProps {
  context: Cs.IContext;
  userId: string;
  data?: {
    practical: Cs.Entities.IPractical;
    markingSolutions: Cs.Collections.ISolutionDAO[];
    refetch: Function;
    loading: boolean;
  }
}
export interface IComponentActions { }
export interface IComponent extends IContainerProps, IComponentProps, IComponentActions { }

let user: Cs.Entities.Group<Cs.Entities.ISolution>
let index: number;

const MarkingView = ({ context, data: { markingSolutions, practical }}: IComponent) => {
  const groupBy = context.Utils.Class.groupByArray;
  const users = groupBy<Cs.Entities.ISolution>(markingSolutions, 'user');

  return (
    <Grid columns={2}>
      <Column width={10}>

      </Column>
      <Column width={6}>
        <Items>
          <For each="user" of={users} index="index">
            <Item.Main key={index}>
              <Item.Content>
                <Item.Header>{user.key}</Item.Header>
                <Item.Description>
                  <ExercisesView userSolutions={user.values} context={context} practical={practical} />
                </Item.Description>
              </Item.Content>
            </Item.Main>
            <Divider />
          </For>
        </Items>
      </Column>
    </Grid>
  )
};

interface IExercisesView {
  context: Cs.IContext;
  userSolutions: Cs.Entities.ISolution[];
  practical: Cs.Entities.IPractical;
}

let exercise: Cs.Entities.Group<Cs.Entities.ISolution>;

const ExercisesView = ({ userSolutions, context, practical }: IExercisesView) => {
  const exercises = context.Utils.Class.groupByArray(userSolutions, 'exerciseId');
  return (
    <List>
      <For each="exercise" of={exercises} index="index">
        <ListItem key={index}>
          <ExerciseView userSolutions={exercise.values} context={context} practical={practical} exerciseId={exercise.key} />
        </ListItem>
      </For>
    </List>
  )
}


interface IExerciseView {
  context: Cs.IContext;
  exerciseId: string;
  userSolutions: Cs.Entities.ISolution[];
  practical: Cs.Entities.IPractical;
}

const ExerciseView = ({ userSolutions, context, practical, exerciseId }: IExerciseView) => {
  const exercise = practical.exercises.find((e) => e._id === exerciseId);
  const marked = userSolutions.filter((s) => s.mark >= 0);
  
  return (
    <div>{exercise.name}</div>
  )
}

export default MarkingView;