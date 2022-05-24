const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
// let ConnectionUtil = util.promisify($dbCon.query).bind($dbCon);
let message = require("../../lib/helpers/message");
let { helperNotification } = require("../../lib/helpers/fcm");
const { companyShowSMTP } = require("./companySMTP_Controller");
const { companyAddTheme } = require("./companyTheme_Controller");
const e = require("express");
//------------------------- add_SurveyQuestion -------------------------
module.exports.add_SurveyQuestion = async (req, res) => {
  try {
    let { survey_Name, survey_Description, questionArray, userId, companyId } =
      req.body;
    let { branch_Id, access } = req.query;
    let surveyTypeObj = {
      survey_Name: survey_Name,
      survey_Description: survey_Description,
      user_Id: userId,
      company_Id: companyId,
      created_By: userId,
      updated_By: userId,
      ip_Address: questionArray[0].ip_Address,
      status: 0,
      branch_Id: branch_Id,
    };
    let surveyTypeAddQueryFind = await ConnectionUtil(
      `INSERT INTO survey_Type SET?`,
      surveyTypeObj
    );
    if (surveyTypeAddQueryFind.insertId != 0) {
      let cId = companyId;
      let uId = userId;
      for (let questionObj of questionArray) {
        let optionArray = JSON.stringify(questionObj.survey_OptionArray);
        let subQuestion = JSON.stringify(questionObj.survey_SubQuestion);
        let columnArray = JSON.stringify(questionObj.survey_ColumnArray);
        let rowArray = JSON.stringify(questionObj.survey_RowArray);
        let sliderOption = JSON.stringify(questionObj.survey_SliderOption);
        let optDepndent = JSON.stringify(questionObj.dependentOption);
        let surveyQuestionObj = {
          survey_Name: survey_Name,
          survey_Description: questionObj.survey_Description,
          survey_Type: questionObj.survey_Type,
          survey_Title: questionObj.survey_Title,
          // survey_Category: questionObj.survey_Category,
          survey_OptionArray: optionArray,
          survey_subQuestion: subQuestion,
          survey_SliderOption: sliderOption,
          survey_Answer: questionObj.survey_Answer,
          survey_ColumnArray: columnArray,
          survey_RowArray: rowArray,
          isRequired: questionObj.isRequired,
          ip_Address: questionObj.ip_Address,
          created_By: uId, //userId,
          updated_By: uId, //userId,
          company_Id: cId, //companyId,
          user_Id: uId, //userId,
          surveyType_Id: surveyTypeAddQueryFind.insertId,
          dependentQuestionId: questionObj.dependentQuestionId, //dependent Question logic params
          questionId: questionObj.questionId, //dependent Question logic params
          dependentOption: optDepndent, //dependent Question logic params
          branch_Id: branch_Id,
        };
        let surveyQuestionAddQueryFind = await ConnectionUtil(
          `INSERT INTO survey_Questions SET?`,
          surveyQuestionObj
        );
      }
      res.status(200).json({
        success: true,
        message: "survey added successfully",
        // data: newArr,
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

//------------------------- Show_SurveyQuestion -------------------------
module.exports.Show_SurveyQuestion = async (req, res) => {
  try {
    let { company_Id } = req.body;
    let { branch_Id, access } = req.query;
    let surveyQuestionDetail;
    if (access == 0) {
      surveyQuestionDetail = await ConnectionUtil(
        `select * from survey_Type where status='0' AND company_Id='${company_Id}' AND branch_Id='${branch_Id}' ORDER BY surveyType_id DESC `
      );
    } else {
      surveyQuestionDetail = await ConnectionUtil(
        `select * from survey_Type where status='0' AND company_Id='${company_Id}' ORDER BY surveyType_id DESC `
      );
    }
    res.status(200).json({
      success: true,
      message: "Show survey question list",
      data: surveyQuestionDetail,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//------------------------- Initiated_Survey -------------------------
module.exports.Initiated_Survey = async (req, res) => {
  try {
    let {
      surveyQuestions_Id,
      company_Id,
      survey_AgeTo,
      survey_AgeFrom,
      survey_Gender,
      survey_Department,
      survey_ExpiryDate,
      survey_ExpiryTime,
      survey_CompanyId,
      user_Id,
      ip_Address,
    } = req.body;
    let { branch_Id, access } = req.query;
    let initiataedSurveyData = await ConnectionUtil(
      `SELECT * FROM initiate_Survey WHERE surveyQuestions_Id ='${surveyQuestions_Id}'`
    );
   
    if (initiataedSurveyData == "") {
      let InitiatSurveyObj = {
        surveyQuestions_Id: surveyQuestions_Id,
        company_Id: company_Id,
        survey_AgeTo:
          survey_AgeTo != null &&
          survey_AgeTo != "" &&
          survey_AgeTo != undefined
            ? survey_AgeTo
            : 200,
        survey_AgeFrom:
          survey_AgeFrom != null &&
          survey_AgeFrom != "" &&
          survey_AgeFrom != undefined
            ? survey_AgeFrom
            : 0,
        survey_Gender:
          survey_Gender != null &&
          survey_Gender != "" &&
          survey_Gender != undefined
            ? survey_Gender
            : null,
        //survey_CompanyId:survey_CompanyId,
        survey_Department: survey_Department,
        survey_ExpiryDate: survey_ExpiryDate,
        survey_ExpiryTime: survey_ExpiryTime,
        created_By: user_Id,
        updated_By: user_Id,
        ip_Address: ip_Address,
        branch_Id: branch_Id,
      };

      let InitiatSurveyAddQueryFind = await ConnectionUtil(
        `INSERT INTO initiate_Survey SET?`,
        InitiatSurveyObj
      );
      if (InitiatSurveyAddQueryFind.insertId != 0) {
        let InitiatSurveyUpdateQueryFind = await ConnectionUtil(
          `update survey_Type SET status='1' where surveyType_id='${surveyQuestions_Id}'`
        );
        if (InitiatSurveyUpdateQueryFind.affectedRows != 0) {
          let companyClause = "";
          let genderClause = "";
          let departmentClause = "";
          let ageClause = "";
          if (survey_CompanyId != null && survey_CompanyId != 0) {
            companyClause = `AND company_id='${survey_CompanyId}'`;
          }
          if (survey_AgeTo != null && survey_AgeFrom != null) {
            ageClause = `AND Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0)>='${survey_AgeFrom}' AND Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0)<='${survey_AgeTo}'`;
          }
          if (survey_Gender != null) {
            gender = survey_Gender == 1 ? "female" : "male";
            genderClause = `AND gender='${gender}'`;
          }
          if (survey_Department != null) {
            var department = await ConnectionUtil(
              `select * from department where isActive='1' AND company_Id='${survey_CompanyId}' AND department_id='${survey_Department}'`
            );
            if (department.length > 0) {
              departmentClause = `AND department='${department[0].department_Type}'`;
            } else {
              departmentClause = "";
            }
          }
          let UserDetails;
          if (access == 0) {
            UserDetails = await ConnectionUtil(
              `select * from user where role !='1' AND isActive='1' AND branch_Id='${branch_Id}' ${companyClause} ${genderClause} ${departmentClause} ${ageClause}`
            );
          } else {
            UserDetails = await ConnectionUtil(
              `select * from user where role !='1' AND isActive='1'  ${companyClause} ${genderClause} ${departmentClause} ${ageClause}`
            );
          }

          let newArr = [];
          let tokenpush_arr = [];
          let Arr = [];
          if (UserDetails.length > 0) {
            for (let user of UserDetails) {
              let userAssign = {
                user_Id: user.user_id,
                surveyType_Id: surveyQuestions_Id,
                surveyExpiry_Date: survey_ExpiryDate,
                company_Id: company_Id,
                branch_Id: branch_Id,
              };
              let userAssign_Survey = ConnectionUtil(
                `INSERT into userAssign_Survey SET?`,
                userAssign
              );

              let userDeviceToken = await ConnectionUtil(
                `select device_Token,user_Id from fcm_Notification where user_Id='${user.user_id}'`
              );

              await userDeviceToken.map(async (data) => {
                if (data.device_Token) {
                  Arr.push(data);
                  let token =
                    data.device_Token != null &&
                    data.device_Token != undefined &&
                    data.device_Token != ""
                      ? data.device_Token
                      : "d8QyFhQqRAy6Y6UyYaOXwm:APA91bEJqszHm-HQBrkpiinDrjVY_FLLSgljSIIhWw4u5kgyVq2rgzujK0arnIL_drErnh_8JbvGbMErh0OgT8Sqx6LlONGsdQzgBn-HuNfZ4aRtPhwu6SC8Dsqq9XxS-9xdCMuRSWtX";
                  return tokenpush_arr.push(token);
                }
              });
              newArr.push(user.user_id);
            }

            let userIdArr = Arr.map((data) => {
              return data.user_Id;
            });

            let userIdSet = new Set(userIdArr);

            userIdSet.forEach(async (data) => {
              await notificaiton_userSave(
                user_Id,
                data,
                company_Id,
                ip_Address
              );
            });

            let testMessage = {
              title: "Survey",
              body: "Your survey assign successfully",
            };
            await helperNotification(tokenpush_arr, testMessage);
            res.status(200).json({
              success: true,
              message: "Survey is initiated!!!",
              data: newArr,
            });
          } else {
            await ConnectionUtil(
              `Delete from initiate_Survey where initiateSurvey_id='${InitiatSurveyAddQueryFind.insertId}'`
            );
            await ConnectionUtil(
              `update survey_Type SET status='0' where surveyType_id='${surveyQuestions_Id}'`
            );
            res.status(200).json({
              success: true,
              message: "Survey Initiated Successfully",
              data: [],
            });
          }
        } else {
          res.status(404).json({
            success: false,
            message: " survey is not intiated!!!",
          });
        }
      } else {
        res.status(404).json({
          success: false,
          message: " survey is not intiated! Something went wrong",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "This survey is already initiated",
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

//------------------------- active_Survey -------------------------
module.exports.Active_Survey = async (req, res) => {
  try {
    let { companyId } = req.body;
    let { branch_Id, access } = req.query;
    let ActiveSurveyQueryFind;
    if (access == 0) {
      ActiveSurveyQueryFind = await ConnectionUtil(
        `select * from initiate_Survey where company_Id='${companyId}'  AND branch_Id='${branch_Id}' 
        DATE_FORMAT(survey_ExpiryDate, '%Y-%m-%d') >= DATE_FORMAT(CURDATE(),'%Y-%m-%d')
        ORDER BY initiateSurvey_id DESC`
      );
    } else {
      ActiveSurveyQueryFind = await ConnectionUtil(
        `select * from initiate_Survey where company_Id='${companyId}'  AND 
        DATE_FORMAT(survey_ExpiryDate, '%Y-%m-%d') >= DATE_FORMAT(CURDATE(),'%Y-%m-%d')
        ORDER BY initiateSurvey_id DESC`
      );
    }
    let newArr = [];
    for (let surveyName of ActiveSurveyQueryFind) {
      let typeid = surveyName.surveyQuestions_Id;
      let SurveyTypeQueryFind = await ConnectionUtil(
        `select * from  survey_Type where surveyType_id = '${surveyName.surveyQuestions_Id}' AND isActive='1'`
      );
      let UserAssignQueryFind = await ConnectionUtil(
        `select * from userAssign_Survey where surveyType_Id = '${surveyName.surveyQuestions_Id}'`
      );
      let totalUserCount = UserAssignQueryFind.length;
      let AttemptedCount = await UserAssingedAttemptedQuestion(
        companyId,
        surveyName.surveyQuestions_Id
      );
      if (SurveyTypeQueryFind != "") {
        surveyName.survey_Name =
          SurveyTypeQueryFind[0].survey_Name != ""
            ? SurveyTypeQueryFind[0].survey_Name
            : "";
        surveyName.survey_Description =
          SurveyTypeQueryFind[0].survey_Description != ""
            ? SurveyTypeQueryFind[0].survey_Description
            : "";
        surveyName.totalUserAssign = totalUserCount != "" ? totalUserCount : 0;
        surveyName.totalUserSubmission =
          AttemptedCount.totAttempted != "" ? AttemptedCount.totAttempted : 0;
      }
      // else {
      //   surveyName.survey_Name = "Test";
      //   surveyName.survey_Description = "Test";
      // }
      newArr.push(surveyName);
    }
    res.status(200).json({
      success: true,
      message: "Show active survey",
      data: newArr,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//------------------------- Detail_Survey -------------------------
module.exports.Detail_Survey = async (req, res) => {
  try {
    let { companyId, surveyQuestionsId } = req.body;
    let InitiateSurveyQueryFind = await ConnectionUtil(`select 
    initiateSurvey_id,
    surveyQuestions_Id,
    company_Id,
    survey_AgeTo,
    survey_AgeFrom,
    survey_Gender,
    survey_Department,
    survey_ExpiryDate
    from initiate_Survey where surveyQuestions_Id='${surveyQuestionsId}' AND company_Id='${companyId}' AND Date(CURRENT_DATE())<=Date(survey_ExpiryDate)`);
    if (InitiateSurveyQueryFind != "") {
      let AttemptedCount = await UserAssingedAttemptedQuestion(
        companyId,
        surveyQuestionsId
      );
      let newArr = [];
      for (let initiateObj of InitiateSurveyQueryFind) {
        let SurveyTypeQueryFind = await ConnectionUtil(
          `select survey_Name , survey_Description from  survey_Type where surveyType_id = '${initiateObj.surveyQuestions_Id}'`
        );
        let SurveyUserAssignQueryFind = await ConnectionUtil(
          `select * from userAssign_Survey where surveyType_id = '${initiateObj.surveyQuestions_Id}'`
        );
        let UserDetail = await userFetchData(SurveyUserAssignQueryFind);
        let userQuestionCount = await QuestionCount(
          UserDetail,
          surveyQuestionsId
        ); //function QuestionCount
        if (SurveyTypeQueryFind != "") {
          initiateObj.TotalQuestionCount = AttemptedCount.TotalQuestion;
          initiateObj.totalQuestion = AttemptedCount.totUser;
          initiateObj.totalUserAttempted = AttemptedCount.totAttempted;
          initiateObj.survey_Name =
            SurveyTypeQueryFind[0].survey_Name != ""
              ? SurveyTypeQueryFind[0].survey_Name
              : "";
          initiateObj.survey_Description =
            SurveyTypeQueryFind[0].survey_Description != ""
              ? SurveyTypeQueryFind[0].survey_Description
              : "";
          initiateObj.surveyType_id =
            SurveyTypeQueryFind[0].surveyType_id != ""
              ? SurveyTypeQueryFind[0].surveyType_id
              : "";
          initiateObj.user = userQuestionCount;
        } else {
          initiateObj.TotalQuestionCount = AttemptedCount.TotalQuestion;
          initiateObj.totalQuestion = AttemptedCount.totUser;
          initiateObj.totalUserAttempted = AttemptedCount.totAttempted;
          initiateObj.survey_Name =
            SurveyTypeQueryFind[0].survey_Name != ""
              ? SurveyTypeQueryFind[0].survey_Name
              : "";
          initiateObj.survey_Description =
            SurveyTypeQueryFind[0].survey_Description != ""
              ? SurveyTypeQueryFind[0].survey_Description
              : "";
          initiateObj.surveyType_id =
            SurveyTypeQueryFind[0].surveyType_id != ""
              ? SurveyTypeQueryFind[0].surveyType_id
              : "";
          initiateObj.user = userQuestionCount;
        }
        newArr.push(initiateObj);
      }
      console.log(newArr);
      res.status(200).json({
        success: true,
        message: "Show active survey details",
        data: newArr,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Show active survey details",
        data: [],
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

// ======== function userFetch_data count ========
async function userFetchData(user_assignSurvey) {
  let newArr = [];
  for (let user_assignSurveyObj of user_assignSurvey) {
    let userData = await ConnectionUtil(
      `select company_Id,user_id,CONCAT(first_name,' ',last_name) as name,email, profile_picture from user where user_id='${user_assignSurveyObj.user_Id}'`
    );
    newArr.push(userData);
  }
  return newArr;
}

// ======== function user Question count ========
async function QuestionCount(userData, surveyQuestionsId) {
  let arrNew = [];
  for (let userObj of userData) {
    let surveySubmission = await ConnectionUtil(
      `select * from survey_Submission where  surveyType_Id='${surveyQuestionsId}' AND user_Id='${userObj[0].user_id}' AND company_Id='${userObj[0].company_Id}'`
    );
    let len = surveySubmission.length;
    userObj[0].attemptedQuestion =
      surveySubmission.length != 0 ? surveySubmission : [];
    userObj[0].attemptedCount = len != 0 ? len : 0;
    arrNew.push(userObj);
  }
  let userDataArray = arrNew.flat();
  return userDataArray; //arrNew;
}

//function
async function UserAssingedAttemptedQuestion(companyId, surveyQuestionsId) {
  let arrNew = [];
  let userAssignSurveyCount = await ConnectionUtil(
    `select * from  userAssign_Survey  where  surveyType_Id='${surveyQuestionsId}'  AND company_Id='${companyId}'`
  );
  let surveyQuestionCount = await ConnectionUtil(
    `select * from survey_Questions where surveyType_Id='${surveyQuestionsId}' AND company_Id='${companyId}'`
  );
  let UAssignCount = userAssignSurveyCount.length;
  let qCount = surveyQuestionCount.length;
  let atmpCount = 0;
  for (let userAssignCount of userAssignSurveyCount) {
    let SubmissionLength = await ConnectionUtil(
      `select * from  survey_Submission  where  surveyType_Id='${surveyQuestionsId}' AND user_Id='${userAssignCount.user_Id}' AND company_Id='${userAssignCount.company_Id}'`
    );
    let sub = SubmissionLength.length;
    if (sub == qCount) {
      atmpCount++;
    }
  }
  let obj = {
    totAttempted: atmpCount,
    totUser: UAssignCount,
    TotalQuestion: qCount,
  };
  return obj;
}

//------------------------- UserAttemptedQuestion_Survey -------------------------
module.exports.AttemptedQuestion_Survey = async (req, res) => {
  try {
    let { surveyTypeId, companyId } = req.body;
    let surveyQuestion = await ConnectionUtil(
      `select * from survey_Questions where surveyType_Id='${surveyTypeId}' AND company_Id='${companyId}'`
    );
    let userAssignDetails = await ConnectionUtil(
      `select * from userAssign_Survey where surveyType_Id='${surveyTypeId}' AND company_Id='${companyId}'`
    );
    let newArray = [];
    for (let QuestionObj of surveyQuestion) {
      let QuestionCountObj = await Question_SubmissionCount(
        QuestionObj,
        userAssignDetails
      );
      newArray.push(QuestionCountObj);
    }
    res.status(200).json({
      success: true,
      message: "Show user attempted question survey ",
      data: newArray,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ===================== Question_SubmissionCount_function =====================
async function Question_SubmissionCount(questionId, userDetail) {
  let obj = {
    surveyQuestions_id: questionId.surveyQuestions_id,
    surveyType_Id: questionId.surveyType_Id,
    survey_Title: questionId.survey_Title,
    survey_Name: questionId.survey_Name,
    surveyDescription: questionId.survey_Description,
    yesCount: 0,
    noCount: 0,
  };
  for (let userAssign of userDetail) {
    let surveySubmission = await ConnectionUtil(
      `select * from survey_Submission where   user_Id = '${userAssign.user_Id}' AND surveyQuestion_Id='${questionId.surveyQuestions_id}' AND surveyType_Id='${userAssign.surveyType_Id}' AND company_Id='${userAssign.company_Id}'`
    );
    if (surveySubmission.length) {
      obj.yesCount++;
    } else {
      obj.noCount++;
    }
  }
  return obj;
}
//------------------------- QuestionSubmission_Survey -------------------------
module.exports.QuestionSubmission_Survey = async (req, res) => {
  try {
    let { surveyQuestionsId, surveyTypeId, companyId } = req.body;
    let surveyQuestion = await ConnectionUtil(
      `select * from survey_Questions where   surveyQuestions_id = '${surveyQuestionsId}' AND company_Id='${companyId}'`
    );
    let userAssignDetails = await ConnectionUtil(
      `select * from userAssign_Survey where surveyType_Id='${surveyQuestion[0].surveyType_Id}' AND company_Id='${companyId}'`
    );
    let newArr = [];
    let userObj = {};
    for (let user of userAssignDetails) {
      let userDetails = await ConnectionUtil(
        `select CONCAT(first_name,' ',last_name) as name,email,profile_picture from user where user_id='${user.user_Id}' AND company_Id='${companyId}'`
      );
      let surveyAnswerKey = await ConnectionUtil(
        `select * from survey_Submission where surveyQuestion_Id='${surveyQuestionsId}'and user_Id='${user.user_Id}' AND surveyType_Id='${surveyTypeId}'`
      );
      let answerArr = surveyAnswerKey.length > 0 ? surveyAnswerKey : [];
      userObj = {
        userId: user.user_Id,
        companyId: user.company_Id,
        name: userDetails[0].name,
        email: userDetails[0].email,
        profile_picture: userDetails[0].profile_picture,
        yesCount: 0,
        noCount: 0,
        surveyTypeId: surveyTypeId,
        answerArray: answerArr,
      };
      let submission = await SubmissionCount(
        userObj,
        surveyQuestionsId,
        companyId
      ); //function calling
      newArr.push(submission);
    }
    res.status(200).json({
      success: true,
      message: "Show question submission survey count",
      data: newArr,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
//================== SubmissionCount_function ==================
async function SubmissionCount(userObj, surveyQuestionsId, companyId) {
  let Details = await ConnectionUtil(
    `SELECT * FROM survey_Submission where  user_Id ='${userObj.userId}' AND surveyQuestion_Id='${surveyQuestionsId}' AND company_Id='${companyId}'`
  );
  if (Details.length) {
    userObj.yesCount++;
  } else {
    userObj.noCount++;
  }
  return userObj;
}
//------- ------------------ UserAssignList_Survey -------------------------
module.exports.UserAssignList_Survey = async (req, res) => {
  try {
    let { surveyTypeId, companyId } = req.body;
    let userAssignDetails = await ConnectionUtil(
      `select userAssignSurvey_id,user_Id,surveyType_Id,surveyExpiry_Date,company_Id from userAssign_Survey where surveyType_Id='${surveyTypeId}' AND company_Id='${companyId}'`
    );
    let newArr = [];
    for (let data of userAssignDetails) {
      let userDetails = await ConnectionUtil(
        `select designation,email,profile_picture,CONCAT(first_name,' ',last_name) as name from user where user_id='${data.user_Id}'`
      );
      data.email = userDetails[0].email;
      data.profile_picture = userDetails[0].profile_picture;
      data.name = userDetails[0].name;
      data.designation = userDetails[0].designation;
      newArr.push(data);
    }
    res.status(200).json({
      success: true,
      message: "Show user assign list survey",
      data: newArr,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//------------------------- IndividualResponses_Survey -------------------------
module.exports.IndividualResponses_Survey = async (req, res) => {
  try {
    let { companyId, userId, surveyTypeId } = req.body;
    let surveyQuestionDetail = await ConnectionUtil(
      `select surveyType_Id,surveyQuestions_id,survey_Title,survey_Description from survey_Questions where   surveyType_Id = '${surveyTypeId}' AND company_Id='${companyId}'`
    );
    let arrNew = [];
    for (let question of surveyQuestionDetail) {
      question.yesCount = 0;
      question.noCount = 0;
      let surveySubmissionDetail = await ConnectionUtil(
        `select * from survey_Submission where user_Id='${userId}'AND  surveyQuestion_Id='${question.surveyQuestions_id}' AND company_Id='${companyId}'`
      );
      if (surveySubmissionDetail.length) {
        question.yesCount++;
        question.noCount;
      }
      arrNew.push(question);
    }
    res.status(200).json({
      success: true,
      message: "Show individualResponses survey ",
      data: arrNew,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//------------------------- ReminderAll_Survey -------------------------
module.exports.ReminderAllUser_Survey = async (req, res) => {
  try {
    let { companyId, surveyTypeId } = req.body;
    if (surveyTypeId == "") {
      return res.status(401).json({
        success: false,
        message: "SurveyTypeId is required",
      });
    }
    if (companyId == 0) {
      let surveyQuestionDetail = await ConnectionUtil(
        `select survey_Name,surveyType_Id,surveyQuestions_id,survey_Title,
    survey_Description,company_id from survey_Questions where   surveyType_Id = '${surveyTypeId}'`
      );
      if (surveyQuestionDetail != "") {
        let checkuserAssignCount = await ConnectionUtil(
          `select * from userAssign_Survey where surveyType_Id='${surveyTypeId}'`
        );
        let getuserAssignCount = checkuserAssignCount.length;
        let checksubmission = await ConnectionUtil(
          `select *  from survey_Submission where  surveyType_Id='${surveyTypeId}'`
        );
        let getusersubmissinCount = checksubmission.length;
        if (getuserAssignCount > getusersubmissinCount) {
          let checkuserAssign = await ConnectionUtil(
            `select * from userAssign_Survey where surveyType_Id='${surveyTypeId}'`
          );
          for (let user of checkuserAssign) {
            let getuser = user.user_Id;
            let Arr = [];
            let userDeviceToken = await ConnectionUtil(
              `select device_Token from fcm_Notification where user_Id='${getuser}' AND device_Token IS NOT NULL`
            );
            let user = await ConnectionUtil(
              `select CONCAT(COALESCE(U.first_name,' '),' ',COALESCE(U.last_name,' ')) as name from user where user_Id='${getuser}'`
            );
            await userDeviceToken.map((data) => {
              return Arr.push(data.device_Token);
            });
            let testMessage = {
              title: "Completed survey reminder", //"Survey Submission Reminder",
              body:
                `Hey ` +
                user[0].name +
                `, are you ready to share your responses for ` +
                surveyQuestionDetail[0].survey_Name +
                `?`, //"You have to submit your pending survey questions"
              // info: Complete it now Remind me tomorrow
            };
            await helperNotification(Arr, testMessage);
          }
          res.status(200).json({
            success: true,
            message: "reminder sent successfully",
          });
        }
        res.status(200).json({
          success: true,
          message: "user's already submitted survey",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "invalid credintials",
        });
      }
    } else {
      let surveyQuestionDetail = await ConnectionUtil(
        `select survey_Name,surveyType_Id,surveyQuestions_id,survey_Title,
    survey_Description,company_id from survey_Questions where   surveyType_Id = '${surveyTypeId}' AND company_Id='${companyId}'`
      );
      if (surveyQuestionDetail != "") {
        let checkuserAssignCount = await ConnectionUtil(
          `select COUNT(*) from userAssign_Survey where surveyType_Id='${surveyTypeId}' AND company_Id='${companyId}'`
        );
        let getuserAssignCount = Object.values(checkuserAssignCount[0]);
        let checksubmission = await ConnectionUtil(
          `select COUNT(*)  from survey_Submission where  surveyType_Id='${surveyTypeId}' AND company_Id='${companyId}'`
        );
        let getusersubmissinCount = Object.values(checksubmission[0]);
        if (getuserAssignCount > getusersubmissinCount) {
          let checkuserAssign = await ConnectionUtil(
            `select * from userAssign_Survey where surveyType_Id='${surveyTypeId}' AND company_Id='${companyId}'`
          );
          for (let user of checkuserAssign) {
            let getuser = user.user_Id;
            let Arr = [];
            let userDeviceToken = await ConnectionUtil(
              `select device_Token from fcm_Notification where user_Id='${getuser}' AND company_Id ='${companyId}'`
            );
            let user = await ConnectionUtil(
              `select CONCAT(COALESCE(U.first_name,' '),' ',COALESCE(U.last_name,' ')) as name from user where user_Id='${getuser}'`
            );
            await userDeviceToken.map((data) => {
              return Arr.push(data.device_Token);
            });
            let testMessage = {
              title: "Completed survey reminder", //"Survey Submission Reminder",
              body:
                `Hey ` +
                user[0].name +
                `, are you ready to share your responses for ` +
                surveyQuestionDetail[0].survey_Name +
                `?`, //"You have to submit your pending survey questions"
              // info: Complete it now Remind me tomorrow
            };
            await helperNotification(Arr, testMessage);
          }
          res.status(200).json({
            success: true,
            message: "reminder sent successfully",
          });
        }
        res.status(200).json({
          success: true,
          message: "user's already submitted survey",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "invalid credintials",
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//------------------------- ReminderByUSer_Survey -------------------------
module.exports.ReminderByUSer_Survey = async (req, res) => {
  try {
    let { companyId, userId, surveyTypeId } = req.body;
    if (userId == "") {
      return res.status(401).json({
        success: false,
        message: "UserId is required",
      });
    }
    if (surveyTypeId == "") {
      return res.status(401).json({
        success: false,
        message: "SurveyTypeId is required",
      });
    }
    if (companyId == 0) {
      let surveyQuestionDetail = await ConnectionUtil(
        `select surveyType_Id,surveyQuestions_id,survey_Title,
          survey_Description from survey_Questions where  surveyType_Id = '${surveyTypeId}'  AND isActive='1'`
      );
      if (surveyQuestionDetail != "") {
        let QuestionCount = await ConnectionUtil(
          `SELECT * FROM survey_Questions WHERE  surveyType_Id = '${surveyTypeId}'  AND isActive='1' `
        );
        let getCount = QuestionCount.length;
        let survey_Submission = await ConnectionUtil(
          `select * from survey_Submission where user_Id='${userId}' AND surveyType_Id='${surveyTypeId}' `
        );
        let getsubmissionCount = survey_Submission.length;
        if (getCount > getsubmissionCount) {
          let Arr = [];
          let userDeviceToken = await ConnectionUtil(
            `select device_Token from fcm_Notification where user_Id='${userId}' AND device_Token IS NOT NULL`
          );
          let user = await ConnectionUtil(
            `select CONCAT(COALESCE(U.first_name,' '),' ',COALESCE(U.last_name,' ')) as name from user where user_Id='${userId}'`
          );
          await userDeviceToken.map((data) => {
            return Arr.push(data.device_Token);
          });
          let testMessage = {
            title: "Completed survey reminder", //"Survey Submission Reminder",
            body:
              `Hey ` +
              user[0].name +
              `, are you ready to share your responses for ` +
              surveyQuestionDetail[0].survey_Name +
              `?`, //"You have to submit your pending survey questions"
            // info: Complete it now Remind me tomorrow
          };
          await helperNotification(Arr, testMessage);
          res.status(200).json({
            success: true,
            message: "reminder sent successfully",
          });
        } else {
          res.status(200).json({
            success: true,
            message: "user already submitted",
          });
        }
      } else {
        res.status(400).json({
          success: false,
          message: "the survey you entered is not in our database",
        });
      }
    } else {
      let surveyQuestionDetail = await ConnectionUtil(
        `select surveyType_Id,surveyQuestions_id,survey_Title,
        survey_Description from survey_Questions where  surveyType_Id = '${surveyTypeId}' AND company_Id='${companyId}' AND isActive='1'`
      );
      if (surveyQuestionDetail.length > 0) {
        let QuestionCount = await ConnectionUtil(
          `SELECT * FROM survey_Questions WHERE  surveyType_Id = '${surveyTypeId}' AND company_Id='${companyId}' AND isActive='1' `
        );
        let getCount = QuestionCount.length;
        let survey_Submission = await ConnectionUtil(
          `select * from survey_Submission where user_Id='${userId}' AND surveyType_Id='${surveyTypeId}' AND company_Id='${companyId}'`
        );
        let getsubmissionCount = survey_Submission.length;
        if (getCount > getsubmissionCount) {
          let Arr = [];
          let userDeviceToken = await ConnectionUtil(
            `select device_Token from fcm_Notification where user_Id='${userId}' AND device_Token IS NOT NULL `
          );
          let user = await ConnectionUtil(
            `select CONCAT(COALESCE(U.first_name,' '),' ',COALESCE(U.last_name,' ')) as name from user where user_Id='${userId}'`
          );
          await userDeviceToken.map((data) => {
            return Arr.push(data.device_Token);
          });
          let testMessage = {
            title: "Completed survey reminder", //"Survey Submission Reminder",
            body:
              `Hey ` +
              user[0].name +
              `, are you ready to share your responses for ` +
              surveyQuestionDetail[0].survey_Name +
              `?`, //"You have to submit your pending survey questions"
            // info: Complete it now Remind me tomorrow
          };
          await helperNotification(Arr, testMessage);
          res.status(200).json({
            success: true,
            message: "reminder sent successfully",
          });
        } else {
          res.status(200).json({
            success: true,
            message: "user already submitted",
          });
        }
      } else {
        res.status(404).json({
          success: false,
          message: "the survey you entered is not in our database",
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//------------------------- SurveyTypeByQuestion -------------------------
module.exports.SurveyTypeByQuestion = async (req, res) => {
  try {
    let { companyId, surveyTypeId } = req.body;
    let surveyQuestionDetail = await ConnectionUtil(
      `select * from survey_Questions where surveyType_Id ='${surveyTypeId}' AND company_Id='${companyId}'`
    );
    res.status(200).json({
      success: true,
      message: "Show surveyType by question",
      data: surveyQuestionDetail,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ------------------------------ SurveyDelete ----------------------------------
module.exports.survey_Delete = async (req, res) => {
  try {
    let { surveyTypeId } = req.body;
    let surveyDetail = await ConnectionUtil(
      `select * FROM survey_Type WHERE status='0' AND surveyType_id='${surveyTypeId}'`
    );
    if (surveyDetail != "") {
      let surveyTypeDelete = await ConnectionUtil(
        `DELETE FROM survey_Type WHERE status='0' AND surveyType_id='${surveyTypeId}'`
      );
      if (surveyTypeDelete.affectedRows != 0) {
        let surveyQestionDelete = await ConnectionUtil(
          `DELETE FROM survey_Questions WHERE  surveyType_Id='${surveyTypeId}'`
        );
        res.status(200).json({
          success: true,
          message: "Show survey delete successfully",
        });
      } else {
        res.status(401).json({
          success: false,
          message: "Something went wrong",
        });
      }
    } else {
      res.status(401).json({
        success: false,
        message: "Survey already initiate",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ------------------------------ SurveyEdit ----------------------------------
module.exports.survey_Edit = async (req, res) => {
  try {
    let {
      survey_Name,
      survey_Description,
      questionArray,
      userId,
      companyId,
      surveyTypeId,
    } = req.body;
    let { branch_Id, access } = req.query;
    let surveyDetail = await ConnectionUtil(
      `select * FROM survey_Type where status='0' AND surveyType_id='${surveyTypeId}'`
    );
    if (surveyDetail != "") {
      var surveyTypeUpdate = await ConnectionUtil(
        `update survey_Type set     
        survey_Name        ='${survey_Name}',
        survey_Description ='${survey_Description}', 
        user_Id            ='${userId}',
        company_Id         ='${companyId}'
         where  surveyType_id='${surveyTypeId}'`
      );
      if (surveyTypeUpdate.affectedRows != 0) {
        let cId = companyId;
        let uId = userId;
        for (let questionObj of questionArray) {
          if (questionObj.surveyQuestions_id != undefined) {
            let optionArray = JSON.stringify(questionObj.survey_OptionArray);
            let subQuestion = JSON.stringify(questionObj.survey_SubQuestion);
            let columnArray = JSON.stringify(questionObj.survey_ColumnArray);
            let rowArray = JSON.stringify(questionObj.survey_RowArray);
            let sliderOption = JSON.stringify(questionObj.survey_SliderOption);
            let optDepndent = JSON.stringify(questionObj.dependentOption);
            var surveyTypeUpdate = await ConnectionUtil(
              `update survey_Questions set     
            survey_Name               = '${survey_Name}',
            survey_Description        = '${questionObj.survey_Description}',
            survey_OptionArray        = '${optionArray}',
            survey_Type               = '${questionObj.survey_Type}',
            survey_Title              = '${questionObj.survey_Title}',
            survey_subQuestion        = '${subQuestion}',
            survey_SliderOption       = '${sliderOption}',
            survey_Answer             = '${questionObj.survey_Answer}',
            survey_ColumnArray        = '${columnArray}',
            survey_RowArray           = '${rowArray}',
            isRequired                = '${questionObj.isRequired}',
            ip_Address                = '${questionObj.ip_Address}',
            updated_By                ='${uId}',
            company_Id                = '${cId}',
            user_Id                   = '${uId}',
            surveyType_Id             = '${surveyTypeId}',
            dependentQuestionId       = '${questionObj.dependentQuestionId}', 
            questionId                = '${questionObj.questionId}',          
            dependentOption           = '${optDepndent}'      
            where  surveyQuestions_id ='${questionObj.surveyQuestions_id}'`
            );
          } else {
            // ----
            let optionArray = JSON.stringify(questionObj.survey_OptionArray);
            let subQuestion = JSON.stringify(questionObj.survey_SubQuestion);
            let columnArray = JSON.stringify(questionObj.survey_ColumnArray);
            let rowArray = JSON.stringify(questionObj.survey_RowArray);
            let sliderOption = JSON.stringify(questionObj.survey_SliderOption);
            let optDepndent = JSON.stringify(questionObj.dependentOption);
            let surveyQuestionObj = {
              survey_Name: survey_Name,
              survey_Description: questionObj.survey_Description,
              survey_Type: questionObj.survey_Type,
              survey_Title: questionObj.survey_Title,
              // survey_Category: questionObj.survey_Category,
              survey_OptionArray: optionArray,
              survey_subQuestion: subQuestion,
              survey_SliderOption: sliderOption,
              survey_Answer: questionObj.survey_Answer,
              survey_ColumnArray: columnArray,
              survey_RowArray: rowArray,
              isRequired: questionObj.isRequired,
              ip_Address: questionObj.ip_Address,
              created_By: uId, //userId,
              updated_By: uId, //userId,
              company_Id: cId, //companyId,
              user_Id: uId, //userId,
              surveyType_Id: surveyTypeId, //questionObj.surveyQuestions_id//surveyTypeAddQueryFind.insertId,
              dependentQuestionId: questionObj.dependentQuestionId,
              questionId: questionObj.questionId,
              dependentOption: optDepndent,
              branch_Id: branch_Id,
            };
            let surveyQuestionAddQueryFind = await ConnectionUtil(
              `INSERT INTO survey_Questions SET?`,
              surveyQuestionObj
            );
            // ----
          }
        }
        res.status(200).json({
          success: true,
          message: "Survey Updated successfully",
        });
      } else {
        res.status(401).json({
          success: false,
          message: "Something went wrong",
        });
      }
    } else {
      res.status(401).json({
        success: false,
        message: "Survey already initiate",
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

// ------------------------------ Survey_Expiry ----------------------------------
module.exports.survey_Expiry = async (req, res) => {
  try {
    let { companyId } = req.body;
    let { branch_Id, access } = req.query;
    let surveyExpiryDetail;
    if (access == 0) {
      surveyExpiryDetail = await ConnectionUtil(
        `SELECT * FROM initiate_Survey WHERE  Date(survey_ExpiryDate)<=Date(CURRENT_DATE) AND company_Id='${companyId}' AND branch_Id='${branch_Id}'`
      );
    } else {
      surveyExpiryDetail = await ConnectionUtil(
        `SELECT * FROM initiate_Survey WHERE  Date(survey_ExpiryDate)<=Date(CURRENT_DATE) AND company_Id='${companyId}'`
      );
    }

    let ArrNew = [];
    if (surveyExpiryDetail.length >= 0) {
      for (let surveyType of surveyExpiryDetail) {
        let AttemptedCount = await UserAssingedAttemptedQuestion(
          companyId,
          surveyType.surveyQuestions_Id
        );
        let UserAssignQueryFind = await ConnectionUtil(
          `select * from userAssign_Survey where surveyType_Id = '${surveyType.surveyQuestions_Id}'`
        );
        let surveyTypeQueryFind = await ConnectionUtil(
          `select * from survey_Type where surveyType_id = '${surveyType.surveyQuestions_Id}'`
        );

        let totCount = UserAssignQueryFind.length;
        surveyType.totalUserAssign = totCount;
        surveyType.totalUserSubmission =
          AttemptedCount.totAttempted != "" ? AttemptedCount.totAttempted : 0; //AttemptedCount.totAttempted;
        surveyType.survey_Name =
          surveyTypeQueryFind.length > 0
            ? surveyTypeQueryFind[0].survey_Name
            : "";
        surveyType.survey_Description =
          surveyTypeQueryFind.length > 0
            ? surveyTypeQueryFind[0].survey_Description
            : "";
        ArrNew.push(surveyType);
      }
      res.status(200).json({
        success: true,
        message: "Survey expiry list",
        data: ArrNew,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Survey expiry list",
        data: [],
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

// ------------------------------ Survey_ExpiryEndSurvey ----------------------------------
module.exports.survey_ExpiryEndSurvey = async (req, res) => {
  try {
    let { companyId, surveyTypeId } = req.body;
    var expiryEndSurveyUpdate = await ConnectionUtil(
      `update initiate_Survey set     
      survey_Name        ='${survey_Name}',
      survey_Description ='${survey_Description}', 
      user_Id            ='${userId}',
      company_Id         ='${companyId}'
       where  surveyType_id='${surveyTypeId}'`
    );

    res.status(200).json({
      success: true,
      message: "Survey expiry end",
      data: expiryEndSurveyUpdate,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ------------------------------ Get_TemplateQuestions ----------------------------------
module.exports.get_TemplateQuestions = async (req, res) => {
  try {
    let { surveytemplate_Id } = req.body;
    let getTemplateName = await ConnectionUtil(
      `select template_category from survey_template where surveytemplate_id='${surveytemplate_Id}' AND isActive='1'`
    );
    if (getTemplateName != "") {
      let getTemplatequestions = await ConnectionUtil(
        `select * from surveytemplate_Questions where surveyType_id='${surveytemplate_Id}' AND isActive='1'`
      );
      if (getTemplatequestions != "") {
        res.status(200).json({
          success: true,
          message: "Template Questions",
          data: getTemplatequestions,
          templateName: getTemplateName[0].template_category,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "invalid template category",
        });
      }
    } else {
      res.status(400).json({
        success: true,
        message: "invalid template category",
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

//------------------------------ Get_Templates ----------------------------------
module.exports.get_Templates = async (req, res) => {
  try {
    let Arr = [];
    let getTemplatesDetail = await ConnectionUtil(
      `select surveytemplate_id,template_category from survey_template where isActive='1'`
    );
    for (let data of getTemplatesDetail) {
      let getTemplatequestions = await ConnectionUtil(
        `select * from surveytemplate_Questions where surveyType_id='${data.surveytemplate_id}' AND isActive='1'`
      );
      let totalQuestionCount = getTemplatequestions.length;
      data.totalQuestion = totalQuestionCount;
      Arr.push(data);
    }
    res.status(200).json({
      success: true,
      message: "Template List",
      data: Arr,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//------------------------------- endActiveSurvey -----------------------------
module.exports.endActive_Survey = async (req, res) => {
  try {
    let { initiateSurvey_id, companyId } = req.body;
    let endActiveSurvey = await ConnectionUtil(
      `update initiate_Survey set 	survey_ExpiryDate = DATE_SUB(CURDATE(), INTERVAL 1 DAY)  where  initiateSurvey_id='${initiateSurvey_id}' AND company_Id='${companyId}'`
    );
    if (endActiveSurvey.affectedRows != 0) {
      res.status(200).json({
        success: true,
        message: "survey ended",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "survey end something went wrong",
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

//----------------------------- Notificaiton function save user be half -----------------------------
async function notificaiton_userSave(
  user_Id,
  EmpUser_Id,
  company_Id,
  ip_Address
) {
  let obj = {
    send_to: user_Id,
    user_Id: EmpUser_Id,
    company_Id: company_Id,
    ip_Address: ip_Address,
    notification_Type: "Survey",
    notification_Text: "Your survey assign successfully",
  };
  let notification = await ConnectionUtil(`INSERT INTO notification SET?`, obj);
}

//------------------------------------------- Copy_APastSurvey -----------------------------------------
module.exports.copy_APastSurvey = async (req, res) => {
  try {
    let { companyId } = req.body;
    let { branch_Id, access } = req.query;
    let newArr = [];
    let TotalSurveyList;
    if (access == 0) {
      TotalSurveyList = await ConnectionUtil(
        `SELECT * FROM initiate_Survey WHERE company_Id = '${companyId}' AND branch_Id='${branch_Id}'`
      );
    } else {
      TotalSurveyList = await ConnectionUtil(
        `SELECT * FROM initiate_Survey WHERE company_Id = '${companyId}'`
      );
    }
    for (let data of TotalSurveyList) {
      let surveyTypeList = await ConnectionUtil(
        `select * from  survey_Type where surveyType_id = '${data.surveyQuestions_Id}'`
      );
      let surveyQuestionDetail = await ConnectionUtil(
        `select * from survey_Questions where surveyType_Id ='${data.surveyQuestions_Id}'`
      );
      let totalQuestionCount = surveyQuestionDetail.length;
      if (surveyTypeList != "") {
        data.survey_Name =
          surveyTypeList[0].survey_Name != undefined &&
          surveyTypeList[0].survey_Name != null &&
          surveyTypeList[0].survey_Name != ""
            ? surveyTypeList[0].survey_Name
            : "";
        data.survey_Description =
          surveyTypeList[0].survey_Description != undefined &&
          surveyTypeList[0].survey_Description != null &&
          surveyTypeList[0].survey_Description != ""
            ? surveyTypeList[0].survey_Description
            : "";
        data.questionCount = totalQuestionCount;
      }
      newArr.push(data);
    }
    res.status(200).json({
      success: true,
      message: "Showing all survey",
      data: newArr,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

//--------------------------------------surveyDashboard---------------------------------------------
module.exports.surveyDashboard = async (req,res) => {
  try{
     
      let {company_id } = req.user;
 
     let { branch_Id , access } = req.query;
     let Arr = [];
     let activeSurveys;
     let totalActiveSurveyCount;
     let surveyByMonth;
     let lastTenSurveys; 
     if(access==0){
        activeSurveys = await ConnectionUtil(`select DISTINCT surveyQuestions_Id,company_Id,branch_Id from initiate_Survey where DATE_FORMAT(survey_ExpiryDate, '%Y-%m-%d') >= DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND company_Id='${company_id}' AND branch_Id='${branch_Id}' ORDER BY initiateSurvey_id DESC`);
        totalActiveSurveyCount = activeSurveys.length;
        surveyByMonth = await ConnectionUtil(`SELECT count(surveyType_Id) as numbersof_survey,month,year FROM(SELECT DISTINCT surveyQuestions_Id AS surveyType_Id,MONTHNAME(created_At) AS month, YEAR(created_At) as year FROM initiate_Survey WHERE company_Id='${company_id}' AND branch_Id='${branch_Id}' GROUP BY surveyQuestions_Id,month,year ORDER BY month,year) AS C GROUP BY month,year ORDER BY month,year`);
        lastTenSurveys = await ConnectionUtil(`SELECT DISTINCT ins.surveyQuestions_Id,st.survey_Name AS survey_name FROM initiate_Survey ins JOIN survey_Type st ON ins.surveyQuestions_Id = st.surveyType_id WHERE ins.company_Id='${company_id}' AND ins.branch_Id='${branch_Id}' ORDER BY ins.created_At DESC LIMIT 10`);
      }else{
        activeSurveys = await ConnectionUtil(`select DISTINCT surveyQuestions_Id,company_Id,branch_Id from initiate_Survey where DATE_FORMAT(survey_ExpiryDate, '%Y-%m-%d') >= DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND company_Id='${company_id}' ORDER BY initiateSurvey_id DESC`);
        totalActiveSurveyCount = activeSurveys.length;
        surveyByMonth = await ConnectionUtil(`SELECT count(surveyType_Id) as numbersof_survey,month,year FROM(SELECT DISTINCT surveyQuestions_Id AS surveyType_Id,MONTHNAME(created_At) AS month, YEAR(created_At) as year FROM initiate_Survey WHERE company_Id='${company_id}' GROUP BY surveyQuestions_Id,month,year ORDER BY month,year) AS C GROUP BY month,year ORDER BY month,year`);
        lastTenSurveys = await ConnectionUtil(`SELECT DISTINCT ins.surveyQuestions_Id,st.survey_Name AS survey_name FROM initiate_Survey ins JOIN survey_Type st ON ins.surveyQuestions_Id = st.surveyType_id WHERE ins.company_Id='${company_id}' ORDER BY ins.created_At DESC LIMIT 10`);  
      }
     for (let data of lastTenSurveys){
        let lastTenSurveyRespondent = await ConnectionUtil(`SELECT COUNT(DISTINCT user_Id) AS numberof_responded FROM survey_Submission WHERE surveyType_Id ='${data.surveyQuestions_Id}'`);
        data.numberof_responded = lastTenSurveyRespondent[0].numberof_responded;
        Arr.push(data);
     }
     let survey_DashboardObj = {
        surveyConductedByMonth : surveyByMonth,
        respondedSurveys : Arr,
        numberResponsesRecieved : { total: 50 , received: 20 },
        numberActiveSurvey : totalActiveSurveyCount
     }
     res.status(200).json({
         success : true,
         message : "Hr Survey Dashboard List",
         data : survey_DashboardObj
     })
  }catch(err){
    res.status(400).json({
        success: false,
        message: err.message,
    });
  }
};