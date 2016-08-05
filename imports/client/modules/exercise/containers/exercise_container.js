import ExerciseView from '../components/exercise_view';
import { connect } from 'apollo-mantra';
const mapQueriesToProps = (context, { state, ownProps }) => {
    return {
        data: {
            query: gql `
      query exercise($exerciseId: String, $practicalId: String, $semesterId: String, $userId: String) {
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

        solutions(semesterId: $semesterId, practicalId: $practicalId, exerciseId: $exerciseId) {
          _id
          questionId
          userQuestion
          userAnswer
          mark
        }
      }

    `,
            pollInterval: 5000,
            variables: {
                exerciseId: ownProps.params.exerciseId,
                userId: state.accounts.userId,
                semesterId: ownProps.params.semesterId,
                practicalId: ownProps.params.practicalId
            }
        },
    };
};
const mapMutationsToProps = (context, { state, ownProps }) => ({
    answers: (solutionIds, userAnswers) => ({
        mutation: gql `
        mutation answers($solutionIds: [String]!, $userAnswers: [String]!) {
          answers(solutionIds: $solutionIds, userAnswers: $userAnswers) 
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
    user: state.accounts.user,
    userId: state.accounts.userId,
});
const mapDispatchToProps = (context, dispatch, ownProps) => ({
    answer(answers, ids, userAnswers, data, submit) {
        answers(ids, userAnswers, submit).then((result) => {
            if (result.errors) {
                alert(JSON.stringify(result.errors));
                console.error(result.errors);
                console.error(result.errors.stack);
            }
            // if we have the data we want
            if (result.data) {
                let userId = context.Store.getState().accounts.userId;
                context.Utils.Ui.alert('Life is good!');
                data.refetch({ exerciseId: ownProps.params.exerciseId, userId, semesterId: ownProps.params.semesterId, });
            }
            ;
        });
    }
});
export default connect({ mapQueriesToProps, mapMutationsToProps, mapStateToProps, mapDispatchToProps })(ExerciseView);
