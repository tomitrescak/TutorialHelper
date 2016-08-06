import * as React from 'react';
import { Grid, Column, Segment, Input, Divider, TextArea, Form, Accordion, AccordionItem } from 'semanticui-react';
import jss from 'jss';
let possibility;
const { classes } = jss.createStyleSheet({
    accordion: {
        '& .column': {
            'padding-top': '3px!important',
            'padding-bottom': '3px!important'
        },
        '& .column:last': {
            'padding-bottom': '12px!important'
        }
    }
}).attach();
const QuestionEditView = ({ question, bind, index }) => {
    return (<Form>
      <TextArea defaultValue={question.description} previewMarkdown={true} label="Description" onChange={bind(`questions.${index}.description`)}/>
      <Input defaultValue={question.question} label="Question" onChange={bind(`questions.${index}.question`)}/>
      <Input defaultValue={question.expectedAnswer} label="Expected Answer" onChange={bind(`questions.${index}.expectedAnswer`)}/>
      
      
      <Input defaultValue={question.control} label="Control" onChange={bind(`questions.${index}.control`)}/>
      

      <If condition={question.possibilities}>
        <Divider />
        <Segment inverted>
          <Accordion id={'Possibilities_' + question._id} classes={`inverted ${classes.accordion}`}>
            <AccordionItem title="Possibilities">
              <Grid columns={2}>
                <Column><b>Question</b></Column>
                <Column><b>Answer</b></Column>
                <For each="possibility" of={question.possibilities} index="index">
                  <Column>{possibility.question}</Column>
                  <Column>{possibility.answer}</Column>
                </For>
              </Grid>
            </AccordionItem>
          </Accordion>
        </Segment>
      </If>
    </Form>);
};
export default QuestionEditView;
