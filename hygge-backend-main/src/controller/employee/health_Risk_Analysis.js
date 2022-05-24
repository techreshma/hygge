const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
const { stat } = require("fs");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let calcBmi = require("bmi-calc");
let hraReportDowwnloadTemplete = require("../../lib/helpers/emailTemplate/hraReportDownload_templete");

var fs = require("fs");
var pdf = require("html-pdf");
var path = require("path");
var multer = require("multer");
const { resolve } = require("path");
const { rejects } = require("assert");
var upload = multer({ dest: "upload/" });
const { v4: uuidv4 } = require("uuid");
let filecall = uuidv4();

// const puppeteer = require("puppeteer");
// const { dirname } = require("path");
// const path = require("path");
// const html_to_pdf = require("html-pdf-node");

//------------------------- health_Risk_Analysis -------------------------
module.exports.health_Risk_Analysis = async (req, res) => {
  try {
    let { user_Id, company_Id } = req.body;
    let newArr = [];
    let HRADetail = await ConnectionUtil(
      `select * from health_Risk_Questions_Details`
    );
    console.log("hello");
    for (let hraObj of HRADetail) {
      let HRASubmissionDetail = await ConnectionUtil(
        `select * from  user_hrasubmission  where user_Id='${user_Id}' AND healthQuestions_Id='${hraObj.healthQuestions_id}' AND status = '1'`
      );
      if (
        hraObj.healthQuestions_id == 12 ||
        hraObj.healthQuestions_id == 18 ||
        hraObj.healthQuestions_id == 19 ||
        hraObj.healthQuestions_id == 21 ||
        hraObj.healthQuestions_id == 23 ||
        hraObj.healthQuestions_id == 24 ||
        hraObj.healthQuestions_id == 27 ||
        hraObj.healthQuestions_id == 34 ||
        hraObj.healthQuestions_id == 48 ||
        hraObj.healthQuestions_id == 61
      ) {
        if (HRASubmissionDetail.length > 0) {
          obj = {
            healthSubmission_id: HRASubmissionDetail[0].healthSubmission_id,
            user_Id: HRASubmissionDetail[0].user_Id,
            company_Id: HRASubmissionDetail[0].company_Id,
            healthQuestions_Id: HRASubmissionDetail[0].healthQuestions_Id,
            question_Point: HRASubmissionDetail[0].question_Point,
            created_At: HRASubmissionDetail[0].created_At,
            updated_At: HRASubmissionDetail[0].updated_At,
            created_By: HRASubmissionDetail[0].created_By,
            updated_By: HRASubmissionDetail[0].updated_By,
            ip_Address: HRASubmissionDetail[0].ip_Address,
            isActive: HRASubmissionDetail[0].isActive,
            status: HRASubmissionDetail[0].status,
            question: HRASubmissionDetail[0].question,
            options: HRASubmissionDetail[0].ArrayM,
            score: HRASubmissionDetail[0].score,
          };
          hraObj.answerkey = HRASubmissionDetail != "" ? [obj] : [];
        } else {
          hraObj.answerkey = [];
        }
      } else {
        hraObj.answerkey = HRASubmissionDetail != "" ? HRASubmissionDetail : [];
      }

      newArr.push(hraObj);
    }
    // var HRADetail;
    // var HRASubmissionDetail = await ConnectionUtil(`select * from  user_hrasubmission  where user_Id='${user_Id}' ORDER BY healthQuestions_Id DESC`);
    // if(HRASubmissionDetail.length>0){
    //   HRADetail = await ConnectionUtil(`select * from health_Risk_Questions_Details `); //where healthQuestions_Id>'${HRASubmissionDetail[0].healthQuestions_Id}'
    // }else{
    //   HRADetail = await ConnectionUtil(`select * from health_Risk_Questions_Details`);
    // }
    res.status(200).json({
      success: true,
      message: "HRA question list",
      data: newArr, //HRADetail,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//------------------------- HRA_Answer -------------------------
module.exports.health_Submission = async (req, res) => {
  try {
    let {
      user_Id,
      company_Id,
      question,
      options,
      healthQuestions_Id,
      question_Point,
      ip_Address,
      score,
      type,
    } = req.body;
    let HRASubmissionDetail = await ConnectionUtil(
      `select * from  user_hrasubmission  where user_Id='${user_Id}' AND company_Id='${company_Id}' AND healthQuestions_Id='${healthQuestions_Id}'`
    );

    if (HRASubmissionDetail.length > 0) {
      if (
        healthQuestions_Id == 12 ||
        healthQuestions_Id == 18 ||
        healthQuestions_Id == 19 ||
        healthQuestions_Id == 21 ||
        healthQuestions_Id == 23 ||
        healthQuestions_Id == 24 ||
        healthQuestions_Id == 27 ||
        healthQuestions_Id == 34 ||
        healthQuestions_Id == 48 ||
        healthQuestions_Id == 61
      ) {
        // ---
        let QuestionSelectQuery = await ConnectionUtil(
          `select * from health_Risk_Questions_Details where healthQuestions_id='${healthQuestions_Id}'`
        );
        if (QuestionSelectQuery.length > 0) {
          let QuestionSelectQueryT = await ConnectionUtil(
            `select * from health_Risk_Questions_Details where dependentQuestionId='${QuestionSelectQuery[0].questionId}'`
          );
          for (let questionID of QuestionSelectQueryT) {
            if (questionID.healthQuestions_id == 3) {
              let QuestionSelectQueryTwo = await ConnectionUtil(
                `delete from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='${questionID.healthQuestions_id}'`
              );
              let QuestionAdditional = await ConnectionUtil(
                `delete from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='${4}'`
              );
            } else {
              let QuestionSelectQueryOne = await ConnectionUtil(
                `delete from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='${questionID.healthQuestions_id}'`
              );
            }
          }
        }
        // ---
        let optionsValue = JSON.stringify(options.value); //options.value;
        let Socre = score == null ? 0 : score;
        let Count = 0;
        for (let socrePoint of options.value) {
          Count += Number(socrePoint.point);
        }
        let optionPoint = Count; //options.point==null?0:options.point
        let HRASubmissionUpdateQuery = await ConnectionUtil(
          `Update user_hrasubmission set question='${question}', score='${Socre}',ArrayM='${optionsValue}',question_Point='${optionPoint}',ip_Address='${ip_Address}',updated_By='${user_Id}'  where user_Id='${user_Id}'AND company_Id='${company_Id}' AND healthQuestions_Id='${healthQuestions_Id}' `
        );
        res.status(200).json({
          success: true,
          message: "HRA question submission update successfully",
          data: HRASubmissionUpdateQuery,
        });
      } else {
        // ---
        let QuestionSelectQuery = await ConnectionUtil(
          `select * from health_Risk_Questions_Details where healthQuestions_id='${healthQuestions_Id}'`
        );
        if (QuestionSelectQuery.length > 0) {
          let QuestionSelectQueryT = await ConnectionUtil(
            `select * from health_Risk_Questions_Details where dependentQuestionId='${QuestionSelectQuery[0].questionId}'`
          );
          for (let questionID of QuestionSelectQueryT) {
            if (questionID.healthQuestions_id == 3) {
              let QuestionSelectQueryTwo = await ConnectionUtil(
                `delete from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='${questionID.healthQuestions_id}'`
              );
              let QuestionAdditional = await ConnectionUtil(
                `delete from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='${4}'`
              );
            } else {
              let QuestionSelectQueryOne = await ConnectionUtil(
                `delete from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='${questionID.healthQuestions_id}'`
              );
            }
          }
        }
        // ---
        let optionPoint;
        let optionsValue;
        let Socre;
        /*Assing_Type @@@ 
         let optionPoint = options.point==null?0:options.point
         let optionsValue = options.value;
         let Socre=score==null?0:score 
        @@@ Assing_Type*/
        if (healthQuestions_Id == 2) {
          (optionPoint = await genderAgePoint(
            user_Id,
            healthQuestions_Id,
            options.value
          )), //options.point==null?0:options.point
            (optionsValue = options.value);
          Socre = score == null ? 0 : score;
        }
        if (healthQuestions_Id == 3) {
          (optionPoint = await genderAgePoint(
            user_Id,
            healthQuestions_Id,
            options.value
          )), //options.point==null?0:options.point
            (optionsValue = options.value);
          Socre = score == null ? 0 : score;
        }
        if (healthQuestions_Id != 3 && healthQuestions_Id != 2) {
          optionPoint = options.point == null ? 0 : options.point;
          optionsValue = options.value;
          Socre = score == null ? 0 : score;
        }
        let HRASubmissionUpdateQuery = await ConnectionUtil(
          `Update user_hrasubmission set question='${question}',score='${Socre}',options='${optionsValue}',question_Point='${optionPoint}',ip_Address='${ip_Address}',updated_By='${user_Id}'  where user_Id='${user_Id}'AND company_Id='${company_Id}' AND healthQuestions_Id='${healthQuestions_Id}' `
        );
        res.status(200).json({
          success: true,
          message: "HRA question submission update successfully",
          data: HRASubmissionUpdateQuery,
        });
      }
    } else {
      if (
        healthQuestions_Id == 12 ||
        healthQuestions_Id == 18 ||
        healthQuestions_Id == 19 ||
        healthQuestions_Id == 21 ||
        healthQuestions_Id == 23 ||
        healthQuestions_Id == 24 ||
        healthQuestions_Id == 27 ||
        healthQuestions_Id == 34 ||
        healthQuestions_Id == 48 ||
        healthQuestions_Id == 61
      ) {
        let T = JSON.stringify(options.value);
        let Count = 0;
        for (let socrePoint of options.value) {
          Count += Number(socrePoint.point);
        }
        let obj = {
          user_Id: user_Id,
          company_Id: company_Id,
          healthQuestions_Id: healthQuestions_Id,
          question_Point: Count, //==null?0:options.point,
          ip_Address: ip_Address,
          created_By: user_Id,
          updated_By: user_Id,
          question: question,
          options: "", //options.value,
          ArrayM: T,
          score: score == null ? 0 : score,
        };
        // ---
        let QuestionSelectQuery = await ConnectionUtil(
          `select * from health_Risk_Questions_Details where healthQuestions_id='${healthQuestions_Id}'`
        );
        if (QuestionSelectQuery.length > 0) {
          let QuestionSelectQueryT = await ConnectionUtil(
            `select * from health_Risk_Questions_Details where dependentQuestionId='${QuestionSelectQuery[0].questionId}'`
          );
          for (let questionID of QuestionSelectQueryT) {
            if (questionID.healthQuestions_id == 3) {
              let QuestionSelectQueryTwo = await ConnectionUtil(
                `delete from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='${questionID.healthQuestions_id}'`
              );
              let QuestionAdditional = await ConnectionUtil(
                `delete from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='${4}'`
              );
            } else {
              let QuestionSelectQueryOne = await ConnectionUtil(
                `delete from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='${questionID.healthQuestions_id}'`
              );
            }
          }
        }
        // ---
        let HRASubmissionInsertQuery = await ConnectionUtil(
          `INSERT INTO user_hrasubmission SET?`,
          obj
        );
        res.status(200).json({
          success: true,
          message: "HRA question submission successfully",
          data: HRASubmissionInsertQuery,
        });
      } else {
        let option_Point;
        if (healthQuestions_Id == 2) {
          option_Point = await genderAgePoint(
            user_Id,
            healthQuestions_Id,
            options.value
          );
        }
        if (healthQuestions_Id == 3) {
          option_Point = await genderAgePoint(
            user_Id,
            healthQuestions_Id,
            options.value
          );
        }
        if (healthQuestions_Id != 3 && healthQuestions_Id != 2) {
          option_Point = options.point;
        }
        obj = {
          user_Id: user_Id,
          company_Id: company_Id,
          healthQuestions_Id: healthQuestions_Id,
          question_Point: option_Point == null ? 0 : option_Point, //options.point==null?0:options.point,
          ip_Address: ip_Address,
          created_By: user_Id,
          updated_By: user_Id,
          question: question,
          options: options.value,
          ArrayM: JSON.stringify([]),
          score: score == null ? 0 : score,
        };
        // ---
        let QuestionSelectQuery = await ConnectionUtil(
          `select * from health_Risk_Questions_Details where healthQuestions_id='${healthQuestions_Id}'`
        );
        if (QuestionSelectQuery.length > 0) {
          let QuestionSelectQueryT = await ConnectionUtil(
            `select * from health_Risk_Questions_Details where dependentQuestionId='${QuestionSelectQuery[0].questionId}'`
          );
          for (let questionID of QuestionSelectQueryT) {
            if (questionID.healthQuestions_id == 3) {
              let QuestionSelectQueryTwo = await ConnectionUtil(
                `delete from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='${questionID.healthQuestions_id}'`
              );
              let QuestionAdditional = await ConnectionUtil(
                `delete from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='${4}'`
              );
            } else {
              let QuestionSelectQueryOne = await ConnectionUtil(
                `delete from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='${questionID.healthQuestions_id}'`
              );
            }
          }
        }
        // ---
        let HRASubmissionInsertQuery = await ConnectionUtil(
          `INSERT INTO user_hrasubmission SET?`,
          obj
        );
        res.status(200).json({
          success: true,
          message: "HRA question submission successfully",
          data: HRASubmissionInsertQuery,
        });
      }
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//--------------------------hraSegmentWiseCalculation-------------------------------
module.exports.hraSegmentWiseCalculation = async (req, res) => {
  try {
    let { id } = req.user;
    let personalArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (1,2,3,4,5,6,7) AND user_Id = ${id} AND status = '1'`
    );
    let BiometricsArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (8,9,10,11) AND user_Id = ${id} AND status = '1'`
    );
    let clinicalHistoryArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (12,13,14,15,16,17) AND user_Id =  ${id} AND status = '1'`
    );
    let screeningArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (18,19) AND user_Id = ${id} AND status = '1'`
    );
    let familyHistoryArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (21,22) AND user_Id = ${id} AND status = '1'`
    );
    let occupationalHistoryArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (23,24,25,26,27,28) AND user_Id = ${id} AND status = '1'`
    );
    let dietArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (29,30,31,32,33,34,35) AND user_Id = ${id} AND status = '1'`
    );
    let physicalActivityArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (36,37) AND user_Id = ${id} AND status = '1'`
    );
    let tobaccoArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (38,39) AND user_Id = ${id} AND status = '1'`
    );
    let sleepArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (40,41,42,43) AND user_Id = ${id} AND status = '1'`
    );
    let bevergesArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (44,45,46) AND user_Id = ${id} AND status = '1'`
    );
    let stressAndMentalWellbeingArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (47,48,49,50,51,52,53,54,55,56,57,58) AND user_Id = ${id} AND status = '1'`
    );
    let readinessAssessmentArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (59,60,61) AND user_Id = ${id} AND status = '1'`
    );

    let bodyArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,21,22,23,24,25,26,27,28) AND user_Id = ${id} AND status = '1'`
    );
    let lifestyleArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46) AND user_Id = ${id} AND status = '1'`
    );
    let mindArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (47,48,49,50,51,52,53,54,55,56,57,58,59,60,61) AND user_Id = ${id} AND status = '1'`
    );

    let personal = 0;
    let Biometrics = 0;
    let clinicalHistory = 0;
    let screening = 0;
    let familyHistory = 0;
    let occupationalHistory = 0;
    let diet = 0;
    let physicalActivity = 0;
    let tobacco = 0;
    let sleep = 0;
    let beverges = 0;
    let stressAndMentalWellbeing = 0;
    let readinessAssessment = 0;
    let body = 0;
    let lifestyle = 0;
    let mind = 0;

    let bodyTotal = 51;
    let lifestyleTotal = 30;
    let mindTotal = 19;
    let personalTotal = 5;
    let BiometricsTotal = 7;
    let clinicalHistoryTotal = 26;
    let screeningTotal = 2;
    let familyHistoryTotal = 5;
    let occupationalHistoryTotal = 12;
    let dietTotal = 12;
    let physicalActivityTotal = 3;
    let tobaccoTotal = 4;
    let sleepTotal = 6;
    let bevergesTotal = 5;
    let stressAndMentalWellbeingTotal = 16.5;

    for (let resp of personalArr) {
      personal += resp.question_Point;
    }
    for (let resp of BiometricsArr) {
      Biometrics += resp.question_Point;
    }
    for (let resp of clinicalHistoryArr) {
      clinicalHistory += resp.question_Point;
    }
    for (let resp of screeningArr) {
      screening += resp.question_Point;
    }
    for (let resp of familyHistoryArr) {
      familyHistory += resp.question_Point;
    }
    for (let resp of occupationalHistoryArr) {
      occupationalHistory += resp.question_Point;
    }
    for (let resp of dietArr) {
      diet += resp.question_Point;
    }
    for (let resp of physicalActivityArr) {
      physicalActivity += resp.question_Point;
    }
    for (let resp of tobaccoArr) {
      tobacco += resp.question_Point;
    }
    for (let resp of sleepArr) {
      sleep += resp.question_Point;
    }
    for (let resp of bevergesArr) {
      beverges += resp.question_Point;
    }
    for (let resp of stressAndMentalWellbeingArr) {
      stressAndMentalWellbeing += resp.question_Point;
    }
    for (let resp of readinessAssessmentArr) {
      readinessAssessment += resp.question_Point;
    }
    for (let resp of bodyArr) {
      body += resp.question_Point;
    }
    for (let resp of lifestyleArr) {
      lifestyle += resp.question_Point;
    }
    for (let resp of mindArr) {
      mind += resp.question_Point;
    }

    let bodyPercentage = Math.round((body / bodyTotal) * 100);
    let lifestylePercentage = Math.round((lifestyle / lifestyleTotal) * 100);
    let mindPercentage = Math.round((mind / mindTotal) * 100);
    let personalPercentage = Math.round((personal / personalTotal) * 100);
    let BiometricsPercentage = Math.round((Biometrics / BiometricsTotal) * 100);
    let clinicalHistoryPercentage = Math.round(
      (clinicalHistory / clinicalHistoryTotal) * 100
    );
    let screeningPercentage = Math.round((screening / screeningTotal) * 100);
    let familyHistoryPercentage = Math.round(
      (familyHistory / familyHistoryTotal) * 100
    );
    let occupationalHistoryPercentage = Math.round(
      (occupationalHistory / occupationalHistoryTotal) * 100
    );
    let dietPercentage = Math.round((diet / dietTotal) * 100);
    let physicalActivityPercentage = Math.round(
      (physicalActivity / physicalActivityTotal) * 100
    );
    let tobaccoPercentage = Math.round((tobacco / tobaccoTotal) * 100);
    let sleepPercentage = Math.round((sleep / sleepTotal) * 100);
    let bevergesPercentage = Math.round((beverges / bevergesTotal) * 100);
    let stressAndMentalWellbeingPercentage = Math.round(
      (stressAndMentalWellbeing / stressAndMentalWellbeingTotal) * 100
    );

    //--------------------health risk analysis------------------------------
    let obesityRiskArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (1,2,8,9,10,11,36,29) AND user_Id = ${id} AND status = '1'`
    );

    let diabetesRiskArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (1,2,8,9,10,11,16,13,22,36,32) AND user_Id = ${id} AND status = '1'`
    );

    let cardiovascularRiskArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (1,2,8,9,13,14,15,16,21,38,36,32,35) AND user_Id = ${id} AND status = '1'`
    );

    let mentalWellbeingOverallRiskArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (47,48,50,54,55,56,57,58) AND user_Id = ${id} AND status = '1'`
    );

    let motivationAndProductivityRiskArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (25,26,28,40,50,51,55) AND user_Id = ${id} AND status = '1'`
    );

    let occupationalHealthRiskArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmission WHERE healthQuestions_Id IN (25,26,27,28,36) AND user_Id = ${id} AND status = '1'`
    );

    let obesityRisk = 0;
    let diabetesRisk = 0;
    let cardiovascularRisk = 0;
    let mentalWellbeingOverallRisk = 0;
    let motivarionAndProductivityRisk = 0;
    let occupationalHealthRisk = 0;

    for (let resp of obesityRiskArr) {
      obesityRisk += resp.question_Point;
    }
    for (let resp of diabetesRiskArr) {
      diabetesRisk += resp.question_Point;
    }
    for (let resp of cardiovascularRiskArr) {
      cardiovascularRisk += resp.question_Point;
    }
    for (let resp of mentalWellbeingOverallRiskArr) {
      mentalWellbeingOverallRisk += resp.question_Point;
    }
    for (let resp of motivationAndProductivityRiskArr) {
      motivarionAndProductivityRisk += resp.question_Point;
    }
    for (let resp of occupationalHealthRiskArr) {
      occupationalHealthRisk += resp.question_Point;
    }

    let obesityRiskPercentage = Math.round((obesityRisk / 14) * 100);
    let diabetesRiskPercentage = Math.round((diabetesRisk / 32) * 100);
    let cardiovascularRiskPercentage = Math.round(
      (cardiovascularRisk / 44) * 100
    );
    let mentalWellbeingOverallRiskPercentage = Math.round(
      (mentalWellbeingOverallRisk / 16.5) * 100
    );
    let motivarionAndProductivityRiskPercentage = Math.round(
      (motivarionAndProductivityRisk / 9.5) * 100
    );
    let occupationalHealthRiskPercentage = Math.round(
      (occupationalHealthRisk / 12) * 100
    );

    res.status(200).json({
      success: true,
      message: "HRA data shown successfully",
      data: {
        body,
        lifestyle,
        mind,
        personal,
        Biometrics,
        clinicalHistory,
        screening,
        familyHistory,
        occupationalHistory,
        diet,
        physicalActivity,
        tobacco,
        sleep,
        beverges,
        stressAndMentalWellbeing,
        readinessAssessment,
        bodyPercentage,
        lifestylePercentage,
        mindPercentage,
        personalPercentage,
        BiometricsPercentage,
        clinicalHistoryPercentage,
        screeningPercentage,
        familyHistoryPercentage,
        occupationalHistoryPercentage,
        dietPercentage,
        physicalActivityPercentage,
        tobaccoPercentage,
        sleepPercentage,
        bevergesPercentage,
        stressAndMentalWellbeingPercentage,
        obesityRiskPercentage,
        diabetesRiskPercentage,
        cardiovascularRiskPercentage,
        mentalWellbeingOverallRiskPercentage,
        motivarionAndProductivityRiskPercentage,
        occupationalHealthRiskPercentage,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//----------------------------hraSegmentWiseCalculation over ---------------------------
//------------------------- HRA_submit -------------------------
module.exports.HRA_submit = async (req, res) => {
  try {
    let { user_Id , company_Id , date , time , ip_Address } = req.body;    
    let questionCheck = await ConnectionUtil(`select * from user_hrasubmission where user_id='${user_Id}' AND status = '1'`);
    let UserSubmitSelectQuery = await ConnectionUtil(`select * from user_hrasubmit where user_id='${user_Id}' AND company_Id='${company_Id}' AND status='1'`);
    if(UserSubmitSelectQuery.length==0){
      let ratioPoint = 0;
      let bmiPoint   = 0;
      let userGender = await ConnectionUtil(`select * from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='1'  AND status = '1'`);
      let waistRatioSore = await ConnectionUtil(`select * from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='10'   AND status = '1'`);
      let hipRatioSore   = await ConnectionUtil(`select * from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='11' AND status = '1'`);
      let heightSore = await ConnectionUtil(`select * from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='8' AND status = '1'`);
      let weightSore   = await ConnectionUtil(`select * from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='9' AND status = '1'`);
      if(waistRatioSore.length>0&& hipRatioSore.length>0 &&userGender.length>0){        
        let w=waistRatioSore[0].options
        let h=hipRatioSore[0].options
        let Ratio = (w/h);
        let fixedNum = Ratio.toFixed( 2 );
        // male
        if(userGender[0].options=="Male"){
          if( fixedNum<="0.95"){
            ratioPoint = 0
          } 
          if(fixedNum>="0.96" && fixedNum<="1.0"){
            ratioPoint = 3
          }
          if(fixedNum>="1.0"){
            ratioPoint = 4
          }
        }          
        // female
        if(userGender[0].options=="Female"){
          if( fixedNum<="0.80"){
            ratioPoint = 0
          } 
          if(fixedNum>="0.81" && fixedNum<="0.85"){
            ratioPoint = 3
          }
          if(fixedNum>="0.86"){
            ratioPoint = 4
          }
        } 
      }  
      if(heightSore.length > 0 && weightSore.length > 0 ){
        let height=heightSore[0].options/100; 
        let weight=weightSore[0].options;
        let bmiPoint=0;
        let valBMI=calcBmi(weight,height);
        let totBMI = valBMI.value.toFixed( 1 );
        // Math.fround(totBMI) < Math.fround(18.5)
        // if( Math.fround(totBMI) <= Math.fround(18.5) ){ console.log('One'); bmiPoint=1}
        // if( Math.fround(totBMI) >=  && Math.fround(totBMI) <= ){console.log('Two'); bmiPoint=0}
        // if( Math.fround(totBMI) >=  && Math.fround(totBMI) <= ){console.log('Three'); bmiPoint=1}
        // if( Math.fround(totBMI)>=  &&  Math.fround(totBMI) <= ){console.log('Four'); bmiPoint=3}

        if(totBMI <= '18.5'){ bmiPoint=1}
        if(totBMI >= '18.5' && totBMI <= '24.9'){ bmiPoint=0}
        if(totBMI >= '25' && totBMI <= '29.9'){bmiPoint=1}
        if(totBMI >= '30' && totBMI <= '39.9'){ bmiPoint=3}    
      }
      let sum = questionCheck.reduce(function(a , b){return a+ b.question_Point	;},0);
      sum=sum+ratioPoint+bmiPoint;
      let Obj={
        user_Id :user_Id, 
        company_Id:company_Id , 
        date:date , 
        time:time , 
        created_By:user_Id,
        updated_By:user_Id,
        ip_Address:ip_Address,
        total_Score: sum||0
      }
      let UserSubmitInsertQuery = await ConnectionUtil(`Insert INTO user_hrasubmit set?`,Obj);
      res.status(200).json({
        success: true,
        message: "HRA submit successfully",
        data:UserSubmitInsertQuery
      });
    }else{
      res.status(200).json({
        success: true,
        message: "You have already submit HRA",
      });
    } 
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//------------------------- HRA_expire -------------------------
module.exports.HRA_expire = async (req, res) => {
  try {
    let { user_Id , company_Id , ip_Address } = req.body;        
    let HRAExpireSelectQuery = await ConnectionUtil(`UPDATE user_hrasubmit SET status='0' where DATE_FORMAT(date,'%Y-%m-%d') + INTERVAL 3 MONTH <=DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND user_Id='${user_Id}' AND company_Id ='${company_Id}'`);
    res.status(200).json({
      success: true,
      message: "HRA expired successfully",
      data : HRAExpireSelectQuery
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/*
function:GenderAge
argument:Dependent Question  Question ID (child,parent)
output: calculate point-> point 
*/
async function genderAgePoint(user_Id, healthQuestions_Id, optionsValue) {
  if (healthQuestions_Id == 2) {
    let point = 0;
    let HRAoption = await ConnectionUtil(
      `select * from  user_hrasubmission  where user_Id='${user_Id}' AND  healthQuestions_Id='${1}' AND status = '1'`
    );
    if (HRAoption[0].options == "Male") {
      if (optionsValue.replace(/\s+/g, "") == "18-35") {
        return 0;
      }
      if (optionsValue.replace(/\s+/g, "") == "36-50") {
        return 2;
      }
      if (optionsValue.replace(/\s+/g, "") == "51-65") {
        return 3;
      }
      if (optionsValue.replace(/\s+/g, "") == "65+") {
        return 4;
      }
    }
  }
  if (healthQuestions_Id == 3) {
    let point = 0;
    let HRAoption = await ConnectionUtil(
      `select * from  user_hrasubmission  where user_Id='${user_Id}' AND  healthQuestions_Id='${1}' AND status = '1'`
    );
    if (HRAoption[0].options == "Female") {
      if (optionsValue.replace(/\s+/g, "") == "18-35") {
        return 0;
      }
      if (optionsValue.replace(/\s+/g, "") == "36-50") {
        return 2;
      }
      if (optionsValue.replace(/\s+/g, "") == "51-65") {
        return 3;
      }
      if (optionsValue.replace(/\s+/g, "") == "65+") {
        return 4;
      }
    }
  }
}

//------------------------- HRA_Score -------------------------
module.exports.HRA_Score = async (req, res) => {
  try {
    let { user_Id, company_Id } = req.body;
    let queryScore = await ConnectionUtil(
      `select * from user_hrasubmit where user_id='${user_Id}' AND company_Id='${company_Id}'`
    );
    obj = {
      totalscore: queryScore.length > 0 ? queryScore[0].total_Score : 0,
      bodyScore: 0,
      mindScore: 0,
      lifeScore: 0,
    };
    res.status(200).json({
      success: true,
      message: "HRA score report successfully",
      data: obj,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//--------------------------hraPdf-------------------------------


// var storage = multer.diskStorage({
//   destination: function (req, file, cd) {
//     cd(null, "upload/");
//   },

//   filename: function (req, file, cd) {
//     var str = file.originalname;
//     var dotIndex = str.lastIndexOf(".");
//     var ext = str.substring(dotIndex);
//     var val = ext.split(".")[1];
//     cd(null, filecall + "-file." + val);
//   },
// });



// var upload = multer({
//   storage: storage,
// }).any("");

// module.exports.uploadHtml = async (req, res) => {
//   try {
//     await uploading(req, res);

//     let PATH = filecall + "-file.html";
//     // let htmlPath = path.join(__dirname, "..", "..", "upload", PATH);
//     let htmlPath = "./upload/" + PATH
//     console.log(`'${htmlPath}'`);

//     await delay(3000);

//     // var output = 'test';
//     // fs.writeFile("/JIVR/Jivr-backend/upload/destination.html", output, function(err) {
//     //     if(err) {
//     //         return console.log(err);
//     //     }

//     //     console.log("The file was saved!");
//     // });

//     // await pdfConverter(htmlPath, res);

//     // res.status(200).json({
//     //   success: true,
//     //   message: "file upload successfully",
//     //   data: htmlPath.replace('html', 'pdf'), //'http://157.245.104.180:4000/'+
//     // });
//   } catch (err) {
//     console.log(err);
//     res.status(400).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

// async function uploading(req, res) {
//   return new Promise(async (resolve, rejects) => {
//     resolve(
//       await upload(req, res, async (err) => {
//         var filenames = req.files;
//         path = await filenames.map((data) => {
//           return data.filename;
//         });
//       })
//     );
//   });
// }

//--------------------------hraPdf over ---------------------------

// ------------------------------------------hra report download --------------------
module.exports.hraReportDownload = async (req, res) => {
  try {
    let {
      body,
      lifestyle,
      mind,
      personal,
      Biometrics,
      clinicalHistory,
      screening,
      familyHistory,
      occupationalHistory,
      diet,
      physicalActivity,
      sleep,
      stressAndMentalWellbeing,
      readinessAssessment,
      tobacco,
      beverges
    } = req.query;

    let { id } = req.user;
    // let id = 194
    // console.log(id)

    let userNameArr = await ConnectionUtil(
      `SELECT concat(first_name, ' ', last_name) AS name , gender , ( DATE_FORMAT(CURDATE() , '%Y-%m-%d') - DATE_FORMAT(DOB , '%Y-%m-%d')) as age FROM user WHERE user_id = ${id}`
    );

    let userName = userNameArr[0].name;
    let userAge = userNameArr[0].age;
    let userGender = userNameArr[0].gender

    let data = hraReportDowwnloadTemplete.hraReportDowwnloadFunction(
      body,
      lifestyle,
      mind,
      personal,
      Biometrics,
      clinicalHistory,
      screening,
      familyHistory,
      occupationalHistory,
      diet,
      physicalActivity,
      sleep,
      stressAndMentalWellbeing,
      readinessAssessment,
      tobacco,
      beverges,
      userName,
      userAge,
      userGender
    );

    var output = data;

    let pathToWriteHtml = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "upload/" + filecall + "-file.html"
    );
    // console.log(pathToWriteHtml);
    // "home/MyHygge/Jivr-backend/upload/" +filecall + "-file.html"
    fs.writeFile(pathToWriteHtml, output, function (err) {
      if (err) {
        return console.log(err);
      }

      console.log("The file was saved!");
    });

    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    await delay(100);

    let PATH = filecall + "-file.html";
    // let htmlPath = path.join(__dirname, "..", "..", "upload", PATH);
    let htmlPath = "./upload/" + PATH;

    // let htmlPath = './upload/destination.html'
    await pdfConverter(htmlPath, res);

    // res.send(data);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

async function pdfConverter(htmlPath, res) {
  var html = fs.readFileSync(htmlPath, "utf8");
  var options = {
    format: "A3",
    orientation: "landscape",
  };

  return new Promise((resolve, rejects) => {
    resolve(
      pdf
        .create(html, options)
        .toFile("./upload/" + filecall + ".pdf", function (err, resp) {
          if (err) return console.log(err);
          console.log(resp);
          res.status(200).json({
            success: true,
            message: "file upload successfully",
            data: "http://20.74.180.163:4000/" + filecall + ".pdf", //'http://20.74.180.163:4000/'+
          }); // { filename: '/app/businesscard.pdf' }
        })
    );
  });
}

//------------------------- hrauser_list -------------------------
module.exports.hraCategoryBy_user = async (req, res) => {
  try {
    let { user_Id } = req.body;
    let bodyCount = 0;
    let mindCount = 0;
    let lifestyleCount = 0;
    let hraQuestion = await ConnectionUtil(
      `select * from health_Risk_Questions_Details`
    );
    let userDetail = await ConnectionUtil(
      `select COALESCE(gender,'male') as gender,COALESCE(Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0),'0') as age,user_id,profile_picture, CONCAT(COALESCE(first_name,' '),' ',COALESCE(last_name,' ')) as name from user where user_id='${user_Id}'`
    );
    flag = 0;
    if (userDetail) {
      flag = 1;
      console.log("flag", flag);
      for (let ques of hraQuestion) {
        console.log("ques ", ques);
        if (ques.category == "body") {
          let hraUser = await ConnectionUtil(
            `select * from user_hrasubmission where healthQuestions_Id='${ques.healthQuestions_id}' AND user_Id='${user_Id}' AND status = '1'`
          );
          hraUser[0] ? (bodyCount += Number(hraUser[0].question_Point)) : 0;
        }
        // console.log("body" , bodyCount )
        if (ques.category == "lifestyle") {
          let hraUser = await ConnectionUtil(
            `select * from user_hrasubmission where   healthQuestions_Id='${ques.healthQuestions_id}' AND user_Id='${user_Id}' AND status = '1'`
          );
          hraUser[0]
            ? (lifestyleCount += Number(hraUser[0].question_Point))
            : 0;
        }
        if (ques.category == "mind") {
          let hraUser = await ConnectionUtil(
            `select * from user_hrasubmission where  healthQuestions_Id='${ques.healthQuestions_id}' AND user_Id='${user_Id}' AND status = '1'`
          );
          hraUser[0] ? (mindCount += Number(hraUser[0].question_Point)) : 0;
        }
      }
      let obj = {
        body: bodyCount,
        mind: mindCount,
        lifestyle: lifestyleCount,
        // user:userDetail[0]
      };

      res.status(200).json({
        success: true,
        message: "HRA user list",
        data: obj,
      });
    } else {
      res.status(422).json({
        success: false,
        message: "user not found ",
        data: {
          body: 0,
          mind: 0,
          lifestyle: 0,
        },
      });
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

//------------------------- hra_report -------------------------
// module.exports.hraCategoryBy_user = async (req, res) => {
//   try {
//       let { user_Id } = req.body;

//       res.status(200).json({
//           success: true,
//           message: "HRA report",
//           data: obj
//       });
//   } catch (err) {
//       console.log(err);
//       res.status(404).json({
//           success: false,
//           message: err.message
//       });
//   }
// }
