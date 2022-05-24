const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let moment = require("moment");

// ------------------------------ show_AllottedSurvey ------------------------------

//example to same query to join -> select VAL.* from userAssign_Survey as US INNER JOIN initiate_Survey as VAL ON US.surveyType_Id= VAL.surveyQuestions_Id where user_Id = '2'

module.exports.show_AllottedSurvey = async (req, res) => {
  try {
    let {
      companyId,
      userId
    } = req.body;
    var userAssignSurveyDetail = await ConnectionUtil(
      `select * from userAssign_Survey where user_Id = '${userId}'`
    );
    let newArr = [];
    let history = [];
    for (let surveyType of userAssignSurveyDetail) {
      if (surveyType.isActiveSurvey == 1) {
        var surveyTypeDetail = await ConnectionUtil(
          `select updated_At,company_Id,surveyType_id,survey_Description,survey_Name from survey_Type where surveyType_id = '${surveyType.surveyType_Id}' `
        );
        newArr.push(surveyTypeDetail[0]);
      } else {
        var surveyTypeDetail = await ConnectionUtil(
          `select company_Id,surveyType_id,survey_Description,survey_Name from survey_Type where surveyType_id = '${surveyType.surveyType_Id}' `
        );
        history.push(surveyTypeDetail[0])
      }
    }
    newArr.sort((a, b) => b.updated_At - a.updated_At);
    res.status(200).json({
      success: true,
      message: "show alloted survey",
      data: newArr,
      history: history
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// ------------------------------ show_SurveyQuestions ------------------------------
module.exports.show_SurveyQuestions = async (req, res) => {
  try {
    let { company_Id , surveyType_Id } = req.body;
    let { id } = req.user; 
    let newArr = [];
    let surveyQuestionsDetails = await ConnectionUtil(`select * from survey_Questions where  surveyType_Id='${surveyType_Id}' AND (company_Id='${company_Id}' or company_Id='0')`);
    for(let surveyQuestion of surveyQuestionsDetails){
      let surveyQuestionsDetails = await ConnectionUtil(`select * from survey_Submission where surveyQuestion_Id	='${surveyQuestion.surveyQuestions_id}' AND surveyType_Id='${surveyType_Id}' AND user_Id='${id}'`); 
      if(surveyQuestionsDetails.length>0){
        surveyQuestion.answerkey=surveyQuestionsDetails;
        newArr.push(surveyQuestion);
      }else{
        surveyQuestion.answerkey=[];
        newArr.push(surveyQuestion);
      }
    }
    res.status(200).json({
      success: true,
      message: "show surveyQuestions",
      data: newArr
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//----------------------Survey Submission----------------------------------------------
module.exports.surveySubmission = async (req, res) => {
  try {
    let {
      ip_Address,
      userId,
      companyId,
      surveyTypeId,
      surveyQuestionId,
      surveyAnswerId,
      surveyAnswerText,
      isSubmit,
      survey_Type,
      surveyAnswerTextArray,
      rowColumnArray	
    } = req.body;
    
    var submitSurvey;
    if(survey_Type=="matrix"||survey_Type=="multiSelect"){
      var submitSurvey = {
        user_Id: userId,
        company_Id: companyId,
        surveyType_Id: surveyTypeId,
        surveyQuestion_Id: surveyQuestionId,
        surveyAnswer_Id: surveyAnswerId,
        surveyAnswerText:"",
        surveyAnswerTextArray:JSON.stringify(surveyAnswerTextArray),
        rowColumnArray:survey_Type=="matrix"?JSON.stringify(rowColumnArray):JSON.stringify([]),
        created_By: userId,
        updated_By: userId,
        ip_Address: ip_Address,
        isSubmit:isSubmit
      };
    }else{
      var submitSurvey = {
        user_Id: userId,
        company_Id: companyId,
        surveyType_Id: surveyTypeId,
        surveyQuestion_Id: surveyQuestionId,
        surveyAnswer_Id: surveyAnswerId,
        surveyAnswerText: surveyAnswerText,
        surveyAnswerTextArray:JSON.stringify([]),
        rowColumnArray:JSON.stringify([]),
        created_By: userId,
        updated_By: userId,
        ip_Address: ip_Address,
        isSubmit:isSubmit
      };
    }
    
    var submissionCheck = await ConnectionUtil(`select * from survey_Submission where user_Id='${userId}' AND company_Id='${companyId}' AND  surveyQuestion_Id='${surveyQuestionId}'`);
    if (submissionCheck.length == 0) {
      var questionSurvey = await ConnectionUtil(`select * from survey_Questions where surveyType_Id='${surveyTypeId}'`);
      var submissionDetails = await ConnectionUtil(`select * from survey_Submission where user_Id='${userId}' AND company_Id='${companyId}' AND  surveyType_Id='${surveyTypeId}'`);
      let q = questionSurvey.length;
      let a = submissionDetails.length + 1;
      if (q >= a) {
        var surveysubmissionDetails = await ConnectionUtil(
          `INSERT INTO survey_Submission SET?`,
          submitSurvey
        );
        if (surveysubmissionDetails.insertId != 0) {
          var questionSurvey = await ConnectionUtil(`select * from survey_Questions where surveyType_Id='${surveyTypeId}'`);
          var submissionDetails = await ConnectionUtil(`select * from survey_Submission where user_Id='${userId}' AND company_Id='${companyId}' AND  surveyType_Id='${surveyTypeId}'`);
         if(isSubmit==1){
          if (questionSurvey.length == submissionDetails.length) {
            var userAssignSurveyUpdateQuery = await ConnectionUtil(
              `update userAssign_Survey set isActiveSurvey='0' where user_Id='${userId}' AND  surveyType_Id='${surveyTypeId}' AND (company_Id='${companyId}' OR company_Id='0')`
            );
            return res.status(200).json({
              success: true,
              message: "Survey thank you survey submitted successfully",
              data: userAssignSurveyUpdateQuery
            });
          } else {
            return res.status(200).json({
              success: true,
              message: "survey submitted",
              data: surveysubmissionDetails,
            });
          }
        }else{
          return res.status(200).json({
            success: true,
            message: "survey submitted",
            data: surveysubmissionDetails,
          });
        }
        } else {
          res.status(200).json({
            success: true,
            message: "something went wrong",
            data: []
          });
        }
      } else {
        if(isSubmit==1){
        var userAssignSurveyUpdateQuery = await ConnectionUtil(
          `update userAssign_Survey set isActiveSurvey='0' where user_Id='${userId}' AND  surveyType_Id='${surveyTypeId}' AND (company_Id='${companyId}' OR company_Id='0')`
        );
        // ----challenge
        let surveyDetail = await ConnectionUtil(`select * from survey_Type`);     
        let challengeDetail = await ConnectionUtil(`select challenge_Configuration,company_Id , 
        Reward , action_Required , expiry_Date , challengePredefined_Id , challenges_id from challenges where  challengePredefined_Id = '${7}' AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d')`);
        
        let SurveyAlotted = await ConnectionUtil(`SELECT *
        FROM survey_Type as ST
        JOIN challenges as  C ON DATE_FORMAT(C.expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(ST.created_At,'%Y-%m-%d') where 
        C.challengePredefined_Id = 7 AND 
        (ST.company_Id='${companyId}' OR ST.company_Id=0) AND (C.company_Id='${companyId}' OR C.company_Id=0) AND
        DATE_FORMAT(ST.created_At,'%Y-%m-%d')>=DATE_FORMAT(C.created_At, '%Y-%m-%d')`);
        if(SurveyAlotted.length>0){
          for(let data of SurveyAlotted){
            let userSurvey = await ConnectionUtil(`select * from userAssign_Survey as US JOIN survey_Type as ST ON  ST.surveyType_id = US.surveyType_Id where US.isActiveSurvey='0' AND  US.user_Id = '${userId}'`); //US.surveyType_id='${data.surveyType_Id}' AND 
            let Count=userSurvey.length;
            for(let Challenge of challengeDetail){
            let config = JSON.parse(Challenge.challenge_Configuration);
              if(config[0].value.replace(/\s+/g, '')=="Equal"){  
                if(Count==config[1].value){
                  let challengeUserAssignDetail = await ConnectionUtil(`select * from userassign_challenges  where isCompleted='0' AND isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${userId}' `);  
                  if(challengeUserAssignDetail.length>0){
                    challengeUserAssignDetail.map(async(data)=>{ 
                      let challengeUserAssignUpdate = await ConnectionUtil(`update userassign_challenges set  isCompleted='1' where assignChallenge_id='${data.assignChallenge_id}'`);  
                      if(challengeUserAssignUpdate.affectedRows!=0){
                      var DATE = new Date().getDate();
                      var MONTH = new Date().getMonth() + 1;
                      var YEAR = new Date().getFullYear();
                      let date=YEAR + '-' + MONTH + '-' + DATE;
                        let obj={ 
                            user_Id      : userId,
                            reward_Id    : Challenge.challenges_id,
                            reward_point : Challenge.Reward,
                            isDeposit    : 1,            
                            redeem_Date  : date,
                        }
                        let addRewardRedeemInsertQuery = await ConnectionUtil(`INSERT INTO reward_redeem SET?`,obj); 
                      }
                    })
                  }
                }
              }
              if(config[0].value.replace(/\s+/g, '')=="MoreThan"){  
                if(Count >= config[1].value){
                  let challengeUserAssignDetail = await ConnectionUtil(`select * from userassign_challenges  where isCompleted='0' AND isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${userId}' `);  
                  if(challengeUserAssignDetail.length>0){
                    challengeUserAssignDetail.map(async(data)=>{ 
                      let challengeUserAssignUpdate = await ConnectionUtil(`update userassign_challenges set  isCompleted='1' where assignChallenge_id='${data.assignChallenge_id}'`);  
                      if(challengeUserAssignUpdate.affectedRows!=0){
                      var DATE = new Date().getDate();
                      var MONTH = new Date().getMonth() + 1;
                      var YEAR = new Date().getFullYear();
                      let date=YEAR + '-' + MONTH + '-' + DATE;
                        let obj={ 
                            user_Id      : userId,
                            reward_Id    : Challenge.challenges_id,
                            reward_point : Challenge.Reward,
                            isDeposit    : 1,            
                            redeem_Date  : date,
                        }
                        let addRewardRedeemInsertQuery = await ConnectionUtil(`INSERT INTO reward_redeem SET?`,obj); 
                      }
                    })
                  }
                }
              }
              if(config[0].value.replace(/\s+/g, '')=="LessThan"){  
                if(Count <= config[1].value){
                  let challengeUserAssignDetail = await ConnectionUtil(`select * from userassign_challenges  where isCompleted='0' AND isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${userId}' `);  
                  if(challengeUserAssignDetail.length>0){
                    challengeUserAssignDetail.map(async(data)=>{ 
                      let challengeUserAssignUpdate = await ConnectionUtil(`update userassign_challenges set  isCompleted='1' where assignChallenge_id='${data.assignChallenge_id}'`);  
                      if(challengeUserAssignUpdate.affectedRows!=0){
                      var DATE = new Date().getDate();
                      var MONTH = new Date().getMonth() + 1;
                      var YEAR = new Date().getFullYear();
                      let date=YEAR + '-' + MONTH + '-' + DATE;
                        let obj={ 
                            user_Id      : userId,
                            reward_Id    : Challenge.challenges_id,
                            reward_point : Challenge.Reward,
                            isDeposit    : 1,            
                            redeem_Date  : date,
                        }
                        let addRewardRedeemInsertQuery = await ConnectionUtil(`INSERT INTO reward_redeem SET?`,obj); 
                      }
                    })
                  }
                }
              }      
            }
          }  
        }
        // ----challenge
          res.status(200).json({
            success: true,
            message: "Survey thank you survey submitted successfully",
            data: userAssignSurveyUpdateQuery,
            value: a,
            q
          });
        }
      }
    } else {
      let surveySbumissionUpdateQuery;
      if(survey_Type=="matrix"||survey_Type=="multiSelect"){
        let ans=JSON.stringify(surveyAnswerTextArray);
        let matrix =survey_Type=="matrix"?JSON.stringify(rowColumnArray):JSON.stringify([]);
        surveySbumissionUpdateQuery = await ConnectionUtil(
          `update survey_Submission set 
          ip_Address='${ip_Address}',
          surveyAnswerTextArray='${ans}',
          rowColumnArray='${matrix}'  
          where 
          surveyQuestion_Id='${surveyQuestionId}' AND
          user_Id='${userId}' AND  
          surveyType_Id='${surveyTypeId}' AND
          company_Id = '${companyId}'`
        );
      }else{
        surveySbumissionUpdateQuery = await ConnectionUtil(
          `update survey_Submission set 
          ip_Address='${ip_Address}',
          surveyAnswerText='${surveyAnswerText}'
          where 
          surveyQuestion_Id='${surveyQuestionId}' AND
          user_Id='${userId}' AND  
          surveyType_Id='${surveyTypeId}' AND
          company_Id = '${companyId}'`
        );
      }
    
      res.status(200).json({
        success: true,
        message: "survey submitted",
        data: surveySbumissionUpdateQuery
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//----------------------survey_AnswerList----------------------------------------------
module.exports.survey_AnswerList = async (req, res) => {
  try {
    let {
      userId,
      companyId,
      surveyTypeId
    } = req.body;
    let newArr = [];
    var surveySubmissionList = await ConnectionUtil(
      `select surveyAnswerTextArray,surveyQuestion_Id,surveyAnswerText from survey_Submission where user_Id='${userId}' AND (company_Id='${companyId}' OR company_Id='0') AND surveyType_Id='${surveyTypeId}'`
    );
    for (let surveyList of surveySubmissionList) {
      var surveySubmissionList = await ConnectionUtil(
        `select survey_Title	 from survey_Questions where surveyQuestions_id='${surveyList.surveyQuestion_Id}' AND (company_Id='${companyId}' OR company_Id='0')  AND surveyType_Id='${surveyTypeId}'`
      );
      surveyList.surveyQuestion = surveySubmissionList[0].survey_Title != '' ? surveySubmissionList[0].survey_Title : '';
      if(surveyList.surveyAnswerText==""){
        surveyList.surveyAnswerText=surveyList.surveyAnswerTextArray
      }else{
        surveyList.surveyAnswerText=JSON.stringify(surveyList.surveyAnswerText)
      }      
      newArr.push(surveyList);
    }
    var totalSubmissionCount = await ConnectionUtil(`select * from survey_Submission where user_Id='${userId}' AND (company_Id='${companyId}' OR company_Id='0') AND surveyType_Id='${surveyTypeId}'`);
    var totalQuestionCount = await ConnectionUtil(`select * from survey_Questions where (company_Id='${companyId}' OR company_Id='0') AND surveyType_Id='${surveyTypeId}'`);
    res.status(200).json({
      success: true,
      message: "Show survey Answerlist",
      data: newArr,
      totalSubmissionCount: totalSubmissionCount.length,
      totalQuestionCount: totalQuestionCount.length
    });
  } catch (err) {
    console.log(err)
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};