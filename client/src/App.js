import 'bootstrap/dist/css/bootstrap.min.css';

import { useEffect, useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';

import  SurveyList  from './components/SurveyList.js';
import { SurveyForm } from './components/SurveyForm.js';
import { AdminContext } from './components/AdminContext.js';
import { getSurveys, getUsers } from './surveys.js';
import { LoginForm, LoginButton, LogoutButton } from './components/LoginForm.js';
import { NewSurveyForm } from './components/NewSurveyForm.js';


function App() {
  let [surveys, setSurveys] = useState([]);
  let [admin, setAdmin] = useState('');
  let [users, setUsers] = useState([]);
  let [triggerUpdate, setTriggerUpdate] = useState(false);

  useEffect(() => getSurveys(setSurveys), [admin, triggerUpdate]);
  useEffect(() => getUsers(setUsers), [triggerUpdate]);

  return (

    <AdminContext.Provider value={[admin, setAdmin]}>
      <Router>
        <Switch>
          <Route path='/login'>
            <LoginForm />
          </Route>
          <Route path='/' exact>
              <Row className="d-flex justify-content-center" style={{backgroundColor:"green"}}>
                <h1 style={{color:"whitesmoke"}}>Welcome to the Survey Page</h1>
              </Row>
              <Container fluid className="h-100">
                    <Row id="main-row" className="position-relative" style={{ minHeight: "92vh" }}>
                      <SurveyList list={surveys} userList={users}/>
                    </Row>
              </Container>
              <Row className="d-flex justify-content-end" style={{position: 'absolute', right: 50, bottom:5}}>
                <LoginButton />
              </Row>
          </Route>
          <Route path='/survey'>
            <SurveyForm fireTrigger={() => setTriggerUpdate(!triggerUpdate)}/>
          </Route>
          <Route path='/admin'>
            <Container fluid className="h-100">
              <Row id="main-row" className="position-relative" style={{ minHeight: "92vh" }}>
                <SurveyList list={surveys} userList={users}/>
              </Row>
            </Container>
            <Row className="d-flex justify-content-end" style={{position: 'absolute', right: 50, bottom:5}}>
              <LogoutButton />
            </Row>
          </Route>
          <Route path='/newSurvey'>
            <NewSurveyForm fireTrigger={() => setTriggerUpdate(!triggerUpdate)}/>
          </Route>
        </Switch>
      </Router>
    </AdminContext.Provider>
  );
}

export default App;
