const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let MAIL = require("../../config/email");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let { helperNotification } = require("../../lib/helpers/fcm");

// ------------------------- variable_RawData -----------------------------------
module.exports.variable_RawData = async (req, res) => {
  try {
    let {
      user_Id,
      company_Id,
      activityCard_Id,
      activityCard_catId,
      date,
      time,
      measure,
      ip_Address,
      degree,
      calories,
    } = req.body;

    if (activityCard_Id == 8) {
      let selectWeightArr = await ConnectionUtil(
        `select * from user_hrasubmission where status = 1 and healthQuestions_Id = 9 and user_Id = ${user_Id} order by created_At desc limit 1`
      );
      if (selectWeightArr.length > 0) {
        let insertOldHraArr = await ConnectionUtil(
          `INSERT INTO hra_submission_old (id, healthQuestions_Id, options, user_Id, status, isActive, company_Id, created_At, updated_At) VALUES (NULL, '9', '${selectWeightArr[0].options}', '${user_Id}', '1', '1', '1', current_timestamp(), current_timestamp())`
        );
      }
      let updateWeightHraArr = await ConnectionUtil(
        `update user_hrasubmission set options = '${measure}' where status = 1 and healthQuestions_Id = 9 and user_Id = ${user_Id}`
      );
    } else if (activityCard_Id == 9) {
      let updatewaistHraArr = await ConnectionUtil(
        `update user_hrasubmission set options = '${measure}' where status = 1 and healthQuestions_Id = 10 and user_Id = ${user_Id}`
      );
      let updateHipHraArr = await ConnectionUtil(
        `update user_hrasubmission set options = '${calories}' where status = 1 and healthQuestions_Id = 11 and user_Id = ${user_Id}`
      );
    } else {
      let obj = {
        user_Id: user_Id,
        company_Id: company_Id,
        activityCard_Id: activityCard_Id,
        activityCard_catId: activityCard_catId,
        date: date,
        time: time,
        measure: measure,
        degree: degree,
        ip_Address: ip_Address,
        calories: calories,
      };

      if (activityCard_Id == 68 && activityCard_catId == 2) {
        let useOfAppCheck = await ConnectionUtil(
          `select * from variable_recorde where activityCard_Id = 68 and activityCard_catId = 2 AND DATE_FORMAT(created_At , '%Y-%m-%d') = DATE_FORMAT(CURDATE() , '%Y-%m-%d')`
        );

        if (useOfAppCheck.length == 0) {
          var addVariablerRecorde = await ConnectionUtil(
            `INSERT INTO variable_recorde SET?`,
            obj
          );
          return res.status(200).json({
            success: true,
            message: "Variable data store successfully",
            data: addVariablerRecorde,
          });
        } else {
          return res.status(403).json({
            success: false,
            message: "already stored todays app usage data",
          });
        }
      }

      var addVariablerRecorde = await ConnectionUtil(
        `INSERT INTO variable_recorde SET?`,
        obj
      );
      if (activityCard_Id == 33) {
        await stepsChallenge(user_Id, company_Id, activityCard_Id);
      }
      if (
        activityCard_Id == 47 ||
        activityCard_Id == 54 ||
        activityCard_Id == 48
      ) {
        await walkingRunningChallenge(user_Id, company_Id, activityCard_Id);
      }
      if (activityCard_Id == 36) {
        await stressChallenge(user_Id, company_Id, activityCard_Id);
      }

      if (activityCard_Id == 2) {
        await bloodPressureChallenge(user_Id, company_Id, activityCard_Id);
      }
      if (activityCard_Id == 3) {
        await sleepChallenge(user_Id, company_Id, activityCard_Id);
      }

      if (activityCard_Id == 68) {
        await useOfAppChallenge(user_Id, company_Id, activityCard_Id);
      }
    }

    res.status(200).json({
      success: true,
      message: "Variable data store successfully",
      data: addVariablerRecorde,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//--------------------------<challenge steps> -----------------------

async function stepsChallenge(user_Id, company_Id, activityCard_Id) {
  let challengeDetail = await ConnectionUtil(
    `select age , age_From , age_To , Gender , genderType , Department , department_Name , company_Id , Reward , action_Required ,challenge_Configuration , DATE_FORMAT(expiry_Date , '%Y-%m-%d') expiry_Date, challengePredefined_Id , DATE_FORMAT(created_At , '%Y-%m-%d') created_At , challenges_id from challenges where  challengePredefined_Id = '1' AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND action_Required = '1'`
  );
  for (let Challenge of challengeDetail) {
    let challengeUserAssignDetail = await ConnectionUtil(
      `select * from userassign_challenges  where isCompleted='0' AND isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${user_Id}' `
    );

    if (Challenge.company_Id == 0) {
      if (Challenge.age == 0 && Challenge.Gender == 0) {
        if (challengeUserAssignDetail.length > 0) {
          await challengeTaskSteps(
            Challenge,
            user_Id,
            company_Id,
            challengeUserAssignDetail
          );
        }
      } else {
        let ageFrom = Challenge.age_From;
        let ageTo = Challenge.age_To;
        let genderType = Challenge.genderType;
        if (Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskSteps(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskSteps(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskSteps(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
      }
    } else {
      if (
        Challenge.age == 0 &&
        Challenge.Gender == 0 &&
        Challenge.Department == 0
      ) {
        if (challengeUserAssignDetail.length > 0) {
          await challengeTaskSteps(
            Challenge,
            user_Id,
            company_Id,
            challengeUserAssignDetail
          );
        }
      } else {
        let ageFrom = Challenge.age_From;
        let ageTo = Challenge.age_To;
        let genderType = Challenge.genderType;
        let department = Challenge.department_Name;
        if (Challenge.Gender == 0 && Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskSteps(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0 && Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskSteps(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0 && Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskSteps(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskSteps(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskSteps(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskSteps(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
      }
    }
  }
}

async function challengeTaskSteps(
  Challenge,
  user_Id,
  company_Id,
  challengeUserAssignDetail
) {
  // console.log(challengeUserAssignDetail, "challenfjghfd");

  let d1 = new Date(Challenge.created_At).getTime();
  let d2 = new Date(Challenge.expiry_Date).getTime();
  let differernce = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24) + 1);
  let y = JSON.parse(Challenge.challenge_Configuration);
  let valueDays = y[2].value;
  let valueSteps = y[1].value;

  let stepsChallengeArr = await ConnectionUtil(
    `SELECT * FROM variable_recorde WHERE user_Id = ${user_Id} AND company_id = ${company_Id} AND isActive = 1 AND date BETWEEN '${Challenge.created_At}' AND '${Challenge.expiry_Date}' AND activityCard_Id = 33 AND activityCard_catId = 2 AND measure > ${valueSteps}`
  );

  console.log(stepsChallengeArr.length, "no of days of steps");
  if (stepsChallengeArr.length >= valueDays && differernce >= valueDays) {
    challengeUserAssignDetail.map(async (data) => {
      let challengeUserAssignDetail = await ConnectionUtil(
        `update userassign_challenges set  isCompleted='1' where assignChallenge_id='${data.assignChallenge_id}'`
      );
      let DATE = new Date().getDate();
      let MONTH = new Date().getMonth() + 1;
      let YEAR = new Date().getFullYear();
      let date = YEAR + "-" + MONTH + "-" + DATE;
      let obj = {
        user_Id: user_Id,
        reward_Id: Challenge.challenges_id, //reward_Id,
        reward_point: Challenge.Reward,
        isDeposit: 1,
        redeem_Date: date,
      };
      let addRewardRedeemInsertQuery = await ConnectionUtil(
        `INSERT INTO reward_redeem SET?`,
        obj
      );
      let userDeviceToken = await ConnectionUtil(
        `select device_Token from fcm_Notification where user_Id='${user_Id}'`
      );
      let Arr = [];
      await userDeviceToken.map(async (data) => {
        return Arr.push(data.device_Token);
      });
      let testMessage = {
        title: "Challenge",
        body: "Congratulation your challenge completed successfully",
      };
      console.log(testMessage);
      await helperNotification(Arr, testMessage);
    });
  }
}

//-------------------------------------</challenge steps> -----------------------------

//--------------------------------------<challenges walking and running> -----------------------

async function walkingRunningChallenge(user_Id, company_Id, activityCard_Id) {
  let challengeDetail = await ConnectionUtil(
    `select age , age_From , age_To , Gender , genderType , Department , department_Name , company_Id , Reward , action_Required ,challenge_Configuration , DATE_FORMAT(expiry_Date , '%Y-%m-%d') expiry_Date, challengePredefined_Id , DATE_FORMAT(created_At , '%Y-%m-%d') created_At , challenges_id from challenges where  challengePredefined_Id = '2' AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND action_Required = '1'`
  );
  for (let Challenge of challengeDetail) {
    let challengeUserAssignDetail = await ConnectionUtil(
      `select * from userassign_challenges  where isCompleted='0' AND isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${user_Id}' `
    );

    if (Challenge.company_Id == 0) {
      if (Challenge.age == 0 && Challenge.Gender == 0) {
        if (challengeUserAssignDetail.length > 0) {
          await challengeTaskWalkingRunning(
            Challenge,
            user_Id,
            company_Id,
            challengeUserAssignDetail
          );
        }
      } else {
        let ageFrom = Challenge.age_From;
        let ageTo = Challenge.age_To;
        let genderType = Challenge.genderType;
        if (Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskWalkingRunning(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskWalkingRunning(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskWalkingRunning(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
      }
    } else {
      if (
        Challenge.age == 0 &&
        Challenge.Gender == 0 &&
        Challenge.Department == 0
      ) {
        if (challengeUserAssignDetail.length > 0) {
          await challengeTaskWalkingRunning(
            Challenge,
            user_Id,
            company_Id,
            challengeUserAssignDetail
          );
        }
      } else {
        let ageFrom = Challenge.age_From;
        let ageTo = Challenge.age_To;
        let genderType = Challenge.genderType;
        let department = Challenge.department_Name;
        if (Challenge.Gender == 0 && Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskWalkingRunning(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0 && Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskWalkingRunning(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0 && Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskWalkingRunning(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskWalkingRunning(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskWalkingRunning(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskWalkingRunning(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
      }
    }
  }
}

async function challengeTaskWalkingRunning(
  Challenge,
  user_Id,
  company_Id,
  challengeUserAssignDetail
) {
  console.log(challengeUserAssignDetail, "challenfjghfd");

  let d1 = new Date(Challenge.created_At).getTime();
  let d2 = new Date(Challenge.expiry_Date).getTime();
  let differernce = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24) + 1);
  let y = JSON.parse(Challenge.challenge_Configuration);
  let valueDays = y[2].value;
  let valueKm = y[1].value;
  console.log(valueDays, "valueDays");
  console.log(valueKm, "valueKm");
  let walkingRunningChallengeArr = await ConnectionUtil(
    `SELECT * FROM variable_recorde WHERE user_Id = ${user_Id} AND company_id = ${company_Id} AND isActive = 1 AND date BETWEEN '${Challenge.created_At}' AND '${Challenge.expiry_Date}' AND activityCard_Id IN (47,48,54) AND activityCard_catId = 2 AND measure > ${valueKm}`
  );

  console.log(walkingRunningChallengeArr.length, "no of days of steps");
  if (
    walkingRunningChallengeArr.length >= valueDays &&
    differernce >= valueDays
  ) {
    challengeUserAssignDetail.map(async (data) => {
      let challengeUserAssignDetail = await ConnectionUtil(
        `update userassign_challenges set  isCompleted='1' where assignChallenge_id='${data.assignChallenge_id}'`
      );
      let DATE = new Date().getDate();
      let MONTH = new Date().getMonth() + 1;
      let YEAR = new Date().getFullYear();
      let date = YEAR + "-" + MONTH + "-" + DATE;
      let obj = {
        user_Id: user_Id,
        reward_Id: Challenge.challenges_id, //reward_Id,
        reward_point: Challenge.Reward,
        isDeposit: 1,
        redeem_Date: date,
      };
      let addRewardRedeemInsertQuery = await ConnectionUtil(
        `INSERT INTO reward_redeem SET?`,
        obj
      );
      let userDeviceToken = await ConnectionUtil(
        `select device_Token from fcm_Notification where user_Id='${user_Id}'`
      );
      let Arr = [];
      await userDeviceToken.map(async (data) => {
        return Arr.push(data.device_Token);
      });
      let testMessage = {
        title: "Challenge",
        body: "Congratulation your challenge completed successfully",
      };
      console.log(testMessage);
      await helperNotification(Arr, testMessage);
    });
  }
}
//-------------------------------------</challenges walking and running>-----------------------------------------

//---------------------------------<stress challenge > ---------------------------------------

async function stressChallenge(user_Id, company_Id, activityCard_Id) {
  let challengeDetail = await ConnectionUtil(
    `select  age , age_From , age_To , Gender , genderType , Department , department_Name , company_Id , Reward , action_Required ,challenge_Configuration , DATE_FORMAT(expiry_Date , '%Y-%m-%d') expiry_Date, challengePredefined_Id , DATE_FORMAT(created_At , '%Y-%m-%d') created_At , challenges_id from challenges where  challengePredefined_Id = '9' AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND action_Required = '1'`
  );
  for (let Challenge of challengeDetail) {
    let challengeUserAssignDetail = await ConnectionUtil(
      `select * from userassign_challenges  where isCompleted='0' AND isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${user_Id}' `
    );

    if (Challenge.company_Id == 0) {
      if (Challenge.age == 0 && Challenge.Gender == 0) {
        if (challengeUserAssignDetail.length > 0) {
          await challengeTaskStress(
            Challenge,
            user_Id,
            company_Id,
            challengeUserAssignDetail
          );
        }
      } else {
        let ageFrom = Challenge.age_From;
        let ageTo = Challenge.age_To;
        let genderType = Challenge.genderType;
        if (Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskStress(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskStress(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskStress(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
      }
    } else {
      if (
        Challenge.age == 0 &&
        Challenge.Gender == 0 &&
        Challenge.Department == 0
      ) {
        if (challengeUserAssignDetail.length > 0) {
          await challengeTaskStress(
            Challenge,
            user_Id,
            company_Id,
            challengeUserAssignDetail
          );
        }
      } else {
        let ageFrom = Challenge.age_From;
        let ageTo = Challenge.age_To;
        let genderType = Challenge.genderType;
        let department = Challenge.department_Name;
        if (Challenge.Gender == 0 && Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskStress(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0 && Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskStress(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0 && Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskStress(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskStress(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskStress(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskStress(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
      }
    }
  }
}

async function challengeTaskStress(
  Challenge,
  user_Id,
  company_Id,
  challengeUserAssignDetail
) {
  console.log(challengeUserAssignDetail, "challenfjghfd");

  let d1 = new Date(Challenge.created_At).getTime();
  let d2 = new Date(Challenge.expiry_Date).getTime();
  let differernce = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24) + 1);
  let y = JSON.parse(Challenge.challenge_Configuration);
  let valueDays = y[0].value;
  console.log(valueDays, "valueDays");
  let stressChallengeArr = await ConnectionUtil(
    `SELECT * FROM variable_recorde WHERE user_Id = ${user_Id} AND company_id = ${company_Id} AND isActive = 1 AND date BETWEEN '${Challenge.created_At}' AND '${Challenge.expiry_Date}' AND activityCard_Id = 36 AND activityCard_catId = 2`
  );
  console.log(stressChallengeArr.length, "no of days stress measured");
  if (stressChallengeArr.length >= valueDays && differernce >= valueDays) {
    challengeUserAssignDetail.map(async (data) => {
      let challengeUserAssignDetail = await ConnectionUtil(
        `update userassign_challenges set  isCompleted='1' where assignChallenge_id='${data.assignChallenge_id}'`
      );
      let DATE = new Date().getDate();
      let MONTH = new Date().getMonth() + 1;
      let YEAR = new Date().getFullYear();
      let date = YEAR + "-" + MONTH + "-" + DATE;
      let obj = {
        user_Id: user_Id,
        reward_Id: Challenge.challenges_id, //reward_Id,
        reward_point: Challenge.Reward,
        isDeposit: 1,
        redeem_Date: date,
      };
      let addRewardRedeemInsertQuery = await ConnectionUtil(
        `INSERT INTO reward_redeem SET?`,
        obj
      );
      let userDeviceToken = await ConnectionUtil(
        `select device_Token from fcm_Notification where user_Id='${user_Id}'`
      );
      let Arr = [];
      await userDeviceToken.map(async (data) => {
        return Arr.push(data.device_Token);
      });
      let testMessage = {
        title: "Challenge",
        body: "Congratulation your challenge completed successfully",
      };
      console.log(testMessage);
      await helperNotification(Arr, testMessage);
    });
  }
}

//-----------------------------------------< /stress  challenge >---------------------------------

//---------------------------------<Blood Pressure challenge> --------------------------------------

async function bloodPressureChallenge(user_Id, company_Id, activityCard_Id) {
  let challengeDetail = await ConnectionUtil(
    `select age , age_From , age_To , Gender , genderType , Department , department_Name , company_Id , Reward , action_Required ,challenge_Configuration , DATE_FORMAT(expiry_Date , '%Y-%m-%d') expiry_Date, challengePredefined_Id , DATE_FORMAT(created_At , '%Y-%m-%d') created_At , challenges_id from challenges where  challengePredefined_Id = '10' AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND action_Required = '1'`
  );
  for (let Challenge of challengeDetail) {
    let challengeUserAssignDetail = await ConnectionUtil(
      `select * from userassign_challenges  where isCompleted='0' AND isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${user_Id}' `
    );

    if (Challenge.company_Id == 0) {
      if (Challenge.age == 0 && Challenge.Gender == 0) {
        if (challengeUserAssignDetail.length > 0) {
          await challengeTask(Challenge, user_Id, company_Id);
        }
      } else {
        let ageFrom = Challenge.age_From;
        let ageTo = Challenge.age_To;
        let genderType = Challenge.genderType;
        if (Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskBloodPressure(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskBloodPressure(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskBloodPressure(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
      }
    } else {
      if (
        Challenge.age == 0 &&
        Challenge.Gender == 0 &&
        Challenge.Department == 0
      ) {
        if (challengeUserAssignDetail.length > 0) {
          await challengeTaskBloodPressure(
            Challenge,
            user_Id,
            company_Id,
            challengeUserAssignDetail
          );
        }
      } else {
        let ageFrom = Challenge.age_From;
        let ageTo = Challenge.age_To;
        let genderType = Challenge.genderType;
        let department = Challenge.department_Name;
        if (Challenge.Gender == 0 && Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskBloodPressure(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0 && Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskBloodPressure(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0 && Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskBloodPressure(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskBloodPressure(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskBloodPressure(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskBloodPressure(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
      }
    }
  }
}

async function challengeTaskBloodPressure(
  Challenge,
  user_Id,
  company_Id,
  challengeUserAssignDetail
) {
  console.log(challengeUserAssignDetail, "challenfjghfd");

  let d1 = new Date(Challenge.created_At).getTime();
  let d2 = new Date(Challenge.expiry_Date).getTime();
  let differernce = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24) + 1);
  let y = JSON.parse(Challenge.challenge_Configuration);
  let valueDays = y[0].value;
  console.log(valueDays, "valueDays");
  let bloodPressureChallengeArr = await ConnectionUtil(
    `SELECT * FROM variable_recorde WHERE user_Id = ${user_Id} AND company_id = ${company_Id} AND isActive = 1 AND date BETWEEN '${Challenge.created_At}' AND '${Challenge.expiry_Date}' AND activityCard_Id = 2 AND activityCard_catId = 2`
  );
  console.log(bloodPressureChallengeArr.length, "no of days BP measured");
  if (
    bloodPressureChallengeArr.length >= valueDays &&
    differernce >= valueDays
  ) {
    challengeUserAssignDetail.map(async (data) => {
      let challengeUserAssignDetail = await ConnectionUtil(
        `update userassign_challenges set  isCompleted='1' where assignChallenge_id='${data.assignChallenge_id}'`
      );
      let DATE = new Date().getDate();
      let MONTH = new Date().getMonth() + 1;
      let YEAR = new Date().getFullYear();
      let date = YEAR + "-" + MONTH + "-" + DATE;
      let obj = {
        user_Id: user_Id,
        reward_Id: Challenge.challenges_id, //reward_Id,
        reward_point: Challenge.Reward,
        isDeposit: 1,
        redeem_Date: date,
      };
      let addRewardRedeemInsertQuery = await ConnectionUtil(
        `INSERT INTO reward_redeem SET?`,
        obj
      );
      let userDeviceToken = await ConnectionUtil(
        `select device_Token from fcm_Notification where user_Id='${user_Id}'`
      );
      let Arr = [];
      await userDeviceToken.map(async (data) => {
        return Arr.push(data.device_Token);
      });
      let testMessage = {
        title: "Challenge",
        body: "Congratulation your challenge completed successfully",
      };
      console.log(testMessage);
      await helperNotification(Arr, testMessage);
    });
  }
}
//---------------------------------</Blood Pressure challenge>--------------------------------------

//---------------------------------<sleep challenge> ----------------------------------------------

async function sleepChallenge(user_Id, company_Id, activityCard_Id) {
  let challengeDetail = await ConnectionUtil(
    `select age , age_From , age_To , Gender , genderType , Department , department_Name , company_Id , Reward , action_Required ,challenge_Configuration , DATE_FORMAT(expiry_Date , '%Y-%m-%d') expiry_Date, challengePredefined_Id , DATE_FORMAT(created_At , '%Y-%m-%d') created_At , challenges_id from challenges where  challengePredefined_Id = '11' AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND action_Required = '1'`
  );
  for (let Challenge of challengeDetail) {
    let challengeUserAssignDetail = await ConnectionUtil(
      `select * from userassign_challenges  where isCompleted='0' AND isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${user_Id}' `
    );

    if (Challenge.company_Id == 0) {
      if (Challenge.age == 0 && Challenge.Gender == 0) {
        if (challengeUserAssignDetail.length > 0) {
          await challengeTaskSleepChallenge(
            Challenge,
            user_Id,
            company_Id,
            challengeUserAssignDetail
          );
        }
      } else {
        let ageFrom = Challenge.age_From;
        let ageTo = Challenge.age_To;
        let genderType = Challenge.genderType;
        if (Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskSleepChallenge(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskSleepChallenge(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskSleepChallenge(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
      }
    } else {
      if (
        Challenge.age == 0 &&
        Challenge.Gender == 0 &&
        Challenge.Department == 0
      ) {
        if (challengeUserAssignDetail.length > 0) {
          await challengeTaskSleepChallenge(
            Challenge,
            user_Id,
            company_Id,
            challengeUserAssignDetail
          );
        }
      } else {
        let ageFrom = Challenge.age_From;
        let ageTo = Challenge.age_To;
        let genderType = Challenge.genderType;
        let department = Challenge.department_Name;
        if (Challenge.Gender == 0 && Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskSleepChallenge(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0 && Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskSleepChallenge(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0 && Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskSleepChallenge(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskSleepChallenge(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskSleepChallenge(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskSleepChallenge(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
      }
    }
  }
}

async function challengeTaskSleepChallenge(
  Challenge,
  user_Id,
  company_Id,
  challengeUserAssignDetail
) {
  console.log(challengeUserAssignDetail, "challenfjghfd");

  let d1 = new Date(Challenge.created_At).getTime();
  let d2 = new Date(Challenge.expiry_Date).getTime();
  let differernce = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24) + 1);
  let y = JSON.parse(Challenge.challenge_Configuration);
  console.log(y, "y");
  let valueHours = y[1].value;
  let valueDays = y[2].value;
  console.log(valueDays, "valueDays");
  let sleepChallengeArr = await ConnectionUtil(
    `SELECT * FROM variable_recorde WHERE user_Id = ${user_Id} AND company_id = ${company_Id} AND isActive = 1 AND date BETWEEN '${Challenge.created_At}' AND '${Challenge.expiry_Date}' AND activityCard_Id = 2 AND activityCard_catId = 2  AND measure <  '${valueHours}' `
  );
  console.log(
    sleepChallengeArr.length,
    "no of days sleepHours less than valueHours "
  );
  if (sleepChallengeArr.length >= valueDays && differernce >= valueDays) {
    challengeUserAssignDetail.map(async (data) => {
      let challengeUserAssignDetail = await ConnectionUtil(
        `update userassign_challenges set  isCompleted='1' where assignChallenge_id='${data.assignChallenge_id}'`
      );
      let DATE = new Date().getDate();
      let MONTH = new Date().getMonth() + 1;
      let YEAR = new Date().getFullYear();
      let date = YEAR + "-" + MONTH + "-" + DATE;
      let obj = {
        user_Id: user_Id,
        reward_Id: Challenge.challenges_id, //reward_Id,
        reward_point: Challenge.Reward,
        isDeposit: 1,
        redeem_Date: date,
      };
      let addRewardRedeemInsertQuery = await ConnectionUtil(
        `INSERT INTO reward_redeem SET?`,
        obj
      );
      let userDeviceToken = await ConnectionUtil(
        `select device_Token from fcm_Notification where user_Id='${user_Id}'`
      );
      let Arr = [];
      await userDeviceToken.map(async (data) => {
        return Arr.push(data.device_Token);
      });
      let testMessage = {
        title: "Challenge",
        body: "Congratulation your challenge completed successfully",
      };
      console.log(testMessage);
      await helperNotification(Arr, testMessage);
    });
  }
}
//---------------------------------</sleep challenge>----------------------------------------------

//---------------------------------<use of app challenge>------------------------------------------
async function useOfAppChallenge(user_Id, company_Id, activityCard_Id) {
  let challengeDetail = await ConnectionUtil(
    `select age , age_From , age_To , Gender , genderType , Department , department_Name , company_Id , Reward , action_Required ,challenge_Configuration , DATE_FORMAT(expiry_Date , '%Y-%m-%d') expiry_Date, challengePredefined_Id , DATE_FORMAT(created_At , '%Y-%m-%d') created_At , challenges_id from challenges where  challengePredefined_Id = '14' AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND action_Required = '1'`
  );
  for (let Challenge of challengeDetail) {
    let challengeUserAssignDetail = await ConnectionUtil(
      `select * from userassign_challenges  where isCompleted='0' AND isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${user_Id}' `
    );

    if (Challenge.company_Id == 0) {
      if (Challenge.age == 0 && Challenge.Gender == 0) {
        if (challengeUserAssignDetail.length > 0) {
          await challengeTaskUseOfAppChallenge(
            Challenge,
            user_Id,
            company_Id,
            challengeUserAssignDetail
          );
        }
      } else {
        let ageFrom = Challenge.age_From;
        let ageTo = Challenge.age_To;
        let genderType = Challenge.genderType;
        if (Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskUseOfAppChallenge(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskUseOfAppChallenge(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskUseOfAppChallenge(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
      }
    } else {
      if (
        Challenge.age == 0 &&
        Challenge.Gender == 0 &&
        Challenge.Department == 0
      ) {
        if (challengeUserAssignDetail.length > 0) {
          await challengeTaskUseOfAppChallenge(
            Challenge,
            user_Id,
            company_Id,
            challengeUserAssignDetail
          );
        }
      } else {
        let ageFrom = Challenge.age_From;
        let ageTo = Challenge.age_To;
        let genderType = Challenge.genderType;
        let department = Challenge.department_Name;
        if (Challenge.Gender == 0 && Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskUseOfAppChallenge(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0 && Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskUseOfAppChallenge(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0 && Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskUseOfAppChallenge(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskUseOfAppChallenge(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskUseOfAppChallenge(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskUseOfAppChallenge(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
      }
    }
  }
}

async function challengeTaskUseOfAppChallenge(
  Challenge,
  user_Id,
  company_Id,
  challengeUserAssignDetail
) {
  console.log(challengeUserAssignDetail, "challenfjghfd");

  let d1 = new Date(Challenge.created_At).getTime();
  let d2 = new Date(Challenge.expiry_Date).getTime();
  let differernce = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24) + 1);
  let y = JSON.parse(Challenge.challenge_Configuration);
  console.log(y, "y");

  let valueCondition =
    y[0].value == "Less Than"
      ? "<"
      : y[0].value == "More Than"
      ? ">"
      : y[0].value == "Equal"
      ? "="
      : ">=";

  let valueTimes = y[1].value;
  // let valueDays = y[2].value;
  // console.log(valueDays, "valueDays");
  let UseOfAppChallengeArr = await ConnectionUtil(
    `SELECT * FROM variable_recorde WHERE user_Id = ${user_Id} AND company_id = ${company_Id} AND isActive = 1 AND date BETWEEN '${Challenge.created_At}' AND '${Challenge.expiry_Date}' AND activityCard_Id = 68 AND activityCard_catId = 2  AND measure >=  '1' `
  );
  // console.log(UseOfAppChallengeArr.length, "no of days UseOfAppHours less than valueHours ");
  if (
    eval(UseOfAppChallengeArr.length + " " + valueCondition + " " + valueTimes)
  ) {
    challengeUserAssignDetail.map(async (data) => {
      let challengeUserAssignDetail = await ConnectionUtil(
        `update userassign_challenges set  isCompleted='1' where assignChallenge_id='${data.assignChallenge_id}'`
      );
      let DATE = new Date().getDate();
      let MONTH = new Date().getMonth() + 1;
      let YEAR = new Date().getFullYear();
      let date = YEAR + "-" + MONTH + "-" + DATE;
      let obj = {
        user_Id: user_Id,
        reward_Id: Challenge.challenges_id, //reward_Id,
        reward_point: Challenge.Reward,
        isDeposit: 1,
        redeem_Date: date,
      };
      let addRewardRedeemInsertQuery = await ConnectionUtil(
        `INSERT INTO reward_redeem SET?`,
        obj
      );
      let userDeviceToken = await ConnectionUtil(
        `select device_Token from fcm_Notification where user_Id='${user_Id}'`
      );
      let Arr = [];
      await userDeviceToken.map(async (data) => {
        return Arr.push(data.device_Token);
      });
      let testMessage = {
        title: "Challenge",
        body: "Congratulation your challenge completed successfully",
      };
      console.log(testMessage);
      await helperNotification(Arr, testMessage);
    });
  }
}

//---------------------------------</use of app challenge>-----------------------------------------

// ------------------------- variable_List -----------------------------------
module.exports.variableWatch_List = async (req, res) => {
  try {
    var variableListDetails = await ConnectionUtil(
      `select * from variabledata`
    );
    res.status(200).json({
      success: true,
      message: "Variable list",
      data: variableListDetails,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ------------------------- select_VariableWatch -----------------------------------
module.exports.select_VariableWatch = async (req, res) => {
  try {
    let { user_Id, company_Id, variableData_Id, ip_Address } = req.body;
    var selectVariableAlottedByUser = await ConnectionUtil(
      `select * from userassign_variablewatch where  user_Id='${user_Id}' AND variableData_Id='${variableData_Id}'`
    );
    if (selectVariableAlottedByUser.length == 0) {
      let obj = {
        user_Id: user_Id,
        company_Id: company_Id,
        variableData_Id: variableData_Id,
        ip_Address: ip_Address,
      };
      var selectByUserVariable = await ConnectionUtil(
        `INSERT INTO userassign_variablewatch SET?`,
        obj
      );
      res.status(200).json({
        success: true,
        message: "Variable add successfully",
        data: selectByUserVariable,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Variable add already exist",
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

// ------------------------- VariableWatch_ByUsers -----------------------------------
module.exports.VariableWatch_ByUser = async (req, res) => {
  try {
    let { id } = req.user;
    var variableListDetails = await ConnectionUtil(
      `select * from userassign_variablewatch where user_Id='${id}'`
    );
    let newArr = [];
    if (variableListDetails.length > 0) {
      for (let variableObj of variableListDetails) {
        let variableDataList = await ConnectionUtil(
          `select * from  variabledata where variableData_id='${variableObj.variableData_Id}'`
        );
        newArr.push(variableDataList[0]);
      }
      res.status(200).json({
        success: true,
        message: "Variable select by user",
        data: newArr,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Variable not select by user",
        data: newArr,
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
