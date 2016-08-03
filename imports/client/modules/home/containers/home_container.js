import HomeView from '../components/home_view';
import { connect, loadingContainer } from 'apollo-mantra';
const mapQueriesToProps = (context, { state, ownProps }) => {
    console.log('Home container ...');
    return {
        data: {
            query: gql `
      query semesters($userId: String) {
        semesters(userId: $userId) {
          _id,
          name,
          practicals {
            _id
            name
            description
          }
        }
      }
    `,
            variables: {
                userId: state.accounts.user
            }
        }
    };
};
const mapStateToProps = (context, state) => ({
    context,
    user: state.accounts.user
});
export default connect({ mapQueriesToProps, mapStateToProps })(loadingContainer(HomeView));
//export default AuthContainer(HomeView); 
