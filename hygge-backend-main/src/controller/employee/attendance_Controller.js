const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
const moment = require("moment");
let { fcm } = require("../../lib/helpers/fcm");
let { helperNotification } = require("../../lib/helpers/fcm");

//--------------------------- Attendance ---------------------------
module.exports.User_Attendance = async (req, res) => {
  try {
    let { userId, companyId, location, ip_Address, time } = req.body;
    let fcmNotificationAddQuery;
    let deviceToken;
    let userDetail = await ConnectionUtil(
      `select * from user WHERE status ='1' AND isActive='1' AND user_id='${userId}' AND company_Id='${companyId}'`
    );
    if (userDetail != "") {
      let attendanceDetail = await ConnectionUtil(
        `select * from Attendance  WHERE company_id='${companyId}' AND user_id='${userId}' AND date='${new Date()
          .toISOString()
          .slice(0, 10)}' AND attendance='${1}'`
      );
      if (attendanceDetail != "") {
        let loc = JSON.stringify(location);
        let end = time;
        let start = attendanceDetail[0].check_In;
        let hour_min = diff(start, end);
        let user = await ConnectionUtil(
          `update Attendance set attendance='${0}',total_time=${hour_min},check_Out='${time}',updated_By='${userId}' ,ip_Address='${ip_Address}',checkOut_Location='${loc}'  where company_id='${companyId}' AND Attendance.user_Id = '${userId}' AND attendance='1' `
        );
        console.log(user, "user 1");
        fcmNotificationAddQuery = await ConnectionUtil(
          `select device_Token,user_Id from fcm_Notification where user_Id='${userId}'`
        );
        let deviceToken = fcmNotificationAddQuery;
        let Arr = [];
        await fcmNotificationAddQuery.map(async (data) => {
          return Arr.push(data.device_Token);
        });
        let status = "Punched-Out";
        await save_notificationfunction(
          userId,
          userId,
          companyId,
          ip_Address,
          status
        );
        await fcm(Arr, status);
        let AttendanceTimeDetail = await ConnectionUtil(
          `select MIN(check_In) as check_In ,MAX(check_Out) as check_Out from Attendance  WHERE company_id='${companyId}'AND user_Id='${userId}' AND date='${new Date()
            .toISOString()
            .slice(0, 10)}'`
        );
        res.status(200).json({
          success: true,
          message: "checkOut",
          data: AttendanceTimeDetail[0],
        });
      } else {
        var post = {
          user_Id: userId,
          company_id: companyId,
          attendance: 1,
          check_In: time, //new Date().toLocaleTimeString(),
          checkIn_Location: JSON.stringify(location),
          date: new Date().toISOString().slice(0, 10),
          ip_Address: ip_Address,
          created_By: userId,
          updated_By: userId,
          //"check_Out":"",
          //"checkOut_Location":
        };
        var user = await ConnectionUtil(`INSERT INTO Attendance  SET ?`, post);
        console.log(user, "user 2");
        fcmNotificationAddQuery = await ConnectionUtil(
          `select user_Id,device_Token from fcm_Notification where user_Id='${userId}'`
        );
        let deviceToken = fcmNotificationAddQuery;
        let Arr = [];
        await fcmNotificationAddQuery.map(async (data) => {
          return Arr.push(data.device_Token);
        });
        let status = "Punched-In";
        await save_notificationfunction(
          userId,
          userId,
          companyId,
          ip_Address,
          status
        );
        await fcm(Arr, status);
        let AttendanceTimeDetail = await ConnectionUtil(
          `select MIN(check_In) as check_In , MAX(check_Out) as check_Out from Attendance  WHERE company_id='${companyId}'AND user_Id='${userId}' AND date='${new Date()
            .toISOString()
            .slice(0, 10)}'`
        );

        res.status(200).json({
          success: true,
          message: "checkIn",
          data: AttendanceTimeDetail[0],
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        message: "user dose not exist",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

function diff(start, end) {
  start = start.split(":");
  end = end.split(":");
  var startDate = new Date(0, 0, 0, start[0], start[1], start[2]);
  var endDate = new Date(0, 0, 0, end[0], end[1], end[2]);
  var diff = endDate.getTime() - startDate.getTime();
  return diff;
}
//--------------------------- show_AttendanceDetail ---------------------------
function parseMillisecondsIntoReadableTime(milliseconds) {
  //Get hours from milliseconds
  var hours = milliseconds / (1000 * 60 * 60);
  var absoluteHours = Math.floor(hours);
  var h = absoluteHours > 9 ? absoluteHours : "0" + absoluteHours;

  //Get remainder from hours and convert to minutes
  var minutes = (hours - absoluteHours) * 60;
  var absoluteMinutes = Math.floor(minutes);
  var m = absoluteMinutes > 9 ? absoluteMinutes : "0" + absoluteMinutes;

  //Get remainder from minutes and convert to seconds
  var seconds = (minutes - absoluteMinutes) * 60;
  var absoluteSeconds = Math.floor(seconds);
  var s = absoluteSeconds > 9 ? absoluteSeconds : "0" + absoluteSeconds;
  return h + ":" + m + ":" + s;
}

module.exports.show_AttendanceDetail = async (req, res) => {
  try {
    let { userId, companyId } = req.body;
    let newArr = [];
    // -----------
    let arrnew = [];
    let attendanceDetail = await ConnectionUtil(
      `select * from Attendance where date='${new Date()
        .toISOString()
        .slice(0, 10)}' AND user_Id='${userId}'`
    );

    let assignedCheckOutArr = await ConnectionUtil(
      `select working_HoursTo , user_id from user where user_id = ${userId}`
    );

    console.log(assignedCheckOutArr);

    let obj = await attendanceDetail.map((data) => {
      if (data.check_Out != null) {
        let timeStart = new Date("01/01/2007 " + data.check_In).getHours();
        let timeEnd = new Date("01/01/2007 " + data.check_Out).getHours();
        // let timeEnd = new Date(
        //   "01/01/2007 " + assignedCheckOutArr[0].working_HoursTo
        // ).getHours();
        let timeStartM = new Date("01/01/2007 " + data.check_In).getMinutes();
        let timeEndM = new Date("01/01/2007 " + data.check_Out).getMinutes();
        // let timeEndM = new Date(
        //   "01/01/2007 " + assignedCheckOutArr[0].working_HoursTo
        // ).getMinutes();
        todayMin = Math.abs(timeEndM - timeStartM);
        todaysHour = Math.abs(timeEnd - timeStart);
        let hours = todaysHour + "." + todayMin;
        return hours;
      } else if (data.check_Out == null) {
        return 0;
      } else {
        return 0;
      }
    });

    arrnew.push(
      obj.reduce((a, b) => parseFloat(a) + parseFloat(b), 0).toFixed(2)
    );
    let totalTime = await ConnectionUtil(
      `select COALESCE(SUM(total_time),0) as totalTime from Attendance where user_Id='${userId}' AND date='${new Date()
        .toISOString()
        .slice(0, 10)}' AND date IS NOT NULL`
    );

    // -----------
    let userCurrentCheckIn =
      await ConnectionUtil(`select MAX(check_In) as check_In  from Attendance  
    WHERE company_id='${companyId}' AND user_Id='${userId}' AND date='${new Date()
        .toISOString()
        .slice(0, 10)}'`);

    let userDetail = await ConnectionUtil(
      `select  user_id,first_name,last_name from user WHERE isActive ='1'  AND user_id='${userId}' AND company_id='${companyId}'`
    );
    if (userDetail != "") {
      // earlier it was the end time concept

      // let AttendanceDetail = await ConnectionUtil(
      //   `select date,user_Id,company_id,MIN(check_In) as check_In ,MAX(check_Out) as check_Out from Attendance  WHERE company_id='${companyId}'AND user_Id='${userId}' AND date='${new Date()
      //     .toISOString()
      //     .slice(0, 10)}'`
      // );

      //as per bug list i am updating it

      let AttendanceDetail = await ConnectionUtil(
        `select date,user_Id,company_id,MIN(check_In) as check_In  from Attendance  WHERE company_id='${companyId}'AND user_Id='${userId}' AND date='${new Date()
          .toISOString()
          .slice(0, 10)}'`
      );
      if (
        AttendanceDetail[0].check_Out != null &&
        AttendanceDetail[0].check_In != null
      ) {
        AttendanceDetail[0].Name =
          userDetail[0].first_name + " " + userDetail[0].last_name;
        AttendanceDetail[0].currentCheckIn =
          userCurrentCheckIn[0].check_In != null
            ? userCurrentCheckIn[0].check_In
            : 0.0;
        AttendanceDetail[0].check_Out = assignedCheckOutArr[0].working_HoursTo; // newly added
        AttendanceDetail[0].timeDate = parseMillisecondsIntoReadableTime(
          totalTime[0].totalTime
        ); //totalTime[0].totalTime//arrnew[0]
        res.status(200).json({
          success: true,
          message: "check_in",
          data: AttendanceDetail[0],
          timeDate: arrnew[0],
        });
      } else {
        AttendanceDetail[0].currentCheckIn =
          userCurrentCheckIn[0].check_In != null
            ? userCurrentCheckIn[0].check_In
            : 0.0;
        AttendanceDetail[0].check_Out = assignedCheckOutArr[0].working_HoursTo; // newly added
        AttendanceDetail[0].timeDate = parseMillisecondsIntoReadableTime(
          totalTime[0].totalTime
        );
        res.status(200).json({
          success: true,
          message: "check_Out",
          timeDate: arrnew[0],
          data: AttendanceDetail[0],
          // totalTime[0].totalTime}
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "user does not exist",
        timeDate: arrnew[0],
        data: {
          currentCheckIn:
            userCurrentCheckIn[0].check_In != null
              ? userCurrentCheckIn[0].check_In
              : 0,
          timeDate: parseMillisecondsIntoReadableTime(totalTime[0].totalTime),
        },
        // totalTime[0].totalTime}
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ------------------------- Attendance_Graph -----------------------------------
module.exports.attendance_Graph = async (req, res) => {
  try {
    let { user_Id, company_Id, preMonth, preYear } = req.body;
    var date = new Date();
    var month = preMonth;
    var year = preYear;
    var daysInMonth = new Date(year, month, 0).getDate();
    let all_days = [];
    date.setDate(1);
    for (let i = 1; i <= daysInMonth; i++) {
      var d = {
        year: year,
        month: month.toString().padStart(2, "0"),
        date: i.toString().padStart(2, "0"),
      };
      all_days.push(d);
    }
    let today = new Date();
    if (month == date.getMonth() + 1) {
      today = today.getDate().toString().padStart(2, "0");
    } else {
      today = all_days[all_days.length - 1].date;
    }
    let mm = String(month).padStart(2, "0");
    let yyyy = year;
    let arrnew = [];
    let Dat = [];
    let todaysHour = 0;
    let todayMin = 0;
    for (let date of all_days) {
      if (date.date <= today) {
        let dateVal = yyyy + "-" + mm + "-" + date.date;
        var surveysubmissionDetails = await ConnectionUtil(
          `select check_In,check_Out ,date from Attendance where  date='${dateVal}' AND user_ID='${user_Id}'`
        );
        if (surveysubmissionDetails.length > 0) {
          let obj = await surveysubmissionDetails.map((data) => {
            if (data.check_Out != null) {
              let timeStart = new Date(
                "01/01/2007 " + data.check_In
              ).getHours();
              let timeEnd = new Date("01/01/2007 " + data.check_Out).getHours();
              let timeStartM = new Date(
                "01/01/2007 " + data.check_In
              ).getMinutes();
              let timeEndM = new Date(
                "01/01/2007 " + data.check_Out
              ).getMinutes();
              todayMin = Math.abs(timeEndM - timeStartM);
              todaysHour = Math.abs(timeEnd - timeStart);
              let hours = todaysHour + "." + todayMin;
              return hours;
            } else if (data.check_Out == null) {
              return 0;
            } else {
              return 0;
            }
          });
          arrnew.push(
            obj.reduce((a, b) => parseFloat(a) + parseFloat(b), 0).toFixed(2)
          );
        } else {
          arrnew.push(0);
        }
        Dat.push(date.date);
      }
    }
    const data = {
      labels: Dat,
      datasets: [
        {
          data: arrnew,
        },
      ],
    };

    await attendenceChallenge(user_Id, company_Id);

    res.status(200).json({
      success: true,
      message: "Attendance graph data",
      data: data,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

async function save_notificationfunction(
  user_Id,
  EmpUser_Id,
  company_Id,
  ip_Address,
  status
) {
  let obj = {
    // "send_to"           : 0,
    user_Id: EmpUser_Id,
    company_Id: company_Id,
    ip_Address: ip_Address,
    notification_Type: "Attendance",
    notification_Text: "you have" + " " + status + " " + "successfully",
  };
  let notification = await ConnectionUtil(`INSERT INTO notification SET?`, obj);
}

// ------------------------- attendance_singleDay -----------------------------------
// module.exports.attendance_singleDay = async (req, res) => {
//   try{
//     let {date}=req.body;
//     let { id }=req.user;
//     let arrnew=[];
//     let  attendanceDetail = await ConnectionUtil(`select * from Attendance where date='${date}' AND user_Id='${id}'`);
//     let obj = await attendanceDetail.map((data) => {
//       if (data.check_Out != null) {
//         let timeStart = new Date("01/01/2007 " + data.check_In).getHours();
//         let timeEnd = new Date("01/01/2007 " + data.check_Out).getHours();
//         let timeStartM = new Date("01/01/2007 " + data.check_In).getMinutes();
//         let timeEndM = new Date("01/01/2007 " + data.check_Out).getMinutes();
//         todayMin = Math.abs((timeEndM - timeStartM))
//         todaysHour = Math.abs((timeEnd - timeStart))
//         let hours = todaysHour + '.' + todayMin;
//         return hours
//       } else if (data.check_Out == null) {
//         return 0;
//       } else {
//         return 0;
//       }
//     });
//     arrnew.push((obj.reduce((a, b) => parseFloat(a) + parseFloat(b), 0)).toFixed(2));
//     res.status(200).json({
//       success: true,
//       message: "Attendance detail",
//       data: arrnew[0],//attendanceDetail
//     })
//   } catch (err) {
//     console.log(err);
//     res.status(400).json({
//       success: false,
//       message: err.message
//     })
//   }
// }

//-------------------------------------challengeAttendence Start  pranay --------------------------

async function attendenceChallenge(user_Id, company_Id) {
  let challengeDetail = await ConnectionUtil(
    `select company_Id , Reward , action_Required ,challenge_Configuration , DATE_FORMAT(expiry_Date , '%Y-%m-%d') expiry_Date, challengePredefined_Id , DATE_FORMAT(created_At , '%Y-%m-%d') created_At , challenges_id from challenges where  challengePredefined_Id = '3' AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND action_Required = '1'`
  );
  for (let Challenge of challengeDetail) {
    let challengeUserAssignDetail = await ConnectionUtil(
      `select * from userassign_challenges  where isCompleted='0' AND isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${user_Id}' `
    );

    if (challengeUserAssignDetail.length > 0) {
      let attendenceArr = await ConnectionUtil(
        `SELECT * FROM attendance WHERE user_Id = ${user_Id} AND company_id = ${company_Id} AND isActive = 1 AND date BETWEEN '${Challenge.created_At}' AND '${Challenge.expiry_Date}'`
      );
      let d1 = new Date(Challenge.created_At).getTime();
      let d2 = new Date(Challenge.expiry_Date).getTime();
      let differernce = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24) + 1);
      let x = Math.floor((differernce / 7) * 1);
      let challengeDuration = differernce - x;
      if (attendenceArr.length >= challengeDuration) {
        let userDetailCheckinArr = await ConnectionUtil(
          `SELECT * FROM user WHERE user_id = ${user_Id} AND company_id = ${company_Id} AND isActive = 1 `
        );

        let challengeFullfilledAttendenceArr = await ConnectionUtil(
          `SELECT * FROM attendance WHERE check_In > '${userDetailCheckinArr[0].working_HoursFrom}' AND user_Id = ${user_Id} AND company_id = ${company_Id} AND isActive = 1 AND DATE_FORMAT(created_At , '%Y-%m-%d') BETWEEN '${Challenge.created_At}' AND '${Challenge.expiry_Date}'`
        );

        let challengeFullfilledAttendence =
          challengeFullfilledAttendenceArr.length;
        let y = JSON.parse(Challenge.challenge_Configuration);
        // console.log(y[0].value , "value")
        let value = y[0].value;
        if (challengeFullfilledAttendence <= value) {
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
      } else {
        console.log("");
      }
    }
  }
}

// -------------------------------------------challenge Attendence completed pranay ------------------------------
