import MarkingView, { IContainerProps, IComponentActions, IComponentProps } from '../components/marking_view';
import { connect, loadingContainer } from 'apollo-mantra';
import * as actions from '../actions/marking_actions';

const mapQueriesToProps = (context: Cs.IContext, { state, ownProps }: Apollo.IGraphQlProps<IContainerProps>): Apollo.IGraphqlQuery => {
  return {
    practicalData: {
      query: gql`
      query practical($practicalId: String, $userId: String) {
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
      }
    `,
      variables: {
        practicalId: ownProps.params.practicalId,
        userId: state.accounts.userId,
      }
    },
    solutionData: {
      query: gql`
      query markingSolutions($practicalId: String, $semesterId: String, $userId: String) {
        markingSolutions(semesterId: $semesterId, practicalId: $practicalId, userId: $userId) {
          _id
          user
          userId
          questionId
          practicalId
          exerciseId
          userQuestion
          userAnswer
          tutorComment
          finished
          modified
          mark
        }
      }

    `,
      pollInterval: 10000,
      variables: {
        practicalId: ownProps.params.practicalId,
        semesterId: ownProps.params.semesterId,
        userId: state.accounts.userId,
      }
    }
  }
};

const mapMutationsToProps = (context: Cs.IContext, { state, ownProps }: Apollo.IGraphQlProps<IContainerProps>): IComponentMutations => ({
  markMutation: (solutionIds: string[], comments: string[], marks: number[]) => ({
    mutation: gql`
        mutation mark(
          $solutionIds: [String]!
          $comments: [String]!
          $marks: [Float]!
        ) {
          mark(
            solutionIds: $solutionIds
            comments: $comments
            marks: $marks
          ) 
        }
      `,
    variables: {
      solutionIds,
      comments,
      marks
    },
  }),
});

const mapStateToProps = (context: Cs.IContext, state: Cs.IState): IComponentProps => ({
  context,
  userId: state.accounts.userId,
  showMarked: state.marking.showMarked,
  showPending: state.marking.showPending
});

const mapDispatchToProps = (context: Cs.IContext, dispatch: Function): IComponentActions => ({
  toggleMarked() {
    dispatch(actions.toggleMarked());
  },
  togglePending() {
    dispatch(actions.togglePending());
  }
});


export default connect({ mapQueriesToProps, mapMutationsToProps, mapStateToProps, mapDispatchToProps })(loadingContainer(MarkingView, ['practicalData', 'solutionData']));
