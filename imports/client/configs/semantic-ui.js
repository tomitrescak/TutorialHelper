import * as React from 'react';
import { config } from 'semanticui-react';
import { Link } from 'react-router';
export default function () {
    config.linkElement = (props) => {
        let newProps = Object.assign({}, props, { to: props.href });
        return React.createElement(Link, newProps);
    };
}
