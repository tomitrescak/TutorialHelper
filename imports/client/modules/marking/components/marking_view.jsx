import * as React from 'react';
import { Grid, Column, Items, Item, List, ListItem, Divider } from 'semanticui-react';
let user;
let index;
const MarkingView = ({ context, data: { markingSolutions, practical } }) => {
    const groupBy = context.Utils.Class.groupByArray;
    const users = groupBy(markingSolutions, 'user');
    return (<Grid columns={2}>
      <Column width={10}>

      </Column>
      <Column width={6}>
        <Items>
          <For each="user" of={users} index="index">
            <Item.Main key={index}>
              <Item.Content>
                <Item.Header>{user.key}</Item.Header>
                <Item.Description>
                  <ExercisesView userSolutions={user.values} context={context} practical={practical}/>
                </Item.Description>
              </Item.Content>
            </Item.Main>
            <Divider />
          </For>
        </Items>
      </Column>
    </Grid>);
};
let exercise;
const ExercisesView = ({ userSolutions, context, practical }) => {
    const exercises = context.Utils.Class.groupByArray(userSolutions, 'exerciseId');
    return (<List>
      <For each="exercise" of={exercises} index="index">
        <ListItem key={index}>
          <ExerciseView userSolutions={exercise.values} context={context} practical={practical} exerciseId={exercise.key}/>
        </ListItem>
      </For>
    </List>);
};
const ExerciseView = ({ userSolutions, context, practical, exerciseId }) => {
    const exercise = practical.exercises.find((e) => e._id === exerciseId);
    const marked = userSolutions.filter((s) => s.mark >= 0);
    return (<div>{exercise.name}</div>);
};
export default MarkingView;
