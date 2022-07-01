

export function getSurveys(setSurveys){
    fetch('/api/surveys')
    .then((surveys) => surveys.json())
    .then((result) => setSurveys(result))
    .catch(() => setSurveys([]));
}

export function getQuestions(setQuestionList, surveyID){
    fetch(`/api/questions?sid=${surveyID}`)
        .then((questions) => questions.json())
        .then((result) => setQuestionList(result))
        .catch(() => setQuestionList([]));
        
}

export function getAnswersRelatedToQuestion(sid, qid, setAnswers){
    const maxAnswerNumber = 10;

    fetch(`/api/questionAns?sid=${sid}&qid=${qid}`)
        .then((responses) => responses.json())
        .then((result) => {
            if(result.length>maxAnswerNumber)
                result = result.slice(0, maxAnswerNumber);
            setAnswers(result)
            }
        )
        .catch(() => setAnswers([])); 
}

export function saveUser(username, sid_, setUserID){
    const requestOptions = {
        method: "POST", 
        headers : { "Content-Type" : "application/json" }, 
        body : JSON.stringify({ usrname : username, sid: sid_ })
    };
    return fetch("/api/saveUser", requestOptions)
         .then(res => res.json())
         .then(data => { return data.uid })
         .catch((err) => console.log(err));
}

export function saveUserAnswers(id, answer){
    const requestOptions = {
        method: "POST", 
        headers : { "Content-Type" : "application/json" }, 
        body : JSON.stringify({ userID : id, ans: answer })
    };
    
    return fetch("/api/saveUserAnswers", requestOptions);

}

export function getUsers(setUsers, surveyID){
    fetch(`/api/users?sid=${surveyID}`)
        .then((users) => users.json())
        .then((result) => setUsers(result))
        .catch(() => setUsers([]));
        
}

export function getUserResponses(usrObj, surveyID, setUserResponses){
    //console.log('survey', usrObj, surveyID);  //survey {uid: 0, username: "John", sid: 0} 0
     fetch(`/api/userResponses?uid=${usrObj.uid}&sid=${surveyID}`)
        .then((users) => users.json())
        .then((result) => setUserResponses(result)) //0: {qid: 0, resptext: "Turtle"}
        .catch(() => setUserResponses([]));
 
}

export function insertSurvey(adminName, surveyTitle, questionNumber){
    const payload = {
        method: "POST", 
        headers : { "Content-Type" : "application/json" }, 
        body : JSON.stringify({ admName : adminName, sTitle: surveyTitle, qNumber : questionNumber })
    };

    return fetch('/api/newSurvey', payload)
        .then(res => res.json())
        .then(data => { return data.sid })
        .catch((err) => console.log(err));
}

export function saveQuestion(id, question, index){
    const payload = {
        method: "POST", 
        headers : { "Content-Type" : "application/json" }, 
        body : JSON.stringify({ surveyID : id, quest: question, idx: index })
    };
    
    return fetch("/api/saveQuestions", payload);

}