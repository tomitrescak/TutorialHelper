import PracticalView from './practical_view';
import { connect, loadingContainer } from 'apollo-mantra';
const mapQueriesToProps = (context, { state, ownProps }) => ({
    data: {
        query: gql `
      query practical($id: String, $userId: String) {
        practical(id: $id, userId: $userId) {
          _id,
          name,
          description,
          exercises {
            _id,
            name
          }
        }
      }
    `,
        variables: {
            id: ownProps.params.practicalId,
            userId: state.accounts.userId
        }
    }
});
const mapStateToProps = (context, state) => ({
    context,
    user: state.accounts.user
});
export default connect({ mapQueriesToProps, mapStateToProps })(loadingContainer(PracticalView));
