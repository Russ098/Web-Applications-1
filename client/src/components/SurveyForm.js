import { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useHistory, useLocation } from "react-router-dom";
import QuestionsList from './QuestionsList.js';
import { getQuestions, getUserResponses, saveUser, saveUserAnswers } from '../surveys';
import { AnswersContext } from "./AnswersContext.js";
import { AdminContext } from "./AdminContext.js";


function WrongUsernameAlert(props) {
    return (
        <Alert variant="danger" hidden={!props.visible}>Your username seems empty. Enter a username!</Alert>
    );
}

function SuccessUsernameAlert(props) {
    return (
        <Alert variant="success" hidden={!props.visible}>Nice username! Now you can proceed with questions.</Alert>
    );
}

function SubmittedAlert(props){
    return (
        <Alert variant="success" hidden={!props.visible}>Nice! Your answers are gonna be saved. Thank you!</Alert>
    );
}

function FormErrorAlert(props){
    return (
        <Alert variant="danger" hidden={!props.visible}>Give a double check to your answers. It seems something went wrong.</Alert>
    );
}


export function SurveyForm(props){
    const params = useLocation();
    const history = useHistory();
    const currentSurvey = params?.state['survey'];
    let [admin, ] = useContext(AdminContext);
    let userList = admin !== ''? params?.state['userList'].filter(user => user.sid === currentSurvey.sid) : [];
    let [counter, setCounter] = useState(0);


    const [username, setUsername] = useState(admin !== '' ? userList[counter].username : '');
    const [visible, setVisible] = useState(false);
    const [visibleSuccessAlert, setVisibleSuccessAlert] = useState(false);
    const [questionList, setQuestionList] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [showFinalAlert, setShowFinalAlert] = useState(false);
    const [showFinalAlert2, setShowFinalAlert2] = useState(false);


    function nextUser(){
        let nextC = (counter+1)%userList.length;
        setCounter(nextC)
    }

    function previousUser(){
        let prevC = counter-1 < 0? (userList.length-1)%userList.length : (counter-1)%userList.length;
        setCounter(prevC)
    }

    const updateUsername = (e) => setUsername(e.target.value);
    function reset() { setUsername('');  setVisible(false); setVisibleSuccessAlert(false);};
    function defineUsername(event){
        event.preventDefault();

        if(username === ''){
            setVisible(true);
            setVisibleSuccessAlert(false);
        }
        else{
            setVisibleSuccessAlert(true);
            setVisible(false);
        }
    }

    const isAllOk = () => {
        let ok = true;
        if(username==="")
            return !ok;
        questionList.forEach((question) => {
            if(question.min_r>0){ //mandatory question
                let a = answers.filter((answer) => answer.sid===question.sid && answer.qid===question.qid);
                if(a === undefined)
                    ok = false;
                else if(a.length === 0 || a.length>question.max_r)
                    ok = false;
                else if(a[0].ans_type === 1 && a[0].txt ==='')
                    ok = false;
            }
        })

        return ok;
    }

    const handleClick = async () => {
        if(isAllOk()){
            let path = "/";
            setShowFinalAlert2(false);
            setShowFinalAlert(true);
            let id= await saveUser(username, answers[0]["sid"]);
            answers.forEach(async (answer) => await saveUserAnswers(id, answer))
            props.fireTrigger();
            setTimeout(() => history.push(path), 1500);
        } else{
            setShowFinalAlert(false);
            setShowFinalAlert2(true);
        }

    }

    useEffect(() => getQuestions(setQuestionList, currentSurvey.sid), []);
    useEffect(() => {
        if(admin !== ''){ 
            setUsername(userList[counter].username);
            getUserResponses(userList[counter], currentSurvey.sid, setAnswers);
        }
    }, [counter])


    return(
        <Container className='py-5 fluid'>
            <Row className="d-flex justify-content-center">
                <Col className="col-8 d-block">
                    <h1>Welcome to the survey '{currentSurvey.title}'!</h1>
                    <h4>Enter your username before starting with questions:</h4>
                    <Form className="d-block">
                        <Form.Group className="d-block py-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control readOnly={admin !== ''? true : false} placeholder="Choose a wonderful username..." onChange={updateUsername} value={username} disabled={visibleSuccessAlert}/>
                            <Form.Text muted> Without entering a username you won't be able to fill the answers!</Form.Text>
                            <Button className="my-2 btn-block" onClick={defineUsername} type="submit"  disabled={admin !== ''? true : visibleSuccessAlert}>Set</Button>
                            <Button className="my-2 btn-block" variant="warning" onClick={reset} disabled={admin !== ''? true : visibleSuccessAlert}>Reset</Button>
                            <WrongUsernameAlert visible={visible} />
                            <SuccessUsernameAlert visible={visibleSuccessAlert} />
                        </Form.Group>
                    </Form>
                    <AnswersContext.Provider value={[answers, setAnswers]}>
                        <QuestionsList blocked={!visibleSuccessAlert} key={currentSurvey.sid} list={questionList} sid={currentSurvey.sid}/>
                    </AnswersContext.Provider>
                </Col>
            </Row>
            <Row className="d-flex justify-content-center">
                <span style={{fontStyle:"italic", fontWeight:"bold", textDecoration:"underline", color:"red", fontsize:"16px"}}>Be sure to answer all the mandatory questions...</span>
            </Row>
            <Row className="d-flex justify-content-end">
                <h5>Have you checked yet? Nice, let's <span style={{fontWeight:"bold", textDecoration:"underline"}}>submit</span>!</h5>
            </Row>
            <Row className="d-flex justify-content-end">
                    <Button variant="primary" onClick={handleClick} disabled={admin !== ''? true : false}>Submit</Button>
            </Row>
            <Row className="d-flex justify-content-start">
                    <Col className="d-flex justify-content-center">
                        <Button hidden={admin===''} variant="dark" className="prev-usr" onClick={previousUser}>Previous</Button>
                    </Col>
                    <Col className="d-flex justify-content-center">
                        <Button hidden={admin===''} variant="dark" className="next-usr" onClick={nextUser}>Next</Button>
                    </Col>
            </Row>
            <Row className="d-flex justify-content-center">
                <SubmittedAlert visible={showFinalAlert} />
                <FormErrorAlert visible={showFinalAlert2} />
            </Row>
        </Container>

    )




}
