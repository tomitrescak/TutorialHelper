import * as React from 'react';
import { List, ListItem, Header2, Header3, Segment, Link, Button } from 'semanticui-react';
let exercise;
let index;
const Practicals = ({ data: { practical }, context, params, user }) => (<Segment>
    <Choose>
      <When condition={user && practical}>
        <div>
          <If condition={user && user.isRole('tutor')}>
            <Button floated="right" text="Marking" icon="legal" labeled="left" url={`/marking/practical/${context.Utils.Router.encodeUrlName(practical.name)}/${params.practicalId}/${params.semesterId}`}/>
          </If>
          <Header2 dividing text={`Practical: ${practical.name}`} icon="edit"/>
          <p>
            {practical.description}
          </p>
          <List divided>
            <For each="exercise" of={practical.exercises.sort((a, b) => a.name > b.name ? 1 : -1)} index="index">
              <ListItem key={index}>
                <Header3><Link link={`/exercise/${context.Utils.Router.encodeUrlName(exercise.name)}/${exercise._id}/${params.practicalId}/${params.semesterId}`} text={exercise.name}/></Header3>
              </ListItem>
            </For>
          </List>
        </div>
      </When>
      <Otherwise>User Logged Out</Otherwise>
    </Choose>
  </Segment>);
export default Practicals;
