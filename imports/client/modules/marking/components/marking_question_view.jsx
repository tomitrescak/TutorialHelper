import * as React from 'react';
import { Header5, TextArea, Button, Segment, Message } from 'semanticui-react';
import * as actions from '../../solution/actions/solution_actions';
const MarkingQuestionView = ({ context, solution, question, stored }) => {
    const bind = context.Utils.Binding(actions.UPDATE, 'solutions.' + solution._id);
    const expectedAnswer = solution.expectedAnswer ? solution.expectedAnswer : question.expectedAnswer;
    let mark;
    const markBind = bind('mark');
    const eventSource = {
        currentTarget: mark
    };
    return (<Segment>
      <Header5>Question: {solution.userQuestion ? solution.userQuestion : question.question}</Header5>
      <p style={{ margin: '12px 0px' }}>
        <Choose>
          <When condition={solution.userAnswer}>{solution.userAnswer}</When>
          <Otherwise>No answer</Otherwise>
        </Choose>
      </p>
      <If condition={expectedAnswer}>
      <Message color="grey">Expected Answer: {expectedAnswer}</Message>
      </If>
      <TextArea rows={2} label="Comment" onChange={bind('tutorComment')} defaultValue={stored.tutorComment}/>
      <div className="ui action labeled input">
        <div className="ui label">%</div>
        <input style={{ width: '80px' }} ref={(node) => { mark = node; eventSource.currentTarget = node; }} type="number" placeholder={`Mark`} value={stored.mark} onChange={markBind}/>
        <Button color="green" text="Good" onClick={() => { mark.value = '100'; markBind(eventSource); }}/>
        <Button color="orange" text="Kinda" onClick={() => { mark.value = '50'; markBind(eventSource); }}/>
        <Button color="red" text="Bad" onClick={() => { mark.value = '0'; markBind(eventSource); }}/>
      </div>


    </Segment>);
};
export default MarkingQuestionView;
