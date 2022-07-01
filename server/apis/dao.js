"use strict"

const sqlite = require('sqlite3').verbose();
const bcrypt = require('bcrypt');


const db = new sqlite.Database('./db.sqlite', (err) => {
     if(err) 
        throw err; 
    else console.log('Database correctly opened.');
});

exports.getAllSurveys = () => {
    const query = "SELECT * FROM surveys";  

    return new Promise((res, rej) => {
        db.all(query, [], (err, rows) => {
            if(err){
                //console.log(err);
                rej(err);
            } else{
                const surveyList = [];
                for(let survey of rows){
                    surveyList.push(survey);
                }
                if(surveyList.length == 0)
                    rej('No survey found');
                res(surveyList);
            }
        })
    });

}

exports.getQuestions = (sid) => {
    const query = 'SELECT * FROM QUESTIONS WHERE QUESTIONS.SID=?';

    return new Promise((res, rej) => {
        db.all(query, [sid], (err, rows) => {
            if(err)
                rej(err);
            else{
                const questionList = [];
                for(let question of rows){
                    questionList.push(question);
                }
                if(questionList.length == 0)
                    rej(`No questions for survey #${sid}`);
                res(questionList);
            }
        })
    })


}

exports.getAnswersFromQuestion = (sid, qid) => {
    const query = "SELECT * FROM POSSIBLEANSWERS AS PA WHERE SID=? AND QID=?";

    return new Promise((res, rej) => {
        db.all(query, [sid, qid], (err, rows) => {
            if(err)
                rej(err);
            else{
                const respList = [];
                for(let response of rows)
                    respList.push(response);
                if(respList.length == 0)
                    rej(`No response for question #${qid} of survey #${sid}`);
                res(respList);
            }
        })
    })

}

exports.saveUser = async (username, sid) => {
    const createNewUserQuery = "INSERT INTO USERS(UID, USERNAME, SID) VALUES ($NEW_UID, $UNAME, $SID)";
    const getNextID = "SELECT MAX(UID)+1 AS ID FROM USERS";

    // Acquire new user ID
    let temp_promise = new Promise((res, _) => {
        db.get(getNextID, (err, row) => {
            if (err)
                throw 'DB Error';
            else
                res(row);
        });
    });

    temp_promise = await temp_promise;
    const nextID = temp_promise['ID'];
    
    // Set Params
    const params = {
        $NEW_UID: nextID,
        $UNAME: username,
        $SID: sid
    };

    if(params["$NEW_UID"] === undefined || params["$UNAME"] === undefined || params["$SID"] === undefined)
        throw `Invalid parameters: ${username} - ${sid}`;


    return new Promise((res, rej) => {
        db.run(createNewUserQuery, params, (err, row) => {
            if(err)
                rej('DB error - User not inserted');
            else{
                res({uid:nextID});
            }
        })
    })

}

exports.saveUserAnswer = async (userID, ans) => {
    const createNewAnswer = "INSERT INTO RESPONSES(QID, RESPTEXT, UID, SID) VALUES ($QID_, $TXT, $UID_, $SID_)";

    let params = {
        $QID_:ans.qid,
        $TXT:ans.ans_type === 0 ? ans.respText : ans.txt,
        $UID_:userID,
        $SID_:ans.sid
    }

    if(params["$UID_"] === -1 || params["$UID_" === undefined])
        throw "uid error";


    return new Promise((res, rej) => {
        db.run(createNewAnswer, params, (err, row) => {
            if(err)
                rej(err);
            else{
                res('Answer inserted properly.');
            }
        })
    })
    
}

exports.login = (uname, plainPsw) => {
    const query = 'SELECT * FROM admins WHERE username = ?';

    return new Promise((res, rej) => {
        db.get(query, [uname], (err, row) => {
            if (err)
                rej(err);
            if (row === undefined)
                rej(false);
            else{
                bcrypt.compare(plainPsw, row.psw)
                    .then(result => {
                        if(result)
                            res({usrname:row.username});
                        else
                            res(false);
                    })
                    .catch((err) => rej(err))
            }
        })
    });

}


exports.findUser = (uname) => {
    const query = 'SELECT * FROM admins WHERE username = ?';

    return new Promise((res, rej) => {
        db.get(query, [uname], (err, row) => {
            if (err)
                rej(err);
            else if (row === undefined)
                rej(undefined);
            else res(row);
        });
    });
}

exports.getUsers = (sid) => {
    const query = "SELECT * FROM users";

    return new Promise((res, rej) => {
        db.all(query, [sid], (err, rows) => {
            if(err)
                rej(err);
            else{
                const userList = [];
                for(let user of rows){
                    userList.push(user);
                }
                if(userList.length == 0)
                    rej(`No users for survey #${sid}`);
                res(userList);
            }
        })
    })

}

exports.getUserResponses = (uid, sid) => {
    const query = "SELECT qid, resptext FROM responses WHERE sid = ? and uid = ?";

    return new Promise((res, rej) => {
        db.all(query, [sid, uid], (err, rows) => {
            if(err)
                rej(err);
            else{
                const respList = [];
                for(let resp of rows){
                    respList.push(resp);
                }
                if(respList.length == 0)
                    rej(`No responses for survey #${sid} from user #${uid}.`);
                res(respList);
            }
        })
    })

}

exports.saveSurvey = async (adminName, surveyTitle, questionNumber) => {
    const query = "INSERT INTO SURVEYS(SID, AUSERNAME, TITLE, QNUM) VALUES ($SID_, $ADMIN_NAME, $S_TITLE, $QUEST_NUM)";
    const getNextID = "SELECT MAX(SID)+1 AS ID FROM SURVEYS";

    let temp_promise = new Promise((res, _) => {
        db.get(getNextID, (err, row) => {
            if (err)
                throw 'DB Error';
            else
                res(row);
        });
    });

    temp_promise = await temp_promise;
    const nextID = temp_promise['ID'];
    

    let params = {
        $SID_: nextID,
        $ADMIN_NAME:adminName,
        $S_TITLE:surveyTitle,
        $QUEST_NUM:questionNumber
    }

    return new Promise((res, rej) => {
        db.run(query, params, (err, row) => {
            if(err)
                rej(err);
            else{
                res({'sid' : nextID});
            }
        })
    })

}

exports.saveQuestion = async (surveyID, question, qid) => {
    const query = "INSERT INTO QUESTIONS(SID, TITLE, TYPE, MIN_R, MAX_R, QID) VALUES ($SID_, $TITLE_, $TYPE_, $MIN_R_, $MAX_R_, $QID_)";
    

    let params = {
        $SID_ : surveyID, 
        $TITLE_ : question.title, 
        $TYPE_ : question.type === 'Open'? 1 : 0,
        $MIN_R_ : question.minAns, 
        $MAX_R_ : question.maxAns, 
        $QID_ : qid,
    }

    return new Promise((res, rej) => {
        db.run(query, params, (err, row) => {
            if(err)
                rej(err);
            else{
                res(`Question #${qid} inserted properly in survey #${surveyID} '${question.title}'.`);
            }
        })
    })
    
}

exports.savePossibleAnswer = (surveyID, answerText, qid) => {
    const query = "INSERT INTO possibleanswers(AID, SID, QID, PLNTEXT) VALUES ($AID_, $SID_, $QID_, $PLNTEXT_)";

    let params = {
        $AID_ : null,
        $SID_: surveyID, 
        $QID_: qid, 
        $PLNTEXT_:answerText
    }

    return new Promise((res, rej) => {
        db.run(query, params, (err, row) => {
            if(err)
                rej(err);
            else{
                res(`Possible answer '${answerText}' inserted properly.`);
            }
        })
    })

}