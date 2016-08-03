import * as React from 'react';
import { Header2, Segment, Input, Button, Divider, Label, TextArea, Form } from 'semanticui-react';

interface IContainerProps { }
interface IComponentProps {
  question: Cs.Entities.IQuestion;
  bind: Function;
  index: number;
}

interface IComponentActions { }
interface IComponent extends IContainerProps, IComponentProps, IComponentActions { }

const QuestionEditView = ({question, bind, index}: IComponent) => {
  return (
  <Form>
    <TextArea defaultValue={question.description} previewMarkdown={true} label="Description" onChange={bind(`questions.${index}.description`)} />
    <Input defaultValue={question.question} label="Question" onChange={bind(`questions.${index}.question`)} />
    <Input defaultValue={question.expectedAnswer} label="Expected Answer" onChange={bind(`questions.${index}.expectedAnswer`)} />
    <TextArea defaultValue={question.validation} label="Validation" rows={2} onChange={bind(`questions.${index}.validation`)} />
    <Input defaultValue={question.control} label="Control" onChange={bind(`questions.${index}.control`)} />
    <Input defaultValue={question.points} label="Points" onChange={bind(`questions.${index}.points`)} />
  </Form>
)};

export default QuestionEditView;
