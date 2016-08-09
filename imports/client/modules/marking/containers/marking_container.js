import MarkingView from '../components/marking_view';
import { connect, loggerContainer } from 'apollo-mantra';
import * as actions from '../actions/marking_actions';
let date = new Date('1/1/1970');
function getLastModification() {
    let origDate = date;
    date = new Date();
    return origDate;
}
const mapQueriesToProps = (context, { state, ownProps }) => {
    return {
        practicalData: {
            query: gql `
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
            query: gql `
      query markingSolutions($practicalId: String, $semesterId: String, $lastModification: Date, $userId: String) {
        markingSolutions(semesterId: $semesterId, practicalId: $practicalId, lastModification: $lastModification, userId: $userId) {
          _id
          user
          userId
          questionId
          practicalId
          semesterId
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
            //pollInterval: 10000,
            variables: {
                practicalId: ownProps.params.practicalId,
                semesterId: ownProps.params.semesterId,
                userId: state.accounts.userId,
                lastModification: getLastModification()
            }
        }
    };
};
const mapMutationsToProps = (context, { state, ownProps }) => ({
    markMutation: (solutionIds, comments, marks) => ({
        mutation: gql `
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
const mapStateToProps = (context, state) => ({
    context,
    userId: state.accounts.userId,
    showMarked: state.marking.showMarked,
    showPending: state.marking.showPending,
    solutions: state.solution.solutions
});
const mapDispatchToProps = (context, dispatch) => {
    return {
        toggleMarked() {
            dispatch(actions.toggleMarked());
        },
        togglePending() {
            dispatch(actions.togglePending());
        }
    };
};
export default connect({ mapQueriesToProps, mapMutationsToProps, mapStateToProps, mapDispatchToProps })(loggerContainer(MarkingView, ['practicalData', 'solutionData']));
