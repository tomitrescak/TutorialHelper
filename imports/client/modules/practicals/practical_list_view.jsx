import * as React from 'react';
import { List, ListItem, Header2, Header3, Link, Segment } from 'semanticui-react';
let practical;
let index;
const PracticalListView = ({ practicals, context, semesterId }) => (<Segment>
    <Header2 dividing text="Practicals" icon="edit"/>
    <List divided>
      <For each="practical" of={practicals} index="index">
        <ListItem key={index}>
         <Header3><Link link={`practical/${context.Utils.Router.encodeUrlName(practical.name)}/${practical._id}/${semesterId}`} text={practical.name}/></Header3>
         <p>{practical.description}</p>
        </ListItem>
      </For>
    </List>
  </Segment>);
export default PracticalListView;
