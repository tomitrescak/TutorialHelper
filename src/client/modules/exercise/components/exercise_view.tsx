import * as React from 'react';
import { Header2, Segment, Input, Button, Divider, Label } from 'semanticui-react';
import MarkdownView from '../../core/containers/markdown_container';
import SolutionView from '../../solution/containers/solution_container';
import Loading from '../../core/components/loading_view';

export interface IContainerProps {
  params: {
    name: string,
    exerciseId: string,
    semesterId: string
  }
}
export interface IComponentProps {
  context: Cs.IContext;
  userId: string;
  data?: {
    exercise: Cs.Collections.IExerciseDAO;
    solutions: Cs.Collections.ISolutionDAO[];
    refetch: Function;
    loading: boolean;
  }
}

export interface IComponentMutations {
  answers: (solutionIds: string[], userAnswers: string[]) => any;
}

interface IComponentActions { }
interface IComponent extends IContainerProps, IComponentProps, IComponentActions, Apollo.IComponentMutations<IComponentMutations> { }

let index: number = 0;
let question: Cs.Entities.IQuestion;

function readSolutions(store: Cs.IStore, ids: string[]): string[] {
  let state = store.getState();
  const result: string[] = [];
  for (let id of ids) {
    result.push(state.solution.solutions[id].userAnswer);
  }
  return result;
}

function readSolutionIds(solutions: Cs.Entities.ISolution[]): string[] {
  return solutions.map(s => s._id);
}

const ExerciseView = ({ context, params, userId, data, data: { exercise, solutions }, mutations: { answers }}: IComponent) => (
  <div>
    <Choose>
      <When condition={!exercise}>
        <Loading />
      </When>
      <Otherwise>
        <Segment>
          <Header2 dividing text={`${exercise.name}`} icon="edit" />
          <MarkdownView text={exercise.instructions} />

          <For each="question" of={exercise.questions} index="index">
            <SolutionView key={question._id} question={question} solutionId={solutions.find((s) => s.questionId === question._id)._id} />
          </For>
        </Segment>

        <Button color="primary" text="Submit" floated="right"
          onClick={() => {
            const ids = readSolutionIds(solutions);
            const userAnswers = readSolutions(context.Store, ids);

            answers(ids, userAnswers).then((result: any) => {
              if (result.errors) {
                alert(JSON.stringify(result.errors));
              }
              // if we have the data we want
              if (result.data) {
                data.refetch({ exerciseId: params.exerciseId, userId, semesterId: params.semesterId, });
              };
            });
          } } />
      </Otherwise>
    </Choose>
  </div>
);


export default ExerciseView;