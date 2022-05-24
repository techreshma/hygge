const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
const { title } = require("process");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
var moment = require("moment-timezone");
const { time } = require("console");
const { parse } = require("path");
moment().tz("America/Los_Angeles").format();

module.exports.survey_Report = async (req, res) => {
  try {
    let totalCompanyCount = await ConnectionUtil(
      `SELECT DISTINCT company_Id FROM survey_Type WHERE company_Id !=0`
    );
    let TopFiveCompanies = [];
    for (let data of totalCompanyCount) {
      let companyName = await ConnectionUtil(
        `SELECT company_Name FROM company WHERE company_id='${data.company_Id}'`
      );
      let totalSurveyArrByCompany = await ConnectionUtil(
        `SELECT * FROM survey_Type WHERE company_Id = '${data.company_Id}'`
      );
      let totalSurveyByCompany = totalSurveyArrByCompany.length;
      let completedSurveyArrByCompany = await ConnectionUtil(
        `SELECT DISTINCT surveyType_Id FROM survey_Submission WHERE company_Id='${data.company_Id}'`
      );
      let completedSurveyByCompany = completedSurveyArrByCompany.length;
      let obj = {
        companyName: companyName[0].company_Name,
        completionRateByCompany:
          Math.ceil((completedSurveyByCompany / totalSurveyByCompany) * 100) +
          "%",
      };
      TopFiveCompanies.push(obj);
    }
    let totalSurveyArr = await ConnectionUtil(`SELECT * FROM survey_Type`);

    let total_survey = totalSurveyArr.length;

    let openSurveyArr = await ConnectionUtil(
      `SELECT * FROM initiate_Survey WHERE DATE_FORMAT(CURDATE() , '%Y-%m-%d') <= DATE_FORMAT(survey_ExpiryDate , '%Y-%m-%d')`
    );

    let open_survey = openSurveyArr.length;

    let completedSurveyArr = await ConnectionUtil(
      `SELECT DISTINCT surveyType_Id FROM survey_Submission`
    );
    let surveyDetails = [];

    for (let i = 0; i <= totalSurveyArr.length - 1; i++) {
      let surveyDate = await ConnectionUtil(
        `SELECT created_At AS start_date , survey_ExpiryDate AS end_date , survey_AgeTo , survey_AgeFrom , survey_Gender FROM initiate_Survey WHERE surveyQuestions_Id = ${totalSurveyArr[i].surveyType_id} AND isActive = 1 `
      );

      let surveyQuestions = await ConnectionUtil(
        `SELECT * FROM survey_Questions WHERE surveyType_Id = ${totalSurveyArr[i].surveyType_id} AND isActive = 1 `
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
          `SELECT DISTINCT user_Id FROM survey_Submission WHERE surveyType_Id = ${totalSurveyArr[i].surveyType_id} and isActive = 1 `
        );

        let surveyStatus = await ConnectionUtil(
          `SELECT * FROM initiate_Survey WHERE DATE_FORMAT(CURDATE() , '%Y-%m-%d') <= DATE_FORMAT(survey_ExpiryDate , '%Y-%m-%d') AND isActive = 1 AND surveyQuestions_Id = ${totalSurveyArr[i].surveyType_id}`
        );

        let status = surveyStatus.length == 0 ? "closed" : "open";

        let elligibleUser;

        if (
          surveyDate[0].survey_Gender != null ||
          surveyDate[0].survey_Gender != undefined
        ) {
          let surveyEligible = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = ${gender} AND isActive = 1`
          );
          elligibleUser = surveyEligible.length;
        } else {
          let surveyEligible = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND isActive = 1`
          );
          elligibleUser = surveyEligible.length;
        }

        let surveyStartedArr = await ConnectionUtil(
          `SELECT * FROM userAssign_Survey WHERE surveyType_Id = ${totalSurveyArr[i].surveyType_id}`
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
          company: totalSurveyArr[i].company_Id,
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

    let arr = [];
    let y = {};
    let temp = [];

    let userCompletedSurveyArr = await ConnectionUtil(
      `SELECT DISTINCT user_Id FROM survey_Submission WHERE isActive = 1`
    );

    let x = {};
    for (let resp of userCompletedSurveyArr) {
      x = resp.user_Id;
      arr.push(x);
    }

    for (let i = 0; i <= arr.length - 1; i++) {
      let suveyCompletedCountPerUserArr = await ConnectionUtil(
        `SELECT DISTINCT surveyType_Id FROM survey_Submission WHERE isActive = 1 AND user_Id = ${arr[i]}`
      );

      let userDetailCompletedSurvey = await ConnectionUtil(
        `SELECT COALESCE(CONCAT(first_name,' ',last_name) , 'noName') as name FROM user WHERE isActive = 1 AND user_id = ${arr[i]}`
      );
      if (userDetailCompletedSurvey.length > 0) {
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
      var obj = {
        total_survey,
        open_survey,
        completed_survey,
        completion_rate:
          Math.ceil((completed_survey / total_survey) * 100) + "%",
        topFiveCompanies: TopFiveCompanies,
        surveyDetails,
      };
    }
    res.status(200).json({
      success: true,
      message: "Survey Report List",
      data: obj,
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports.Challenges_Report = async (req, res) => {
  try {
    let totalChallengesArr = await ConnectionUtil(
      `SELECT DISTINCT challenge_Name FROM challenges WHERE isActive = 1`
    );

    let userAssignChallengeArr = await ConnectionUtil(
      `SELECT DISTINCT user_id FROM userassign_challenges WHERE isActive = 1`
    );

    let participantArr = await ConnectionUtil(
      `SELECT DISTINCT user_id FROM userassign_challenges WHERE isActive = 1 AND isAccept = 1 `
    );

    let ParticipantArrByCompany = await ConnectionUtil(
      `SELECT DISTINCT company_Id FROM userassign_challenges WHERE isActive = 1 AND isAccept = 1 AND company_Id != 0`
    );

    let completionArr = await ConnectionUtil(
      `SELECT DISTINCT user_id FROM userassign_challenges WHERE isActive = 1 AND isAccept = 1 AND isCompleted = 1`
    );

    let rewardPoint_earnArr = await ConnectionUtil(
      `SELECT SUM(Reward) AS rewardPoints FROM challenges WHERE isActive = 1`
    );

    let numberReward_redeemedArr = await ConnectionUtil(
      `SELECT * FROM challenges WHERE isActive = 1`
    );

    let total_challenge = totalChallengesArr.length;
    let userAssignChallenge = userAssignChallengeArr.length;
    let participant = participantArr.length;
    let participant_percentage =
      Math.round((participant / userAssignChallenge) * 100) + "%";
    let completion = completionArr.length;
    let completion_percentage =
      Math.round((completion / userAssignChallenge) * 100) + "%";
    let rewardPoint_earn = rewardPoint_earnArr[0].rewardPoints;
    let numberReward_redeemed = numberReward_redeemedArr.length;
    let userIdArr = [];
    let companyIdArr = [];
    let topParticipants = [];
    let topFinishers = [];
    let topCompanies = [];
    for (let resp of participantArr) {
      userIdArr.push(resp.user_id);
    }

    for (let data of ParticipantArrByCompany) {
      companyIdArr.push(data.company_Id);
    }

    for (let i = 0; i <= userIdArr.length - 1; i++) {
      let challengeParticipatedCountPerUserArr = await ConnectionUtil(
        `SELECT DISTINCT challenge_Id  FROM userassign_challenges WHERE isActive = 1 AND isAccept = 1 AND user_id = ${userIdArr[i]}`
      );

      let challengeCompletedCountPerUserArr = await ConnectionUtil(
        `SELECT DISTINCT challenge_Id  FROM userassign_challenges WHERE isActive = 1 AND isAccept = 1 AND isCompleted = 1  AND user_id = ${userIdArr[i]}`
      );

      let userDetailCompletedChallenges = await ConnectionUtil(
        `SELECT COALESCE(CONCAT(first_name,' ',last_name) , 'noName') as name FROM user WHERE isActive = 1 AND user_id = ${userIdArr[i]}`
      );
      if (userDetailCompletedChallenges.length > 0) {
        y = {
          user_Id: userIdArr[i],
          name: userDetailCompletedChallenges[0].name,
          challenge_participated: challengeParticipatedCountPerUserArr.length,
        };
        topParticipants.push(y);
        z = {
          user_Id: userIdArr[i],
          name: userDetailCompletedChallenges[0].name,
          challenge_completed: challengeCompletedCountPerUserArr.length,
        };
        topFinishers.push(z);
      }

      topParticipants.sort((a, b) =>
        a.challenge_participated > b.challenge_participated
          ? 1
          : b.challenge_participated > a.challenge_participated
          ? -1
          : 0
      );

      topFinishers.sort((a, b) =>
        a.challenge_completed > b.challenge_completed
          ? 1
          : b.challenge_completed > a.challenge_completed
          ? -1
          : 0
      );
    }

    let finalArrOfParticipants = [];
    for (
      let i = topParticipants.length - 1;
      i >= topParticipants.length - 5;
      i--
    ) {
      finalArrOfParticipants.push(topParticipants[i]);
    }

    let finalArrOfFinishers = [];
    for (let i = topFinishers.length - 1; i >= topFinishers.length - 5; i--) {
      finalArrOfFinishers.push(topFinishers[i]);
    }

    let userArr = [];
    let TopCompanyByParticipationRate = [];
    let TopCompanyByCompletionRate = [];
    for (let i = 0; i <= companyIdArr.length - 1; i++) {
      let companyNameDetailArr = await ConnectionUtil(
        `SELECT company_id ,company_Name FROM company WHERE company_id = '${companyIdArr[i]}'`
      );
      let challengeParticipatedByCompanyArr = await ConnectionUtil(
        `SELECT DISTINCT challenge_Id  FROM userassign_challenges WHERE isActive = 1 AND isAccept = 1 AND company_Id = '${companyIdArr[i]}'`
      );
      let totalAvailableChallengesByCompanyArr = await ConnectionUtil(
        `SELECT challenges_id FROM challenges WHERE DATE_FORMAT(CURDATE() , '%Y-%m-%d') <= DATE_FORMAT(expiry_Date , '%Y-%m-%d')`
      );
      let challengeCompletedByCompanyArr = await ConnectionUtil(
        `SELECT DISTINCT challenge_Id  FROM userassign_challenges WHERE isActive = 1 AND isAccept = 1 AND company_Id = '${companyIdArr[i]}' AND isCompleted = 1`
      );

      let TopCompanybyParcipationRateObj = {
        company: companyNameDetailArr[0].company_Name,
        participationRateByCompany: Math.round(
          (challengeParticipatedByCompanyArr.length /
            totalAvailableChallengesByCompanyArr.length) *
            100
        ),
      };
      TopCompanyByParticipationRate.push(TopCompanybyParcipationRateObj);

      let TopCompanybyCompletionRateObj = {
        company: companyNameDetailArr[0].company_Name,
        completionRateByCompany: Math.round(
          (challengeCompletedByCompanyArr.length /
            totalAvailableChallengesByCompanyArr.length) *
            100
        ),
      };
      TopCompanyByCompletionRate.push(TopCompanybyCompletionRateObj);
    }

    TopCompanyByParticipationRate.sort((a, b) =>
      a.participationRateByCompany > b.participationRateByCompany
        ? -1
        : b.participationRateByCompany > a.participationRateByCompany
        ? 1
        : 0
    );

    TopCompanyByCompletionRate.sort((a, b) =>
      a.completionRateByCompany > b.completionRateByCompany
        ? -1
        : b.completionRateByCompany > a.completionRateByCompany
        ? 1
        : 0
    );

    let finalTopCompanyByParticipationRate = [];
    for (let data of TopCompanyByParticipationRate) {
      data.participationRateByCompany = data.participationRateByCompany + "%";
      finalTopCompanyByParticipationRate.push(data);
    }
    let finalTopCompanyByCompletionRate = [];
    for (let data of TopCompanyByCompletionRate) {
      data.completionRateByCompany = data.completionRateByCompany + "%";
      finalTopCompanyByCompletionRate.push(data);
    }

    let newFinalTopCompanyByParticipationRate = [];
    for (let i = 0; i < 5; i++) {
      if (
        finalTopCompanyByParticipationRate[i] != null &&
        finalTopCompanyByParticipationRate[i] != undefined
      ) {
        newFinalTopCompanyByParticipationRate.push(
          finalTopCompanyByParticipationRate[i]
        );
      }
    }

    let newFinalTopCompanyByCompletionRate = [];
    for (let i = 0; i < 5; i++) {
      if (
        finalTopCompanyByCompletionRate[i] != null &&
        finalTopCompanyByCompletionRate[i] != undefined
      ) {
        newFinalTopCompanyByCompletionRate.push(
          finalTopCompanyByCompletionRate[i]
        );
      }
    }

    for (let i = 0; i <= userIdArr.length - 1; i++) {
      let challengeParticipatedArr = await ConnectionUtil(
        `SELECT DISTINCT challenge_Id  FROM userassign_challenges WHERE isActive = 1 AND isAccept = 1 AND user_id = ${userIdArr[i]}`
      );

      let userDetailArr = await ConnectionUtil(
        `SELECT user_id , COALESCE(CONCAT(first_name,' ',last_name) , 'noName') as name ,company_id , gender , DATE_FORMAT(NOW(), '%Y') - DATE_FORMAT(DOB, '%Y') - (DATE_FORMAT(NOW(), '00-%m-%d') < DATE_FORMAT(DOB, '00-%m-%d')) AS age FROM user WHERE isActive = 1 AND user_id = ${userIdArr[i]}`
      );
      let companyDetailArr;
      for (let i = 0; i <= userDetailArr.length - 1; i++) {
        companyDetailArr = await ConnectionUtil(
          `SELECT company_id ,company_Name FROM company WHERE company_id = '${userDetailArr[i].company_id}'`
        );
      }

      let challengeCompletedArr = await ConnectionUtil(
        `SELECT DISTINCT challenge_Id  FROM userassign_challenges WHERE isActive = 1 AND isAccept = 1 AND user_id = ${userIdArr[i]} AND isCompleted = 1`
      );

      let totalAvailableChallengesArr = await ConnectionUtil(
        `SELECT challenges_id FROM challenges WHERE DATE_FORMAT(CURDATE() , '%Y-%m-%d') <= DATE_FORMAT(expiry_Date , '%Y-%m-%d')`
      );

      let rewardPointsEarnedPerUserArr = await ConnectionUtil(
        `SELECT SUM(reward_point) AS rewardPoints FROM reward_redeem  WHERE  user_Id = ${userIdArr[i]}`
      );

      let rewardPointsRedeemedPerUserArr = await ConnectionUtil(
        `SELECT SUM(reward_point) AS rewardPointsRedeemed FROM reward_redeem  WHERE  user_Id = '${userIdArr[i]}'  AND isDeposit=0`
      );

      var arrParticipated = [];
      let challengeParicipatedTypePerUser;
      for (let i = 0; i <= challengeParticipatedArr.length - 1; i++) {
        challengeParicipatedTypePerUser = await ConnectionUtil(
          `SELECT challenge_Name FROM challenges WHERE challenges_id = ${challengeParticipatedArr[i].challenge_Id}`
        );
        if (challengeParicipatedTypePerUser.length > 0) {
          arrParticipated.push(
            challengeParicipatedTypePerUser[0].challenge_Name
          );
        }
      }
      var arrCompleted = [];
      let challengeCompletedTypePerUser = [];
      for (let i = 0; i <= challengeCompletedArr.length - 1; i++) {
        challengeCompletedTypePerUser = await ConnectionUtil(
          `SELECT challenge_Name FROM challenges WHERE challenges_id = ${challengeCompletedArr[i].challenge_Id}`
        );
        if (challengeCompletedTypePerUser.length > 0) {
          arrCompleted.push(challengeCompletedTypePerUser[0].challenge_Name);
        }
      }
      var arrTotal = [];
      let totalAvailableChallengeTypePerUser;

      for (let i = 0; i <= totalAvailableChallengesArr.length - 1; i++) {
        totalAvailableChallengeTypePerUser = await ConnectionUtil(
          `SELECT challenge_Name FROM challenges WHERE challenges_id = ${totalAvailableChallengesArr[i].challenges_id}`
        );
        if (totalAvailableChallengeTypePerUser.length > 0) {
          arrTotal.push(totalAvailableChallengeTypePerUser[0].challenge_Name);
        }
      }

      let rewardRedeemPerUserArr = await ConnectionUtil(
        `SELECT * FROM reward_redeem  WHERE  user_Id = ${userIdArr[i]}`
      );
      if (userDetailArr.length > 0) {
        let obj = {
          userID: userDetailArr[0].user_id,
          Company: companyDetailArr[0].company_Name,
          Gender: userDetailArr[0].gender,
          Age: userDetailArr[0].age,
          Challenge_Participated: challengeParticipatedArr.length,
          challenge_completed: challengeCompletedArr.length,
          totalAvailable_Challenge: totalAvailableChallengesArr.length,
          participationRate:
            Math.round(
              (challengeParticipatedArr.length /
                totalAvailableChallengesArr.length) *
                100
            ) + "%",
          completionRate:
            Math.round(
              (challengeCompletedArr.length /
                totalAvailableChallengesArr.length) *
                100
            ) + "%",
          rewardPointsEarned:
            rewardPointsEarnedPerUserArr[0].rewardPoints != null
              ? rewardPointsEarnedPerUserArr[0].rewardPoints
              : 0,
          rewardPointsRedeemed:
            rewardPointsRedeemedPerUserArr[0].rewardPointsRedeemed != null
              ? rewardPointsRedeemedPerUserArr[0].rewardPointsRedeemed
              : 0,
          rewardRedeemed: rewardRedeemPerUserArr.length,
          challengeParticipatedType: arrParticipated,
          challengeCompletedType: arrCompleted,
          totalAvailableChallengesType: arrTotal,
        };
        userArr.push(obj);
      }
    }

    let user2 = [];
    let totalChallengesArray2 = await ConnectionUtil(
      `SELECT challenges_id ,challenge_Name ,company_Id , DATE_FORMAT(created_At , '%Y-%m-%d') AS start_date ,DATE_FORMAT(expiry_Date , '%Y-%m-%d') AS end_date , age_From , age_To , genderType FROM challenges WHERE isActive = 1`
    );

    for (let i = 0; i <= totalChallengesArray2.length - 1; i++) {
      let statusArr = await ConnectionUtil(
        `SELECT *  FROM challenges WHERE DATE_FORMAT(CURDATE() , '%Y-%m-%d') <= DATE_FORMAT(expiry_Date , '%Y-%m-%d') AND isActive = 1 AND challenges_id = ${totalChallengesArray2[i].challenges_id}`
      );

      let ageTo =
        totalChallengesArray2[i].age_To == null ||
        totalChallengesArray2[i].age_To == undefined
          ? 100
          : totalChallengesArray2[i].age_To;
      let ageFrom =
        totalChallengesArray2[i].age_From == null ||
        totalChallengesArray2[i].age_From == undefined
          ? 0
          : totalChallengesArray2[i].age_From;

      let gender =
        totalChallengesArray2[i].genderType == null ||
        totalChallengesArray2[i].genderType == undefined
          ? "Male"
          : totalChallengesArray2[i].genderType;

      let elligibleUser;

      if (
        totalChallengesArray2[i].genderType != null ||
        totalChallengesArray2[i].genderType != undefined
      ) {
        let challengeEligible = await ConnectionUtil(
          `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${gender}' AND isActive = 1`
        );
        elligibleUser = challengeEligible.length;
      } else {
        let challengeEligible = await ConnectionUtil(
          `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND isActive = 1`
        );
        elligibleUser = challengeEligible.length;
      }

      let employeeParticipatedArr = await ConnectionUtil(
        `SELECT DISTINCT user_id FROM userassign_challenges WHERE challenge_Id = ${totalChallengesArray2[i].challenges_id} AND isAccept = 1 AND isActive = 1`
      );

      let employeeCompletedArr = await ConnectionUtil(
        `SELECT DISTINCT user_id FROM userassign_challenges WHERE challenge_Id = ${totalChallengesArray2[i].challenges_id} AND isAccept = 1 AND isCompleted = 1 AND isActive = 1`
      );
      if (totalChallengesArray2.length > 0) {
        let obj = {
          Name: totalChallengesArray2[i].challenge_Name,
          company: totalChallengesArray2[i].company_Id,
          start_date: totalChallengesArray2[i].start_date,
          end_date: totalChallengesArray2[i].end_date,
          status: statusArr.length > 0 ? "open" : "close",
          eligibile_employees: elligibleUser,
          employee_participated: employeeParticipatedArr.length,
          employee_completed: employeeCompletedArr.length,
          percentage_participation:
            Math.round(
              (employeeParticipatedArr.length / elligibleUser) * 100
            ) != Infinity &&
            Math.round(
              (employeeParticipatedArr.length / elligibleUser) * 100
            ) != NaN
              ? Math.round(
                  (employeeParticipatedArr.length / elligibleUser) * 100
                ) + "%"
              : "0%",
          percentage_completion:
            Math.round((employeeCompletedArr.length / elligibleUser) * 100) !=
              Infinity &&
            Math.round((employeeCompletedArr.length / elligibleUser) * 100) !=
              NaN
              ? Math.round(
                  (employeeCompletedArr.length / elligibleUser) * 100
                ) + "%"
              : "0%",
        };
        user2.push(obj);
      }
    }

    let obj = {
      total_challenge,
      participant,
      participant_percentage,
      completion,
      completion_percentage,
      rewardPoint_earn,
      numberReward_redeemed,
      top_participants: finalArrOfParticipants,
      top_finishers: finalArrOfFinishers,
      topFiveCompanyByParticipationRate: newFinalTopCompanyByParticipationRate,
      topFiveCompanyByCompletionRate: newFinalTopCompanyByCompletionRate,
      user: userArr,
      userView2: user2,
    };
    res.status(200).json({
      success: true,
      message: "Challenges Report List",
      data: obj,
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports.Employee_Report = async (req, res) => {
  try {
    //total user_count
    let TotalUser = await ConnectionUtil(
      `select COUNT(*) as totalUserCount from user where isActive=1 ORDER BY user_id DESC`
    );

    // gender
    let userDetailByGender = await ConnectionUtil(
      `select gender,COUNT(*) as employee from user where isActive=1  Group By gender`
    );
    await userDetailByGender.map((data) => {
      if (data.gender == null) {
        data.gender = "Not Mentioned";
      }
    });
    // nationality count
    let userDetailByNationalty = await ConnectionUtil(
      `select nationality,COUNT(*) as employee from user where isActive=1 Group By nationality`
    );

    // marital_Status count
    let userDetailByMarital = await ConnectionUtil(
      `select marital_Status,COUNT(*) as employee from user where isActive=1 Group By marital_Status`
    );

    //company
    let employeeCountByCompany = await ConnectionUtil(
      `SELECT company.company_Name as comapny_name,COUNT(*) AS value FROM user JOIN company ON user.company_id = company.company_id where user.isActive=1 GROUP BY user.company_id ORDER BY value DESC LIMIT 10`
    );

    //work_location
    let userCountByWorkLocation = await ConnectionUtil(
      `SELECT work_location AS location_name , COUNT(*) AS users_count FROM user where isActive=1 GROUP BY location_name ORDER BY users_count DESC LIMIT 10`
    );

    //home_location
    let userCountByHomeLocation = await ConnectionUtil(
      `SELECT home_Location AS location_name , COUNT(*) AS users_count FROM user where isActive=1 GROUP BY location_name ORDER BY users_count DESC LIMIT 10`
    );

    //Age
    let userDetailByAge = await ConnectionUtil(
      `select  Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0) as age from user where isActive=1 AND DOB IS NOT NULL`
    );

    let countAge = 0;
    let ageOne = 0;
    let ageTwo = 0;
    let ageThree = 0;
    let ageFour = 0;
    let ageFive = 0;
    let ageAverageArr = [];
    let totalUserAge = userDetailByAge.length;
    await userDetailByAge.map((data) => {
      countAge = countAge + data.age;
      if (data.age >= 18 && data.age <= 24) {
        ageOne = ageOne + 1;
      }
      if (data.age >= 25 && data.age <= 34) {
        ageTwo = ageTwo + 1;
      }
      if (data.age >= 35 && data.age <= 50) {
        ageThree = ageThree + 1;
      }
      if (data.age >= 51 && data.age <= 60) {
        ageFour = ageFour + 1;
      }
      if (data.age >= 60) {
        ageFive = ageFive + 1;
      }
    });
    let ageAverage = Math.trunc(countAge / totalUserAge);
    ageAverageArr.push(
      { ageKey: "18-24", ageEmp: ageOne },
      { ageKey: "25-34", ageEmp: ageTwo },
      { ageKey: "35-50", ageEmp: ageThree },
      { ageKey: "51-60", ageEmp: ageFour },
      { ageKey: "+60", ageEmp: ageFive }
    );

    let newUserArr = [];
    let userLength = await ConnectionUtil(
      `SELECT user_id AS User_ID,gender AS Gender,Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0) as Age,company_id,nationality AS Nationality,work_location AS Work_Location,home_Location AS Home_Location FROM user WHERE isActive=1 ORDER BY user_id DESC`
    );
    for (let i = 0; i <= userLength.length - 1; i++) {
      let userDetailArr = await ConnectionUtil(
        `SELECT user_id AS User_ID,gender AS Gender,Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0) as Age,company_id,nationality AS Nationality,work_location AS Work_Location,home_Location AS Home_Location FROM user WHERE user_id='${userLength[i].User_ID}' AND isActive=1 ORDER BY user_id DESC`
      );
      let companyDetail = await ConnectionUtil(
        `SELECT company_Name FROM company WHERE company_id = '${userLength[i].company_id}'`
      );
      let newObj = {
        userId: userDetailArr[0].User_ID,
        gender: userDetailArr[0].Gender,
        age: userDetailArr[0].Age,
        company:
          companyDetail != null &&
          companyDetail != undefined &&
          companyDetail != ""
            ? companyDetail[0].company_Name
            : "",
        nationality: userDetailArr[0].Nationality,
        workLocation: userDetailArr[0].Work_Location,
        homeLocation: userDetailArr[0].Home_Location,
        platform: "",
        lastLogin: "",
        lastThirtyDaysLogin: "",
        averageLoginPermonth: "",
        averageDurationPerlogin: "",
        totalLifetimeDurationUsed: "",
      };
      newUserArr.push(newObj);
    }

    let obj = {
      total_users: TotalUser[0].totalUserCount,
      average_ageCriteria: ageAverageArr,
      age_average: ageAverage,
      gender: userDetailByGender,
      nationalty: userDetailByNationalty,
      marital: userDetailByMarital,
      company: employeeCountByCompany,
      user_on_platforms: [
        {
          device_name: "Android",
          user_count: "1000000",
        },
        {
          device_name: "IOS",
          user_count: "100000",
        },
      ],
      work_locations: userCountByWorkLocation,
      home_location: userCountByHomeLocation,
      login_counts: "",
      average_login_count: "",
      total_usage_duration: "",
      average_usage_duration: "",
      user_report_detail: newUserArr,
    };

    res.status(200).json({
      success: true,
      message: "Employee Report List",
      data: obj,
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports.company_Report = async (req, res) => {
  try {
    let currentDate = Date.now(); //"02-01-2022";
    let date = moment(currentDate).format("DD-MM-YYYY");
    let currentGetMonth = date.split("-");

    let Totalcompany = await ConnectionUtil(
      `SELECT * from company WHERE isActive=1`
    );

    let topIndustries = await ConnectionUtil(
      `select company_Industry AS industry_name ,COUNT(*) as value from company where isActive=1 GROUP BY industry_name ORDER BY value DESC LIMIT 5`
    );

    // let topLocations = await ConnectionUtil(`select company_Locations AS company_Locations ,COUNT(*) as value from company where isActive=1 GROUP BY company_Locations ORDER BY value DESC LIMIT 5`);

    let topPlan = await ConnectionUtil(
      `SELECT plan_Name AS plan_name,COUNT(*) AS value FROM company WHERE isActive=1 GROUP BY plan_name ORDER BY value DESC limit 3`
    );

    let CompanyUserArr = [];
    let companyReportDetail = [];
    for (let i = 0; i <= Totalcompany.length - 1; i++) {
      let companyDetailByUser = await ConnectionUtil(
        `SELECT company_id,COUNT(*) AS UserCount FROM user WHERE company_id ='${Totalcompany[i].company_id}' AND isActive=1 GROUP BY company_id ORDER BY UserCount DESC`
      );
      //---- //
      let companyCheckin_out = await ConnectionUtil(
        `SELECT COUNT(*) AS CheckinCount FROM Attendance WHERE company_id ='${Totalcompany[i].company_id}' AND (YEAR(created_At) = YEAR(CURRENT_DATE) AND MONTH(created_At) = MONTH(CURRENT_DATE))`
      );

      var count = companyCheckin_out[0].CheckinCount;
      let numberOfEmployees = await ConnectionUtil(
        `SELECT company_id,COUNT(*) AS UserCount FROM user WHERE company_id ='${Totalcompany[i].company_id}' AND (status='1' AND isActive='1') GROUP BY company_id  ORDER BY UserCount DESC`
      );

      if (numberOfEmployees != 0) {
        var calculation =
          count / (numberOfEmployees[0].UserCount * currentGetMonth[0]);
      }
      //---- //

      if (companyDetailByUser != "") {
        CompanyUserArr.push(companyDetailByUser[0]);
      }
      let companyArr = await ConnectionUtil(
        `SELECT * from company WHERE company_id='${Totalcompany[i].company_id}' AND isActive=1`
      );

      let ActivePlanDetailByCompanyArr = await ConnectionUtil(
        `SELECT * from company WHERE DATE_FORMAT(CURDATE() , '%Y-%m-%d') <= DATE_FORMAT(plan_EndDate , '%Y-%m-%d') AND company_id='${Totalcompany[i].company_id}' AND isActive=1`
      );

      let userListByCompany = await ConnectionUtil(
        `SELECT * FROM user WHERE company_id ='${Totalcompany[i].company_id}' AND isActive=1`
      );

      let newObj = {
        name: companyArr[0].company_Name,
        // checkin_count: companyCheckin_out[0].CheckinCount,
        location_city: companyArr[0].company_Address,
        Industry: companyArr[0].company_Industry,
        no_of_users: userListByCompany != "" ? userListByCompany.length : 0,
        userList: userListByCompany != "" ? userListByCompany : [],
        plan: companyArr[0].plan_Name,
        plan_status: ActivePlanDetailByCompanyArr != "" ? "Active" : "Expired", //active = 1 , expired =0,
        plan_activation_date: companyArr[0].plan_StartDate,
        plan_expiry_date: companyArr[0].plan_EndDate,
        customer_acquisition: companyArr[0].plan_StartDate,
        usage_score: calculation,
      };
      companyReportDetail.push(newObj);
    }

    let countUser = 0;
    let companyRangeOne = 0;
    let companyRangeTwo = 0;
    let companyRangeThree = 0;
    let companyRangeFour = 0;
    let companyRangeFive = 0;
    let userArrByCompany = [];
    let totalCompanyCount = CompanyUserArr.length;
    await CompanyUserArr.map((data) => {
      countUser = countUser + data.UserCount;
      if (data.UserCount >= 1 && data.UserCount <= 24) {
        companyRangeOne = companyRangeOne + 1;
      }
      if (data.UserCount >= 25 && data.UserCount <= 49) {
        companyRangeTwo = companyRangeTwo + 1;
      }
      if (data.UserCount >= 50 && data.UserCount <= 99) {
        companyRangeThree = companyRangeThree + 1;
      }
      if (data.UserCount >= 100 && data.UserCount <= 199) {
        companyRangeFour = companyRangeFour + 1;
      }
      if (data.UserCount >= 200) {
        companyRangeFive = companyRangeFive + 1;
      }
    });
    let companyAverage = Math.trunc(countUser / totalCompanyCount);
    userArrByCompany.push(
      { userKey: "1-24", companyCount: companyRangeOne },
      { userKey: "25-49", companyCount: companyRangeTwo },
      { userKey: "50-99", companyCount: companyRangeThree },
      { userKey: "100-199", companyCount: companyRangeFour },
      { userKey: "200+", companyCount: companyRangeFive }
    );

    let obj = {
      comapnyGraphData: {
        totalCompanies: Totalcompany.length,
        topIndustries: topIndustries,
        topCities: [
          {
            city_name: "city1",
            value: "",
          },
          {
            city_name: "city2",
            value: "",
          },
          {
            city_name: "city3",
            value: "",
          },
          {
            city_name: "city4",
            value: "",
          },
          {
            city_name: "city5",
            value: "",
          },
        ],
        plansDetail: topPlan,
        userCompany: {
          averageUsersCount: companyAverage,
          companyUsers: userArrByCompany,
        },
        usageScoreAverage: "",
        usageScoreCompanies: [
          {
            company_name: "company1",
            value: "",
          },
          {
            company_name: "company2",
            value: "",
          },
          {
            company_name: "company3",
            value: "",
          },
        ],
      },
      companiesReportDetail: companyReportDetail,
    };

    res.status(200).json({
      success: true,
      message: "Company Report List",
      data: obj,
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports.monthlyAverageAndDuration = async (req, res) => {
  try {
    //let testDate = "01-02-2022";
    let curentDate = Date.now();
    let date = moment(curentDate).format("DD-MM-YYYY"); //testDate;
    let currentGetMonth = date.split("-");
    let loginCount = 0;
    let loginAverageCount = 0;

    let totalHours;
    let totalSeconds = 0;
    let userLength = 0;
    let totalDuration = 0;
    let totalAverage = 0;

    let checkDuration = await ConnectionUtil(`select * from duration_maintain`);
    for (let userdata of checkDuration) {
      let userLastMonth = userdata.date.split("-");

      if (parseInt(currentGetMonth[1]) == parseInt(userLastMonth[1])) {
        loginCount++;
        loginAverageCount++;
        parts = userdata.duration.split(":");
        hours = parseInt(parts[0]) * 3600000;
        minutes = parseInt(parts[1]) * 60000;
        seconds = parseInt(parts[2]) * 1000;
        totalSeconds += hours + minutes + seconds;
        ++userLength;
      }
    }

    totalHours = totalSeconds / 3600000;
    let average = totalHours / userLength;
    let durationDays = Math.floor(totalSeconds / 3600000 / 24);
    let durationHours = Math.floor((totalSeconds / 3600000) % 24);
    let durationMinutes = Math.floor((totalSeconds / 60000) % 60);
    let durationSeconds = Math.floor(totalSeconds % 60);

    totalDuration =
      durationDays +
      "days" +
      "," +
      durationHours +
      "hours" +
      "," +
      durationMinutes +
      "minutes";

    let convertAverage = average * 3600000;
    let averageHours = Math.floor(convertAverage / 3600000);
    let averageMinutes = Math.floor((convertAverage / 60000) % 60);
    let averageSeconds = Math.floor(convertAverage % 60);
    totalAverage = averageHours * 60 + averageMinutes + ":" + averageSeconds;
    res.status(200).json({
      success: true,
      message: "Average Duration Showed Successfully",
      data: { loginCount, loginAverageCount, totalDuration, totalAverage },
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
