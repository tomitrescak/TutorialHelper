import ExerciseView from '../components/exercise_edit_view';
import { connect, loadingContainer } from 'apollo-mantra';
import * as actions from '../actions/exercise_actions';
import { Random } from 'meteor/random';
const mapQueriesToProps = (context, { state, ownProps }) => {
    console.log('Exercise container ...');
    return {
        data: {
            query: gql `
      query exercise($exerciseId: String, $userId: String) {
        exercise(id: $exerciseId, userId: $userId) {
          _id
          name
          instructions
          questions {
            _id
            description
            question
            expectedAnswer
            validation
            control
            points
            possibilities {
              question
              answer
            }
          }
        }
      }

    `,
            variables: {
                exerciseId: ownProps.params.exerciseId,
                userId: state.accounts.userId
            }
        },
    };
};
const mapMutationsToProps = (context, { state, ownProps }) => ({
    save: (exerciseId) => ({
        mutation: gql `
        mutation save($exercise: ExerciseInput!) {
          save(exercise: $exercise) 
        }
      `,
        variables: {
            exercise: context.Store.getState().exercise.exercises[exerciseId]
        },
    }),
});
const mapStateToProps = (context, state, ownProps) => ({
    context,
    userId: state.accounts.userId,
    exercise: state.exercise.exercises[ownProps.params.exerciseId]
});
const mapDispatchToProps = (context, dispatch, ownProps) => ({
    insertQuestion() {
        dispatch(actions.insertQuestion(ownProps.params.exerciseId, Random.id()));
    }
});
export default connect({ mapQueriesToProps, mapMutationsToProps, mapStateToProps, mapDispatchToProps })(loadingContainer(ExerciseView));
