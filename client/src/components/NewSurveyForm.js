import { useState } from "react";
import { Container, Row, Col, Form, Button, Alert, ListGroup } from "react-bootstrap";
import { useHistory, useLocation } from "react-router-dom";
import { insertSurvey, saveQuestion } from '../surveys';



function QuestionForm(props){
    let currentIdx = props.idx;
    let [title_, setTitle_] = useState(props.q[currentIdx].title);
    let [type, setType] = useState('---');
    let [minA, setMinA] = useState(0);
    let [maxA, setMaxA] = useState(0);
    let [textArea, setTextArea] = useState('');

    const deleteQuestion = (index) =>{
        let list = [...props.q];
        list.splice(index, 1); //remove 1 element at index 'index'
        props.setQ(list);
    }

    const setQuestionDown = () =>{
        let list = [...props.q];
        let newIdx = (currentIdx+1)%props.q.length;
        let questReplaced = list[newIdx];
        list[newIdx] = list[currentIdx];
        list[currentIdx] = questReplaced;
        props.setQ(list);
        
    }

    const setQuestionUp = () =>{
        let list = [...props.q];
        let newIdx = (currentIdx-1) < 0? props.q.length-1 : currentIdx-1;
        let questReplaced = list[newIdx];
        list[newIdx] = list[currentIdx];
        list[currentIdx] = questReplaced;
        props.setQ(list);
    }

    const handleTitle = e => {
        setTitle_(e.target.value);
        props.q[currentIdx].title = e.target.value;
    }        

    const handleChange = e => {
        if(e.target.value === 'Open'){
            setType('Open');
            props.q[currentIdx].type = 'Open';
        }
        else if (e.target.value === 'Closed'){
            setType('Closed');
            props.q[currentIdx].type = 'Closed';
        }
        else{
            setType('---');
        }
    }

    const handleChangeMin = e =>{
        setMinA(e.target.value);
        props.q[currentIdx].minAns = e.target.value;
    }

    const handleChangeMax = e =>{
        setMaxA(e.target.value);
        props.q[currentIdx].maxAns = e.target.value;   
    }
    
    const handleTextArea = e => {
        setTextArea(e.target.value);
        let s = e.target.value;
        props.q[currentIdx].choices = Array.from(s.split('-'));
    }
    

    return(
            <ListGroup.Item>
                <Form>
                    <Form.Row>
                        <Form.Group as={Col} controlId="formGridQuestTitle">
                        <Form.Label>Title</Form.Label>
                        <Form.Control type="text" onChange={handleTitle} value={props.q[currentIdx].title} placeholder="Enter the question title" />
                        </Form.Group>

                        <Form.Group as={Col} controlId="formGridQuestType">
                            <Form.Label >Type</Form.Label>
                            <Form.Control value={props.q[currentIdx].type} onChange={handleChange} as='select' custom>
                                <option disabled>---</option>
                                <option>Closed</option>
                                <option>Open</option>
                            </Form.Control>
                        </Form.Group>
                    </Form.Row>

                    <Form.Row>
                        <Form.Group as={Col} controlId="formGridMinR">
                            <Form.Label>Minimum answers</Form.Label>
                            <Form.Control type='number'  min={0} max={1} onChange={handleChangeMin} placeholder="Insert a number..." value={props.q[currentIdx].minAns} />
                        </Form.Group>

                        <Form.Group as={Col} controlId="formGridMaxR"> 
                            <Form.Label>Maximum answers</Form.Label>
                            <Form.Control type='number' min={0} max={props.q[currentIdx].type === 'Closed' ? 10 : 1} onChange={handleChangeMax} placeholder="Insert a number..." value={props.q[currentIdx].maxAns}/>
                        </Form.Group>
                    </Form.Row>

                    <Form.Row >
                        <Form.Label>Insert possible answers separated by '-'</Form.Label>
                        <Form.Control disabled={props.q[currentIdx].type === 'Closed' ? false : true} type="text" placeholder='Write here...' value={props.q[currentIdx].choices.join('-')} onChange={handleTextArea}/>
                    </Form.Row>
                </Form>
                <Row>
                    <Col>
                        <Button onClick={deleteQuestion}>Delete</Button>
                    </Col>
                    <Col>
                        <span><Button onClick={setQuestionUp}>Up</Button></span>
                        <span><Button onClick={setQuestionDown}>Down</Button></span>
                    </Col>
                </Row>
            </ListGroup.Item>
    )
}

function WrongTitleAlert(props) {
    return (
        <Alert variant="danger" hidden={!props.visible}>Your title seems empty. Enter a valid title!</Alert>
    );
}

function SuccessTitleAlert(props) {
    return (
        <Alert variant="success" hidden={!props.visible}>Nice title! Now you can proceed.</Alert>
    );
}

function SubmittedAlert(props){
    return (
        <Alert variant="success" hidden={!props.visible}>Nice! Your survey is gonna be saved.</Alert>
    );
}

function FormErrorAlert(props){
    return (
        <Alert variant="danger" hidden={!props.visible}>Give a double check to your questions. It seems something went wrong.</Alert>
    );
}


export function NewSurveyForm(props){
    let [title, setTitle] = useState('');
    const [visibleSuccessAlert, setVisibleSuccessAlert] = useState(false);
    const [visible, setVisible] = useState(false);
    const [showFinalAlert, setShowFinalAlert] = useState(false);
    const [showFinalAlert2, setShowFinalAlert2] = useState(false);
    let [questions, setQuestions] = useState([]);
    const params = useLocation();
    const history = useHistory();
    let adminName = params?.state['adminName'];



    const updateTitle = (e) => setTitle(e.target.value);
    function defineTitle(event){
        event.preventDefault();

        if(title === ''){
            setVisible(true);
            setVisibleSuccessAlert(false);
        }
        else{
            setVisibleSuccessAlert(true);
            setVisible(false);
        }
    }

    function reset() { setTitle('');  setVisible(false); setVisibleSuccessAlert(false);};


    const isAllOk = () => {
        let ok = true;
        if(title==="")
            return !ok;
        if(questions.length === 0)
            return !ok;

        questions.forEach((question) => {
            if(question.title === '' || question.title === undefined)
                ok = false;
            if(question.type === '---' || question.type === undefined)
                ok = false;
            if(question.minAns > question.maxAns)
                ok = false;
            if(question.type === 'Closed' && question.maxAns > question.choices.length)
                ok = false;
        })

        return ok;
    }

    const handleClick = async () => {
        if(isAllOk()){
            let path = "/admin";
            setShowFinalAlert2(false);
            setShowFinalAlert(true);
            let id= await insertSurvey(adminName, title, questions.length);
            questions.forEach(async (question, index) => await saveQuestion(id, question, index))
            props.fireTrigger();
            setTimeout(() => history.push(path), 1500);
        } else{
            setShowFinalAlert(false);
            setShowFinalAlert2(true);
        }

    }

    let addQuestion = () => {
        let newQuestionInfo = {
            'title': '',
            'type': '---',
            'minAns': 0,
            'maxAns': 0,
            'qNum' : 0,
            'choices': []
        }
        setQuestions([...questions, newQuestionInfo])
    }


    return(
        <Container className='py-5 fluid'>
            <Row className="d-flex justify-content-center">
                <Col className="col-8 d-block">
                    <h1>Let's create a new survey!</h1>
                    <h4>Enter your survey title first: </h4>
                    <Form className="d-block">
                        <Form.Group className="d-block py-3">
                            <Form.Label>Survey Title</Form.Label>
                            <Form.Control placeholder="Choose a wonderful title..." onChange={updateTitle} value={title} disabled={visibleSuccessAlert}/>
                            <Form.Text muted> Without entering a title you won't be able to go on!</Form.Text>
                            <Button className="my-2 btn-block" onClick={defineTitle} type="submit"  disabled={visibleSuccessAlert}>Set</Button>
                            <Button className="my-2 btn-block" variant="warning" onClick={reset} disabled={visibleSuccessAlert}>Reset</Button>
                            <WrongTitleAlert visible={visible} />
                            <SuccessTitleAlert visible={visibleSuccessAlert} />
                        </Form.Group>
                    </Form>
                    <span>
                        <h2>Add new questions: <Button onClick={addQuestion} disabled={title === ''}>Add</Button></h2>
                    </span>
                    <ListGroup variant='flush'>
                        {questions.map((question, index) => <QuestionForm q={questions} key={index} setQ={setQuestions} idx={index}/>)}
                    </ListGroup>
                </Col>
            </Row>
            <Row className="d-flex justify-content-end">
                    <Button variant="primary" onClick={handleClick}>Create</Button>
            </Row>
            <Row className="d-flex justify-content-center">
                <SubmittedAlert visible={showFinalAlert} />
                <FormErrorAlert visible={showFinalAlert2} />
            </Row>
        </Container>

    )



}