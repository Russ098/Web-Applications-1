'use strict';

const queries = require('./apis/dao.js');
const express = require('express');
const session = require('express-session');
const sessionsettings = {
  secret: "It's gonna be our little secret",
  resave: false,
  saveUninitialized: false,
  name: 'survey-session'
};

// init express
const app = new express();

app.use(session(sessionsettings));

// Passport Setup
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

app.use(passport.initialize());
app.use(passport.session());

passport.deserializeUser((usernameObj, done) => {
    queries.findUser(usernameObj.usrname)
        .then(adminRow => done(null, adminRow))
        .catch( () => done(null, false));
});

passport.serializeUser( (usernameObj, done) => {
    done(null, usernameObj);
});

// Default behaviour
const isLogged = (req, res, next) => {
  if (req.isAuthenticated())
    return next();
  res.status(401).json({message:'Not authenticated.'});
}

// Used to authenticate
passport.use(new LocalStrategy((uname, password, done) => {
    queries.login(uname, password)
      .then((usernameObj) => { 
        if(usernameObj)
          done(null, usernameObj);
        else
          done(null, false, {message : 'Username or password wrong.'});      
       })
      .catch(err => done(err) );
}));

// End Passport Setup

app.use(express.json());
const port = 3001;

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

app.get("/api/surveys", (req, res) => {
  queries.getAllSurveys()
    .then((response) => res.send(response))
    .catch((err) => res.status(404).send(err) );
});

app.get("/api/questions", (req, res) => {
  queries.getQuestions(req.query.sid)
    .then((response) => res.send(response))
    .catch((err) => res.status(404).send(err) );
});

app.get("/api/questionAns", (req, res) => {
  queries.getAnswersFromQuestion(req.query.sid, req.query.qid)
    .then((response) => res.send(response))
    .catch((err) => res.status(404).send(err));
});

app.post("/api/saveUser", (req, res) => {
  const b = req.body;

  queries.saveUser(b.usrname, b.sid)
      .then((response) => res.send(response))
      .catch(() => res.status(404).send('DB error - User not inserted'));
  });


app.post("/api/saveUserAnswers", (req, res) => {
  const b = req.body;
  queries.saveUserAnswer(b.userID, b.ans)
    .then((res) => console.log(res))
    .catch((err) => res.status(404).send('DB error - Answer not inserted'));
  
})

app.post('/api/login', passport.authenticate('local'), (req, res) => {
  //console.log('api login, param: ', req.user); req.user è uguale a { usrname : 'firstAdmin }
  res.set({'Content-Type': 'application/json'}).status(200).send({ uname : req.user.usrname });
})


app.get("/api/whoami", isLogged, (req, res) => {
  //console.log("Chi sono? - ", req.user); //req.user contiene { username: '...', psw: 'hashPassword', sid:'...' }
  res.set({'Content-Type': 'application/json'}).status(200).send({ uname : req.user.username });
});

app.post("/api/logout", isLogged, (req, res) => {
  req.logout();
  res.sendStatus(200);
});

app.get("/api/users", (req, res) => {
  queries.getUsers()
    .then((response) => res.send(response))
    .catch((err) => res.status(404).send(err) );
});

app.get("/api/userResponses", (req, res) => {
  const p = req.query;
  queries.getUserResponses(p.uid,p.sid)
    .then((response) => res.send(response))  // [ { qid: 0, resptext: 'Crocodile' } ]
    .catch((err) => res.status(404).send(err) );
});

app.post('/api/newSurvey', (req, res) => {
  const b = req.body;
  queries.saveSurvey(b.admName, b.sTitle, b.qNumber)
    .then((response) => res.send(response))
    .catch((err) => res.send(err));
})

app.post("/api/saveQuestions", (req, res) => {
  const b = req.body;

  queries.saveQuestion(b.surveyID, b.quest, b.idx)
    .then(() => {
      if(b.quest.type === 'Closed'){
        b.quest.choices.forEach(possibleAnswer => queries.savePossibleAnswer(b.surveyID, possibleAnswer, b.idx)
                                                      .catch(err => res.send(err)))
      }
    })
    .catch((err) => console.log(err));
  
})