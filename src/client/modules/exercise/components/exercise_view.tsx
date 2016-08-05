import * as React from 'react';
import { Header2, Segment, Input, Button, Divider, Label } from 'semanticui-react';
import MarkdownView from '../../core/containers/markdown_container';
import SolutionView from '../../solution/containers/solution_container';
import Loading from '../../core/components/loading_view';

export interface IContainerProps {
  params: {
    name: string,
    exerciseId: string,
    semesterId: string,
    practicalId: string
  }
}
export interface IComponentProps {
  context: Cs.IContext;
  userId: string;
  user: Cs.Accounts.SystemUser;
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

interface IComponentActions { 
  answer(answers: Function, ids: String[], userAnswers: String[], data: any, submit: boolean): any;
}
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

const ExerciseView = ({ context, user, params, userId, data, data: { exercise, solutions }, answer, mutations: { answers }}: IComponent) => (
  <div>
    <Choose>
      <When condition={!exercise}>
        <Loading />
      </When>
      <Otherwise>

        <Segment>
          <If condition={user.isRole('tutor')}>
            <Button floated="right" color="orange" text="Modify" icon="edit" labeled="left" url={`/admin/exercise/${context.Utils.Router.encodeUrlName(exercise.name)}/${params.exerciseId}/${params.semesterId}`} />
          </If>
          <Button floated="right" color="default" text="Back to Practical" icon="arrow left" labeled="left" url={`/practical/1/${params.practicalId}/${params.semesterId}`} />
          <Header2 dividing text={`${exercise.name}`} icon="edit" />
          <MarkdownView text={exercise.instructions} />

          <For each="question" of={exercise.questions} index="index">
            <SolutionView key={question._id} question={question} solutionId={solutions.find((s) => s.questionId === question._id)._id} />
          </For>
        </Segment>

        <Button color="green" text="Submit to Tutor" floated="right"
          onClick={() => {
            const ids = readSolutionIds(solutions);
            const userAnswers = readSolutions(context.Store, ids);
            answer(answers, ids, userAnswers, data, true);
          } } />

        <Button color="primary" text="Submit" floated="right"
          onClick={() => {
            const ids = readSolutionIds(solutions);
            const userAnswers = readSolutions(context.Store, ids);
            answer(answers, ids, userAnswers, data, false);
          } } />
      </Otherwise>
    </Choose>
  </div>
);


export default ExerciseView;