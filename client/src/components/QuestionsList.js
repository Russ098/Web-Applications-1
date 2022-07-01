import { Col, Container, ListGroup} from 'react-bootstrap';
import QuestionItem from './QuestionItem.js';


function QuestionsList(props){
    let questionList = props.list

    return(
        <Col id='survey-content' className='p-2'>
            <Container fluid>
                <h2>Let's begin with questions!</h2>
                <ListGroup variant='flush'>
                    {questionList.map((question) => <QuestionItem {...question} key={question.qid} block={props.blocked}/>)}
                </ListGroup>
            </Container>
        </Col>    
    );


}


export default QuestionsList;