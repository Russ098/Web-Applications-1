import { useContext, useEffect, useState } from 'react';
import { ListGroup, Row, Col, Form, Container} from 'react-bootstrap';
import { getAnswersRelatedToQuestion } from '../surveys';
import { AdminContext } from './AdminContext';
import { AnswersContext } from './AnswersContext';

function CloseQuestionChoice(props){
    let [userAnswers, setUserAnswers] = useContext(AnswersContext);
    let [admin, ] = useContext(AdminContext);
    let letsCheck = false;

    if(admin !==''){
        letsCheck = userAnswers.some(answer => answer.resptext === props.plntext)
    }



    const handleChange = (e) => {
        if(e.target.checked){
            let ans = {
                respText : props.plntext,
                sid : props.sid,
                qid : props.qid,
                aid : props.aid,
                ans_type : 0
            }
            props.saveResp(ans);
        } else{
            props.deleteResp(props.aid);
        }
    }

    if(admin !== ''){
        return(
            <Row className="justify-content-start">
                <Col xs="auto">
                    <Form>
                        <Form.Check  checked={letsCheck} disabled={props.block} custom type="checkbox" key={props.aid} id={`custom-checkbox-${props.aid}`} label={props.plntext} onChange={handleChange}/>
                    </Form>
                </Col>
            </Row>
        )
    } else{
        return(
            <Row className="justify-content-start">
                <Col xs="auto">
                    <Form>
                        <Form.Check disabled={props.block} custom type="checkbox" key={props.aid} id={`custom-checkbox-${props.aid}`} label={props.plntext} onChange={handleChange}/>
                    </Form>
                </Col>
            </Row>
        )        
    }


}

    


function PossibleAnswer(props){
    const [currentResponse, setCurrentResponse] = useState('');
    const [answers, setAnswers] = useState([]);
    const mandatory = props.minR>0 ? true : false;
    let [admin, ] = useContext(AdminContext);
    let [userAnswers, setUserAnswers] = useContext(AnswersContext);
    let resp = undefined;

    

    const saveResponse = (e) => {
        props.updateRespList(currentResponse);
    }

    const updateCurrentResponse = (e) => setCurrentResponse(e.target.value);

    useEffect(() => {
            if(props.answerType === 0)
                getAnswersRelatedToQuestion(props.sid, props.qid, setAnswers);
            }, [])


    if(props.answerType === 0){//closed-answer
         return(
             answers.map((answer) => {
                return(<Container>
                            <CloseQuestionChoice deleteResp={props.deleteR} key={answer.aid} saveResp={props.saveR} block={props.block} {...answer}/>
                         </Container>
                )}
             )
         );
    } else if(props.answerType === 1){//open-answer

        if(admin !== ''){
            resp = userAnswers.find(answer => answer.qid === props.qid);
            if(resp === undefined)
                resp = 'undefined';
        }

        return (
            <Form.Label control_id="openAnswer" label="Write here... (max 200 characters)" className="mb-3">
                <Form.Control disabled={props.block} as="textarea" maxLength="200" placeholder={admin===''? "Leave a comment here" :  resp.resptext} onChange={updateCurrentResponse} onBlur={saveResponse} style={{ height: '100px', width: '650px' }} required={mandatory}/>
            </Form.Label>
        )
    } else
        console.log('Answer type error.')
}


function QuestionItem(props){
    let [admin, ] = useContext(AdminContext);
    let [ans_, setAns_] = useContext(AnswersContext);
    const showMandatory = props.min_r>0? "(Mandatory)" : "";
    const attentionText = props.type === 0 ? showMandatory+` Min: ${props.min_r}-Max ${props.max_r}` : showMandatory+"";

    const handleTrueCheck = (answer) => {
        let l = Array.from(ans_);
        l.push(answer);
        
        setAns_(l);
    }

    const updateOpenAnswers = (answer) => {
        let l = ans_.filter((ans) => ans.qid!==props.qid);
        let maxID = -1;

        ans_.forEach((answer) => {
            if(answer.aid>maxID) 
                maxID=answer.aid;
            }
        )

        let res = {
            aid: maxID+1,
            qid : props.qid,
            sid : props.sid,
            txt : answer,
            ans_type: props.type
        };
        l.push(res);

        setAns_(l);
    };

    const deleteAnswerByID = (aid) => {
        let l = ans_.filter((ans) => ans.aid!==aid);
        setAns_(l);
    }

    return(
        <ListGroup.Item id={props.qid} className="px-0">
           <Row className="px-4 py-2">
                <h4>Question #{props.qid}: {props.title} <span style={{fontStyle:"italic", fontWeight:"bold", textDecoration:"underline"}}>{attentionText}</span></h4>
            </Row>
            <Row>
                <PossibleAnswer deleteR={deleteAnswerByID} saveR={handleTrueCheck} block={props.block} sid={props.sid} qid={props.qid} minR={props.min_r} maxR={props.max_r} updateRespList={updateOpenAnswers} answerType={props.type}/>
            </Row>
        </ListGroup.Item>
    );



}

export default QuestionItem;