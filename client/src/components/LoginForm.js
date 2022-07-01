import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { AdminContext } from './AdminContext';


export function LogoutButton(){
    const [admin, setAdmin] = useContext(AdminContext);
    const history = useHistory();

    const redir = () => {
        fetch('/api/logout', {method: 'POST'})
        .then( () => setAdmin('') )
        .then( () => history.push('/'));
    }

    return (
        <Button className="my-3 container-fluid" variant="warning"  onClick={redir}>
            Logout
        </Button>);
}

export function LoginButton() {
    const [variant, setVariant] = useState("secondary");
    const [disable, setDisable] = useState(true)
    const [text, setText] = useState('Loading...');
    const hist = useHistory();
    const action = () => hist.push('/login');
    const [admin, setAdmin] = useContext(AdminContext);

    useEffect(() => {
        fetch('/api/whoami')
            .then(res => {
                if (!res.ok) {
                    setText('Login');
                    setDisable(false);
                    setVariant('primary');
                } else res.json()
                        .then(data => {
                            setText(`Welcome back, ${data.uname}`);
                            setDisable(true);
                            setVariant('light');
                            setAdmin(data.uname);
                        })
            })
            .catch(err => console.log(err.message))
    }, [admin]);


    return (
        <Button variant={variant} disabled={disable} onClick={action}>
            {text}
        </Button>
    );
}


function WrongCredentialsAlert(props) {
    return (
        <Alert variant="danger" hidden={!props.visible}>Something seems wrong with your credentials.</Alert>
    );
}


export function LoginForm(props){
    const [mail, setMail] = useState('');
    const [passwd, setPasswd] = useState('');
    const [visible, setVisible] = useState(false);
    const [, setAdmin] = useContext(AdminContext);
    const hist = useHistory();
    const updateMail = (e) => setMail(e.target.value);
    const updatePasswd = (e) => setPasswd(e.target.value);
    function reset() { setMail(''); setPasswd(''); setVisible(false); };

    function login(event) {
        event.preventDefault();

        const payload = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'username': mail, 'password': passwd })
        }

        fetch('/api/login', payload)
            .then(async (res) =>{ 
                //console.log(res); ha status 200 OK
                if(res.status === 200){
                    let data = await res.json(); //data è uguale a {uname: "firstAdmin"}
                    setAdmin(data.uname);
                    hist.push(`/admin/${data.uname}`);
                }else{
                    setVisible(true);
                }
            });
    }

    return (
        <Container className="py-5 fluid">
            <Row className="d-flex justify-content-center">
                <Col className="col-6 d-block">
                    <h3>Admin Login</h3>
                    <Form className="d-block">
                        <Form.Group className="d-block py-3">
                            <Form.Label >Admin Username</Form.Label>
                            <Form.Control placeholder="Must be a valid one." onChange={updateMail} value={mail} type="email"/>
                            <Form.Label>Password</Form.Label>
                            <Form.Control placeholder="Enter your password." onChange={updatePasswd} value={passwd} type="password"/>
                            <Button className="my-2 btn-block" onClick={login} type="submit">Login</Button>
                            <Button className="my-2 btn-block" variant="warning" onClick={reset}>Reset</Button>
                            <WrongCredentialsAlert visible={visible} />
                        </Form.Group>
                    </Form>
                </Col>
            </Row>
        </Container>
    )


}

