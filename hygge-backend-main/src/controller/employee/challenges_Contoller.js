const util = require("util");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);

//----------------- Challenges_list ---------------------
module.exports.Challenges_list = async (req, res) => {
  try {
    let newArr = [];
    let { company_id, id } = req.user;
    let challengeDetail = await ConnectionUtil(
      `select C.challenges_id , C.challenge_Name , C.challenge_Image , C.Reward , C.expiry_Date , C.company_Id , C.created_At , C.updated_At , C.created_By , C.updated_By , C.challengePredefined_Id , UC.isAccept , UC.assignChallenge_id from challenges as C JOIN userassign_challenges as UC ON  UC.challenge_Id=C.challenges_id where (UC.company_Id='0' or UC.company_Id='${company_id}') AND C.action_Required='1'AND  UC.user_Id='${id}' ORDER BY C.challenges_id DESC`
    );
    for (let data of challengeDetail) {
      data.Reward = data.Reward.toString().replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ","
      );
      newArr.push(data);
    }
    res.status(200).json({
      success: true,
      message: "Challenge list",
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

//----------------- Accept_challenge ---------------------
module.exports.Accept_challenge = async (req, res) => {
  try {
    let { challenges_Id, isAccept, assignChallenge_id, ip_Address } = req.body;
    let { id, company_id } = req.user;
    let challengeDetail = await ConnectionUtil(
      `Update userassign_challenges set  isAccept='${isAccept}' , ip_Address='${ip_Address}' , updated_By='${id}'  where challenge_Id='${challenges_Id}' AND assignChallenge_id='${assignChallenge_id}'`
    );
    if (challengeDetail.affectedRows != 0) {
      let challengesData = await ConnectionUtil(
        `select * from challenges where challenges_id='${challenges_Id}'`
      );
      if (
        challengesData.length > 0 &&
        challengesData[0].challengePredefined_Id == 5
      ) {
        await documentFunction(
          assignChallenge_id,
          id,
          challenges_Id,
          company_id
        );
      }
      res.status(200).json({
        success: true,
        message: "Challenge accepted successfully",
        challengesId: challenges_Id,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Something went wrong",
        challengesId: "",
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

// ---------Function
async function documentFunction(
  assignChallenge_id,
  userId,
  challenges_Id,
  companyId
) {
  // ---Challenge
  var Challenge_documentTypeDetail = await ConnectionUtil(
    `select isCheck,dependent,documentType_id,document_Type from document_Type where isCheck ='1' AND  status ='1' AND isActive='1' AND company_id='${companyId}'`
  );
  let newArr = [];
  for (let docTypeID of Challenge_documentTypeDetail) {
    if (docTypeID.isCheck == 1) {
      var Challenge_documentDetail = await ConnectionUtil(
        `select * from document_Detail where (expiry_Date IS NULL or DATE_FORMAT(expiry_Date,'%Y-%m-%d')>=DATE_FORMAT(CURDATE(), '%Y-%m-%d')) AND dependentType = '0' AND status ='1' AND isActive='1'  AND user_id='${userId}' AND DocType='${docTypeID.documentType_id}'`
      );
      if (Challenge_documentDetail.length == 0) {
        newArr.push(docTypeID);
      }
    }
  }
  if (newArr.length == 0) {
    let challengeDetail = await ConnectionUtil(
      `select company_Id , Reward , action_Required , expiry_Date , challengePredefined_Id , challenges_id from challenges where challenges_id='${challenges_Id}' AND challengePredefined_Id = '${5}' AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d')`
    );
    for (let Challenge of challengeDetail) {
      let challengeUserAssignDetail = await ConnectionUtil(
        `select * from userassign_challenges  where isCompleted='0' AND isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${userId}' `
      );
      if (challengeUserAssignDetail.length > 0) {
        challengeUserAssignDetail.map(async (data) => {
          let challengeUserAssignDetail = await ConnectionUtil(
            `update userassign_challenges set  isCompleted='1' where assignChallenge_id='${data.assignChallenge_id}'`
          );
          var DATE = new Date().getDate();
          var MONTH = new Date().getMonth() + 1;
          var YEAR = new Date().getFullYear();
          let date = YEAR + "-" + MONTH + "-" + DATE;
          let obj = {
            user_Id: userId,
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
            `select device_Token from fcm_Notification where user_Id='${userId}'`
          );
          let Arr = [];
          await userDeviceToken.map(async (data) => {
            return Arr.push(data.device_Token);
          });
          let testMessage = {
            title: "Challenge",
            body: "Congratulation your challenge completed successfully",
          };
          await helperNotification(Arr, testMessage);
        });
      }
    }
  } // ---Challenge
} // ---------Function

//----------------- Detail_challenge ---------------------
module.exports.Detail_challenge = async (req, res) => {
  try {
    let { Challenges_id } = req.body;
    let { id } = req.user;
    let newArr = [];
    let challengeDetail = await ConnectionUtil(
      `select challenges_id,challenge_Name,challenges_Description,challenge_Image,challenge_Configuration,Reward,expiry_Date,company_Id,challengePredefined_Id from challenges where Challenges_id='${Challenges_id}'`
    );
    for (let challengeDetailObj of challengeDetail) {
      let userAssignchallengeSelectQuery = await ConnectionUtil(
        `select assignChallenge_id,isAccept from userassign_challenges where user_Id ='${id}' AND Challenge_Id='${Challenges_id}'`
      );

      if (userAssignchallengeSelectQuery.length > 0) {
        challengeDetailObj.isAccept =
          userAssignchallengeSelectQuery[0].isAccept;
        challengeDetailObj.assignChallenge_id =
          userAssignchallengeSelectQuery[0].assignChallenge_id;
        challengeDetailObj.Reward =
          challengeDetailObj.Reward.toString().replace(
            /\B(?=(\d{3})+(?!\d))/g,
            ","
          );
      } else {
        challengeDetailObj.isAccept = 0;
        challengeDetailObj.assignChallenge_id = 0;
        challengeDetailObj.Reward =
          challengeDetailObj.Reward.toString().replace(
            /\B(?=(\d{3})+(?!\d))/g,
            ","
          );
      }
      newArr.push(challengeDetailObj);
    }
    res.status(200).json({
      success: true,
      message: "Challenge detail",
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

//----------------- Leaderboard_list ---------------------
module.exports.Leaderboard_list = async (req, res) => {
  try {
    let { user_Id, Challenge_Id, challengePredefined_Id } = req.body;
    let newArr = [];
    let count = 0;
    let challengeUserDetail = await ConnectionUtil(
      `select user_Id from userassign_challenges where challenge_Id='${Challenge_Id}' limit 10`
    );
    if (challengeUserDetail.length > 0) {
      for (let data of challengeUserDetail) {
        let userDetail = await ConnectionUtil(
          `select user_id,CONCAT(first_name,' ',last_name)as name ,user_Id,profile_picture from user where user_id='${data.user_Id}'`
        );
        count = count + 1;
        let obj = {
          user_id: userDetail[0].user_id,
          rank: count,
          name: userDetail[0].name,
          profile_picture:
            userDetail[0].profile_picture == null
              ? "download.png"
              : userDetail[0].profile_picture,
        };
        newArr.push(obj);
      }
    }
    res.status(200).json({
      success: true,
      message: "Challenge detail",
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

//############ Food_Log_Task ############
//----------------- Addfood_log ---------------------

//### [Category foodlog_List] ###
//------- foodlog_cat -------
//1->breakfast,2->lunch,3->snacks,4->dinner
//### [Category foodlog_List] ####
module.exports.Addfood_log = async (req, res) => {
  try {
    let {
      foodLog_cat,
      calories,
      foodImage_path,
      user_Id,
      Challenge_Id,
      challengePredefined_Id,
      company_Id,
      ip_Address,
      food_category,
      food_Subcategory,
      activityCard_Id,
      activityCard_catId,
      date,
    } = req.body;
    let { id } = req.user;
    let obj = {
      foodLog_cat: foodLog_cat,
      calories: calories,
      foodImage_path: JSON.stringify(foodImage_path),
      user_Id: user_Id,
      Challenge_Id: Challenge_Id,
      challengePredefined_Id: challengePredefined_Id,
      ip_Address: ip_Address,
      food_category: food_category,
      food_Subcategory: food_Subcategory,
      activityCard_Id: activityCard_Id,
      activityCard_catId: activityCard_catId,
      created_By: id,
      updated_By: id,
      date: date,
    };
    let addFoodLogInsertQuery = await ConnectionUtil(
      `INSERT INTO userchallenge_task SET?`,
      obj
    );

    let addFoodLogDetails = await ConnectionUtil(
      `SELECT * FROM userchallenge_task ORDER BY created_At DESC LIMIT 1`
    );

    var object = addFoodLogDetails.reduce(function (acc, cur, i) {
      acc[i] = cur;
      return acc;
    }, {});

    await challengeFoodLog(user_Id, company_Id);

    res.status(200).json({
      success: true,
      message: "food log",
      data: object["0"],
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//----------------- editfood_log ---------------------
module.exports.editfood_log = async (req, res) => {
  try {
    let {
      challengeTask_id,
      foodLog_cat,
      calories,
      foodImage_path,
      food_category,
      food_Subcategory,
      user_Id,
      Challenge_Id,
      challengePredefined_Id,
      ip_Address,
      foodInstantAdd_id,
      foodInstant_id,
      value,
    } = req.body;
    let { id } = req.user;
    let path = JSON.stringify(foodImage_path);
    let editFoodLogUpdateQuery = await ConnectionUtil(
      `Update userchallenge_task SET 
                foodLog_cat             = '${foodLog_cat}',
                calories                = '${calories}' ,
                foodImage_path          = '${path}',
                food_category           = '${food_category}',
                food_Subcategory        = '${food_Subcategory}',
                ip_Address              = '${ip_Address}', 
                updated_By              = '${id}'
                 where  challengeTask_id = '${challengeTask_id}'`
    );
    let editFoodInstant = await ConnectionUtil(
      `UPDATE foodInstant_add SET foodInstant_id = ${foodInstant_id} ,value = ${value} WHERE user_Id = ${user_Id} AND foodInstantAdd_id = ${foodInstantAdd_id}`
    );
    res.status(200).json({
      success: true,
      message: "Edit food_log successfully",
      data: editFoodLogUpdateQuery,
      editFoodInstant,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//----------------- showfood_log ---------------------
module.exports.showfood_log = async (req, res) => {
  try {
    let { Challenge_Id, challengePredefined_Id, user_Id, foodLog_cat } =
      req.body;
    let { id } = req.user;

    let showFoodLogDetailQuery = await ConnectionUtil(`
    select UT.challengeTask_id,UT.foodImage_path ,UT.calories,UT.foodLog_cat,UT.activityCard_Id,UT.activityCard_catId,
    (select food_name from  food_category where foodcategory_id =UT.food_Subcategory) as food_Subcategory,
    (select food_name from  food_category where foodcategory_id =UT.food_category) as food_category,
    UT.created_At , UT.date ,FI.foodInstantAdd_id , FI.foodInstant_id , FI.value 
    from userchallenge_task as UT JOIN foodInstant_add  FI ON (UT.user_Id = FI.user_Id) and (UT.challengeTask_id = FI.challengeTask_id)
    where  UT.user_Id=${user_Id} AND DATE_FORMAT(UT.created_At, '%Y-%m-%d') = DATE_FORMAT(CURDATE(), '%Y-%m-%d') AND UT.foodLog_cat = ${foodLog_cat}  AND DATE_FORMAT(FI.created_At, '%Y-%m-%d') = DATE_FORMAT(CURDATE(), '%Y-%m-%d') AND FI.foodLog_cat = ${foodLog_cat}`);

    res.status(200).json({
      success: true,
      message: "Show food_log successfully",
      data: showFoodLogDetailQuery,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//------------------------ foodlog_Upload ------------------------
var multer = require("multer");
var upload = multer({ dest: "upload/challenge/foodlog" });
var storage = multer.diskStorage({
  destination: function (req, file, cd) {
    cd(null, "upload/challenge/foodlog");
  },

  filename: function (req, file, cd) {
    var str = file.originalname;
    var dotIndex = str.lastIndexOf(".");
    var ext = str.substring(dotIndex);
    var val = ext.split(".")[1];
    cd(null, Date.now() + "-image." + val);
  },
});

var upload = multer({
  storage: storage,
}).any("");
module.exports.foodlogUpload = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      var imagename = req.files;
      path = await imagename.map((data) => {
        return data.filename;
      });
      res.status(200).json({
        success: true,
        message: "Image upload successfully",
        data: path, //'http://157.245.104.180:4000/'+
      });
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//----------------- Foodlog_CategoryList ---------------------
module.exports.Foodlog_CategoryList = async (req, res) => {
  try {
    let { Challenge_Id, challengePredefined_Id, user_Id, date, is_Type } =
      req.body;
    if (is_Type == 1) {
      let Lcount = 0,
        Bcount = 0,
        Dcount = 0,
        Scount = 0;
      let lunch_log = 0,
        breakfast_log = 0,
        dinner_log = 0,
        snacks_log = 0;
      let lunch_Kcal = 0,
        breakfast_Kcal = 0,
        dinner_Kcal = 0,
        snacks_Kcal = 0;
      //   let arr = [];
      let obj = {};
      let FoodLogCatListDetail = await ConnectionUtil(
        `select * from  userchallenge_task where user_Id='${user_Id}' AND DATE_FORMAT(date, '%Y-%m-%d') = DATE_FORMAT(CURDATE(), '%Y-%m-%d')`
      );
      for (let listFood of FoodLogCatListDetail) {
        if (listFood.foodLog_cat == 1) {
          Bcount = 1;
          breakfast_log++;
          breakfast_Kcal =
            parseInt(breakfast_Kcal) + parseInt(listFood.calories);
          //   breakfast_Kcal = listFood.calories;
          //   console.log(breakfast_Kcal);
        } else if (listFood.foodLog_cat == 2) {
          Lcount = 1;
          lunch_log++;
          lunch_Kcal = parseInt(lunch_Kcal) + parseInt(listFood.calories);
        } else if (listFood.foodLog_cat == 3) {
          Scount = 1;
          snacks_log++;
          snacks_Kcal = parseInt(snacks_Kcal) + parseInt(listFood.calories);
        } else if (listFood.foodLog_cat == 4) {
          Dcount = 1;
          dinner_log++;
          dinner_Kcal = Number(dinner_Kcal) + Number(listFood.calories);
        }
      }
      Lcount != 0
        ? ((obj.lunch = 1),
          (obj.lunch_log = lunch_log),
          (obj.lunch_Kcal = lunch_Kcal))
        : ((obj.lunch = 0),
          (obj.lunch_log = lunch_log),
          (obj.lunch_Kcal = lunch_Kcal));
      Bcount != 0
        ? ((obj.breakfast = 1),
          (obj.breakfast_log = breakfast_log),
          (obj.breakfast_Kcal = breakfast_Kcal))
        : ((obj.breakfast = 0),
          (obj.breakfast_log = breakfast_log),
          (obj.breakfast_Kcal = breakfast_Kcal));
      Dcount != 0
        ? ((obj.dinner = 1),
          (obj.dinner_log = dinner_log),
          (obj.dinner_Kcal = dinner_Kcal))
        : ((obj.dinner = 0),
          (obj.dinner_log = dinner_log),
          (obj.dinner_Kcal = dinner_Kcal));
      Scount != 0
        ? ((obj.snacks = 1),
          (obj.snacks_log = snacks_log),
          (obj.snacks_Kcal = snacks_Kcal))
        : ((obj.snacks = 0),
          (obj.snacks_log = snacks_log),
          (obj.snacks_Kcal = snacks_Kcal));
      obj.user_Id = user_Id;

      //   arr.push({ currentDate: obj });

      let Lcount_total = 0,
        Bcount_total = 0,
        Dcount_total = 0,
        Scount_total = 0;
      let lunch_log_total = 0,
        breakfast_log_total = 0,
        dinner_log_total = 0,
        snacks_log_total = 0;
      let lunch_Kcal_total = 0,
        breakfast_Kcal_total = 0,
        dinner_Kcal_total = 0,
        snacks_Kcal_total = 0;
      let obj_total = {};
      let FoodLogCatListDetail_total = await ConnectionUtil(
        `select * from  userchallenge_task where user_Id='${user_Id}'`
      );
      for (let listFood of FoodLogCatListDetail_total) {
        if (listFood.foodLog_cat == 1) {
          Bcount_total = 1;
          breakfast_log_total++;
          breakfast_Kcal_total =
            parseInt(breakfast_Kcal_total) + parseInt(listFood.calories);
          // breakfast_Kcal_total = listFood.calories
          // console.log(breakfast_Kcal_total)
        } else if (listFood.foodLog_cat == 2) {
          Lcount_total = 1;
          lunch_log_total++;
          lunch_Kcal_total =
            parseInt(lunch_Kcal_total) + parseInt(listFood.calories);
        } else if (listFood.foodLog_cat == 3) {
          Scount_total = 1;
          snacks_log_total++;
          snacks_Kcal_total =
            Number(snacks_Kcal_total) + Number(listFood.calories);
        } else if (listFood.foodLog_cat == 4) {
          Dcount_total = 1;
          dinner_log_total++;
          dinner_Kcal_total =
            Number(dinner_Kcal_total) + Number(listFood.calories);
        }
      }
      Lcount_total != 0
        ? ((obj_total.lunch = 1),
          (obj_total.lunch_log = lunch_log_total),
          (obj_total.lunch_Kcal = lunch_Kcal_total))
        : ((obj_total.lunch = 0),
          (obj_total.lunch_log = lunch_log_total),
          (obj_total.lunch_Kcal = lunch_Kcal_total));
      Bcount_total != 0
        ? ((obj_total.breakfast = 1),
          (obj_total.breakfast_log = breakfast_log_total),
          (obj_total.breakfast_Kcal = breakfast_Kcal_total))
        : ((obj_total.breakfast = 0),
          (obj.breakfast_log = breakfast_log_total),
          (obj_total.breakfast_Kcal = breakfast_Kcal_total));
      Dcount_total != 0
        ? ((obj_total.dinner = 1),
          (obj_total.dinner_log = dinner_log_total),
          (obj_total.dinner_Kcal = dinner_Kcal_total))
        : ((obj_total.dinner = 0),
          (obj_total.dinner_log = dinner_log_total),
          (obj_total.dinner_Kcal = dinner_Kcal_total));
      Scount_total != 0
        ? ((obj_total.snacks = 1),
          (obj_total.snacks_log = snacks_log_total),
          (obj_total.snacks_Kcal = snacks_Kcal_total))
        : ((obj_total.snacks = 0),
          (obj_total.snacks_log = snacks_log_total),
          (obj_total.snacks_Kcal = snacks_Kcal_total));
      obj_total.user_Id = user_Id;
      obj_total.totalLog =
        breakfast_log_total +
        lunch_log_total +
        dinner_log_total +
        snacks_log_total;
      obj_total.totalCalories =
        lunch_Kcal_total +
        breakfast_Kcal_total +
        dinner_Kcal_total +
        snacks_Kcal_total;

      //   arr.push({ totalData: obj_total });

      res.status(200).json({
        success: true,
        message: "Food_log CategoryList",
        currentDate: obj,
        totalData: obj_total,
      });
    } else {
      let Lcount = 0,
        Bcount = 0,
        Dcount = 0,
        Scount = 0;
      let lunch_log = 0,
        breakfast_log = 0,
        dinner_log = 0,
        snacks_log = 0;
      let lunch_Kcal = 0,
        breakfast_Kcal = 0,
        dinner_Kcal = 0,
        snacks_Kcal = 0;
      let obj = {};
      let FoodLogCatListDetail = await ConnectionUtil(
        `select * from  userchallenge_task where Challenge_Id='${Challenge_Id}' AND challengePredefined_Id='${challengePredefined_Id}' AND user_Id='${user_Id}'`
      );
      for (let listFood of FoodLogCatListDetail) {
        if (listFood.foodLog_cat == 1) {
          Bcount = 1;
          breakfast_log++;
          breakfast_Kcal =
            parseInt(breakfast_Kcal) + parseInt(listFood.calories);
        } else if (listFood.foodLog_cat == 2) {
          Lcount = 1;
          lunch_log++;
          lunch_Kcal = parseInt(lunch_Kcal) + parseInt(listFood.calories);
        } else if (listFood.foodLog_cat == 3) {
          Scount = 1;
          snacks_log++;
          snacks_Kcal = parseInt(snacks_Kcal) + parseInt(listFood.calories);
        } else if (listFood.foodLog_cat == 4) {
          Dcount = 1;
          dinner_log++;
          dinner_Kcal = parseInt(dinner_Kcal) + parseInt(listFood.calories);
        }
      }
      Lcount != 0
        ? ((obj.lunch = 1),
          (obj.lunch_log = lunch_log),
          (obj.lunch_Kcal = lunch_Kcal))
        : ((obj.lunch = 0),
          (obj.lunch_log = lunch_log),
          (obj.lunch_Kcal = lunch_Kcal));
      Bcount != 0
        ? ((obj.breakfast = 1),
          (obj.breakfast_log = breakfast_log),
          (obj.breakfast_Kcal = breakfast_Kcal))
        : ((obj.breakfast = 0),
          (obj.breakfast_log = breakfast_log),
          (obj.breakfast_Kcal = breakfast_Kcal));
      Dcount != 0
        ? ((obj.dinner = 1),
          (obj.dinner_log = dinner_log),
          (obj.dinner_Kcal = dinner_Kcal))
        : ((obj.dinner = 0),
          (obj.dinner_log = dinner_log),
          (obj.dinner_Kcal = dinner_Kcal));
      Scount != 0
        ? ((obj.snacks = 1),
          (obj.snacks_log = snacks_log),
          (obj.snacks_Kcal = snacks_Kcal))
        : ((obj.snacks = 0),
          (obj.snacks_log = snacks_log),
          (obj.snacks_Kcal = snacks_Kcal));
      (obj.Challenge_Id = Challenge_Id),
        (obj.challengePredefined_Id = challengePredefined_Id),
        (obj.user_Id = user_Id),
        (obj.totalLog = breakfast_log + lunch_log + dinner_log + snacks_log);
      obj.totalCalories =
        lunch_Kcal + breakfast_Kcal + dinner_Kcal + snacks_Kcal;
      res.status(200).json({
        success: true,
        message: "Food_log CategoryList",
        totalData: obj,
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

//-------------------foodLog_graph--------------------------
module.exports.foodLog_graph = async (req, res) => {
  try {
    let { user_Id, isType, challenge_Id, challengePredefined_Id } = req.body;
    let yyyy = new Date().getFullYear();
    let mm = new Date().getMonth() + 1;
    let dd = new Date().getDate();
    if (isType == 0) {
      let arr1 = [];
      let logs = [];

      for (let i = 1; i <= dd; i++) {
        // console.log(yyyy + "-" + mm + "-" + i)
        let graphData = await ConnectionUtil(
          `SELECT * FROM userchallenge_task WHERE DATE_FORMAT(created_At , '%Y-%m-%d') = DATE_FORMAT('${
            yyyy + "-" + mm + "-" + i
          }' , '%Y-%m-%d') AND user_Id = ${user_Id}  AND challenge_Id = ${challenge_Id} AND challengePredefined_Id = ${challengePredefined_Id}`
        );
        logs.push([graphData.length, 0]);
        arr1.push(i + "");
      }

      res.status(200).json({
        success: true,
        message: "foodLog_graph data success",
        data: {
          labels: arr1,
          data: logs,
          barColors: ["#DDCEFF", "#DDCEFF"],
        },
      });
    } else {
      let arr1 = [];
      let calories = [];

      for (let i = 1; i <= dd; i++) {
        // console.log(yyyy + "-" + mm + "-" + i)
        let graphData = await ConnectionUtil(
          `SELECT * FROM userchallenge_task WHERE DATE_FORMAT(created_At , '%Y-%m-%d') = DATE_FORMAT('${
            yyyy + "-" + mm + "-" + i
          }' , '%Y-%m-%d') AND user_Id = ${user_Id}`
        );

        let calorie = 0;
        for (let i = 0; i <= graphData.length - 1; i++) {
          calorie += Number(graphData[i].calories);
        }

        calories.push([calorie, 0]);
        arr1.push(i + "");
      }

      res.status(200).json({
        success: true,
        message: "foodLog_graph data success",
        data: {
          labels: arr1,
          data: calories,
          barColors: ["#DDCEFF", "#DDCEFF"],
        },
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

//----------------- delete_FoodlogImage ---------------------
const fs = require("fs");
module.exports.delete_FoodlogImage = async (req, res) => {
  try {
    let { image_Path } = req.body;
    let path = __dirname + image_Path;
    let filepath = path.join(
      __dirname + `/../upload/challenge/foodlog/1620211960312-image.undefined`
    );
    console.log(filepath);
    // 1620211960312-image.undefined
    //  await  fs.unlink()
    // fs.unlink('./../../../upload/challenge/foodlog/test.jpg', (err) => {
    //     if (err) {
    //         console.error(err)
    //         return
    //     }
    // })
    res.status(200).json({
      success: true,
      message: "Food_log image delete successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

//@@@@@@@@@@@@@@@@@@@@@@@@ Document_Task @@@@@@@@@@@@@@@@@@@@@@@@

//------------------------------delete food log ---------------------------------
module.exports.delete_FoodLog = async (req, res) => {
  try {
    let { challengeTask_id, foodInstantAdd_id } = req.body;

    let deleteFoodInstant = await ConnectionUtil(
      `DELETE FROM foodInstant_add WHERE foodInstantAdd_id = ${foodInstantAdd_id}`
    );

    let deleteFoodLog = await ConnectionUtil(
      `DELETE FROM userchallenge_task WHERE challengeTask_id = ${challengeTask_id}`
    );

    res.status(200).json({
      success: true,
      message: "Food_log deleted successfully",
      data: deleteFoodInstant,
      deleteFoodLog,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

//---------------------- Document&Profile_Status_Graph ------------------------
module.exports.Challenge_TaskStatus = async (req, res) => {
  try {
    let { Challenge_Id, user_Id } = req.body;
    let challengeUserAssign = await ConnectionUtil(
      `select * from userassign_challenges  where  isAccept='1' AND  challenge_Id = '${Challenge_Id}' AND user_id ='${user_Id}'`
    ); //challengePredefined_Id = '${challengeUserAssign[0].challengePredefined_Id}'
    let obj = {};
    if (challengeUserAssign.length > 0) {
      obj = {
        Document_Completed: challengeUserAssign[0].isCompleted,
      }; // 0-> NO , 1-> Yes
    } else {
      obj = {
        Document_Completed: 0,
      }; // 0-> NO , 1-> Yes
    }

    res.status(200).json({
      success: true,
      message: "task list",
      data: obj,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
let moment = require("moment");
const { Testleave } = require("../hrAdmin/employeeUser_Controller");
//---------------------- Survey_Task ------------------------
module.exports.Challenge_SurveyStatus = async (req, res) => {
  try {
    let { Challenge_Id, user_Id, challengePredefined_Id } = req.body;
    let { company_id } = req.user;
    let count = 0;
    let newArr = [];
    let challengeDetail = await ConnectionUtil(
      `select challenge_Configuration,company_Id , Reward , action_Required , expiry_Date , challengePredefined_Id , challenges_id from challenges where  challengePredefined_Id = '${7}' AND (company_Id='${company_id}' or company_Id='0')AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d')`
    );

    let SurveyDetail = await ConnectionUtil(`SELECT *
        FROM survey_Type as ST
        JOIN challenges as  C ON DATE_FORMAT(C.expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(ST.created_At,'%Y-%m-%d') where 
        C.challengePredefined_Id = 7 AND 
        (ST.company_Id='${company_id}' OR ST.company_Id=0) AND (C.company_Id='${company_id}' OR C.company_Id=0) AND
        DATE_FORMAT(ST.created_At,'%Y-%m-%d')>=DATE_FORMAT(C.created_At, '%Y-%m-%d')`);
    for (let data of SurveyDetail) {
      let userSurvey =
        await ConnectionUtil(`select * from userAssign_Survey as US JOIN survey_Type as ST ON  ST.surveyType_id = US.surveyType_Id 
            where US.isActiveSurvey = '0' AND  US.user_Id = '${user_Id}' AND US.surveyType_id = '${data.surveyType_id}' `);
      if (userSurvey.length > 0) {
        count = count + 1;
        newArr.push({
          surveyName: data.survey_Name,
          surveySubmitDate: moment(data.created_At).format("YYYY-MM-DD"),
        });
      }
    }
    let config = JSON.parse(challengeDetail[0].challenge_Configuration);

    let obj = {
      totalSurvey: config[1].value,
      completeSurvey: count,
      surveyObj: newArr,
    };
    res.status(200).json({
      success: true,
      message: "Survey status task list",
      data: obj,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//---------------------- Survey_Task ------------------------
module.exports.Challenge_AttendanceStatus = async (req, res) => {
  try {
    let { Challenge_Id, user_Id, challengePredefined_Id } = req.body;
    // let challengeUserAssign = await ConnectionUtil(`select isCompleted from userassign_challenges  where  isAccept='1' AND  challenge_Id = '${Challenge_Id}' AND user_id ='${user_Id}'`); //challengePredefined_Id = '${challengeUserAssign[0].challengePredefined_Id}'
    let obj = {
      attendancePercentage: 100,
      surveyObj: [
        {
          day: 1,
          value: 10,
        },
        {
          day: 2,
          value: 20,
        },
        {
          day: 3,
          value: 30,
        },
        {
          day: 4,
          value: 40,
        },
      ],
    };
    res.status(200).json({
      success: true,
      message: "Attendance status task list",
      data: obj,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//@@@@@@@@@@@@@@@@@@@@@@@@ UseApp_Task @@@@@@@@@@@@@@@@@@@@@@@@
// module.exports.AppUseage_log = async (req, res) => {
//     try {
//         let {user_Id , Challenge_Id , challengePredefined_Id , ip_Address,date,time,duration } = req.body
//         let {id} = req.user;
//         let obj={
//             user_Id                : user_Id,
//             Challenge_Id           : Challenge_Id,
//             challengePredefined_Id : challengePredefined_Id,
//             ip_Address             : ip_Address,
//             created_By             : id,
//             updated_By             : id
//         }
//         let addFoodLogInsertQuery = await ConnectionUtil(`INSERT INTO userchallenge_task SET?`,obj);
//         res.status(200).json({
//             success : true,
//             message : "food log",
//             data    : addFoodLogInsertQuery
//         })
//     } catch (err) {
//         console.log(err)
//         res.status(400).json({
//             success: false,
//             message: err.message
//         })
//     }
// }

async function challengeFoodLog(user_Id, company_Id) {
  let challengeDetail = await ConnectionUtil(
    `select age , age_From , age_To , Gender , genderType , Department , department_Name , company_Id , Reward , action_Required ,challenge_Configuration , DATE_FORMAT(expiry_Date , '%Y-%m-%d') expiry_Date, challengePredefined_Id , DATE_FORMAT(created_At , '%Y-%m-%d') created_At , challenges_id from challenges where  challengePredefined_Id = '8' AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND action_Required = '1'`
  );
  // console.log(challengeDetail , "challengeDetail")
  for (let Challenge of challengeDetail) {
    let challengeUserAssignDetail = await ConnectionUtil(
      `select * from userassign_challenges  where isCompleted='0' AND isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${user_Id}' `
    );
    // console.log(challengeUserAssignDetail , "challengeUserassign")
    
    if (Challenge.company_Id == 0) {
      if (Challenge.age == 0 && Challenge.Gender == 0) {
        if (challengeUserAssignDetail.length > 0) {
          await challengeTaskFoodLog(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskFoodLog(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskFoodLog(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskFoodLog(Challenge, user_Id, company_Id , challengeUserAssignDetail);
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
      }
    } else {
      if (Challenge.age == 0 && Challenge.Gender == 0 && Challenge.Department == 0) {
        if (challengeUserAssignDetail.length > 0) {
          await challengeTaskFoodLog(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskFoodLog(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskFoodLog(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskFoodLog(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskFoodLog(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskFoodLog(Challenge, user_Id, company_Id , challengeUserAssignDetail);
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
        else {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTaskFoodLog(Challenge, user_Id, company_Id , challengeUserAssignDetail);
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
      }
    }

  }
}


async function challengeTaskFoodLog (Challenge, user_Id, company_Id , challengeUserAssignDetail) {
  let y = JSON.parse(Challenge.challenge_Configuration);

      let value = y[0].value;
      let d1 = new Date(Challenge.created_At).getTime();
      let d2 = new Date(Challenge.expiry_Date).getTime();
      let differernce = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24) + 1);

      let foodLogEveryDay = await ConnectionUtil(
        `SELECT DISTINCT date  FROM userchallenge_task WHERE user_Id = ${user_Id} and isActive = 1 AND date BETWEEN '${Challenge.created_At}' AND '${Challenge.expiry_Date}'`
      );

      
      console.log(value);
      if (foodLogEveryDay.length >= value) {
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
          await helperNotification(Arr, testMessage);
        });
      }
}