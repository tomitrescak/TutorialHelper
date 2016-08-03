import ExerciseView from '../components/exercise_view';
import { connect } from 'apollo-mantra';
const mapQueriesToProps = (context, { state, ownProps }) => {
    console.log('Exercise container ...');
    return {
        data: {
            query: gql `
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
    };
};
const mapMutationsToProps = (context, { state, ownProps }) => ({
    answers: (solutionIds, userAnswers) => ({
        mutation: gql `
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
const mapStateToProps = (context, state) => ({
    context,
    userId: state.accounts.userId
});
export default connect({ mapQueriesToProps, mapMutationsToProps, mapStateToProps })(ExerciseView);
