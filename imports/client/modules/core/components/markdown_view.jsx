import React from 'react';
export default class Markdown extends React.Component {
    render() {
        return <span dangerouslySetInnerHTML={{ __html: this.props.html }}/>;
    }
}
