import Component from '../components/marking_question_view';
import { connect } from 'apollo-mantra';
const mapStateToProps = (context, state, ownProps) => ({
    stored: state.solution.solutions[ownProps.solution._id]
});
export default connect({ mapStateToProps })(Component);
