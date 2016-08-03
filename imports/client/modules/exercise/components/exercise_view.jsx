import * as React from 'react';
import { Header2, Segment, Button } from 'semanticui-react';
import MarkdownView from '../../core/containers/markdown_container';
import SolutionView from '../../solution/containers/solution_container';
import Loading from '../../core/components/loading_view';
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
const ExerciseView = ({ context, params, userId, data, data: { exercise, solutions }, mutations: { answers } }) => (<div>
    <Choose>
      <When condition={!exercise}>
        <Loading />
      </When>
      <Otherwise>
        <Segment>
          <Header2 dividing text={`${exercise.name}`} icon="edit"/>
          <MarkdownView text={exercise.instructions}/>

          <For each="question" of={exercise.questions} index="index">
            <SolutionView key={question._id} question={question} solutionId={solutions.find((s) => s.questionId === question._id)._id}/>
          </For>
        </Segment>

        <Button color="primary" text="Submit" floated="right" onClick={() => {
    const ids = readSolutionIds(solutions);
    const userAnswers = readSolutions(context.Store, ids);
    answers(ids, userAnswers).then((result) => {
        if (result.errors) {
            alert(JSON.stringify(result.errors));
        }
        // if we have the data we want
        if (result.data) {
            data.refetch({ exerciseId: params.exerciseId, userId, semesterId: params.semesterId, });
        }
        ;
    });
}}/>
      </Otherwise>
    </Choose>
  </div>);
export default ExerciseView;
