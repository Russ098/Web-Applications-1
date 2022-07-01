import { useContext, useEffect, useState } from 'react';
import { Col, Container, ListGroup, Row, Button } from 'react-bootstrap/';
import { Link } from 'react-router-dom';
import { AdminContext } from './AdminContext';
import SurveyItem from './SurveyItem';

function AdminTitle(props){
    if(props.title !== ''){

        return(
            <Row className="d-flex justify-content-start" style={{backgroundColor:"blue"}}>
                <h2 style={{color:"white", position:'relative', top:1, left:1}}>{props.title}</h2>
            </Row>)
    }
    else{
        return(<h2>{props.title}</h2>)
    }
    
}

function SurveyList(props){
    const [admin,] = useContext(AdminContext);
    const [title, setTitle] = useState('');
    let surveyList = admin === ''? props.list : props.list.filter(survey => survey.ausername === admin);
    
    useEffect(() => {
        if(admin !== ''){
            setTitle(`Welcome,   ${admin}`);
        }
        else{
            setTitle('');
        }
    }, [admin, surveyList.length]);

    return(
        <Col id='app-content' className='p-2'>
            <Container fluid>
                <AdminTitle title={title}/>
                <ListGroup variant='flush'>
                    {surveyList.map((survey) => <SurveyItem {...survey} users={props.userList} sid={survey.sid} key={survey.sid}/>)}
                </ListGroup>
            </Container>
            <Row className="d-flex justify-content-end" style={{position: 'absolute', left: 50, bottom:5}}>
                <Link to={{
                            pathname :'/newSurvey',
                            search : ``,
                            state : {
                                'operation' : 'addSurvey',
                                'adminName' : admin
                            }
                        }}>
                    <Button className="my-addSurvey btn-block"  hidden={admin === ''}>Create Survey</Button>
                </Link>
            </Row>             
        </Col>    
    );

}


export default SurveyList;