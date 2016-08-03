import ExerciseView, { IContainerProps, IComponentMutations, IComponentProps } from '../components/exercise_view';
import { connect, loadingContainer } from 'apollo-mantra';

const mapQueriesToProps = (context: Cs.IContext, { state, ownProps }: Apollo.IGraphQlProps<IContainerProps>): Apollo.IGraphqlQuery => {
  console.log('Exercise container ...');
  return {
  data: {
    query: gql`
      query exercise($exerciseId: String, $semesterId: String, $userId: String) {
        exercise(id: $exerciseId, userId: $userId) {
          _id
          name
          instructions
          questions {
            _id
            description
            question
            control
            points
          }
        }

        solutions(semesterId: $semesterId, exerciseId: $exerciseId) {
          _id
          questionId
          userQuestion
          userAnswer
          userAnswerValid
          mark
        }
      }

    `,
    pollInterval: 5000,
    variables: {
      exerciseId: ownProps.params.exerciseId,
      userId: state.accounts.userId,
      semesterId: ownProps.params.semesterId,
    }
  },
}
};

const mapMutationsToProps = (context: Cs.IContext, { state, ownProps }: Apollo.IGraphQlProps<IContainerProps>): IComponentMutations => ({
  answers: (solutionIds: string[], userAnswers: string[]) => ({
    mutation: gql`
        mutation answers(
          $solutionIds: [String]!
          $userAnswers: [String]!
        ) {
          answers(
            solutionIds: $solutionIds
            userAnswers: $userAnswers
          ) 
        }
      `,
    variables: {
      solutionIds,
      userAnswers,
    },
  }),
});

const mapStateToProps = (context: Cs.IContext, state: Cs.IState): IComponentProps => ({
  context,
  userId: state.accounts.userId
});

export default connect({ mapQueriesToProps, mapMutationsToProps, mapStateToProps })(ExerciseView);