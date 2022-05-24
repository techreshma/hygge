const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);

// ------------------------- employeeReportBy_Challenge -----------------------------------
module.exports.employeeReportBy_Challenge = async (req, res) => {
  try {
    let { company_Id, start_date, end_date, page, pagination } = req.body;
    let { branch_Id, access } = req.query;

    let totalChallengesArr = await ConnectionUtil(
      `SELECT DISTINCT challenge_Name FROM challenges WHERE company_Id = ${company_Id} AND isActive = 1`
    );

    let userAssignChallengeArr = await ConnectionUtil(
      `SELECT DISTINCT user_id FROM userassign_challenges WHERE isActive = 1 AND company_Id = ${company_Id}`
    );

    let participantArr = await ConnectionUtil(
      `SELECT DISTINCT user_id FROM userassign_challenges WHERE  company_Id = ${company_Id} AND isActive = 1 AND isAccept = 1 `
    );

    let completionArr = await ConnectionUtil(
      `SELECT DISTINCT user_id FROM userassign_challenges WHERE  company_Id = ${company_Id} AND isActive = 1 AND isAccept = 1 AND isCompleted = 1`
    );

    let rewardPoint_earnArr = await ConnectionUtil(
      `SELECT SUM(Reward) AS rewardPoints FROM challenges WHERE company_Id = ${company_Id} AND isActive = 1`
    );

    let numberReward_redeemedArr = await ConnectionUtil(
      `SELECT * FROM challenges WHERE company_Id = 1 AND isActive = 1`
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
    let topParticipants = [];
    let topFinishers = [];
    for (let resp of participantArr) {
      userIdArr.push(resp.user_id);
    }

    for (let i = 0; i <= userIdArr.length - 1; i++) {
      let challengeParticipatedCountPerUserArr = await ConnectionUtil(
        `SELECT DISTINCT challenge_Id  FROM userassign_challenges WHERE  company_Id = 1 AND isActive = 1 AND isAccept = 1 AND user_id = ${userIdArr[i]}`
      );

      let challengeCompletedCountPerUserArr = await ConnectionUtil(
        `SELECT DISTINCT challenge_Id  FROM userassign_challenges WHERE  company_Id = 1 AND isActive = 1 AND isAccept = 1 AND isCompleted = 1  AND user_id = ${userIdArr[i]}`
      );

      let userDetailCompletedChallenges = await ConnectionUtil(
        `SELECT CONCAT(first_name,' ',last_name) as name FROM user WHERE company_id = ${company_Id} and isActive = 1 AND user_id = ${userIdArr[i]}`
      );

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

    for (let i = 0; i <= userIdArr.length - 1; i++) {
      let challengeParticipatedArr = await ConnectionUtil(
        `SELECT DISTINCT challenge_Id  FROM userassign_challenges WHERE  company_Id = ${company_Id} AND isActive = 1 AND isAccept = 1 AND user_id = ${userIdArr[i]}`
      );

      let userDetailArr = await ConnectionUtil(
        `SELECT concat(first_name, ' ', last_name) AS name ,department ,  reporting_Manager  FROM user WHERE company_id = ${company_Id} AND isActive = 1 AND user_id = ${userIdArr[i]}`
      );

      let challengeCompletedArr = await ConnectionUtil(
        `SELECT DISTINCT challenge_Id  FROM userassign_challenges WHERE  company_Id = ${company_Id} AND isActive = 1 AND isAccept = 1 AND user_id = ${userIdArr[i]} AND isCompleted = 1`
      );

      let totalAvailableChallengesArr = await ConnectionUtil(
        `SELECT challenges_id FROM challenges WHERE DATE_FORMAT(CURDATE() , '%Y-%m-%d') <= DATE_FORMAT(expiry_Date , '%Y-%m-%d') AND company_Id = ${company_Id}`
      );

      let rewardPointsEarnedPerUserArr = await ConnectionUtil(
        `SELECT SUM(reward_point) AS rewardPoints FROM reward_redeem  WHERE  user_Id = ${userIdArr[i]}`
      );
      var arrParticipated = [];
      let challengeParicipatedTypePerUser;
      for (let i = 0; i <= challengeParticipatedArr.length - 1; i++) {
        challengeParicipatedTypePerUser = await ConnectionUtil(
          `SELECT challenge_Name FROM challenges WHERE challenges_id = ${challengeParticipatedArr[i].challenge_Id}`
        );
        arrParticipated.push(challengeParicipatedTypePerUser[0].challenge_Name);
      }
      var arrCompleted = [];
      let challengeCompletedTypePerUser = [];
      for (let i = 0; i <= challengeCompletedArr.length - 1; i++) {
        challengeCompletedTypePerUser = await ConnectionUtil(
          `SELECT challenge_Name FROM challenges WHERE challenges_id = ${challengeCompletedArr[i].challenge_Id}`
        );
        arrCompleted.push(challengeCompletedTypePerUser[0].challenge_Name);
      }
      var arrTotal = [];
      let totalAvailableChallengeTypePerUser;

      for (let i = 0; i <= totalAvailableChallengesArr.length - 1; i++) {
        totalAvailableChallengeTypePerUser = await ConnectionUtil(
          `SELECT challenge_Name FROM challenges WHERE challenges_id = ${totalAvailableChallengesArr[i].challenges_id}`
        );
        arrTotal.push(totalAvailableChallengeTypePerUser[0].challenge_Name);
      }

      let rewardRedeemPerUserArr = await ConnectionUtil(
        `SELECT * FROM reward_redeem  WHERE  user_Id = ${userIdArr[i]}`
      );

      let obj = {
        Name: userDetailArr[0].name,
        Deparment: userDetailArr[0].deparment,
        Reporting_Manager: userDetailArr[0].reporting_Manager,
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
          rewardPointsEarnedPerUserArr != null
            ? rewardPointsEarnedPerUserArr[0].rewardPoints
            : 0,
        rewardRedeemed: rewardRedeemPerUserArr.length,
        challengeParticipatedType: arrParticipated,
        challengeCompletedType: arrCompleted,
        totalAvailableChallengesType: arrTotal,
      };
      userArr.push(obj);
    }

    let user2 = [];
    let totalChallengesArray2 = await ConnectionUtil(
      `SELECT challenges_id ,challenge_Name , DATE_FORMAT(created_At , '%Y-%m-%d') AS start_date ,DATE_FORMAT(expiry_Date , '%Y-%m-%d') AS end_date , age_From , age_To , genderType FROM challenges WHERE company_Id = ${company_Id} AND isActive = 1`
    );

    console.log(totalChallengesArray2, "===================>>>>>>>>>>>>>>>");
    for (let i = 0; i <= totalChallengesArray2.length - 1; i++) {
      let statusArr = await ConnectionUtil(
        `SELECT *  FROM challenges WHERE DATE_FORMAT(CURDATE() , '%Y-%m-%d') <= DATE_FORMAT(expiry_Date , '%Y-%m-%d') AND 
        company_Id = ${company_Id} AND isActive = 1 AND challenges_id = ${totalChallengesArray2[i].challenges_id}`
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
          `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${gender}' AND company_id = ${company_Id} AND isActive = 1`
        );
        elligibleUser = challengeEligible.length;
      } else {
        let challengeEligible = await ConnectionUtil(
          `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND company_id = ${company_Id} AND isActive = 1`
        );
        elligibleUser = challengeEligible.length;
      }

      let employeeParticipatedArr = await ConnectionUtil(
        `SELECT DISTINCT user_id FROM userassign_challenges WHERE challenge_Id = ${totalChallengesArray2[i].challenges_id} AND isAccept = 1 AND company_Id = ${company_Id} AND isActive = 1`
      );

      let employeeCompletedArr = await ConnectionUtil(
        `SELECT DISTINCT user_id FROM userassign_challenges WHERE challenge_Id = ${totalChallengesArray2[i].challenges_id} AND isAccept = 1 AND isCompleted = 1 AND company_Id = ${company_Id} AND isActive = 1`
      );

      let obj = {
        Name: totalChallengesArray2[i].challenge_Name,
        start_date: totalChallengesArray2[i].start_date,
        end_date: totalChallengesArray2[i].end_date,
        status: statusArr.length > 0 ? "open" : "close",
        eligibile_employees: elligibleUser,
        employee_participated: employeeParticipatedArr.length,
        employee_completed: employeeCompletedArr.length,
        percentage_participation:
          Math.round((employeeParticipatedArr.length / elligibleUser) * 100) +
          "%",
        percentage_completion:
          Math.round((employeeCompletedArr.length / elligibleUser) * 100) + "%",
      };
      user2.push(obj);
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
      user: userArr,
      userView2: user2,
    };
    res.status(200).json({
      success: true,
      message: "report of challenges",
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
