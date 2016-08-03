import React from "react";
import { Text } from 'semanticui-react';
import jss from 'jss';
export class EmptyLoading extends React.Component {
    render() {
        return (<span></span>);
    }
}
let { classes } = jss.createStyleSheet({
    content: {
        top: '50%',
        width: '300px',
        position: 'absolute',
        left: '50%',
        'margin-left': '-150px'
    }
}).attach();
export const CenteredLoading = ({ text }) => (<div id="editorLoader" className={classes.content}>
    <div className="ui segment">
      <div className="ui active small inline loader"></div>&nbsp; &nbsp; &nbsp; <Text text={text ? text : 'loading'}/>
    </div>
  </div>);
const Loading = ({ error }) => (<span>
    <div className="ui active small inline loader"></div>&nbsp; &nbsp; &nbsp; <Text text="Loading ..."/>
    {error && console.error(error)}
  </span>);
export default Loading;
// export default new Loading();
// export default function ComposeLoading(what: string) {
//   return () => <Loading what={what} />;
// }
