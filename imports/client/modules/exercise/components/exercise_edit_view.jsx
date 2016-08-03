import * as React from 'react';
import { Header2, Segment, Input, Button, TextArea } from 'semanticui-react';
import QuestionEditView from './question_edit_view';
import Loading from '../../core/components/loading_view';
import * as actions from '../actions/exercise_actions';
let index = 0;
let question;
function readSolutions(store, ids) {
    let state = store.getState();
    const result = [];
    for (let id of ids) {
        result.push(state.solution.solutions[id].userAnswer);
    }
    return result;
}
function readSolutionIds(solutions) {
    return solutions.map(s => s._id);
}
const ExerciseView = ({ context, params, userId, data, mutations: { save }, exercise, insertQuestion }) => {
    const bind = context.Utils.Binding(actions.UPDATE, 'exercises.' + exercise._id);
    return (<div className="ui form">
    <Choose>
      <When condition={!exercise}>
        <Loading />
      </When>
      <Otherwise>
        <Segment>
          <Input label="Name" placeholder="Name" defaultValue={exercise.name} onChange={bind('name')}/>
          <TextArea defaultValue={exercise.instructions} label="Instructions" previewMarkdown={true} onChange={bind('instructions')}/>

          <For each="question" of={exercise.questions} index="index">
            <Header2 text={"Question: " + (index + 1)} attached="top"/>
            <Segment attached="bottom">
              <QuestionEditView key={question._id} question={question} bind={bind} index={index}/>
            </Segment>
          </For>
        </Segment>

        <Button color="primary" text="Submit" floated="right" onClick={() => {
        save(exercise._id).then((result) => {
            if (result.errors) {
                alert(JSON.stringify(result.errors));
            }
            // if we have the data we want
            if (result.data) {
                context.Utils.Ui.alert('Life is good!');
            }
            ;
        });
    }}/>

        <Button color="default" text="Insert Question" icon="plus" floated="right" onClick={insertQuestion}/>
      </Otherwise>
    </Choose>
  </div>);
};
export default ExerciseView;
