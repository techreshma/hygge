const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
var fetch = require("node-fetch");
var cron = require("node-cron");
let calcBmi = require("bmi-calc");
var moment = require("moment-timezone");
const { time } = require("console");
const { parse } = require("path");
moment().tz("America/Los_Angeles").format();

// ------------------------- Activity -----------------------------------
module.exports.card_Activity = async (req, res) => {
  try {
    let {
      user_Id,
      company_Id,
      activityCard_catId,
      activityCard_Id,
      ip_Address,
      date,
      time,
    } = req.body;
    let yyyy = new Date().getFullYear();
    let mm = new Date().getMonth() + 1;
    let dd = new Date().getDate();
    let arr = [];
    let labels = [];
    let dataSets = [];

    let activityDetail_user = await ConnectionUtil(
      `select * from variable_recorde where activityCard_catId = '${activityCard_catId}'AND  activityCard_id ='${activityCard_Id}' AND user_Id='${user_Id}'`
    );

    let avgCalTimeArr = await ConnectionUtil(
      `select avg(calories)  as avgCalories  , avg(measure) as avgTime from variable_recorde where activityCard_Id = ${activityCard_Id}  and user_Id = ${user_Id} and company_Id = ${company_Id} AND DATE_FORMAT(created_At , '%Y-%m-%d') = DATE_FORMAT(CURDATE() ,'%Y-%m-%d')`
    );

    let datecurrentMonth = await currentMonth_datefunction();

    if (activityDetail_user.length > 0) {
      let activityDetail_total = await ConnectionUtil(
        `select DATE_FORMAT(date, '%d') as date , measure from variable_recorde where activityCard_catId = '${activityCard_catId}'AND  activityCard_id ='${activityCard_Id}' AND user_Id='${user_Id}' AND DATE_FORMAT(date , '%Y-%m') = DATE_FORMAT( CURDATE() , '%Y-%m')`
      );

      if (activityDetail_total.length > 0) {
        let activit_card = await ConnectionUtil(
          `select * from activity_card where activityCard_catId = '${activityCard_catId}'AND  activityCard_id ='${activityCard_Id}'`
        );
        let dateAdd_arr = [];
        for (let activity of activityDetail_total) {
          datecurrentMonth.filter((data) => {
            if (activity.date == data) {
              dateAdd_arr.push(activity.measure);
            } else {
              dateAdd_arr.push(0);
            }
          });
        }

        for (let i = 1; i <= dd; i++) {
          let graphData = await ConnectionUtil(
            `select COALESCE(SUM(measure),0) as measure from variable_recorde where activityCard_catId = '${activityCard_catId}'AND  activityCard_id ='${activityCard_Id}' AND user_Id='${user_Id}' AND DATE_FORMAT(date , '%Y-%m-%d') = DATE_FORMAT('${
              yyyy + "-" + mm + "-" + i
            }' , '%Y-%m-%d') ORDER BY created_At  DESC `
          );

          labels.push(i + "");

          let data = graphData.length > 0 ? parseInt(graphData[0].measure) : 0;
          dataSets.push([data, 0]);
        }

        let val = await ConnectionUtil(
          `select COALESCE(measure,0) as measure from variable_recorde where activityCard_catId = '${activityCard_catId}'AND  activityCard_id ='${activityCard_Id}' AND user_Id='${user_Id}' AND DATE_FORMAT(created_At , '%Y-%m-%d') = DATE_FORMAT( CURDATE() , '%Y-%m-%d') ORDER BY created_At  DESC LIMIT 1`
        );

        console.log(val, "val");

        if (val.length != 0) {
          arr = [
            { content: activit_card[0].content },
            { total_value: 10, measure_value: val[0].measure },
            // { labels: datecurrentMonth, datasets: [{ data: dateAdd_arr }] },
          ];
        } else {
          arr = [
            { content: activit_card[0].content },
            { total_value: 10, measure_value: 0 },
            // { labels: datecurrentMonth, datasets: [{ data: dateAdd_arr }] },
          ];
        }
      } else {
        for (let i = 1; i <= dd; i++) {
          let graphData = await ConnectionUtil(
            `select COALESCE(SUM(measure),0) as measure from variable_recorde where activityCard_catId = '${activityCard_catId}'AND  activityCard_id ='${activityCard_Id}' AND user_Id='${user_Id}' AND DATE_FORMAT(date , '%Y-%m-%d') = DATE_FORMAT('${
              yyyy + "-" + mm + "-" + i
            }' , '%Y-%m-%d')`
          );

          labels.push(i + "");
          let data =
            graphData.length > 0 ? parseInt(graphData[0].measure) : [0, 0];
          dataSets.push([data, 0]);
        }
        // let dateblank_arr = [];
        // datecurrentMonth.map((data) => {
        //   if (data) {
        //     dateblank_arr.push(0);
        //   }
        // });
        arr = [
          { content: [] },
          { total_value: 10, measure_value: 0 },
          // { labels: datecurrentMonth, datasets: [{ data: dateblank_arr }] },
        ];
      }
    } else {
      for (let i = 1; i <= dd; i++) {
        let graphData = await ConnectionUtil(
          `select COALESCE(SUM(measure),0) as measure from variable_recorde where activityCard_catId = '${activityCard_catId}'AND  activityCard_id ='${activityCard_Id}' AND user_Id='${user_Id}' AND DATE_FORMAT(date , '%Y-%m-%d') = DATE_FORMAT('${
            yyyy + "-" + mm + "-" + i
          }' , '%Y-%m-%d')`
        );

        labels.push(i + "");
        let data =
          graphData.length > 0 ? parseInt(graphData[0].measure) : [0, 0];
        dataSets.push([data, 0]);
      }

      arr = [{ content: [] }, { total_value: 10, measure_value: 0 }];
    }

    let avgCalories =
      avgCalTimeArr.length > 0 && avgCalTimeArr[0].avgCalories != null
        ? avgCalTimeArr[0].avgCalories.toFixed(2)
        : 0;
    let avgTime =
      avgCalTimeArr.length > 0 && avgCalTimeArr[0].avgTime
        ? avgCalTimeArr[0].avgTime.toFixed(2)
        : 0;

    if (activityCard_Id == 8) {
      let weightGained = 0;
      let bmi;

      let weightSore = await ConnectionUtil(
        `select * from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='9' AND status = '1'`
      );

      let heightSore = await ConnectionUtil(
        `select * from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='8' AND status = '1'`
      );

      let weightSoreOld = await ConnectionUtil(
        `SELECT * FROM hra_submission_old WHERE healthQuestions_Id = 9 AND user_Id = ${user_Id} AND company_Id = ${company_Id} ORDER by created_At desc LIMIT 1 `
      );

      let newWeight =
        weightSore.length > 0 ? parseInt(weightSore[0].options) : 0;
      let oldWeight =
        weightSoreOld.length > 0 ? parseInt(weightSoreOld[0].options) : 0;
      let newHeight =
        heightSore.length > 0 ? parseInt(heightSore[0].options) : 0;
      if (weightSoreOld.length > 0) {
        weightGained = newWeight - oldWeight;
      } else {
        weightGained = 0;
      }
      let height = newHeight / 100;
      let weight = newWeight;
      let valBMI = calcBmi(weight, height);
      let totBMI = valBMI.value.toFixed(1);
      bmi = totBMI;

      return res.status(200).json({
        success: true,
        message: "show card activity",
        data: {
          currentDateDate: arr,
          graph: { data: dataSets, labels, barColors: ["#DDCEFF", "#DDCEFF"] },
          avgCalTimeArr: { avgCalories, avgTime },
          weightGained,
          newHeight,
          bmi,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "show card activity",
      data: {
        currentDateDate: arr,
        graph: { data: dataSets, labels, barColors: ["#DDCEFF", "#DDCEFF"] },
        avgCalTimeArr: { avgCalories, avgTime },
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

// -------------- currentMonth_datefunction --------------
async function currentMonth_datefunction() {
  let dateArr = [];
  let date_current = new Date();
  let month = date_current.getMonth() + 1;
  let year = date_current.getFullYear();
  let daysInMonth = new Date(year, month, 0).getDate();
  date_current.setDate(1);
  let all_days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    var d = {
      year: year,
      month: month.toString().padStart(2, "0"),
      date: i.toString().padStart(2, "0"),
    };
    if (i.toString().padStart(2, "0") <= new Date().getDate()) {
      all_days.push(d);
    }
  }
  for (let dateVal of all_days) {
    dateArr.push(dateVal.date);
  }
  return dateArr;
}

// ------------------------- Activity_valueUpdate -------------------------------
module.exports.valueUpdate_Activity = async (req, res) => {
  try {
    let {
      user_Id,
      company_Id,
      date,
      activityCard_catId,
      activityCard_Id,
      ip_Address,
      isType,
      measure,
      time,
    } = req.body; //time
    let activityAdd_val = await ConnectionUtil(
      `select * from variable_recorde where activityCard_catId = '${activityCard_catId}'AND  activityCard_id ='${activityCard_Id}' AND user_Id='${user_Id}' AND date = '${date}'`
    );

    if (activityAdd_val.length == 0) {
      let obj = {
        activityCard_catId: activityCard_catId,
        activityCard_id: activityCard_Id,
        measure: isType == 1 ? 1 : 0,
        user_Id: user_Id,
        date: date,
        ip_Address: ip_Address,
        company_Id: company_Id,
        time: time,
      };
      let variableRecordeInsert = await ConnectionUtil(
        `INSERT INTO variable_recorde SET ? `,
        obj
      );

      let val = await ConnectionUtil(
        `select COALESCE(measure,0) as measure from variable_recorde where activityCard_catId = '${activityCard_catId}'AND  activityCard_id ='${activityCard_Id}' AND user_Id='${user_Id}' AND date = '${date}' `
      );

      res.status(200).json({
        success: true,
        message: " Value update activity ",
        data: parseInt(val[0].measure), // variableRecordeInsert
      });
    } else {
      if (isType == 1) {
        let measure = parseInt(activityAdd_val[0].measure) + 1;
        // let measure = Number(activityAdd_val[0].measure);
        let variable_recordeUser = await ConnectionUtil(
          `update variable_recorde set
          measure=${measure},ip_Address='${ip_Address}'
          where activityCard_catId = '${activityCard_catId}'AND  activityCard_id ='${activityCard_Id}' AND user_Id='${user_Id}' AND date = '${date}' `
        );
        let val = await ConnectionUtil(
          `select COALESCE(measure,0) as measure from variable_recorde where activityCard_catId = '${activityCard_catId}'AND  activityCard_id ='${activityCard_Id}' AND user_Id='${user_Id}' AND date = '${date}' `
        );
        res.status(200).json({
          success: true,
          message: " Value update activity ",
          data: parseInt(val[0].measure), //variable_recordeUser
        });
      } else {
        let measure =
          parseInt(activityAdd_val[0].measure) != 0
            ? parseInt(activityAdd_val[0].measure) - 1
            : 0;
        let variable_recordeUser = await ConnectionUtil(
          `update variable_recorde set
          measure = ${measure} , ip_Address = '${ip_Address}'
          where activityCard_catId = '${activityCard_catId}'AND  activityCard_id ='${activityCard_Id}' AND user_Id='${user_Id}' AND date = '${date}'`
        );
        let val = await ConnectionUtil(
          `select COALESCE(measure,0) as measure from variable_recorde where activityCard_catId = '${activityCard_catId}'AND  activityCard_id ='${activityCard_Id}' AND user_Id='${user_Id}' AND date = '${date}' `
        );

        res.status(200).json({
          success: true,
          message: " Value update activity ",
          data: Number(val[0].measure), // variable_recordeUser
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

// -------------------------  foodInstant_list -----------------------------------
// module.exports.foodInstant_list = async (req, res) => {
//   try {
//     let { id } = req.user;
//     let foodInstant_list = await ConnectionUtil(
//       `select foodInstant_id,food_name,image,colour from foodInstant_list`
//     );
//     let foodlist_arr = [];
//     for (let foodlist of foodInstant_list) {
//       let foodinstantAdd_detail = await ConnectionUtil(
//         `select * from foodInstant_add where foodInstant_id='${foodlist.foodInstant_id}' AND user_Id='${id}'`
//       );
//       foodlist.value =
//         foodinstantAdd_detail.length > 0 ? foodinstantAdd_detail[0].value : 0;
//       foodlist_arr.push(foodlist);
//     }
//     res.status(200).json({
//       success: true,
//       message: "foodInstant list",
//       data: foodlist_arr,
//     });
//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

// -------------------------  add_foodInstant -----------------------------------

module.exports.foodInstant_list = async (req, res) => {
  try {
    let { id } = req.user;
    console.log(id, "id");
    // console.log("challengePredefined_Id", challengePredefined_Id);
    let v1 = 0;
    let v2 = 0;
    let v3 = 0;
    let v4 = 0;
    let v5 = 0;
    let v6 = 0;
    let v7 = 0;
    let v8 = 0;
    let v9 = 0;
    let v10 = 0;
    let v11 = 0;

    for (let i = 1; i <= 11; i++) {
      let foodInstantArr = await ConnectionUtil(
        `SELECT * FROM foodInstant_add WHERE foodInstant_id = ${i} AND user_Id = ${id} AND DATE_FORMAT(created_AT , '%Y-%m-%d') = DATE_FORMAT(CURDATE() , '%Y-%m-%d')`
      );
      // console.log(foodInstantArr);
      if (foodInstantArr.length > 0) {
        for (let j = 0; j < foodInstantArr.length; j++) {
          switch (foodInstantArr[j].foodInstant_id) {
            case 1:
              v1++;

              break;
            case 2:
              v2++;

              break;
            case 3:
              v3++;

              break;
            case 4:
              v4++;

              break;
            case 5:
              v5++;

              break;
            case 6:
              v6++;

              break;
            case 7:
              v7++;

              break;
            case 8:
              v8++;

              break;
            case 9:
              v9++;

              break;
            case 10:
              v10++;

              break;
            case 11:
              v11++;

              break;

            default:
              v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11;
              break;
          }
        }
      }
    }

    let finalArr = [
      {
        foodInstant_id: 1,
        food_name: "High Sugar",
        image: "restaurant.png",
        colour: "#8B0000",
        value: v1,
      },
      {
        foodInstant_id: 2,
        food_name: "Binge Snack",
        image: "restaurant.png",
        colour: "#00008B",
        value: v2,
      },
      {
        foodInstant_id: 3,
        food_name: "Fried/junk",
        image: "restaurant.png",
        colour: "#006400",
        value: v3,
      },
      {
        foodInstant_id: 4,
        food_name: "High Carb",
        image: "restaurant.png",
        colour: "#8B8000",
        value: v4,
      },
      {
        foodInstant_id: 5,
        food_name: "Low carb",
        image: "restaurant.png",
        colour: "#FFD580",
        value: v5,
      },
      {
        foodInstant_id: 6,
        food_name: "Fiber rich",
        image: "restaurant.png",
        colour: "#8A2BE2",
        value: v6,
      },
      {
        foodInstant_id: 7,
        food_name: "Fruits/ Salads",
        image: "restaurant.png",
        colour: "#C4A484",
        value: v7,
      },
      {
        foodInstant_id: 8,
        food_name: "Healthy diet",
        image: "restaurant.png",
        colour: "#87CEEB",
        value: v8,
      },
      {
        foodInstant_id: 9,
        food_name: "Plants/Veggies",
        image: "restaurant.png",
        colour: "#90EE90",
        value: v9,
      },
      {
        foodInstant_id: 10,
        food_name: "Recommended food",
        image: "restaurant.png",
        colour: "#DDCEFF",
        value: v10,
      },
      {
        foodInstant_id: 11,
        food_name: "1/2 healthy 1/2 junk",
        image: "restaurant.png",
        colour: "#FF77FF",
        value: v11,
      },
    ];

    res.status(200).json({
      success: true,
      message: "foodInstant list",
      data: finalArr,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports.add_foodInstant = async (req, res) => {
  try {
    let {
      user_Id,
      company_Id,
      date,
      foodInstant_id,
      activityCard_Id,
      activityCard_catId,
      isType,
      challengeTask_Id,
      challenge_Id,
      challengePredefined_Id,
      foodLog_cat,
      ip_Address,
    } = req.body;
    console.log("challengePredefined_Id", challengePredefined_Id);
    if (isType == 1) {
      let foodinstantAdd_detail = await ConnectionUtil(
        `select * from foodInstant_add where foodInstant_id='${foodInstant_id}' AND user_Id='${user_Id}' AND DATE_FORMAT(date, '%Y-%m-%d') ='${date}' AND challengeTask_Id = ${challengeTask_Id}`
      );
      if (foodinstantAdd_detail.length == 0) {
        let obj = {
          user_Id: user_Id,
          company_Id: company_Id,
          date: date,
          foodInstant_id: foodInstant_id,
          activityCard_Id: activityCard_Id,
          activityCard_catId: activityCard_catId,
          challengeTask_Id,
          value: 1,
          foodLog_cat,
        };
        let foodInstantAdd_insert = await ConnectionUtil(
          `INSERT INTO foodInstant_add SET ?`,
          obj
        );

        let foodInstant_list = await ConnectionUtil(
          `select foodInstant_id,food_name,image from foodInstant_list`
        );
        let foodlist_arr = [];
        let foodInstantLog = 0;
        for (let foodlist of foodInstant_list) {
          let foodinstantAdd_detail = await ConnectionUtil(
            `select * from foodInstant_add where foodInstant_id='${foodlist.foodInstant_id}' AND user_Id='${user_Id}' AND DATE_FORMAT(date, '%Y-%m-%d') =DATE_FORMAT(CURDATE(),'%Y-%m-%d')  AND challengeTask_Id = ${challengeTask_Id}`
          );
          let foodInstantValueArr = await ConnectionUtil(
            `select * from foodInstant_add where foodInstant_id='${foodlist.foodInstant_id}' AND user_Id='${user_Id}' AND DATE_FORMAT(date, '%Y-%m-%d') =DATE_FORMAT(CURDATE(),'%Y-%m-%d')  AND foodLog_cat = ${foodLog_cat}`
          );

          for (let resp of foodInstantValueArr) {
            if (foodInstantValueArr.length > 0) {
              foodInstantLog += resp.value;
            }
          }
          foodlist.value =
            foodinstantAdd_detail.length > 0
              ? foodinstantAdd_detail[0].value
              : 0;
          foodlist.value2 = foodInstantValueArr.length > 0 ? foodInstantLog : 0;

          foodlist_arr.push(foodlist);

          // foodInstantLog += foodInstantValueArr[0]
          // foodinstantAdd_detail.value2 = 0
          // for(let resp of foodInstantValueArr) {
          //   foodinstantAdd_detail.value2 =   foodInstantValueArr.length > 0 ? foodinstantAdd_detail.value2 + resp.value : 0 ;
          //   foodlist_arr.push({valuee : foodinstantAdd_detail.value2})
          // }
        }
        // console.log(foodlist_arr)

        let foodinstantAdd_detailArr = await ConnectionUtil(
          `select * from foodInstant_add where foodInstant_id = ${foodInstant_id} AND user_Id= ${user_Id}`
        );
        let val = 0;
        let foodinstant_total = [];

        for (let i = 0; i <= foodinstantAdd_detailArr.length - 1; i++) {
          let foodinstantAdd_detailArr1 = await ConnectionUtil(
            `select * from foodInstant_add where foodInstant_id = ${foodInstant_id} AND user_Id= ${user_Id}`
          );
          val += foodinstantAdd_detailArr1[i].value;
        }
        let tempObj = {
          user_Id,
          foodInstant_id,
          value2: val,
          // y,
        };

        foodinstant_total.push(tempObj);
        let objTotal = {
          foodinstant_currentdate: foodlist_arr,
          foodinstant_total,
        };

        // let object = {
        //   foodinstant_currentdate: foodlist_arr,
        // };

        res.status(200).json({
          success: true,
          message: "foodInstant add ddd",
          data: objTotal,
        });
      } else {
        let value = parseInt(foodinstantAdd_detail[0].value) + 1;
        let foodInstantAdd_update = await ConnectionUtil(
          `update foodInstant_add SET value='${value}' where foodinstantAdd_id='${foodinstantAdd_detail[0].foodInstantAdd_id}'`
        );

        let foodInstant_list = await ConnectionUtil(
          `select foodInstant_id,food_name,image, colour from foodInstant_list`
        );
        let foodlist_arr = [];
        let foodInstantLog = 0;
        for (let foodlist of foodInstant_list) {
          let foodinstantAdd_detail = await ConnectionUtil(
            `select * from foodInstant_add where foodInstant_id='${foodlist.foodInstant_id}' AND user_Id='${user_Id}' AND DATE_FORMAT(date, '%Y-%m-%d') =DATE_FORMAT(CURDATE(),'%Y-%m-%d')  AND challengeTask_Id = ${challengeTask_Id}`
          );

          let foodInstantValueArr = await ConnectionUtil(
            `select * from foodInstant_add where foodInstant_id='${foodlist.foodInstant_id}' AND user_Id='${user_Id}' AND DATE_FORMAT(date, '%Y-%m-%d') =DATE_FORMAT(CURDATE(),'%Y-%m-%d')  AND foodLog_cat = ${foodLog_cat}`
          );

          for (let resp of foodInstantValueArr) {
            if (foodInstantValueArr.length > 0) {
              foodInstantLog += resp.value;
            }
          }

          foodlist.value =
            foodinstantAdd_detail.length > 0
              ? foodinstantAdd_detail[0].value
              : 0;

          foodlist.value2 = foodInstantValueArr.length > 0 ? foodInstantLog : 0;

          foodlist_arr.push(foodlist);
        }

        let foodinstantAdd_detailArr = await ConnectionUtil(
          `select * from foodInstant_add where foodInstant_id = ${foodInstant_id} AND user_Id= ${user_Id}`
        );
        let val = 0;
        let foodinstant_total = [];

        for (let i = 0; i <= foodinstantAdd_detailArr.length - 1; i++) {
          let foodinstantAdd_detailArr1 = await ConnectionUtil(
            `select * from foodInstant_add where foodInstant_id = ${foodInstant_id} AND user_Id= ${user_Id}`
          );
          val += foodinstantAdd_detailArr1[i].value;
        }
        let tempObj = {
          user_Id,
          foodInstant_id,
          value2: val,
        };

        foodinstant_total.push(tempObj);
        let obj = {
          foodinstant_currentdate: foodlist_arr,
          foodinstant_total,
        };
        res.status(200).json({
          success: true,
          message: "foodInstant add update",
          data: obj, //foodInstantAdd_update
        });
      }
    } else {
      let foodinstantAdd_detail = await ConnectionUtil(
        `select * from foodInstant_add where foodInstant_id='${foodInstant_id}' AND user_Id='${user_Id}' AND DATE_FORMAT(date, '%Y-%m-%d') ='${date}' AND challenge_Id = '${challenge_Id}' AND challengePredefined_Id = '${challengePredefined_Id}'  AND challengeTask_Id = ${challengeTask_Id}`
      );
      if (foodinstantAdd_detail.length == 0) {
        let obj = {
          user_Id: user_Id,
          company_Id: company_Id,
          date: date,
          foodInstant_id: foodInstant_id,
          activityCard_Id: activityCard_Id,
          activityCard_catId: activityCard_catId,
          challengeTask_Id,
          challenge_Id,
          challengePredefined_Id,
          value: 1,
          foodLog_cat,
        };
        let foodInstantAdd_insert = await ConnectionUtil(
          `INSERT INTO foodInstant_add SET ?`,
          obj
        );

        let foodInstant_list = await ConnectionUtil(
          `select foodInstant_id,food_name,image, colour from foodInstant_list`
        );
        let foodlist_arr = [];
        let foodInstantLog = 0;
        for (let foodlist of foodInstant_list) {
          let foodinstantAdd_detail = await ConnectionUtil(
            `select * from foodInstant_add where foodInstant_id='${foodlist.foodInstant_id}' AND user_Id='${user_Id}' AND DATE_FORMAT(date, '%Y-%m-%d') = DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND challenge_Id = '${challenge_Id}' AND challengePredefined_Id = '${challengePredefined_Id}'  AND challengeTask_Id = ${challengeTask_Id}`
          );

          let foodInstantValueArr = await ConnectionUtil(
            `select * from foodInstant_add where foodInstant_id='${foodlist.foodInstant_id}' AND user_Id='${user_Id}' AND DATE_FORMAT(date, '%Y-%m-%d') =DATE_FORMAT(CURDATE(),'%Y-%m-%d')  AND foodLog_cat = ${foodLog_cat}`
          );

          for (let resp of foodInstantValueArr) {
            if (foodInstantValueArr.length > 0) {
              foodInstantLog += resp.value;
            }
          }

          foodlist.value =
            foodinstantAdd_detail.length > 0
              ? foodinstantAdd_detail[0].value
              : 0;

          foodlist.value2 = foodInstantValueArr.length > 0 ? foodInstantLog : 0;

          foodlist_arr.push(foodlist);
        }
        let object = {
          foodinstant_currentdate: foodlist_arr,
        };

        let foodinstantAdd_detailArr = await ConnectionUtil(
          `select * from foodInstant_add where foodInstant_id = '${foodInstant_id}' AND user_Id= '${user_Id}' AND challenge_Id = '${challenge_Id}' AND challengePredefined_Id = ${challengePredefined_Id}`
        );
        let val = 0;
        let foodinstant_total = [];

        for (let i = 0; i <= foodinstantAdd_detailArr.length - 1; i++) {
          let foodinstantAdd_detailArr1 = await ConnectionUtil(
            `select * from foodInstant_add where foodInstant_id = '${foodInstant_id}' AND user_Id= '${user_Id}' AND challenge_Id = '${challenge_Id}'`
          );
          val += foodinstantAdd_detailArr1[i].value;
        }
        let tempObj = {
          user_Id,
          foodInstant_id,
          value2: val,
        };

        foodinstant_total.push(tempObj);
        let objTotal = {
          foodinstant_currentdate: foodlist_arr,
          foodinstant_total,
        };

        res.status(200).json({
          success: true,
          message: "foodInstant add ddd",
          data: objTotal,
        });
      } else {
        let value = foodinstantAdd_detail[0].value + 1;
        let foodInstantAdd_update = await ConnectionUtil(
          `update foodInstant_add SET value='${value}' where foodinstantAdd_id='${foodinstantAdd_detail[0].foodInstantAdd_id}' AND challenge_Id = '${challenge_Id}' AND challengePredefined_Id = '${challengePredefined_Id}'`
        );
        //-------------------------------------------------------------CurrentData-----------------------------------------
        let foodInstant_list = await ConnectionUtil(
          `select foodInstant_id,food_name,image,colour from foodInstant_list`
        );
        let foodlist_arr = [];
        let foodInstantLog = 0;
        for (let foodlist of foodInstant_list) {
          let foodinstantAdd_detail = await ConnectionUtil(
            `select * from foodInstant_add where foodInstant_id='${foodlist.foodInstant_id}' AND user_Id='${user_Id}' AND DATE_FORMAT(date, '%Y-%m-%d') =DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND challenge_Id = '${challenge_Id}' AND challengePredefined_Id = ${challengePredefined_Id}`
          );
          let foodInstantValueArr = await ConnectionUtil(
            `select * from foodInstant_add where foodInstant_id='${foodlist.foodInstant_id}' AND user_Id='${user_Id}' AND DATE_FORMAT(date, '%Y-%m-%d') =DATE_FORMAT(CURDATE(),'%Y-%m-%d')  AND foodLog_cat = ${foodLog_cat}`
          );

          for (let resp of foodInstantValueArr) {
            if (foodInstantValueArr.length > 0) {
              foodInstantLog += resp.value;
            }
          }

          foodlist.value =
            foodinstantAdd_detail.length > 0
              ? foodinstantAdd_detail[0].value
              : 0;

          foodlist.value2 = foodInstantValueArr.length > 0 ? foodInstantLog : 0;

          foodlist_arr.push(foodlist);
        }
        //--------------------------------------------------------------totalData --------------------------------------
        let foodinstantAdd_detailArr = await ConnectionUtil(
          `select * from foodInstant_add where foodInstant_id = '${foodInstant_id}' AND user_Id= '${user_Id}' AND challenge_Id = '${challenge_Id}' AND challengePredefined_Id = ${challengePredefined_Id}`
        );
        let val = 0;
        let foodinstant_total = [];

        for (let i = 0; i <= foodinstantAdd_detailArr.length - 1; i++) {
          let foodinstantAdd_detailArr1 = await ConnectionUtil(
            `select * from foodInstant_add where foodInstant_id = '${foodInstant_id}' AND user_Id= '${user_Id}' AND challenge_Id = '${challenge_Id}'`
          );
          val += foodinstantAdd_detailArr1[i].value;
        }
        let tempObj = {
          user_Id,
          foodInstant_id,
          value2: val,
        };

        foodinstant_total.push(tempObj);
        let obj = {
          foodinstant_currentdate: foodlist_arr,
          foodinstant_total,
        };
        res.status(200).json({
          success: true,
          message: "foodInstant add update",
          data: obj, //foodInstantAdd_update
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
// ------------------------- food_category -----------------------------------
module.exports.food_category = async (req, res) => {
  try {
    let foodCategory = await ConnectionUtil(
      `select foodcategory_id,food_name,calories from food_category where catId='0'`
    );

    res.status(200).json({
      success: true,
      message: "food Category list",
      data: foodCategory,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ------------------------- food_Subcategory -------------------------------
module.exports.food_Subcategory = async (req, res) => {
  try {
    let foodSub_category = await ConnectionUtil(
      `select foodcategory_id,food_name,calories from food_category where catId='1'`
    );
    res.status(200).json({
      success: true,
      message: "food Subcategory list",
      data: foodSub_category,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports.deviceToken = async (req, res) => {
  try {
    let data = await ConnectionUtil(
      `select distinct(device_Token) from fcm_Notification`
    );

    let fcm_tokens = data.map((item) => {
      return item.device_Token != null &&
        item.device_Token != undefined &&
        item.device_Token != ""
        ? item.device_Token
        : "d8QyFhQqRAy6Y6UyYaOXwm:APA91bEJqszHm-HQBrkpiinDrjVY_FLLSgljSIIhWw4u5kgyVq2rgzujK0arnIL_drErnh_8JbvGbMErh0OgT8Sqx6LlONGsdQzgBn-HuNfZ4aRtPhwu6SC8Dsqq9XxS-9xdCMuRSWtX";
    });

    // console.log(fcm_tokens)
    pushNotification(fcm_tokens);
    res.status(200).json({
      fcm_tokens,
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

function pushNotification(fcm_tokens) {
  var notification = {
    title: "Session time out",
  };

  // var fcm_tokens = [
  //    'cxxlFK5sRQyQURa33A1UOu:APA91bGkmREpAPFQAq8Ei86ZQC_PTkloIc8rWLKGbOSSvfj2LD4KgpMnsC1k6Q0xxECfcXDMaRYEGsHQ_Sg1O5SioVMiN71WzURROEZEGWqPeQhXf8-rDja35qobyy6oBNb7fxskgFHX',
  //      'd8QyFhQqRAy6Y6UyYaOXwm:APA91bEJqszHm-HQBrkpiinDrjVY_FLLSgljSIIhWw4u5kgyVq2rgzujK0arnIL_drErnh_8JbvGbMErh0OgT8Sqx6LlONGsdQzgBn-HuNfZ4aRtPhwu6SC8Dsqq9XxS-9xdCMuRSWtX',
  //    ]

  var notification_body = {
    notification: notification,
    registration_ids: fcm_tokens,
  };

  notificationSend(notification_body);
}

function notificationSend(notification_body) {
  fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      // replace authorization key with your key
      Authorization:
        "key=" +
        "AAAAlYXydjI:APA91bE2pV3pHNvBkgtImOd7iQDr5EIFjl_1sX-QWlpvhTCws2jSoOWXLustHReG2ZqVLAHJ8ac8b82uoRTdBXEYtX6Je5s1t02J8jejLRHgWE0dQsPL4a04FjRlFQ7I2Yi8F6sILEMN",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notification_body),
  })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.error(error);
    });
}

// cron.schedule('29 22 * * *', () => {
//   console.log('Running a job at 11:59 pm  at Asia/kolkata');
//   notificationSend(notification_body)
// }, {
//   scheduled: true,
//   timezone: "America/Los_Angeles"
// });

module.exports.durationMaintain = async (req, res) => {
  try {
    let { id, company_id } = req.user;
    let { duration, date, time } = req.body;
    let durationObject = {
      user_id: id,
      company_id,
      duration,
      date,
      time,
    };
    let checkDuration = await ConnectionUtil(
      `select * from duration_maintain where user_id='${id}' and company_id ='${company_id}' and date ='${date}'`
    );
    if (checkDuration.length > 0) {
      if (checkDuration[0].date == date && time <= "23:59:00") {
        const a = moment.duration(checkDuration[0].duration);
        const b = moment.duration(duration);
        const c = a.add(b);
        let updatedDuration = c.hours() + ":" + c.minutes() + ":" + c.seconds();

        let duration_maintain_update = await ConnectionUtil(
          `update duration_maintain set duration ='${updatedDuration}' ,time='${time}' where user_id='${id}' and company_id ='${company_id}' and date ='${date}'
      `
        );
      } else {
        let duration_maintain_insert = await ConnectionUtil(
          `INSERT INTO duration_maintain SET ?`,
          durationObject
        );
      }
    } else {
      let duration_maintain_insert = await ConnectionUtil(
        `INSERT INTO duration_maintain SET ?`,
        durationObject
      );
    }

    res.status(200).json({
      success: true,
      message: "Duration Inserted Successfully",
      data: "",
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// module.exports.averageDuration = async (req, res) => {
//   try {
//     let checkDuration = await ConnectionUtil(`select * from duration_maintain`);
//     let totalHours = 0;
//     for (let i = 0; i < checkDuration.length; i++) {
//       parts = checkDuration[i].duration.split(":");

//       hours = parseInt(parts[0]) * 3600000;
//       minutes = parseInt(parts[1]) * 60000;
//       seconds = parseInt(parts[2]) * 1000;
//       totalHours += hours + minutes + seconds;
//     }
//     let total = totalHours / 3600000;
//     let average = total / checkDuration.length;

//     res.status(200).json({
//       success: true,
//       message: "Average Duration Showed Successfully In hour's",
//       data: average,
//     });
//   } catch (err) {
//     console.log(err.message);
//     res.status(400).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

