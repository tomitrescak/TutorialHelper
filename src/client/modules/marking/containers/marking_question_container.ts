import Component, { IComponentProps, IContainerProps } from '../components/marking_question_view';
import { connect, loadingContainer } from 'apollo-mantra';

const mapStateToProps = (context: Cs.IContext, state: Cs.IState, ownProps: IContainerProps): IComponentProps => ({
  stored: state.solution.solutions[ownProps.solution._id]
});

export default connect<IContainerProps>({mapStateToProps})(Component);
