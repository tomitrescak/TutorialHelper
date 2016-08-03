import * as React from 'react';
import { Input, TextArea, Form } from 'semanticui-react';
const QuestionEditView = ({ question, bind, index }) => {
    return (<Form>
    <TextArea defaultValue={question.description} previewMarkdown={true} label="Description" onChange={bind(`questions.${index}.description`)}/>
    <Input defaultValue={question.question} label="Question" onChange={bind(`questions.${index}.question`)}/>
    <Input defaultValue={question.expectedAnswer} label="Expected Answer" onChange={bind(`questions.${index}.expectedAnswer`)}/>
    <TextArea defaultValue={question.validation} label="Validation" rows={2} onChange={bind(`questions.${index}.validation`)}/>
    <Input defaultValue={question.control} label="Control" onChange={bind(`questions.${index}.control`)}/>
    <Input defaultValue={question.points} label="Points" onChange={bind(`questions.${index}.points`)}/>
  </Form>);
};
export default QuestionEditView;
