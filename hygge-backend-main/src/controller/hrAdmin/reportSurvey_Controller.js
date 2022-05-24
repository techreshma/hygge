const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
const { resolve } = require("path");
let ConnectionUtil = util.promisify(connection.query).bind(connection);

// ------------------------- employeeReportBy_Survey -----------------------------------
module.exports.employeeReportBy_Survey = async (req, res) => {
  try {
    let { company_Id, start_date, end_date, page, pagination } = req.body;
    let { branch_Id, access } = req.query;

    let totalSurveyArr = await ConnectionUtil(
      `SELECT * FROM survey_Type WHERE company_Id = ${company_Id}`
    );

    let total_survey = totalSurveyArr.length;

    let openSurveyArr = await ConnectionUtil(
      `SELECT * FROM initiate_Survey WHERE DATE_FORMAT(CURDATE() , '%Y-%m-%d') <= DATE_FORMAT(survey_ExpiryDate , '%Y-%m-%d') AND company_Id = ${company_Id}`
    );

    let open_survey = openSurveyArr.length;

    let completedSurveyArr = await ConnectionUtil(
      `SELECT DISTINCT surveyType_Id FROM survey_Submission WHERE company_Id = ${company_Id} AND isActive = 1`
    );
    let surveyDetails = [];

    for (let i = 0; i <= totalSurveyArr.length - 1; i++) {
      let surveyDate = await ConnectionUtil(
        `SELECT created_At AS start_date , survey_ExpiryDate AS end_date , survey_AgeTo , survey_AgeFrom , survey_Gender FROM initiate_Survey WHERE surveyQuestions_Id = ${totalSurveyArr[i].surveyType_id} AND isActive = 1 AND company_Id = ${company_Id}`
      );

      let surveyQuestions = await ConnectionUtil(
        `SELECT * FROM survey_Questions WHERE surveyType_Id = ${totalSurveyArr[i].surveyType_id} AND isActive = 1 AND company_Id = ${company_Id}`
      );
           
      if (surveyDate.length > 0) {
        let ageTo =
          surveyDate[0].survey_AgeTo == null ||
          surveyDate[0].survey_AgeTo == undefined
            ? 100
            : surveyDate[0].survey_AgeTo;
        let ageFrom =
          surveyDate[0].survey_AgeFrom == null ||
          surveyDate[0].survey_AgeFrom == undefined
            ? 0
            : surveyDate[0].survey_AgeFrom;

        let gender =
          surveyDate[0].survey_Gender == null ||
          surveyDate[0].survey_Gender == undefined
            ? "male"
            : surveyDate[0].survey_Gender;

        let surveySubmission = await ConnectionUtil(
          `SELECT DISTINCT user_Id FROM survey_Submission WHERE surveyType_Id = ${totalSurveyArr[i].surveyType_id} and isActive = 1 and company_Id = ${company_Id}`
        );

        let surveyStatus = await ConnectionUtil(
          `SELECT * FROM initiate_Survey WHERE DATE_FORMAT(CURDATE() , '%Y-%m-%d') <= DATE_FORMAT(survey_ExpiryDate , '%Y-%m-%d') AND isActive = 1 AND company_Id = ${company_Id} and surveyQuestions_Id = ${totalSurveyArr[i].surveyType_id}`
        );

        let status = surveyStatus.length == 0 ? "closed" : "open";

        let elligibleUser;

        if (
          surveyDate[0].survey_Gender != null ||
          surveyDate[0].survey_Gender != undefined
        ) {
          let surveyEligible = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = ${gender} AND company_id = ${company_Id} AND isActive = 1`
          );
          elligibleUser = surveyEligible.length;
        } else {
          let surveyEligible = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND company_id = ${company_Id} AND isActive = 1`
          );
          elligibleUser = surveyEligible.length;
        }

        let surveyStartedArr = await ConnectionUtil(
          `SELECT * FROM userAssign_Survey WHERE  company_Id = ${company_Id} and surveyType_Id = ${totalSurveyArr[i].surveyType_id}`
        );

        let surveyStarted =
          surveyStartedArr.length == 0
            ? 0
            : surveyStartedArr.length +
              "(" +
              Math.round((surveyStartedArr.length / elligibleUser) * 100) +
              "%" +
              ")";

        let questionCount = surveyQuestions.length;

        let submissions =
          surveySubmission.length +
          "(" +
          Math.round((surveySubmission.length / elligibleUser) * 100) +
          "%" +
          ")";

        let obj = {
          surveyName: totalSurveyArr[i].survey_Name,
          startDate: surveyDate[0].start_date,
          endDate: surveyDate[0].end_date,
          questionCount,
          elligibleUser,
          submissions,
          surveyStarted,
          status,
        };
        surveyDetails.push(obj);
      }
    }
    // console.log(surveyDetails)
    let arr = [];
    let y = {};
    let temp = [];

    let userCompletedSurveyArr = await ConnectionUtil(
      `SELECT DISTINCT user_Id FROM survey_Submission WHERE company_Id = ${company_Id} and isActive = 1`
    );

    let x = {};
    for (let resp of userCompletedSurveyArr) {
      x = resp.user_Id;
      arr.push(x);
    }

    for (let i = 0; i <= arr.length - 1; i++) {
      let suveyCompletedCountPerUserArr = await ConnectionUtil(
        `SELECT DISTINCT surveyType_Id FROM survey_Submission WHERE company_Id = ${company_Id} and isActive = 1 AND user_Id = ${arr[i]}`
      );

      let userDetailCompletedSurvey = await ConnectionUtil(
        `SELECT CONCAT(first_name,' ',last_name) as name FROM user WHERE company_id = ${company_Id} and isActive = 1 AND user_id = ${arr[i]}`
      );
      y = {
        user_Id: arr[i],
        name: userDetailCompletedSurvey[0].name,
        survey_completed: suveyCompletedCountPerUserArr.length,
      };
      temp.push(y);
    }

    temp.sort((a, b) =>
      a.survey_completed > b.survey_completed
        ? 1
        : b.survey_completed > a.survey_completed
        ? -1
        : 0
    );

    let finalArr = [];
    for (let i = temp.length - 1; i >= temp.length - 5; i--) {
      finalArr.push(temp[i]);
    }

    let completed_survey = completedSurveyArr.length;
    let obj = {
      total_survey,
      open_survey,
      completed_survey,
      completion_rate: Math.ceil((completed_survey / total_survey) * 100) + "%",
      topEmployee: finalArr,
      surveyDetails,
    };

    res.status(200).json({
      success: true,
      message: "Survey report list",
      data: obj,
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};
