const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
const { create } = require("domain");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let message = require("../../lib/helpers/message");
let { helperNotification } = require("../../lib/helpers/fcm");

//----------------- CreateChallenge -----------------
module.exports.create_Challenge = async (req, res) => {
  try {
    let {
      challengeName,
      description,
      challengeImage,
      challengeConfiguration,
      RewardPoints,
      ageFrom,
      Gender,
      Department,
      age,
      ageTo,
      createdBy,
      expiryDate,
      ip_Address,
      company_Id,
      genderType,
      departmentName,
      challengePredefined_Id,
    } = req.body;
    let { branch_Id, access } = req.query;
    let tempArr = [];
    let Arr = [];
    let challengeDetail = await ConnectionUtil(
      `select * from challenges  where  (company_id='${0}'or company_id='${company_Id}') and  challengePredefined_Id='${challengePredefined_Id}' AND action_Required='1'`
    ); //company_id='${0}'or company_id='${company_Id}' and
    if (challengeDetail.length == 0 || challengeDetail.length > 0) {
      let challengeObj = {
        challenge_Name: challengeName,
        challenges_Description: description,
        challenge_Image: challengeImage,
        challenge_Configuration: JSON.stringify(challengeConfiguration),
        Reward: RewardPoints,
        age: age || 0,
        Gender: Gender || 0,
        genderType: genderType,
        age_From: ageFrom,
        age_To: ageTo,
        Department: Department || 0,
        department_Name: departmentName,
        created_By: 0,
        company_Id: company_Id,
        expiry_Date: expiryDate,
        ip_Address: ip_Address,
        challengePredefined_Id: challengePredefined_Id,
        branch_Id: branch_Id,
      };
      let ageClause = "";
      let genderClause = "";
      let departmentClause = "";
      // let companyClause = '';

      // if (company_Id != "") {
      //     companyClause = `AND company_id='${company_Id}'`
      // }
      if (age != 0) {
        if (ageFrom != 0 && ageTo != 0) {
          ageClause = `AND Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0)>='${ageFrom}' AND Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0)<='${ageTo}'`;
        }
      }
      if (Gender != 0) {
        genderClause = `AND gender='${genderType}'`;
      }
      if (Department != 0) {
        departmentClause = `AND department='${departmentName}'`;
      }
      let addChallenge = await ConnectionUtil(
        `INSERT INTO challenges SET isActive='1',?`,
        challengeObj
      );
      // let getChallenge = await ConnectionUtil(`select * from challenges where company_Id='${company_Id}' AND isActive='1'`);
      if (addChallenge.insertId != 0) {
        let UserDetails;
        if (access == 0) {
          UserDetails = await ConnectionUtil(
            `select * from user where role !='1' AND isActive='1' AND branch_Id='${branch_Id}' AND company_id='${company_Id}' ${ageClause} ${genderClause} ${departmentClause}`
          ); //${companyClause}
        } else {
          UserDetails = await ConnectionUtil(
            `select * from user where role !='1' AND isActive='1' AND company_id='${company_Id}' ${ageClause} ${genderClause} ${departmentClause}`
          ); //${companyClause}
        }
        if (UserDetails.length > 0) {
          let newArr = [];
          for (let user of UserDetails) {
            let userAssign = {
              user_Id: user.user_id,
              challenge_Id: addChallenge.insertId,
              created_By: createdBy,
              updated_By: createdBy,
              company_Id: company_Id,
              ip_Address: ip_Address,
              branch_Id: branch_Id,
            };
            let userAssignChallenge = await ConnectionUtil(
              `INSERT INTO userassign_challenges SET ?`,
              userAssign
            );
            let userDeviceToken = await ConnectionUtil(
              `select device_Token,user_Id from fcm_Notification where user_Id='${user.user_id}'`
            );

            await userDeviceToken.map((data) => {
              if (data.device_Token) {
                tempArr.push(data);
                let token =
                  data.device_Token != null &&
                  data.device_Token != undefined &&
                  data.device_Token != ""
                    ? data.device_Token
                    : "d8QyFhQqRAy6Y6UyYaOXwm:APA91bEJqszHm-HQBrkpiinDrjVY_FLLSgljSIIhWw4u5kgyVq2rgzujK0arnIL_drErnh_8JbvGbMErh0OgT8Sqx6LlONGsdQzgBn-HuNfZ4aRtPhwu6SC8Dsqq9XxS-9xdCMuRSWtX";
                return Arr.push(token);
              }
            });

            newArr.push({ userId: user.user_id });
          }

          let userIdArr = tempArr.map((data) => {
            return data.user_Id;
          });

          //   console.log(userIdArr , "userIdArr 00000000000000000000000000000")

          let userIdSet = new Set(userIdArr);

          let arrayUserId = [];
          // console.log(userIdSet , "userIdSet 0101010101010101010101010101010101010")
          userIdSet.forEach(async (data) => {
            arrayUserId.push(data);
          });

          for (let data of arrayUserId) {
            await notificaiton_userSave("0", data, company_Id, ip_Address);
          }

          //   console.log(tempArr , "tempArr 222222222222222222222222222222222")

          let testMessage = {
            title: "New Challenge Activated", //"Challenge",
            body: "Come back to Hygge: there is a new challenge waiting for you.", //"Accept new challenge"
          };
          await helperNotification(Arr, testMessage);

          res.status(200).json({
            success: true,
            message: "Challenge assigned to user",
            data: newArr,
          });
        } else {
          let UserDetails = await ConnectionUtil(
            `delete from  challenges where  challenges_id=${addChallenge.insertId}`
          );
          res.status(200).json({
            success: true,
            message: "User filter request not find over record",
            data: [],
          });
        }
      } else {
        res.status(200).json({
          success: false,
          message: "challenge not found",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Challenge already activated by superAdmin",
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

//----------------- Challenge -----------------
module.exports.challenege = async (req, res) => {
  try {
    let { company_id } = req.user;
    let { branch_Id, access } = req.query;
    let newArr = [];
    let challengePreDefDetails = await ConnectionUtil(
      `select * from challenge_predefined`
    );
    for (let challengePreDefObj of challengePreDefDetails) {
      let challengeDetails;
      if (access == 0) {
        challengeDetails = await ConnectionUtil(
          `select * from challenges where  branch_Id='${branch_Id}' AND company_id=${company_id} AND action_Required='1' AND challengePredefined_Id=${challengePreDefObj.challengePredefined_id}`
        );
      } else {
        challengeDetails = await ConnectionUtil(
          `select * from challenges where company_id=${company_id} AND action_Required='1' AND challengePredefined_Id=${challengePreDefObj.challengePredefined_id}`
        );
      }
      if (challengeDetails.length > 0) {
        let count = await countEmployee(challengeDetails[0].challenges_id);
        challengePreDefObj.point =
          challengeDetails[0].Reward != undefined
            ? challengeDetails[0].Reward
            : "";
        challengePreDefObj.acceptedByTotalUser = count.totalCount;
        challengePreDefObj.acceptedByAcceptUser = count.numCount;
        challengePreDefObj.expiry =
          challengeDetails[0].expiry_Date != undefined
            ? challengeDetails[0].expiry_Date
            : "";
        challengePreDefObj.actin_Required =
          challengeDetails[0].action_Required != undefined
            ? challengeDetails[0].action_Required
            : "";
        (challengePreDefObj.challenges_id = challengeDetails[0].challenges_id),
          (challengePreDefObj.Details = challengeDetails);
      } else {
        challengePreDefObj.point = "-";
        challengePreDefObj.acceptedBy = "-";
        challengePreDefObj.expiry = "-";
        challengePreDefObj.actin_Required = 0;
        challengePreDefObj.challengePredefined = "-";
        challengePreDefObj.challenges_id = "-";
        challengePreDefObj.Details = challengeDetails;
      }
      newArr.push(challengePreDefObj);
    }
    res.status(200).json({
      success: true,
      message: "Challenge predefined list",
      data: newArr,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "something went wrong",
    });
  }
};

//----------------- countEmployee -----------------
async function countEmployee(challengesId) {
  let checkuserAssignSelectQuery = await ConnectionUtil(
    `select * from userassign_challenges where challenge_Id='${challengesId}'`
  );
  let totalCount = checkuserAssignSelectQuery.length;
  let numCount = 0;
  checkuserAssignSelectQuery.map((data) => {
    if (data.isAccept == 1) {
      numCount = numCount + 1;
    }
  });
  let obj = {
    totalCount: totalCount,
    numCount: numCount,
  };
  return obj;
}

//----------------- ActionRequired_Challenge -----------------
module.exports.actionRequired_Challenge = async (req, res) => {
  try {
    let { challenges_id, action_Required, ip_Address } = req.body;
    let { id, company_id } = req.user;
    let challengeSelectQuery = await ConnectionUtil(
      `SELECT * from challenges where  isActive='1' AND  challenges_id=${challenges_id}`
    );
    if (challengeSelectQuery.length > 0) {
      let challengeUpdateQuery = await ConnectionUtil(
        `UPDATE  challenges SET updated_By='${id}' , ip_Address = '${ip_Address}' , action_Required='${action_Required}' where  challenges_id=${challenges_id}`
      );

      res.status(200).json({
        success: true,
        message: "Challenge deactive successfully",
        data: challengeUpdateQuery,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "something went wrong",
    });
  }
};

//----------------- GraphDetail_Challenege -----------------
let arr = [];
module.exports.GraphDetail_Challenege = async (req, res) => {
  try {
    let { company_Id } = req.body;
    let { branch_Id, access } = req.query;
    let newArr = [];
    let challengeSelectQuery;
    if (access == 0) {
      challengeSelectQuery = await ConnectionUtil(
        `select * from challenges where action_Required='1' AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND branch_Id='${branch_Id}' AND  company_Id='${company_Id}'`
      );
    } else {
      challengeSelectQuery = await ConnectionUtil(
        `select * from challenges where action_Required='1' AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND company_Id='${company_Id}'`
      );
    }
    for (let challengeObj of challengeSelectQuery) {
      let userAssignSelectQuery = await ConnectionUtil(
        `select * from userassign_challenges where  challenge_Id='${challengeObj.challenges_id}'`
      );
      let countNum = await userfilterCount(
        challengeObj.Department,
        challengeObj.department_Name,
        challengeObj.challenges_id,
        userAssignSelectQuery
      );
      newArr.push(countNum);
    }
    res.status(200).json({
      success: true,
      message: "Challenge deactive successfully",
      data: newArr,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "something went wrong",
    });
  }
};

async function userfilterCount(
  DepartmentCount,
  departmentName,
  challenegesId,
  userAssignSelectQuery
) {
  let femalecount = 0;
  let malecount = 0;
  let departmentArr = [];
  var DepartmentnewArray;
  let conut = 0;
  for (let data of userAssignSelectQuery) {
    let userMaleSelectQuery = await ConnectionUtil(
      `select gender from user where company_id='${data.company_Id}' and   gender='male' AND  user_id='${data.user_id}'`
    );
    let userFelmaleSelectQuery = await ConnectionUtil(
      `select gender from user where company_id='${data.company_Id}' and  gender='female' AND  user_id='${data.user_id}'`
    );
    if (userMaleSelectQuery.length > 0) {
      malecount = malecount + 1;
    } else if (userFelmaleSelectQuery.length > 0) {
      femalecount = femalecount + 1;
    }
  }
  for (let data of userAssignSelectQuery) {
    let userDepartmentSelectQuery = await ConnectionUtil(
      `select department from user where company_id='${data.company_Id}' and role=0 AND  user_id ='${data.user_id}'`
    );
    if (userDepartmentSelectQuery.length > 0) {
      if (userDepartmentSelectQuery[0].department != "") {
        departmentArr.push(userDepartmentSelectQuery[0].department);
        DepartmentnewArray = await compressArray(departmentArr);
      }
    }
  }
  DepartmentnewArray = DepartmentnewArray || [];
  return {
    challenegesId: challenegesId,
    male: malecount,
    female: femalecount,
    DepartmentnewArray,
  };
}

// -------- compressArray -------- //this function ref : https://gist.github.com/ralphcrisostomo/3141412
function compressArray(original) {
  var compressed = [];
  // make a copy of the input array
  var copy = original.slice(0);
  // first loop goes over every element
  for (var i = 0; i < original.length; i++) {
    var myCount = 0;
    // loop over every element in the copy and see if it's the same
    for (var w = 0; w < copy.length; w++) {
      if (original[i] == copy[w]) {
        // increase amount of times duplicate is found
        myCount++;
        // sets item to undefined
        delete copy[w];
      }
    }
    if (myCount > 0) {
      var a = new Object();
      a.department = original[i];
      a.count = myCount;
      compressed.push(a);
    }
  }
  return compressed;
}

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
    notification_Type: "challenge",
    notification_Text: "New Challenge Activated",
  };
  let notification = await ConnectionUtil(`INSERT INTO notification SET?`, obj);
}
