import Layout from '../components/main_layout';
import { connect } from 'apollo-mantra';
const mapStateToProps = (context, state) => ({
    context: context,
    user: state.accounts.user,
    loggingIn: state.accounts.loggingIn
});
const depsToPropsMapper = (context) => ({
    context: context,
    store: context.Store,
});
export default connect({ mapStateToProps })(Layout);
