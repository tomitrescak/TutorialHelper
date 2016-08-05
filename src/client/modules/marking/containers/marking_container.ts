import MarkingView, { IContainerProps, IComponentMutations, IComponentProps } from '../components/marking_view';
import { connect, loadingContainer } from 'apollo-mantra';

const mapQueriesToProps = (context: Cs.IContext, { state, ownProps }: Apollo.IGraphQlProps<IContainerProps>): Apollo.IGraphqlQuery => {
  console.log('Exercise container ...');
  return {
  data: {
    query: gql`
      query exercise($practicalId: String, $semesterId: String, $userId: String) {
        practical(id: $practicalId, userId: $userId) {
          _id,
          name,
          exercises {
            _id
            name
            instructions
            questions {
              _id
              question
              expectedAnswer
              points
            }
          }
        }

        markingSolutions(semesterId: $semesterId, practicalId: $practicalId) {
          _id
          user
          questionId
          practicalId
          exerciseId
          userQuestion
          userAnswer
          userAnswerValid
          mark
        }
      }

    `,
    pollInterval: 5000,
    variables: {
      practicalId: ownProps.params.practicalId,
      semesterId: ownProps.params.semesterId,
      userId: state.accounts.userId,
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

export default connect({ mapQueriesToProps, mapMutationsToProps, mapStateToProps })(loadingContainer(MarkingView));
