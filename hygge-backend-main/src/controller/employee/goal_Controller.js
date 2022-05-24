const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let moment = require("moment");
const { json } = require("body-parser");
let { helperNotification } = require("../../lib/helpers/fcm");

//------------------------- current_BodyMeasurement -------------------------------------
module.exports.current_BodyMeasurement = async (req, res) => {
  try {
    let { user_Id, company_Id } = req.body;
    let userDetail = await ConnectionUtil(
      `select Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0) as age ,gender from  user where user_Id='${user_Id}'`
    );
    let height = await ConnectionUtil(
      `select * from  user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='${8}'`
    );
    let weight = await ConnectionUtil(
      `select * from  user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='${9}'`
    );
    console.log(weight)
    let waistSize = await ConnectionUtil(
      `select * from  user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='${10}'`
    );
    let hipSize = await ConnectionUtil(
      `select * from  user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='${11}'`
    );

    let heightHRARange = await ConnectionUtil(
      `select sliderOption from health_Risk_Questions_Details where healthQuestions_id='${8}'`
    );
    let weightHRARange = await ConnectionUtil(
      `select sliderOption from health_Risk_Questions_Details where healthQuestions_id='${9}'`
    );
    let waistSizeHRARange = await ConnectionUtil(
      `select sliderOption from health_Risk_Questions_Details where healthQuestions_id='${10}'`
    );
    let hipSizeHRARange = await ConnectionUtil(
      `select sliderOption from health_Risk_Questions_Details where healthQuestions_id='${11}'`
    );
    let bmi_heightwieght = await ConnectionUtil(
      `SELECT * FROM activity_heightweight WHERE height_cm = ${parseInt(
        height[0].options
      )} AND ${parseFloat(weight[0].options)} BETWEEN weight_from AND weight_to`
    );
    let optionArr = [
      {
        answerKey:
          bmi_heightwieght[0].length != ""
            ? bmi_heightwieght[0].value.trim()
            : "", //weight.length > 0 ? parseFloat(weight[0].options) : 0,
        answerKey_weight:
          bmi_heightwieght[0].length != "" ? bmi_heightwieght[0].weight_to : "", //weight.length > 0 ? parseFloat(weight[0].options) : 0,
        healthQuestions_Id: 0,
        keyName: "heightToweight_ageChart",
        optionRange: '{"left": 0, "label": "", "right": 100}',
      },
      {
        answerKey: height.length > 0 ? parseFloat(height[0].options) : 0,
        healthQuestions_Id: 8,
        keyName: "height",
        optionRange: heightHRARange[0].sliderOption,
      },
      {
        answerKey: weight.length > 0 ? parseFloat(weight[0].options) : 0,
        healthQuestions_Id: 9,
        keyName: "weight",
        optionRange: weightHRARange[0].sliderOption,
      },
      {
        answerKey: waistSize.length > 0 ? parseFloat(waistSize[0].options) : 0,
        healthQuestions_Id: 10,
        keyName: "waist",
        optionRange: waistSizeHRARange[0].sliderOption,
      },
      {
        answerKey: hipSize.length > 0 ? parseFloat(hipSize[0].options) : 0,
        healthQuestions_Id: 11,
        keyName: "hip",
        optionRange: hipSizeHRARange[0].sliderOption,
      },
      {
        answerKey:
          userDetail.length > 0 && userDetail[0].age != null
            ? userDetail[0].age
            : 0,
        healthQuestions_Id: 0,
        keyName: "age",
        optionRange: '{"left": 0, "label": "", "right": 100}',
      },
      {
        answerKey:
          userDetail.length > 0 && userDetail[0].gender != null
            ? userDetail[0].gender
            : "",
        healthQuestions_Id: 0,
        keyName: "gender",
        optionRange: '{"left": 0, "label": "", "right": 100}',
      },
    ];
    res.status(200).json({
      success: true,
      message: "current body measrement list",
      data: optionArr,
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

//------------------------- current_BodyMeasurement -------------------------------------
module.exports.desired_BodyMeasurement = async (req, res) => {
  try {
    let { user_Id, company_Id, healthQuestions_Id, options, ip_Address } =
      req.body;
    let selectDesiredMeasurement = await ConnectionUtil(
      `select * from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='${healthQuestions_Id}'`
    );
    if (selectDesiredMeasurement.length > 0) {
      let updateDesiredMeasurement = await ConnectionUtil(
        `Update user_hrasubmission set updated_By='${user_Id}' , options='${options}' , ip_Address='${ip_Address}' where healthQuestions_Id='${healthQuestions_Id}' AND user_Id = '${user_Id}'`
      );
      res.status(200).json({
        success: true,
        message: "Desired body measrement update",
        data: updateDesiredMeasurement,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "HRA submission data not found",
        data: [],
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

//------------------------- show_Goal -------------------------
module.exports.show_Goal = async (req, res) => {
  try {
    let { coachingcat_Id } = req.body;
    let { id, company_id } = req.user;

    let newArrGoal = [];
    let goals = await ConnectionUtil(
      `select * from coachingprogram_goals where coachingcat_Id='${coachingcat_Id}' AND isActive='1'`
    );
    let userGoalsSelectQuery = await ConnectionUtil(
      `select * from userassign_programgoals where user_Id='${id}' AND coachingcat_Id='${coachingcat_Id}'`
    );
    if (userGoalsSelectQuery.length == 0) {
      for (let goalsObj of goals) {
        goalsObj.isGoal =
          goalsObj.weekAlloted == 1 || goalsObj.weekAlloted == 2 ? 1 : 0;
        goalsObj.isGoalAccept = 0;
        newArrGoal.push(goalsObj);
      }
      let can_submit = [];
      for (let submit of newArrGoal) {
        submit.cansubmit = false;
        can_submit.push(submit);
      }
      res.status(200).json({
        success: true,
        message: "Show goals data",
        data: can_submit, //newArrGoal,
        submit_week: [],
      });
    } else {
      for (let goalsObj of goals) {
        let userProgramgoalsSelectQuery = await ConnectionUtil(
          `select * from userassign_programgoals where user_Id='${id}' AND  programGoal_Id='${goalsObj.programGoal_id}'  AND isGoalAccept=1`
        );
        if (userProgramgoalsSelectQuery.length > 0) {
          goalsObj.isGoal = 1;
          goalsObj.isGoalAccept = 1;
        } else {
          let goal_active = await userGoalsSelectQuery.filter((data) => {
            return data.weekId == goalsObj.weekId;
          });
          let startGoalTocheckTwo = await ConnectionUtil(
            `select * from user_goalsubmit where status='0' AND user_ID='${id}' ORDER BY userStart_id  DESC`
          );

          if (goal_active.length > 0) {
            goalsObj.isGoal = 1;
            goalsObj.isGoalAccept = 0;
          } else if (
            startGoalTocheckTwo.length > 0 &&
            startGoalTocheckTwo[0].weekId + 1 == goalsObj.weekId
          ) {
            goalsObj.isGoal = 1;
            goalsObj.isGoalAccept = 0;
          } else {
            goalsObj.isGoal = 0;
            goalsObj.isGoalAccept = 0;
          }
        }
        newArrGoal.push(goalsObj);
      }
      let submit_user = await ConnectionUtil(
        `select * from user_goalsubmit where  coachingcat_Id='${coachingcat_Id}' AND  user_Id='${id}'`
      );
      let can_submit = [];
      for (let submit of newArrGoal) {
        // datediff(CURRENT_DATE, start_date)<15 AND
        let val =
          await ConnectionUtil(`select datediff(CURRENT_DATE, start_date),start_date,weekId from user_goalsubmit where  
            status=1 AND  
             coachingcat_Id='${coachingcat_Id}' AND user_Id='${id}' AND weekId='${submit.weekId}'`);
        if (val.length > 0) {
          submit.cansubmit = true;
        } else {
          submit.cansubmit = false;
        }
        can_submit.push(submit);
      }
      res.status(200).json({
        success: true,
        message: "Show goals data",
        data: can_submit, //newArrGoal ,
        submit_week: submit_user,
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

//------------------------- show_Goal -------------------------
module.exports.goal_Toggle = async (req, res) => {
  try {
    let { programGoal_Id, coachingcat_Id, isGoalAccept, weekId } = req.body;
    let { id, company_id } = req.user;
    let catId = [];
    let userProgramgoals = await ConnectionUtil(
      `select * from userassign_programgoals where user_Id='${id}' AND  coachingcat_Id='${coachingcat_Id}' AND weekId='${weekId}' AND isGoalAccept=1`
    );
    if (userProgramgoals.length >= 2) {
      let userGoal = await ConnectionUtil(
        `select * from userassign_programgoals where user_Id='${id}' AND  weekId=${weekId} AND isGoalAccept=1`
      );
      if (userGoal.length > 0) {
        userGoal.map((data) => {
          catId.push(data.assignGoal_id);
        });
      }
      res.status(400).json({
        success: false,
        message: "Two Goals already exist",
        data: catId,
      });
    } else {
      let userAssignProgramgoals = await ConnectionUtil(
        `select * from userassign_programgoals where user_Id='${id}' AND  programGoal_Id='${programGoal_Id}' AND isGoalAccept = 1`
      );
      if (isGoalAccept == 0) {
        let deleteData = await ConnectionUtil(
          `update  userassign_programgoals set isGoalAccept='0' where user_Id='${id}' AND  programGoal_Id='${programGoal_Id}'`
        );
        let userGoal = await ConnectionUtil(
          `select * from userassign_programgoals where user_Id='${id}' AND  weekId=${weekId} AND isGoalAccept=1`
        );
        if (userGoal.length > 0) {
          userGoal.map((data) => {
            catId.push(data.assignGoal_id);
          });
        }
        res.status(200).json({
          success: true,
          message: "Goals deactive",
          data: catId,
        });
      } else {
        if (userAssignProgramgoals.length == 0) {
          let goalsProgramTocheck = await ConnectionUtil(
            `select * from userassign_programgoals where   weekId='${weekId}' AND programGoal_Id='${programGoal_Id}' `
          );
          if (goalsProgramTocheck.length == 0) {
            let obj = {
              programGoal_Id: programGoal_Id,
              coachingcat_Id: coachingcat_Id,
              isGoalAccept: isGoalAccept,
              user_Id: id,
              company_Id: company_id,
              weekId: weekId,
            };
            let programGoalsInsertQuery = await ConnectionUtil(
              `INSERT INTO userassign_programgoals SET?`,
              obj
            );

            if (programGoalsInsertQuery.affectedRows != 0) {
              let goalsProgram = await ConnectionUtil(
                `select * from coachingprogram_goals where   weekId='${weekId}' AND programGoal_Id!='${programGoal_Id}' AND isActive='1'`
              );
              for (let goalByUser of goalsProgram) {
                let obj = {
                  programGoal_Id: goalByUser.programGoal_id,
                  coachingcat_Id: coachingcat_Id,
                  isGoalAccept: 0,
                  user_Id: id,
                  company_Id: company_id,
                  weekId: weekId,
                };
                let programGoalsInsertQuery = await ConnectionUtil(
                  `INSERT INTO userassign_programgoals SET?`,
                  obj
                );
              }
              let userGoal = await ConnectionUtil(
                `select * from userassign_programgoals where user_Id='${id}' AND  weekId=${weekId} AND isGoalAccept=1`
              );
              if (userGoal.length > 0) {
                userGoal.map((data) => {
                  catId.push(data.assignGoal_id);
                });
              }
              res.status(200).json({
                success: true,
                message: "Goals accept successfully",
                data: catId,
              });
            }
          } else {
            let programGoalsUpdateQuery =
              await ConnectionUtil(`update userassign_programgoals SET isGoalAccept='1' where programGoal_Id= '${programGoal_Id}'AND coachingcat_Id='${coachingcat_Id}'
                    `);
            let userGoal = await ConnectionUtil(
              `select * from userassign_programgoals where user_Id='${id}' AND  weekId=${weekId} AND isGoalAccept=1`
            );
            if (userGoal.length > 0) {
              userGoal.map((data) => {
                catId.push(data.assignGoal_id);
              });
            }
            res.status(200).json({
              success: true,
              message: "Goals accept successfully",
              data: catId,
            });
          }
        } else {
          let userGoal = await ConnectionUtil(
            `select * from userassign_programgoals where user_Id='${id}' AND  weekId=${weekId} AND isGoalAccept=1`
          );
          if (userGoal.length > 0) {
            userGoal.map((data) => {
              catId.push(data.assignGoal_id);
            });
          }
          res.status(200).json({
            success: true,
            message: "Goals already exits",
            data: catId,
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

//------------------------- start_Goal -------------------------
module.exports.goal_Start = async (req, res) => {
  try {
    let { goal_Id, start_date, weekId } = req.body; //goal_Id
    // let goal_Id=[];
    let { id, company_id } = req.user;
    let catId = [];
    if (goal_Id.length == 0) {
      let userGoal = await ConnectionUtil(
        `select * from userassign_programgoals where user_Id='${id}' AND  weekId=${weekId} AND isGoalAccept=1`
      );
      if (userGoal.length > 0) {
        userGoal.map((data) => {
          goal_Id.push(data.assignGoal_id);
        });
      }
    }
    if (goal_Id.length == 0) {
      res.status(404).json({
        success: false,
        message: "Goal Id is required",
        data: [],
      });
    } else if (start_date == "") {
      res.status(404).json({
        success: false,
        message: "start Date is required",
        data: [],
      });
    } else {
      let active_user = await ConnectionUtil(
        `select * from user_goalsubmit where user_Id='${id}' AND status='1' `
      );
      if (active_user.length == 0) {
        if (goal_Id.length == 2) {
          let userGoalProgram = await ConnectionUtil(
            `select weekId,coachingcat_Id from userassign_programgoals where assignGoal_id  IN(${goal_Id}) GROUP BY weekId `
          );
          for (let user of userGoalProgram) {
            let obj = {
              start_date: start_date,
              user_Id: id,
              company_Id: company_id,
              coachingcat_Id: user.coachingcat_Id,
              weekId: user.weekId,
            };
            let programGoalsInsertQuery = await ConnectionUtil(
              `INSERT INTO user_goalsubmit SET?`,
              obj
            );
          }

          res.status(200).json({
            success: true,
            message: "Goals started successfully",
            data: [],
          });
        } else {
          res.status(404).json({
            success: true,
            message: "Please select atleat two goal",
            data: [],
          });
        }
      } else {
        res.status(404).json({
          success: true,
          message: "Already One on going",
          data: [],
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

//------------------------- submit_Goal -------------------------
module.exports.goal_Submit = async (req, res) => {
  try {
    let { submit_date } = req.body;
    let { id, company_id } = req.user;
    let programGoals = await ConnectionUtil(
      `select  datediff(CURRENT_DATE(), start_date) as day  from user_goalsubmit  where  status =1 AND datediff(CURRENT_DATE(), start_date)<=15 AND user_Id='${id}'`
    );
    if (programGoals.length == 0) {
      let programGoalsUpdateQuery = await ConnectionUtil(
        `Update user_goalsubmit set status='0',end_date='${submit_date}' where status='1' AND user_Id='${id}'`
      );

      await goalAchivedChallenge(id, company_id);

      if (programGoalsUpdateQuery.affectedRows != 0) {
        res.status(200).json({
          success: true,
          message: "Goal submit successfully",
          data: [],
        });
      }
    } else {
      let programGoals = await ConnectionUtil(
        `select  datediff(CURRENT_DATE(), start_date) as day from user_goalsubmit  where status =1 AND user_Id='${id}'`
      );
      res.status(400).json({
        success: true,
        message: "Goal is Incomplete!",
        data: [],
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

//------------------------- goal_DailyStatus -------------------------
module.exports.goal_DailyStatus = async (req, res) => {
  try {
    let { current_date, day_status } = req.body;
    let { id, company_id } = req.user;

    let programGoalsSelectQuery = await ConnectionUtil(
      `select userStart_id,weekId,coachingcat_Id,COALESCE(DATEDIFF(CURDATE(),start_date),0) as day ,COALESCE(COUNT(*),0) as count from user_goalsubmit where status='1' AND user_Id='${id}' group by userStart_id ,weekId , coachingcat_Id , start_date `
    );

    if (programGoalsSelectQuery.length == 0) {
      res.status(200).json({
        success: false,
        message: "Please goal start first",
        data: [],
      });
    } else {
      let userGoalsSelectQuery = await ConnectionUtil(
        `select *  from user_goaldailystatus where coachingcat_Id='${programGoalsSelectQuery[0].coachingcat_Id}' AND  userStart_Id='${programGoalsSelectQuery[0].userStart_id}'AND user_Id='${id}'`
      );
      let day = programGoalsSelectQuery[0].day + 1;
      if (day_status <= day) {
        let obj = {
          user_Id: id,
          weekId: programGoalsSelectQuery[0].weekId,
          coachingcat_Id: programGoalsSelectQuery[0].coachingcat_Id,
          current_date: current_date,
          company_Id: company_id,
          userStart_Id: programGoalsSelectQuery[0].userStart_id,
          day_status: day_status,
        };
        let userGoalDailyStatus = await ConnectionUtil(
          `INSERT INTO user_goaldailystatus SET?`,
          obj
        );
        res.status(200).json({
          success: true,
          message: "Goal status updated successfully",
          data: userGoalDailyStatus,
        });
      } else {
        console.log(userGoalsSelectQuery.length, day, "SSSSSSSSSSSSSSSSSSSSSS");
        res.status(404).json({
          success: false,
          message: "goal tick next day",
          data: [],
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};
//coachingprogram_goals
//------------------------- goal_DailyStatus -------------------------
module.exports.showGoal_DailyStatus = async (req, res) => {
  try {
    let { id, company_id } = req.user;
    let programGoalsSelectQuery = await ConnectionUtil(
      `select * from user_goalsubmit where status='1' AND user_Id='${id}'`
    );
    if (programGoalsSelectQuery.length > 0) {
      let dailyStatusGoalsSelectQuery = await ConnectionUtil(
        `select * from user_goaldailystatus where  user_Id='${id}' AND userStart_Id = '${programGoalsSelectQuery[0].userStart_id}'`
      );
      console.log(programGoalsSelectQuery[0].userStart_id);
      res.status(200).json({
        success: true,
        message: "Show goal daliy successfully",
        data: dailyStatusGoalsSelectQuery,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Goal not started",
        data: [],
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

// Heart Healthy - 25 to 36 - weekId(5,6,7) - weekAlloted(1,2,3,4,5,6) - 3 levels (1 level =  2 week = 4 goal)

// Diabetes - 37 to 48 - weekID(8,9,10) - weekAlloted(1,2,3,4,5,6) -3 levels (1 level =  2 week = 4 goal)

// Sleep - 49 to 60 - weekID(11,12,13) - weekAlloted(1,2,3,4,5,6) -3 levels (1 level =  2 week = 4 goal)

// Anti - Innflammatory - 1 to 16 - weekID(1,2,3,4) - weekAlloted(1,2,3,4,5,6,7,8) - 4 levels (1 level =  2 week = 4 goal)

// Energy - 61 to 68 - weekID(14,15) - weekAlloted(1,2,3,4) -2 levels (1 level =  2 week = 4 goal)

// Weight Loss - 69 to 84 - weekID(16,17,18,19) - weekAlloted(1,2,3,4,5,6,7,8) -4 levels (1 level =  2 week = 4 goal)

// Stress - 85 to 96 - weekID(20,21,22) - weekAlloted(1,2,3,4,5,6) -3 levels (1 level =  2 week = 4 goal)

// Beginner - weekAlloted_1 and weekAlloted_2
// Challenge Pro - weekAlloted_3 and weekAlloted_4
// Fit Fantic - weekAlloted_5 and weekAlloted_6
// Fit Fantic - weekAlloted_7 and weekAlloted_8

//--------------------------------------showActiveGoal -----------------------------
module.exports.showActiveGoal = async (req, res) => {
  let { company_Id } = req.query;
  let { id, company_id } = req.user;
  console.log(id);
  try {
    let tempArr = [];
    let programGoals = await ConnectionUtil(
      `select * from userassign_programgoals where user_Id = '${id}' and isGoalAccept = 1 and company_Id = ${company_id}`
    );

    // console.log(goalStart)

    let goalCount = programGoals.length;
    let weekAllotedArray = [];
    let x = [];

    tempArr.count = goalCount;
    tempArr.goal_id = x;
    tempArr.user_id = id;
    // tempArr.isGoalStart = isGoalStart;

    tempArr.push({
      activeCountDetails: {
        user_id: tempArr.user_id,
        totalGoalCount: tempArr.count,
        assignGoal_id: tempArr.goal_id,
        // isGoalStart : tempArr.isGoalStart
      },
    });

    let weekSubmit = [];

    let arr1 = [];
    let arr2 = [];
    let arr3 = [];
    let arr4 = [];
    let arr5 = [];
    let arr6 = [];
    let arr7 = [];

    for (let data of programGoals) {
      let weekAllotedArr = await ConnectionUtil(
        `SELECT * FROM coachingprogram_goals WHERE programGoal_id = (${data.programGoal_Id})`
      );

      weekAllotedArray.push(weekAllotedArr[0].weekAlloted);

      let goal_name = weekAllotedArr[0].goal_name;
      let weekAlloted = weekAllotedArr[0].weekAlloted;
      let status = weekAllotedArr[0].status;
      let weekId = weekAllotedArr[0].weekId;
      let coachingcat_Id = weekAllotedArr[0].coachingcat_Id;
      let programGoal_Id = data.programGoal_Id;
      let isGoalAccept = data.isGoalAccept;
      let assignGoal_id = data.assignGoal_id;

      let goalStart = await ConnectionUtil(
        `select * from user_goalsubmit where user_Id = ${id} and weekId = ${weekId} and company_Id = ${company_id}`
      );

      let isGoalStart = goalStart.length > 0 ? 1 : 0;

      x.push(data.assignGoal_id);
      let obj = {
        assignGoal_id,
        goal_name,
        weekAlloted,
        status,
        weekId,
        coachingcat_Id,
        programGoal_Id,
        isGoalAccept,
        isGoalStart,
      };

      let canSubmitArr = await ConnectionUtil(
        `select distinct day_status from user_goaldailystatus where user_Id = ${id} and weekId = ${weekId} and company_Id = ${company_id}`
      );

      let canSubmit = canSubmitArr.length >= 14 ? 1 : 0;

      var week_1 = weekId == 1 ? canSubmit : 0;
      var week_2 = weekId == 2 ? canSubmit : 0;
      var week_3 = weekId == 3 ? canSubmit : 0;
      var week_4 = weekId == 4 ? canSubmit : 0;
      var week_5 = weekId == 5 ? canSubmit : 0;
      var week_6 = weekId == 6 ? canSubmit : 0;
      var week_7 = weekId == 7 ? canSubmit : 0;
      var week_8 = weekId == 8 ? canSubmit : 0;
      var week_9 = weekId == 9 ? canSubmit : 0;
      var week_10 = weekId == 10 ? canSubmit : 0;
      var week_11 = weekId == 11 ? canSubmit : 0;
      var week_12 = weekId == 12 ? canSubmit : 0;
      var week_13 = weekId == 13 ? canSubmit : 0;
      var week_14 = weekId == 14 ? canSubmit : 0;
      var week_15 = weekId == 15 ? canSubmit : 0;
      var week_16 = weekId == 16 ? canSubmit : 0;
      var week_17 = weekId == 17 ? canSubmit : 0;
      var week_18 = weekId == 18 ? canSubmit : 0;
      var week_19 = weekId == 19 ? canSubmit : 0;
      var week_20 = weekId == 20 ? canSubmit : 0;
      var week_21 = weekId == 21 ? canSubmit : 0;
      var week_22 = weekId == 22 ? canSubmit : 0;

      if (
        weekId == 1 ||
        weekId == 2 ||
        weekId == 3 ||
        (weekId == 4 && isGoalAccept == 1)
      ) {
        arr1.push(obj);
      }
      if (weekId == 5 || weekId == 6 || (weekId == 7 && isGoalAccept == 1)) {
        arr2.push(obj);
      }

      if (weekId == 8 || weekId == 9 || (weekId == 10 && isGoalAccept == 1)) {
        arr3.push(obj);
      }
      if (weekId == 11 || weekId == 12 || (weekId == 13 && isGoalAccept == 1)) {
        arr4.push(obj);
      }
      if (weekId == 14 || (weekId == 15 && isGoalAccept == 1)) {
        arr5.push(obj);
      }
      if (
        weekId == 16 ||
        weekId == 17 ||
        weekId == 18 ||
        (weekId == 19 && isGoalAccept == 1)
      ) {
        arr6.push(obj);
      }
      if (weekId == 20 || weekId == 21 || (weekId == 22 && isGoalAccept == 1)) {
        arr7.push(obj);
      }
    }

    tempArr.push({ weekAlloted_1: arr1 });
    tempArr.push({ weekAlloted_2: arr2 });
    tempArr.push({ weekAlloted_3: arr3 });
    tempArr.push({ weekAlloted_4: arr4 });
    tempArr.push({ weekAlloted_5: arr5 });
    tempArr.push({ weekAlloted_6: arr6 });
    tempArr.push({ weekAlloted_7: arr7 });

    res.status(200).json({
      success: true,
      message: "Active Goal id ",
      weekSubmit: {
        week_1,
        week_2,
        week_3,
        week_4,
        week_5,
        week_6,
        week_7,
        week_8,
        week_9,
        week_10,
        week_11,
        week_12,
        week_13,
        week_14,
        week_15,
        week_16,
        week_17,
        week_18,
        week_19,
        week_20,
        week_21,
        week_22,
      },
      activeCountDetails: tempArr[0].activeCountDetails,
      Anti_Innflammatory: tempArr[1].weekAlloted_1,
      Heart_Healthy: tempArr[2].weekAlloted_2,
      Diabetes: tempArr[3].weekAlloted_3,
      Sleep: tempArr[4].weekAlloted_4,
      Energy: tempArr[5].weekAlloted_5,
      Weight_Loss: tempArr[6].weekAlloted_6,
      Stress: tempArr[7].weekAlloted_7,
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

//------------------------- goal_Content -------------------------
module.exports.goal_Content = async (req, res) => {
  try {
    let { coachingcat_Id } = req.body;
    // coachingcat_Id: 15, coaching_Category: "Weight Loss Program"
    let obj = [
      {
        //Anti-inflammatory
        coachingcat_Id: 13,
        title1: "Immune Booster Program",
        Duration: "12 Weeks",
        paragraph:
          "Take New Steps, Every Two Weeks OR Coach Yourself to Good Health",
        content1:
          "Do you have any specific health goals like losing weight, revving up your metabolism, controlling your sugar intake, keeping your heart healthy, boosting your immune system, improving your sleep or reducing stress? Are you struggling to achieve these goals?Our self-driven coaching programs have been specially designed to help you get S.M.A.R.T. (Specific, Measurable, Attainable, Relevant & Time bound) results via sustainable diet and lifestyle changes. These programs are focused on modifiable risk factors.Certain factors are responsible for the development of chronic lifestyle disorders. Some are non-modifiable, such as age, gender and your family’s medical history. Other factors such as food choices, activity levels, sleep patterns or stress management are modifiable.By breaking down your health goals into simple actionable steps, our programs can help you reduce the risks from modifiable factors.How will you know if a program is working well for you? All our programs have an inbuilt, intuitive tracking system that will help you analyze and monitor the basic pillars of your health like diet, sleep, hydration, physical activity and stress levels",
        question1: "What is Energy Booster program? Is it right for me?",
        answer1: [
          {
            ansKey:
              "Our immune system gets activated when it comes into contact with any foreign body such as an invading microbe, an allergen or even stress. This can trigger the process of inflammation and lead to pain if not managed properly.The Immune Booster program can help you:",
          },
          {
            ansKey:
              "•combat inflammation and manage pain via your kitchen, reducing your reliance on over-the-counter drugs;",
          },
          {
            ansKey:
              "•eliminate food items that increase inflammation and cause related health concerns;",
          },
          {
            ansKey:
              "•identify and consume foods that strengthen the immune system;",
          },
          {
            ansKey:
              "•provide insights on your weight and calorie intake based on BMI;",
          },
          { ansKey: "•make positive lifestyle modifications." },
          { ansKey: "This program is suitable for you if you have:" },
          { ansKey: "any known inflammatory condition like arthritis;" },
          { ansKey: "constant aches and pain;" },
          { ansKey: "body pain that affects your productivity;" },
          { ansKey: "back ache or stiff neck;" },
          { ansKey: "allergies;" },
          {
            ansKey:
              "other associated complaints like bloating, fatigue and tiredness;",
          },
          { ansKey: "stress, depression, mood swings; and/or brain fog." },
        ],
        question2: "How do I follow this program?",
        answer2: [
          { ansKey: "1.Choose between 2-4 goals every 2 weeks." },
          {
            ansKey:
              "2.Meet at least 50% of your bi-weekly goals in order to unlock new weeks.",
          },
          {
            ansKey:
              "3.You can renew previous goals for 2 more weeks but 50% compliance is required to move forward.",
          },
          {
            ansKey:
              "4.Once you unlock more weeks, choose new goals & set reminders again.",
          },
          { ansKey: "5.Track your goals via food logs & activity logs." },
          {
            ansKey:
              "6.Upload pics of your food plates so that the habit graph can depict your performance.",
          },
          {
            ansKey:
              "7.Choose from a list of activities which have the calorie burn estimate/hour. Set daily reminders for your selected time slot.",
          },
          { ansKey: "8.Follow goals daily to develop healthy habits." },
        ],
        title2: "Compliance and Success",
        content2:
          "A graph of your compliance with daily goals, based on your inputs, will help you track your progress.",
        title3: "LET’S GET STARTED",
        title4: "Insert Infographic",
        infographic_image: "Anti_Inflammatory_Infographic.png",
        title5: "Recommendations",
        AvoidPro: [
          { title: "Avoid Pro-inflammatories:" },
          {
            point:
              "1.High-sugar foods causing immunosuppression for 2-4 hrs after eating",
          },
          { point: "2.High-fat foods, especially dairy & animal fat" },
          { point: "3.Food allergens" },
          { point: "4.Emotional stress & toxic relationships" },
          {
            point: "5.Proteins (opt for plant-based)",
          },
        ],
        AddAnti: [
          { title: "Add Anti-inflammatories:" },
          { point: "1.Fibers " },
          { point: "2.Vitamin D" },
          { point: "3.Phytonutrients" },
          { point: "4.Omega-3" },
          { point: "5.Vitamin E" },
          { point: "6.Magnesium" },
          { point: "7.Zinc" },
          { point: "8.Antioxidants" },
          { point: "9.Plant-based proteins" },
          { point: "10.More water" },
        ],
      },
      {
        //Diabetes Program
        coachingcat_Id: 11,
        title1: "Diabetes Program",
        Duration: "6 Weeks",
        paragraph:
          "Take New Steps, Every Two Weeks OR Coach Yourself to Good Health",
        content1:
          "Do you have any specific health goals like losing weight, revving up your metabolism,  detoxing, controlling sugar intake, keeping your heart healthy, boosting immunity, improving sleep or reducing stress? Our self-driven coaching programs will let you set S.M.A.R.T. (Specific, Measurable, Attainable, Relevant & Time bound) health goals. They have been specially designed to help you reduce risks from modifiable factors, such as food choices, activity levels, sleep patterns, etc., which contribute towards the development of chronic lifestyle disorders. Our programs have an inbuilt, intuitive tracking system that will help you monitor your health and transition through the various stages of lifestyle changes: from precontemplation (not acknowledging a problem) to contemplation (acknowledging it) and building readiness; then taking simple, actionable steps towards making and maintaining pro-health changes in your life.",
        question1: "What is Diabetes program? Is it right for me?",
        answer1: [
          {
            ansKey:
              "This program is for you if you are at high risk of developing diabetes because:",
          },
          {
            ansKey: "• you are above 40;",
          },
          {
            ansKey: "•	have a strong family history of diabetes;",
          },
          {
            ansKey:
              "•	are pre-diabetic or have had two or more episodes of high blood glucose consecutively;",
          },
          {
            ansKey:
              "•	have abdominal obesity and high cholesterol levels; and/or",
          },
          {
            ansKey:
              "•	have a sweet tooth and would like to just develop a disciplined lifestyle",
          },
        ],
        question2: "How do I follow this program?",
        answer2: [
          {
            ansKey: "1. Choose between 2-4 goals every 2 weeks.",
          },
          {
            ansKey:
              "2. Meet at least 50% of your bi-weekly goals in order to unlock new weeks.",
          },
          {
            ansKey:
              "3. You can renew previous goals for 2 more weeks but 50% compliance is required to move forward.",
          },
          {
            ansKey:
              "4. Once you unlock more weeks, choose new goals & set reminders again.",
          },
          { ansKey: "5. Track your goals via food logs & activity logs." },
          {
            ansKey:
              "6. Upload pics of your food plates so that the habit graph can depict your performance.",
          },
          {
            ansKey:
              "7. Choose from a list of activities which have the calorie burn estimate/hour. Set daily reminders for your selected time slot.",
          },
          { ansKey: "8. Follow goals daily to develop healthy habits." },
        ],

        title2: "Compliance and Success",
        content2:
          "A graph of your compliance with daily goals, based on your inputs, will help you track your progress.",
        title3: "LET’S GET STARTED",
        title4: "Insert Infographic",
        infographic_image: "diabetes_infographic.png",
        title5: "Recommendations",
        AvoidPro: [
          {
            title:
              "Did you know: in diabetes meal planning,one serving of a food with carbohydrates has about 15 grams of carbohydrates.",
          },
        ],
        Dos: [
          { point: "•	Check serving sizes with measuring cups and spoons." },
          {
            point:
              "•	Read the Nutrition Facts on food labels to find out how many grams of carbohydrates are in the foods you eat.",
          },
          {
            point:
              "•	Count one cup of raw vegetables or 1⁄2 cup of cooked, non-starchy vegetables as zero carbohydrate servings or “free” foods. If you consume three or more servings for one meal, then count them as one carbohydrate serving.",
          },
          {
            point:
              "•	Foods that have less than 20 calories in each serving also may be counted as zero carbohydrate servings or “free” foods.",
          },
          {
            point:
              "•	Count one cup of casserole or other mixed foods as two carbohydrate servings.",
          },
        ],
        Donots: [
          {
            point:
              "•	Remove all sweet, white and processed food items from your diet.",
          },
          {
            point:
              "•	Reduce the use of medications by eating at regular meal times daily.",
          },
          {
            point:
              "•	Psychology: don’t focus on sugar reduction but on adding more flavors and taste adventures.",
          },
        ],
      },
      {
        //Energy Booster Program
        coachingcat_Id: 14,
        title1: "Energy Booster Program",
        Duration: "4 Weeks",
        paragraph:
          "Take New Steps, Every Two Weeks OR Coach Yourself to Good Health",
        content1:
          "Do you have any specific health goals like losing weight, revving up your metabolism,  detoxing, controlling sugar intake, keeping your heart healthy, boosting immunity, improving sleep or reducing stress? Our self-driven coaching programs will let you set S.M.A.R.T. (Specific, Measurable, Attainable, Relevant & Time bound) health goals. They have been specially designed to help you reduce risks from modifiable factors, such as food choices, activity levels, sleep patterns, etc., which contribute towards the development of chronic lifestyle disorders. Our programs have an inbuilt, intuitive tracking system that will help you monitor your health and transition through the various stages of lifestyle changes: from precontemplation (not acknowledging a problem) to contemplation (acknowledging it) and building readiness; then taking simple, actionable steps towards making and maintaining pro-health changes in your life.",
        question1: "What is Energy Booster program? Is it right for me?",
        answer1: [
          {
            ansKey:
              "This program focuses on boosting energy and improving metabolism through the use of therapeutic foods. It’s suitable for you if you:",
          },
          {
            ansKey: "•	struggle with fatigue and lethargy;",
          },
          {
            ansKey: "•	have to nearly always pull yourself out of bed;",
          },
          {
            ansKey: "•	feel tired after doing the simplest of tasks;",
          },
          { ansKey: "•	feel your energy levels drop by midday; and" },
          { ansKey: "•	feel clouded and brain fogged often" },
        ],

        question2: "How do I follow this program?",
        answer2: [
          {
            ansKey: "1. Choose between 2-4 goals every 2 weeks.",
          },
          {
            ansKey:
              "2. Meet at least 50% of your bi-weekly goals in order to unlock new weeks.",
          },
          {
            ansKey:
              "3. You can renew previous goals for 2 more weeks but 50% compliance is required to move forward.",
          },
          {
            ansKey:
              "4. Once you unlock more weeks, choose new goals & set reminders again.",
          },
          { ansKey: "5. Track your goals via food logs & activity logs." },
          {
            ansKey:
              "6. Upload pics of your food plates so that the habit graph can depict your performance.",
          },
          {
            ansKey:
              "7. Choose from a list of activities which have the calorie burn estimate/hour. Set daily reminders for your selected time slot.",
          },
          { ansKey: "8. Follow goals daily to develop healthy habits." },
        ],
        title2: "Compliance and Success",
        content2:
          "A graph of your compliance with daily goals, based on your inputs, will help you track your progress.",
        title3: "LET’S GET STARTED",
        title4: "Insert Infographic",
        infographic_image: "diabetes_infographic.png",
        title5: "Recommendations",
        AvoidPro: [
          { title: "Add Energy Boosters" },
          { point: "•	Exercise" },
          {
            point:
              "•	Foods: Complex carbs, healthy fats and proteins (oatmeal, eggs, beans, chicken, sardines, walnuts, etc.)",
          },
          { point: "•	Good quality sleep / power naps" },
          { point: "•	Power snacks (protein and some fiber with a little fat)" },
          {
            point: "•	Water",
          },
        ],
        AddAnti: [
          { title: "Eliminate Energy Drainers" },
          {
            point:
              "•	Foods: Fried/fast food, fizzy drinks, pasta, white bread, rice, etc.",
          },
          { point: "•	Procrastination" },
          { point: "•	Smoking" },
          { point: "•	Stress" },
          { point: "•	Toxic people & environments" },
          { point: "•	Unexpressed emotions" },
          { point: "•	Unhealthy thought patterns" },
        ],
      },
      {
        //Heart Health Program
        coachingcat_Id: 10,
        title1: "Heart Health Program",
        Duration: "6 Weeks",
        paragraph:
          "Take New Steps, Every Two Weeks OR Coach Yourself to Good Health",
        content1:
          "Do you have any specific health goals like losing weight, revving up your metabolism,  detoxing, controlling sugar intake, keeping your heart healthy, boosting immunity, improving sleep or reducing stress? Our self-driven coaching programs will let you set S.M.A.R.T. (Specific, Measurable, Attainable, Relevant & Time bound) health goals. They have been specially designed to help you reduce risks from modifiable factors, such as food choices, activity levels, sleep patterns, etc., which contribute towards the development of chronic lifestyle disorders. Our programs have an inbuilt, intuitive tracking system that will help you monitor your health and transition through the various stages of lifestyle changes: from precontemplation (not acknowledging a problem) to contemplation (acknowledging it) and building readiness; then taking simple, actionable steps towards making and maintaining pro-health changes in your life.",
        question1: "What is Heart Health program? Is it right for me?",
        answer1: [
          {
            ansKey:
              "This program is focused on reducing the risk of developing heart diseases by addressing modifiable risk factors such as high cholesterol and elevated blood fats, high blood glucose, high blood pressure, increased belly fat, etc.",
          },
          {
            ansKey:
              "This program is for you if want to fight metabolic diseases by:",
          },
          {
            ansKey: "•	adopting a well-rounded lifestyle;",
          },
          {
            ansKey: "•	adding therapeutic foods to your diet; and",
          },
          {
            ansKey: "•	maintaining a basic exercise routine.",
          },
        ],

        question2: "How do I follow this program?",
        answer2: [
          {
            ansKey: "1. Choose between 2-4 goals every 2 weeks.",
          },
          {
            ansKey:
              "2. Meet at least 50% of your bi-weekly goals in order to unlock new weeks.",
          },
          {
            ansKey:
              "3. You can renew previous goals for 2 more weeks but 50% compliance is required to move forward.",
          },
          {
            ansKey:
              "4. Once you unlock more weeks, choose new goals & set reminders again.",
          },
          { ansKey: "5. Track your goals via food logs & activity logs." },
          {
            ansKey:
              "6. Upload pics of your food plates so that the habit graph can depict your performance.",
          },
          {
            ansKey:
              "7. Choose from a list of activities which have the calorie burn estimate/hour. Set daily reminders for your selected time slot.",
          },
          { ansKey: "8. Follow goals daily to develop healthy habits." },
        ],
        title2: "Compliance and Success",
        content2:
          "A graph of your compliance with daily goals, based on your inputs, will help you track your progress.",
        title3: "LET’S GET STARTED",
        title4: "Insert Infographic",
        infographic_image: "diabetes_infographic.png",
        title5: "Recommendations",
        AvoidPro: [
          { title: "Food Habits" },
          { title: "Focus on:" },
          { point: "1. regular eating times;" },
          { point: "2. low glycemic food options;" },
          { point: "3. good fats;" },
          { point: "4. changing food plates to a whole food plan;" },
          {
            point:
              "5. watching intake of risky diet elements like alcohol, saturated fats and so on;",
          },
          { point: "6. eating close to your calorie range; and" },
          {
            point: "7. calculating your calories",
          },
        ],

        AddAnti: [
          { title: "" },
          {
            point:
              "Please visit our meal plan/recipe section to find Mediterranean Diet OR calorie based, heart healthy recipes.",
          },
        ],
      },
      {
        //Sleep Well Program
        coachingcat_Id: 12,
        title1: "Sleep Well Program",
        Duration: "6 Weeks",
        paragraph:
          "Take New Steps, Every Two Weeks OR Coach Yourself to Good Health",
        content1:
          "Do you have any specific health goals like losing weight, revving up your metabolism,  detoxing, controlling sugar intake, keeping your heart healthy, boosting immunity, improving sleep or reducing stress? Our self-driven coaching programs will let you set S.M.A.R.T. (Specific, Measurable, Attainable, Relevant & Time bound) health goals. They have been specially designed to help you reduce risks from modifiable factors, such as food choices, activity levels, sleep patterns, etc., which contribute towards the development of chronic lifestyle disorders. Our programs have an inbuilt, intuitive tracking system that will help you monitor your health and transition through the various stages of lifestyle changes: from precontemplation (not acknowledging a problem) to contemplation (acknowledging it) and building readiness; then taking simple, actionable steps towards making and maintaining pro-health changes in your life.",
        question1: "What is Sleep Well program? Is it right for me?",
        answer1: [
          {
            ansKey:
              "As one of the foundations of good health, sleep must be of good quality in order to provide rejuvenation to the body and mind. It can be challenging to carry on with your daily routine if you have chronic sleep problems. This program is right for you if you often:",
          },
          {
            ansKey: "•	face trouble falling asleep;",
          },
          {
            ansKey: "•	sleep too much;",
          },
          {
            ansKey: "•	have restless or unsatisfying sleep; or",
          },
          {
            ansKey: "•	experience disturbed sleep early in the morning.",
          },
        ],
        question2: "How do I follow this program?",
        answer2: [
          {
            ansKey: "1. Choose between 2-4 goals every 2 weeks.",
          },
          {
            ansKey:
              "2. Meet at least 50% of your bi-weekly goals in order to unlock new weeks.",
          },
          {
            ansKey:
              "3. You can renew previous goals for 2 more weeks but 50% compliance is required to move forward.",
          },
          {
            ansKey:
              "4. Once you unlock more weeks, choose new goals & set reminders again.",
          },
          { ansKey: "5. Track your goals via food logs & activity logs." },
          {
            ansKey:
              "6. Upload pics of your food plates so that the habit graph can depict your performance.",
          },
          {
            ansKey:
              "7. Choose from a list of activities which have the calorie burn estimate/hour. Set daily reminders for your selected time slot.",
          },
          { ansKey: "8. Follow goals daily to develop healthy habits." },
        ],
        title2: "Compliance and Success",
        content2:
          "A graph of your compliance with daily goals, based on your inputs, will help you track your progress.",
        title3: "LET’S GET STARTED",
        title4: "Insert Infographic",
        infographic_image: "sleep_infographic.png",
        title5: "Recommendations",
        AvoidPro: [
          { title: "Melatonin Boosters" },
          {
            point:
              "The melatonin hormone tells your body it’s time to sleep. Some foods high in melatonin are:",
          },
          { point: "•	Almonds" },
          { point: "•	Cherries" },
          { point: "•	Cocoa" },
          { point: "•	Kiwi" },
          { point: "•	Milk" },
          { point: "•	Pistachios" },
          { point: "•	Salmon" },
          {
            point: "•	Sardines",
          },
        ],
        AddAnti: [
          { title: "Avoid" },
          { point: "1. Spicy & heavy dinners" },
          { point: "2. Caffeine after 4 pm" },
          { point: "3. Getting overtired" },
        ],
      },
      {
        //Stress Management Program
        coachingcat_Id: 16,
        title1: "Stress Management Program",
        Duration: "6 Weeks",
        paragraph:
          "Take New Steps, Every Two Weeks OR Coach Yourself to Good Health",
        content1:
          "Do you have any specific health goals like losing weight, revving up your metabolism,  detoxing, controlling sugar intake, keeping your heart healthy, boosting immunity, improving sleep or reducing stress? Our self-driven coaching programs will let you set S.M.A.R.T. (Specific, Measurable, Attainable, Relevant & Time bound) health goals. They have been specially designed to help you reduce risks from modifiable factors, such as food choices, activity levels, sleep patterns, etc., which contribute towards the development of chronic lifestyle disorders. Our programs have an inbuilt, intuitive tracking system that will help you monitor your health and transition through the various stages of lifestyle changes: from precontemplation (not acknowledging a problem) to contemplation (acknowledging it) and building readiness; then taking simple, actionable steps towards making and maintaining pro-health changes in your life.",
        question1: "What is Stress Management program? Is it right for me?",
        answer1: [
          {
            ansKey:
              "Stress is an integral part of life. However, prolonged stress can be detrimental to your health and quality of life.",
          },
          {
            ansKey: "This program is right for you if you:",
          },
          {
            ansKey: "•	feel nervous, anxious or depressed often;",
          },
          {
            ansKey: "•	have insomnia or don't sleep well;",
          },
          { ansKey: "•	suffer from chronic fatigue;" },
          { ansKey: "•	are less productive than before;" },
          {
            ansKey: "•	are unable to manage work pressure;",
          },
          {
            ansKey: "•	procrastinate constantly;",
          },
          {
            ansKey: "•	get irritated easily or overreact to small issues",
          },
          { ansKey: "•	have a weak immune system;" },
          { ansKey: "•	usually face digestive difficulties;" },
          {
            ansKey:
              "•	frequently experience heavy breathing, palpitations, sweating or faintness;",
          },
          {
            ansKey:
              "•	have lost interest in your work, hobbies and other activities",
          },
        ],
        question2: "How do I follow this program?",
        answer2: [
          {
            ansKey: "1. Choose between 2-4 goals every 2 weeks.",
          },
          {
            ansKey:
              "2. Meet at least 50% of your bi-weekly goals in order to unlock new weeks.",
          },
          {
            ansKey:
              "3. You can renew previous goals for 2 more weeks but 50% compliance is required to move forward.",
          },
          {
            ansKey:
              "4. Once you unlock more weeks, choose new goals & set reminders again.",
          },
          { ansKey: "5. Track your goals via food logs & activity logs." },
          {
            ansKey:
              "6. Upload pics of your food plates so that the habit graph can depict your performance.",
          },
          {
            ansKey:
              "7. Choose from a list of activities which have the calorie burn estimate/hour. Set daily reminders for your selected time slot.",
          },
          { ansKey: "8. Follow goals daily to develop healthy habits." },
        ],
        title2: "Compliance and Success",
        content2:
          "A graph of your compliance with daily goals, based on your inputs, will help you track your progress.",
        title3: "LET’S GET STARTED",
        title4: "Insert Infographic",
        infographic_image: "stress_infographic.png",
        title5: "Recommendations",
        AvoidPro: [
          { title: "Happy Foods" },
          { point: "Consume these to induce Happy Hormones (Serotonin):" },
          { point: "•	Cheese" },
          { point: "•	Eggs" },
          { point: "•	Nuts and seeds" },
          { point: "•	Pineapples" },
          { point: "•	Salmon" },
          { point: "•	Tofu" },
          {
            point: "•	Turkey",
          },
        ],
        AddAnti: [
          { title: "High Stress Foods" },
          { point: "Reduce Stress Hormones (Cortisol) by avoiding:" },
          { point: "•	Caffeine" },
          { point: "•	Chocolate cake" },
          { point: "•	Factory farm beef" },
          { point: "•	Fat-free flavored yogurts" },
          { point: "•	Fruit juices" },
          { point: "•	Packaged junk food" },
          { point: "•	Vegetable & seed oils" },
        ],
      },
      {
        //Stress Management Program
        coachingcat_Id: 15,
        title1: "Weight Loss Program",
        Duration: "8 Weeks",
        paragraph:
          "Take New Steps, Every Two Weeks OR Coach Yourself to Good Health",
        content1:
          "Do you have any specific health goals like losing weight, revving up your metabolism,  detoxing, controlling sugar intake, keeping your heart healthy, boosting immunity, improving sleep or reducing stress? Our self-driven coaching programs will let you set S.M.A.R.T. (Specific, Measurable, Attainable, Relevant & Time bound) health goals. They have been specially designed to help you reduce risks from modifiable factors, such as food choices, activity levels, sleep patterns, etc., which contribute towards the development of chronic lifestyle disorders. Our programs have an inbuilt, intuitive tracking system that will help you monitor your health and transition through the various stages of lifestyle changes: from precontemplation (not acknowledging a problem) to contemplation (acknowledging it) and building readiness; then taking simple, actionable steps towards making and maintaining pro-health changes in your life.",
        question1: "What is Stress Management program? Is it right for me?",
        answer1: [
          {
            ansKey:
              "Stress is an integral part of life. However, prolonged stress can be detrimental to your health and quality of life.",
          },
          {
            ansKey: "This program is right for you if you:",
          },
          {
            ansKey: "•	feel nervous, anxious or depressed often;",
          },
          {
            ansKey: "•	have insomnia or don't sleep well;",
          },
          { ansKey: "•	suffer from chronic fatigue;" },
          { ansKey: "•	are less productive than before;" },
          {
            ansKey: "•	are unable to manage work pressure;",
          },
          {
            ansKey: "•	procrastinate constantly;",
          },
          {
            ansKey: "•	get irritated easily or overreact to small issues",
          },
          { ansKey: "•	have a weak immune system;" },
          { ansKey: "•	usually face digestive difficulties;" },
          {
            ansKey:
              "•	frequently experience heavy breathing, palpitations, sweating or faintness;",
          },
          {
            ansKey:
              "•	have lost interest in your work, hobbies and other activities",
          },
        ],
        question2: "How do I follow this program?",
        answer2: [
          {
            ansKey: "1. Choose between 2-4 goals every 2 weeks.",
          },
          {
            ansKey:
              "2. Meet at least 50% of your bi-weekly goals in order to unlock new weeks.",
          },
          {
            ansKey:
              "3. You can renew previous goals for 2 more weeks but 50% compliance is required to move forward.",
          },
          {
            ansKey:
              "4. Once you unlock more weeks, choose new goals & set reminders again.",
          },
          { ansKey: "5. Track your goals via food logs & activity logs." },
          {
            ansKey:
              "6. Upload pics of your food plates so that the habit graph can depict your performance.",
          },
          {
            ansKey:
              "7. Choose from a list of activities which have the calorie burn estimate/hour. Set daily reminders for your selected time slot.",
          },
          { ansKey: "8. Follow goals daily to develop healthy habits." },
        ],
        title2: "Compliance and Success",
        content2:
          "A graph of your compliance with daily goals, based on your inputs, will help you track your progress.",
        title3: "LET’S GET STARTED",
        title4: "Insert Infographic",
        infographic_image: "stress_infographic.png",
        title5: "Recommendations",
        AvoidPro: [
          { title: "Happy Foods" },
          { point: "Consume these to induce Happy Hormones (Serotonin):" },
          { point: "•	Cheese" },
          { point: "•	Eggs" },
          { point: "•	Nuts and seeds" },
          { point: "•	Pineapples" },
          { point: "•	Salmon" },
          { point: "•	Tofu" },
          {
            point: "•	Turkey",
          },
        ],
        AddAnti: [
          { title: "High Stress Foods" },
          { point: "Reduce Stress Hormones (Cortisol) by avoiding:" },
          { point: "•	Caffeine" },
          { point: "•	Chocolate cake" },
          { point: "•	Factory farm beef" },
          { point: "•	Fat-free flavored yogurts" },
          { point: "•	Fruit juices" },
          { point: "•	Packaged junk food" },
          { point: "•	Vegetable & seed oils" },
        ],
      },
    ];
    let goalContent = obj.filter((data) => {
      return data.coachingcat_Id == coachingcat_Id;
    });
    res.json({
      success: true,
      message: "Show goals data",
      data: goalContent,
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

async function goalAchivedChallenge(user_Id, company_Id) {
  let challengeDetail = await ConnectionUtil(
    `select age , age_From , age_To , Gender , genderType , Department , department_Name , company_Id , Reward , action_Required ,challenge_Configuration , DATE_FORMAT(expiry_Date , '%Y-%m-%d') expiry_Date, challengePredefined_Id , DATE_FORMAT(created_At , '%Y-%m-%d') created_At , challenges_id from challenges where  challengePredefined_Id = '12' AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND action_Required = '1'`
  );
  for (let Challenge of challengeDetail) {
    let challengeUserAssignDetail = await ConnectionUtil(
      `select * from userassign_challenges  where isCompleted='0' AND isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${user_Id}' `
    );
    
    if (Challenge.company_Id == 0) {
      if (Challenge.age == 0 && Challenge.Gender == 0) {
        if (challengeUserAssignDetail.length > 0) {
          await challengeTaskGoal(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskGoal(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskGoal(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskGoal(Challenge, user_Id, company_Id , challengeUserAssignDetail);
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
      }
    } else {
      if (Challenge.age == 0 && Challenge.Gender == 0 && Challenge.Department == 0) {
        if (challengeUserAssignDetail.length > 0) {
          await challengeTaskGoal(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskGoal(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskGoal(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskGoal(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskGoal(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskGoal(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskGoal(Challenge, user_Id, company_Id , challengeUserAssignDetail);
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
      }
    }

  }
}


async function challengeTaskGoal (Challenge, user_Id, company_Id , challengeUserAssignDetail) {
  console.log(challengeUserAssignDetail, "challenfjghfd");

      let d1 = new Date(Challenge.created_At).getTime();
      let d2 = new Date(Challenge.expiry_Date).getTime();
      let differernceDays = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24) + 1);
      console.log(differernceDays , "differernceDays")
      let difference = Math.floor(differernceDays/15)
      console.log(difference , "difference")
      let y = JSON.parse(Challenge.challenge_Configuration);
      // console.log(y, "y");
      let valueCondition = y[0].value == 'Less Than' ? "<" : y[0].value == 'More Than' ? ">" : y[0].value == 'Equal' ? "=" : ">="
      console.log(valueCondition , "valueCondition")
      let valueTimes = y[1].value;
      // console.log(valueTimes, "valueTimes");
      let goalChallengeArr = await ConnectionUtil(
        `SELECT * FROM user_goalsubmit WHERE user_Id = ${user_Id} AND company_id = ${Challenge.company_Id} AND isActive = 1 AND DATE_FORMAT(created_At , '%Y-%m-%d') BETWEEN '${Challenge.created_At}' AND '${Challenge.expiry_Date}' AND status = '0' `
      );
      console.log(
        goalChallengeArr.length,
        "no of times goalAchived " + valueCondition  + " " + valueTimes 
      );
      console.log(goalChallengeArr.length + " " + valueCondition + " " + valueTimes , "condition of challenge")
      if (difference >= valueTimes) {
        if (eval(goalChallengeArr.length + " " + valueCondition + " " + valueTimes)) {
          console.log("condition satisfied of challenge")
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
      } else {
        console.log("challenge can not be completed in this duration")
      }
}