import Component from '../components/solution_view';
import { connect } from 'apollo-mantra';
const mapStateToProps = (context, state, ownProps) => ({
    solution: state.solution.solutions[ownProps.solutionId],
    context
});
export default connect({ mapStateToProps })(Component);
