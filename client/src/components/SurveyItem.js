import { useContext } from 'react';
import { ListGroup, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AdminContext } from './AdminContext';

function RightCol(props){
    
    if(props.administrator === ''){
        return(
            <span>Questions: {props.quesNum}</span>
        )
    } else
        return <span>Responses: {props.respNum}</span>
}

function SurveyLink(props){

    if(props.administrator === '')
        return(
            <Link to={{
                        pathname :'/survey',
                        search : `?op=addResponse&sid=${props.sid}`,
                        state : {
                            'operation' : 'addResponse',
                            'survey' : props.properties
                        }
                    }}>
                {props.title}
            </Link>)
    else{
        if(props.respNum > 0)
            return(
                <Link to={{
                            pathname :`/survey`,
                            search : `?sid=${props.sid}`,
                            state : {
                                'survey' : props.properties,
                                'userList' : props.properties.users
                            }
                        }}>
                    {props.title}
                </Link>)
        else
            return(
                <span>
                    {props.title}
                </span>
            )
    }
        
}

function SurveyItem(props){
    const [admin,] = useContext(AdminContext);
    let color_= admin !== ''? 'white': 'black';
    let usersOfSurvey = props.users.filter(user => user.sid === props.sid)


    return(
        <ListGroup.Item className='px-0'>
            <Row className='px-4 py-2' key={`survey-${props.sid}`}>
                <Col className="d-flex justify-content-start align-self-center">
                    <Col><span style={{'textDecorationLine': 'underline'}}>Survey #{props.sid}</span></Col>
                    <Col><span style={{'color':color_}}>Author: {props.ausername}</span></Col>
                </Col>
                <Col className="d-flex justify-content-start align-self-center">
                    Survey title:
                    <SurveyLink respNum={usersOfSurvey.length} administrator={admin} title={props.title} sid={props.sid} properties={props}/>
                    <span style={{'color':color_}}>(click to answer)</span>
                </Col>
                <Col className="col-2 d-flex justify-content-end align-self-center">
                    <RightCol administrator={admin} quesNum={props.qnum} respNum={usersOfSurvey.length}/>
                </Col>
            </Row>
        </ListGroup.Item>
    );

}


export default SurveyItem;