import * as React from 'react';
import { List, ListItem, Header2, Header3, Segment, Link } from 'semanticui-react';

export interface IContainerProps { 
  params: {
    name: string,
    practicalId: string,
    semesterId: string
  }
}

interface IComponentProps { 
  context: Cs.IContext,
  data: {
    practical: Cs.Collections.IPractical
  }
}
interface IComponentActions { }
interface IComponent extends IContainerProps, IComponentProps, IComponentActions { }

let exercise: Cs.Collections.IExerciseDAO;
let index: number;

const Practicals = ({ data: { practical }, context, params}: IComponent) => (
  <Segment>
    <Header2 dividing text={`Practical: ${practical.name}`} icon="edit" />
    <p>
      { practical.description }
    </p>
    <List divided>
      <For each="exercise" of={practical.exercises} index="index">
        <ListItem key={index}>
         <Header3><Link link={`/exercise/${context.Utils.Router.encodeUrlName(exercise.name)}/${exercise._id}/${params.semesterId}`} text={exercise.name} /></Header3>
        </ListItem>
      </For>
    </List>
  </Segment>
);

export default Practicals;