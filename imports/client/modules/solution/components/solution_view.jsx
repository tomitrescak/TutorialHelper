import * as React from 'react';
import { Input, Divider, Label } from 'semanticui-react';
import MarkdownView from '../../core/containers/markdown_container';
import jss from 'jss';
import * as SolutionActions from '../actions/solution_actions';
const { classes } = jss.createStyleSheet({
    textbox: {
        'margin-bottom': '12px!important'
    }
}).attach();
const SolutionView = ({ context, question, solution }) => {
    const bind = context.Utils.Binding(SolutionActions.UPDATE, 'solutions.' + solution._id);
    const questionText = solution.userQuestion ? solution.userQuestion : question.question;
    return (<div className="ui form">
      <Divider icon="game" orientation="horizontal"/>
      <p>
        <MarkdownView text={question.description}/>
      </p>
      <div className="field">
        <label>{questionText}</label>
        <Choose>
          <When condition={question.control === 'textarea'}>
            <textarea className={classes.textbox} rows="3" placeholder={questionText} defaultValue={solution.userAnswer} onChange={bind('userAnswer')}></textarea>
          </When>
          <Otherwise>
            <Input defaultValue={solution.userAnswer} placeholder={questionText} onChange={bind('userAnswer')}/>
          </Otherwise>
        </Choose>
        <If condition={solution.mark >= 0}>
          <Label color="blue" text={'Mark: ' + solution.mark}/>
        </If>
        <Choose>
          <When condition={solution.mark >= 0 && solution.userAnswerValid == null}>
            <Label color="orange" text={'Satisfying Answer'}/>
          </When>
          <When condition={solution.userAnswerValid === true}>
            <Label color="green" text="Correct"/>
          </When>
          <When condition={solution.userAnswerValid === false}>
            <Label color="red" text="Incorrect"/>
          </When>
        </Choose>
      </div>
    </div>);
};
export default SolutionView;
