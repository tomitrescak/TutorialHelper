import { connect } from 'apollo-mantra';
import Component from '../components/markdown_view';
const mapStateToProps = (context, state, ownProps) => ({
    html: context.Utils.Ui.parseMarkdown(ownProps.text)
});
export default connect({ mapStateToProps })(Component);
