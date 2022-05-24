const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let message = require("../../lib/helpers/message");
let moment = require("moment");
const { param } = require("../../router/hrAdmin");
let MAIL = require("../../config/email");
const { count, log } = require("console");
let leaveReturnStatus = 0;
let { helperNotification } = require("../../lib/helpers/fcm");
const { reset } = require("colors");
// var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

// ------------------------- add_EmployeeLeave -------------------------------------
module.exports.add_LeaveEmployee = async (req, res) => {
  try {
    let {
      TypeId,
      leave_From,
      leave_To,
      user_reason,
      leave_description,
      leave_Number,
      ip_Address,
      user_Id,
      company_Id,
      leave_Name,
      leave_Type,
      to_Hour,
      from_Hour,
      is_Short,
    } = req.body;
    let { id } = req.user;
    let { branch_Id, access } = req.query;
    let userDetails = await ConnectionUtil(
      `select * from user where isActive = '1' AND user_id = '${user_Id}' AND company_id ='${company_Id}'`
    );
    if (userDetails != "") {
      let salaryKey = {};
      let answer = JSON.parse(userDetails[0].leaveBalance);
      console.log("answer", answer);
      await answer.map((item) => {
        console.log("item", item);
        for (var ck in item) {
          console.log("ck ", ck);
          if (ck == leave_Name) {
            return (salaryKey = item);
          }
        }
      });
      var size = Object.keys(salaryKey).length;
      let y = Object.values(salaryKey);
      console.log("y", y);
      let leaveNumberVal = parseInt(y[0]);
      if (leaveNumberVal >= leave_Number) {
        if (leave_To < leave_From) {
          return res.status(404).json({
            success: false,
            message: "Invalid Date",
          });
        }
        let leaveDetail = await ConnectionUtil(
          `select * from leave_details where isActive = '1' AND company_Id ='${company_Id}' AND '${leave_From}'<=leave_To AND '${leave_From}'>=leave_From AND user_Id ='${user_Id}'`
        );

        let leaveData = await ConnectionUtil(
          `select * from leave_details where isActive = '1' AND company_Id ='${company_Id}' AND '${leave_To}' <= leave_To AND '${leave_To}' >= leave_From AND user_Id='${user_Id}'`
        );
        if ((leaveDetail == "") & (leaveData == "")) {
          let leaveObj = {
            leaveType_Id: TypeId,
            leave_From: moment(leave_From).format("YYYY-MM-DD"),
            leave_To: moment(leave_To).format("YYYY-MM-DD"),
            user_reason: user_reason,
            leave_description: leave_description,
            leave_Number: leave_Number,
            ip_Address: ip_Address,
            user_Id: user_Id,
            company_Id: company_Id,
            leave_Name: leave_Name,
            is_leave: 1,
            created_By: id,
            updated_By: id,
            to_Hour: moment("00:00:00", "HH:mm:ss").format("HH:mm:ss"),
            from_Hour: moment("00:00:00", "HH:mm:ss").format("HH:mm:ss"),
            branch_Id: branch_Id,
          };
          let leaveAddQueryFind = await ConnectionUtil(
            `INSERT INTO leave_details SET?`,
            leaveObj
          );
          res.status(200).json({
            success: true,
            message: "leave add successfull",
            data: leaveAddQueryFind,
          });
        } else {
          res.status(200).json({
            success: true,
            message: "leave already applied",
          });
        }
      } else {
        res.status(200).json({
          success: false,
          message: "Leave balance insufficient",
        });
      }
    } else {
      res.status(200).json({
        success: false,
        message: "user not exits",
      });
    }
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err, //"err",
    });
  }
};

// ------------------------- Show_EmployeeLeaveList -------------------------------------
module.exports.show_EmployeeLeaveList = async (req, res) => {
  try {
    let { companyId, userId, employee, byWhich, department } = req.body;
    let { branch_Id, access } = req.query;
    let isUserId = "";
    let isEmployee = "";
    let isDepartment = "";
    let isByWhich = "";
    if (employee != "") {
      isEmployee = `AND user_Id='${employee}' `;
    }
    if (department != "") {
      // let leaveDetails = await ConnectionUtil(`select  from user where department='${}'`);
      isDepartment = `AND department='${department}'`;
    }
    if (byWhich.startDate != "" && byWhich.endDate != "") {
      let start = moment(byWhich.startDate).format("YYYY-MM-DD 00:00:00");
      let end = moment(byWhich.endDate).format("YYYY-MM-DD 23:59:59");
      isByWhich = `AND created_At between '${start}' and '${end}'`;
    }
    let leaveDetails;
    if (access == 0) {
      leaveDetails = await ConnectionUtil(
        `select leave_Number,leaveDetails_id,is_leave,user_Id,company_Id,leave_description,leaveType_Id,leave_From,leave_To,user_reason,hr_reason	from leave_details where  branch_Id='${branch_Id}' AND company_Id ='${companyId}' ${isByWhich} ${isEmployee} ${isDepartment} ORDER BY leaveDetails_id DESC `
      );
    } else {
      leaveDetails = await ConnectionUtil(
        `select leave_Number,leaveDetails_id,is_leave,user_Id,company_Id,leave_description,leaveType_Id,leave_From,leave_To,user_reason,hr_reason	from leave_details where company_Id ='${companyId}' ${isByWhich} ${isEmployee} ${isDepartment} ORDER BY leaveDetails_id DESC `
      );
    }
    let newArr = [];
    if (leaveDetails != "") {
      for (let leaveData of leaveDetails) {
        let leaveTypeDetails = await ConnectionUtil(
          `select leave_Type,isActive from leave_Type where leaveType_id ='${leaveData.leaveType_Id}' AND company_Id='${companyId}'`
        );
        let userDetails = await ConnectionUtil(
          `select email,CONCAT(first_name," ",last_name) as username,profile_picture,department,leaveBalance from user where user_id ='${leaveData.user_Id}'`
        );
        leaveData.leave_From = leaveData.leave_From;
        // != ""
        //   ? moment(leaveData.leave_From).format("ll")
        //   : "";

        leaveData.leave_To = leaveData.leave_To;
        // != ""
        // ? moment(leaveData.leave_To).format("ll")
        // : "";

        leaveData.leave_Type =
          leaveTypeDetails[0].leave_Type != ""
            ? leaveTypeDetails[0].leave_Type
            : "Test";

        leaveData.isActive =
          leaveTypeDetails[0].isActive != ""
            ? leaveTypeDetails[0].isActive
            : "";

        leaveData.name =
          userDetails[0].username != "" ? userDetails[0].username : "";

        leaveData.profile_picture =
          userDetails[0].profile_picture != ""
            ? userDetails[0].profile_picture
            : "download.png";

        leaveData.department =
          userDetails[0].department != "" ? userDetails[0].department : "";

        leaveData.leaveBalance =
          userDetails[0].leaveBalance != ""
            ? JSON.parse(userDetails[0].leaveBalance)
            : [];

        leaveData.email =
          userDetails[0].email != "" ? userDetails[0].email : "";
        newArr.push(leaveData);
      }
      res.status(200).json({
        success: true,
        message: "Show leave list",
        data: newArr,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "data not found",
      });
    }
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

// ------------------------- manage_EmployeeleaveBalance -------------------------------------
module.exports.manage_EmployeeleaveBalance = async (req, res) => {
  try {
    let { userId, companyId, ip_Address, leaveBalace } = req.body;
    let { id } = req.user;
    let userDetails = await ConnectionUtil(
      `select *	from user where isActive='1' AND status='1' AND user_id='${userId}' AND company_Id ='${companyId}' `
    );
    if (userDetails != "") {
      let l = JSON.stringify(leaveBalace);
      let userUpdateQueryFind = await ConnectionUtil(
        `update user set leaveBalance ='${l}' , ip_Address='${ip_Address}', updated_By='${id}'  where user_id='${userId}' AND company_Id ='${companyId}'`
      );
      if (userUpdateQueryFind.affectedRows != 0) {
        res.status(200).json({
          success: true,
          message: "leave Balance updated successfull",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Some thing went wrong",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "user not exits",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({
      success: false,
      message: "err",
    });
  }
};

// ------------------------- _EmployeeLeave Accept/Reject(status) -------------------------------------
module.exports.request_Employeeleave = async (req, res) => {
  try {
    let {
      leaveDetailsId,
      userId,
      companyId,
      isLeave,
      ip_Address,
      leaveType_Id,
      hrReason,
    } = req.body;
    let { id } = req.user;
    if (isLeave == 2 && hrReason == "") {
      res.status(404).json({
        success: false,
        message: "Please mention reject Reason",
      });
    }
    let userDetails = await ConnectionUtil(
      `select *	from user where isActive='1' AND status='1' AND user_id='${userId}' AND company_Id ='${companyId}'`
    );
    if (userDetails != "") {
      // --
      let leaveTypeDetails = await ConnectionUtil(
        `select leave_Type	from leave_Type where leaveType_id ='${leaveType_Id}' AND company_Id ='${companyId}'`
      );
      let leaveDetails = await ConnectionUtil(
        `select leave_Number,is_leave,user_Id from leave_details where leaveDetails_id='${leaveDetailsId}' AND company_Id ='${companyId}'`
      );
      if (leaveDetails[0].is_leave == 0) {
        let answer = JSON.parse(userDetails[0].leaveBalance);
        let leaveRemainStatus = await leaveRemainingCount(
          answer,
          leaveDetails[0].leave_Number,
          leaveTypeDetails
        );
        if (leaveRemainStatus == 1) {
          return res.status(404).json({
            success: false,
            message: "insufficent balance",
          });
        } else {
          let newLeaveBal = [];
          await answer.map((item) => {
            for (var leaveBal in item) {
              let lType = leaveTypeDetails[0].leave_Type;
              if (leaveTypeDetails[0].leave_Type == "ShortHourly") {
                lType = leaveTypeDetails[0].leave_Type.replace(
                  "ShortHourly",
                  "AnnualLeave"
                );
              }
              if (leaveBal == lType) {
                let leaveKey = {};
                item[leaveBal] = (
                  parseInt(item[leaveBal]) -
                  parseInt(leaveDetails[0].leave_Number)
                ).toString();
              }
            }
            newLeaveBal.push(item);
          });

          let leaveDetailUpdateQueryFind = await ConnectionUtil(
            `update leave_details set hr_reason='${hrReason}', is_leave='${isLeave}' ,ip_Address='${ip_Address}',updated_By='${id}',hr_reason= '${hrReason}'  where user_id='${leaveDetails[0].user_Id}' AND company_Id ='${companyId}' AND leaveDetails_id='${leaveDetailsId}'`
          );
          if (leaveDetailUpdateQueryFind.affectedRows != 0) {
            let leaveBals = JSON.stringify(newLeaveBal);
            if (isLeave == 1) {
              let leaveDetailUpdateQueryFind = await ConnectionUtil(
                `update  user set leaveBalance='${leaveBals}' ,ip_Address='${ip_Address}',updated_By='${id}' where isActive='1' AND status='1' AND user_id='${leaveDetails[0].user_Id}' AND company_Id ='${companyId}'`
              );

              let x = await leaveChallenge(userId, companyId);

              return res.status(200).json({
                success: true,
                message: "Employee leave accept successfull",
              });
            }
            if (isLeave == 2) {
              return res.status(200).json({
                success: true,
                message: "Employee leave reject successfull",
              });
            }
          } else {
            res.status(404).json({
              success: false,
              message: "Some thing went wrong",
            });
          }
        }
      } else if (leaveDetails[0].is_leave == 1) {
        res.status(404).json({
          success: false,
          message: "Already accept",
        });
      } else if (leaveDetails[0].is_leave == 2) {
        res.status(404).json({
          success: false,
          message: "Already reject",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "user not exits",
      });
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ------------------------- _EmployeeLeave Modify leave -------------------------------

// module.exports.modify_Employeeleave = async (req, res) => {
//   try {
//     let {
//       isType,
//       leaveDetailsId,
//       userId,
//       companyId,
//       ip_Address,
//       leaveName,
//       leaveDescription,
//       leaveFrom,
//       leaveTo,
//       fromHour,
//       toHour,
//       leaveType_Id,
//       hrReason,
//       isLeave,
//     } = req.body;
//     let { id } = req.user;
//     let userDetails = await ConnectionUtil(
//       `select *	from user where isActive='1' AND status='1' AND user_id='${userId}' AND company_Id ='${companyId}' `
//     );
//     if (userDetails != "") {
//       if (!hrReason) {
//         res
//           .status(404)
//           .json({ success: false, message: "hr reason is requied " });
//       }
//       if (isType == "cancel") {
//         // '4',
//         let leaveDetailUpdateQueryFind = await ConnectionUtil(
//           `update  leave_details set
//           is_leave          =  '3',
//           hr_reason         = '${hrReason}',
//           ip_Address        = '${ip_Address}',
//           updated_By        = '${id}'
//           where user_id='${userId}' AND company_Id ='${companyId}' AND leaveDetails_id='${leaveDetailsId}'`
//         );
//         if (leaveDetailUpdateQueryFind.affectedRows != 0) {
//           let Arr = [];
//           let userDeviceToken = await ConnectionUtil(`select device_Token from fcm_Notification where user_Id='${userId}' AND company_Id ='${companyId}'`);
//           await userDeviceToken.map((data) => { return Arr.push(data.device_Token) })
//           let testMessage = {
//             title: "Cancel Leave Notification",
//             body: "your leave cancel successfully"
//           }
//           await helperNotification(Arr, testMessage)
//           return res.status(200).json({
//             success: true,
//             message: "Cancelled employee leave successfully",
//           });
//         } else {
//           return res.status(404).json({
//             success: false,
//             message: "Some thing went wrong",
//           });
//         }
//       }
//       if (isType == "modify") {
//         let to = moment(leaveTo).format("YYYY-MM-DD");
//         let from = moment(leaveFrom).format("YYYY-MM-DD");
//         let leaveDetailUpdateQueryFind = await ConnectionUtil(
//           `update  leave_details set
//           leave_Name        = '${leaveName}',
//           leave_description = '${leaveDescription}',
//           leave_From        = '${from}',
//           leave_To          = '${to}',
//           from_Hour         = '${fromHour}',
//           to_Hour           = '${toHour}',
//           hr_reason         = '${hrReason}',
//           ip_Address        =  '${ip_Address}',
//           updated_By        =  '${id}'
//           where user_id='${userId}' AND company_Id ='${companyId}' AND leaveDetails_id='${leaveDetailsId}'`
//         );
//         if (leaveDetailUpdateQueryFind.affectedRows != 0) {
//           res.status(200).json({
//             success: true,
//             message: "Modify employee leave successfully",
//           });
//         } else {
//           res.status(404).json({
//             success: false,
//             message: "Some thing went wrong",
//           });
//         }
//       }
//       if (isType == "request") {
//         //let {leaveDetailsId,userId,companyId,isLeave,ip_Address,leaveType_Id,hrReason}=req.body;
//         let { id } = req.user;
//         if (isLeave == 2 && hrReason == "") {
//           res.status(404).json({
//             success: false,
//             message: "Please mention reject Reason",
//           });
//         }
//         let userDetails = await ConnectionUtil(
//           `select *	from user where isActive='1' AND status='1' AND user_id='${userId}' AND company_Id ='${companyId}'`
//         );
//         if (userDetails != "") {
//           // --
//           let leaveTypeDetails = await ConnectionUtil(
//             `select leave_Type	from leave_Type where leaveType_id ='${leaveType_Id}' AND company_Id ='${companyId}'`
//           );

//           console.log(leaveTypeDetails , "leaveTypeDetails")
//           let leaveDetails = await ConnectionUtil(
//             `select leave_Number,is_leave,user_Id from leave_details where leaveDetails_id='${leaveDetailsId}' AND company_Id ='${companyId}'`
//           );
//           if (leaveDetails[0].is_leave == 0) {
//             // let salaryKey = {};
//             let answer = JSON.parse(userDetails[0].leaveBalance);
//             let leaveRemainStatus = await leaveRemainingCount(answer, leaveDetails[0].leave_Number, leaveTypeDetails)
//             if (leaveRemainStatus == 1) {
//               return res.status(404).json({
//                 success: false,
//                 message: "insufficent balance"
//               });
//             } else {
//               let newLeaveBal = [];
//               await answer.map((item) => {
//                 for (var leaveBal in item) {
//                   //--
//                   console.log(leaveBal,"leaveBal")
//                   if (leaveTypeDetails.length > 0 ) {
//                     var lType = leaveTypeDetails[0].leave_Type;
//                   } else{
//                     console.log("unable to get leave typw")
//                   }

//                   // console.log(lType , "1Type")
//                   if (leaveTypeDetails.length > 0) {
//                     if (leaveTypeDetails[0].leave_Type == "ShortHourly") {
//                       lType = leaveTypeDetails[0].leave_Type.replace(
//                         "ShortHourly",
//                         "AnnualLeave"
//                       );
//                     }
//                   } else{
//                     console.log("unable to get leave typw")
//                   }

//                   //--
//                   if (lType == leaveBal) {
//                     let leaveKey = {};
//                     item[leaveBal] = (
//                       parseInt(item[leaveBal]) -
//                       parseInt(leaveDetails[0].leave_Number)
//                     ).toString();
//                   }
//                 }
//                 newLeaveBal.push(item);
//               });
//               //  --
//               let leaveDetailUpdateQueryFind = await ConnectionUtil(
//                 `update leave_details set hr_reason='${hrReason}', is_leave='${isLeave}' ,ip_Address='${ip_Address}',updated_By='${id}',hr_reason= '${hrReason}'  where user_id='${leaveDetails[0].user_Id}' AND company_Id ='${companyId}' AND leaveDetails_id='${leaveDetailsId}'`
//               );
//               if (leaveDetailUpdateQueryFind.affectedRows != 0) {
//                 let leaveBals = JSON.stringify(newLeaveBal);
//                 if (isLeave == 1) {
//                   let leaveDetailUpdateQueryFind = await ConnectionUtil(
//                     `update  user set leaveBalance='${leaveBals}' ,ip_Address='${ip_Address}',updated_By='${id}' where isActive='1' AND status='1' AND user_id='${leaveDetails[0].user_Id}' AND company_Id ='${companyId}'`
//                   );
//                   if (leaveDetailUpdateQueryFind.affectedRows != 0) {
//                     let Arr = [];
//                     let userDeviceToken = await ConnectionUtil(`select device_Token from fcm_Notification where user_Id='${userId}' AND company_Id ='${companyId}'`);
//                     await userDeviceToken.map((data) => { return Arr.push(data.device_Token) })
//                     let testMessage = {
//                       title: "Leave acceptance - User",// "Accept Leave Notification",
//                       body: `Your request for `/* +leaveTypeDetails[0].leave_Type+*/` leave has been approved!`//"Your leave accept successfully"
//                     }
//                     await helperNotification(Arr, testMessage)

//                     let x = await leaveChallenge(userId, companyId)

//                     return res.status(200).json({
//                       success: true,
//                       message: "Employee leave accept successfull"
//                     });
//                   } else {
//                     return res.status(404).json({
//                       success: false,
//                       message: "something went wrong",
//                     });
//                   }
//                 }
//                 if (isLeave == 2) {
//                   let Arr = [];
//                   let userDeviceToken = await ConnectionUtil(`select device_Token from fcm_Notification where user_Id='${userId}' AND company_Id ='${companyId}'`);
//                   await userDeviceToken.map((data) => { return Arr.push(data.device_Token) })
//                   let testMessage = {
//                     title: "Leave rejection - User",//"Reject Leave Notification",
//                     body: `Your request for `/*+leaveTypeDetails[0].leave_Type+*/` leave has been declined because [insert reason].`//"Your leave reject successfully"
//                   }
//                   await helperNotification(Arr, testMessage)
//                   return res.status(200).json({
//                     success: true,
//                     message: "Employee leave reject successfull",
//                   });
//                 }
//               } else {
//                 res.status(404).json({
//                   success: false,
//                   message: "Some thing went wrong",
//                 });
//               }
//             }
//           } else if (leaveDetails[0].is_leave == 1) {
//             res.status(404).json({
//               success: false,
//               message: "Already accept",
//             });
//           } else if (leaveDetails[0].is_leave == 2) {
//             res.status(404).json({
//               success: false,
//               message: "Already reject",
//             });
//           }
//         } else {
//           res.status(404).json({
//             success: false,
//             message: "user not exits",
//           });
//         }
//       } else {
//         res.status(404).json({
//           success: false,
//           message: "Please select type first",
//         });
//       }
//     } else {
//       res.status(404).json({
//         success: false,
//         message: "user not exits",
//       });
//     }
//   } catch (err) {
//     console.log(err.message)
//     res.status(400).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

module.exports.modify_Employeeleave = async (req, res) => {
  try {
    let {
      isType,
      leaveDetailsId,
      userId,
      companyId,
      ip_Address,
      leaveName,
      leaveDescription,
      leaveFrom,
      leaveTo,
      fromHour,
      toHour,
      leaveType_Id,
      hrReason,
      isLeave,
    } = req.body;
    let { id } = req.user;
    let userDetails = await ConnectionUtil(
      `select *	from user where isActive='1' AND status='1' AND user_id='${userId}' AND company_Id ='${companyId}' `
    );
    // console.log(userDetails,"userDetails");
    if (userDetails != "") {
      if (!hrReason) {
        res
          .status(404)
          .json({ success: false, message: "hr reason is requied " });
      }
      if (isType == "cancel") {
        // '4',
        let leaveDetailUpdateQueryFind = await ConnectionUtil(
          `update  leave_details set 
          is_leave          =  '3',
          hr_reason         = '${hrReason}',
          ip_Address        = '${ip_Address}',
          updated_By        = '${id}'
          where user_id='${userId}' AND company_Id ='${companyId}' AND leaveDetails_id='${leaveDetailsId}'`
        );
        if (leaveDetailUpdateQueryFind.affectedRows != 0) {
          let Arr = [];
          let userDeviceToken = await ConnectionUtil(
            `select device_Token from fcm_Notification where user_Id='${userId}' AND company_Id ='${companyId}'`
          );
          await userDeviceToken.map((data) => {
            return Arr.push(data.device_Token);
          });
          let testMessage = {
            title: "Cancel Leave Notification",
            body: "your leave cancel successfully",
          };
          await helperNotification(Arr, testMessage);
          return res.status(200).json({
            success: true,
            message: "Cancelled employee leave successfully",
          });
        } else {
          return res.status(404).json({
            success: false,
            message: "Some thing went wrong",
          });
        }
      }
      if (isType == "modify") {
        let to = moment(leaveTo).format("YYYY-MM-DD");
        let from = moment(leaveFrom).format("YYYY-MM-DD");
        let leaveDetailUpdateQueryFind = await ConnectionUtil(
          `update  leave_details set 
          leave_Name        = '${leaveName}',
          leave_description = '${leaveDescription}',
          leave_From        = '${from}',
          leave_To          = '${to}',
          from_Hour         = '${fromHour}',
          to_Hour           = '${toHour}',
          hr_reason         = '${hrReason}',
          ip_Address        =  '${ip_Address}',
          updated_By        =  '${id}'
          where user_id='${userId}' AND company_Id ='${companyId}' AND leaveDetails_id='${leaveDetailsId}'`
        );
        if (leaveDetailUpdateQueryFind.affectedRows != 0) {
          res.status(200).json({
            success: true,
            message: "Modify employee leave successfully",
          });
        } else {
          res.status(404).json({
            success: false,
            message: "Some thing went wrong",
          });
        }
      }
      if (isType == "request") {
        //let {leaveDetailsId,userId,companyId,isLeave,ip_Address,leaveType_Id,hrReason}=req.body;
        let { id } = req.user;
        if (isLeave == 2 && hrReason == "") {
          res.status(404).json({
            success: false,
            message: "Please mention reject Reason",
          });
        }
        let userDetails = await ConnectionUtil(
          `select *	from user where isActive='1' AND status='1' AND user_id='${userId}' AND company_Id ='${companyId}'`
        );
        if (userDetails != "") {
          // --
          let leaveTypeDetails = await ConnectionUtil(
            `select leave_Type	from leave_Type where leaveType_id ='${leaveType_Id}' AND company_Id ='${companyId}'`
          );
          // console.log(leaveTypeDetails,"leaveTypeDetails");
          let leaveDetails = await ConnectionUtil(
            `select leave_Number,is_leave,user_Id from leave_details where leaveDetails_id='${leaveDetailsId}' AND company_Id ='${companyId}'`
          );
          // console.log(leaveDetails,"leaveDetails");
          if (leaveDetails[0].is_leave == 0) {
            // let salaryKey = {};
            let answer = JSON.parse(userDetails[0].leaveBalance);
            // console.log(answer,"answer");
            let leaveRemainStatus = await leaveRemainingCount(
              answer,
              leaveDetails[0].leave_Number,
              leaveTypeDetails
            );
            // console.log(leaveRemainStatus,"leaveRemainStatus");
            if (leaveRemainStatus == 1) {
              return res.status(404).json({
                success: false,
                message: "insufficent balance",
              });
            } else {
              let newLeaveBal = [];
              await answer.map((item) => {
                for (var leaveBal in item) {
                  //--
                  let lType = leaveTypeDetails[0].leave_Type;
                  if (leaveTypeDetails[0].leave_Type == "ShortHourly") {
                    lType = leaveTypeDetails[0].leave_Type.replace(
                      "ShortHourly",
                      "AnnualLeave"
                    );
                  }
                  //--
                  if (lType == leaveBal) {
                    let leaveKey = {};
                    item[leaveBal] = (
                      parseInt(item[leaveBal]) -
                      parseInt(leaveDetails[0].leave_Number)
                    ).toString();
                  }
                }
                newLeaveBal.push(item);
              });
              //  --
              let leaveDetailUpdateQueryFind = await ConnectionUtil(
                `update leave_details set hr_reason='${hrReason}', is_leave='${isLeave}' ,ip_Address='${ip_Address}',updated_By='${id}',hr_reason= '${hrReason}'  where user_id='${leaveDetails[0].user_Id}' AND company_Id ='${companyId}' AND leaveDetails_id='${leaveDetailsId}'`
              );
              if (leaveDetailUpdateQueryFind.affectedRows != 0) {
                let leaveBals = JSON.stringify(newLeaveBal);
                if (isLeave == 1) {
                  let leaveDetailUpdateQueryFind = await ConnectionUtil(
                    `update  user set leaveBalance='${leaveBals}' ,ip_Address='${ip_Address}',updated_By='${id}' where isActive='1' AND status='1' AND user_id='${leaveDetails[0].user_Id}' AND company_Id ='${companyId}'`
                  );
                  if (leaveDetailUpdateQueryFind.affectedRows != 0) {
                    let Arr = [];
                    let userDeviceToken = await ConnectionUtil(
                      `select device_Token from fcm_Notification where user_Id='${userId}' AND company_Id ='${companyId}'`
                    );
                    await userDeviceToken.map((data) => {
                      return Arr.push(data.device_Token);
                    });
                    let testMessage = {
                      title: "Leave acceptance - User", // "Accept Leave Notification",
                      body:
                        `Your request for ` +
                        leaveTypeDetails[0].leave_Type +
                        ` leave has been approved!`, //"Your leave accept successfully"
                    };
                    await helperNotification(Arr, testMessage);

                    return res.status(200).json({
                      success: true,
                      message: "Employee leave accept successfull",
                    });
                  } else {
                    return res.status(404).json({
                      success: false,
                      message: "something went wrong",
                    });
                  }
                }
                if (isLeave == 2) {
                  let Arr = [];
                  let userDeviceToken = await ConnectionUtil(
                    `select device_Token from fcm_Notification where user_Id='${userId}' AND company_Id ='${companyId}'`
                  );
                  await userDeviceToken.map((data) => {
                    return Arr.push(data.device_Token);
                  });
                  let testMessage = {
                    title: "Leave rejection - User", //"Reject Leave Notification",
                    body:
                      `Your request for ` +
                      leaveTypeDetails[0].leave_Type +
                      ` leave has been declined because [insert reason].`, //"Your leave reject successfully"
                  };
                  await helperNotification(Arr, testMessage);
                  return res.status(200).json({
                    success: true,
                    message: "Employee leave reject successfull",
                  });
                }
              } else {
                res.status(404).json({
                  success: false,
                  message: "Some thing went wrong",
                });
              }
            }
          } else if (leaveDetails[0].is_leave == 1) {
            res.status(404).json({
              success: false,
              message: "Already accept",
            });
          } else if (leaveDetails[0].is_leave == 2) {
            res.status(404).json({
              success: false,
              message: "Already reject",
            });
          }
        } else {
          res.status(404).json({
            success: false,
            message: "user not exits",
          });
        }
      } else {
        res.status(404).json({
          success: false,
          message: "Please select type first",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "user not exits",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// --------------- function leaveRemainingCount(check) ---------------
async function leaveRemainingCount(a, b, c) {
  let d = a.map((data) => {
    let lType = c[0].leave_Type;
    if (c[0].leave_Type == "ShortHourly") {
      lType = c[0].leave_Type.replace("ShortHourly", "AnnualLeave");
    }
    var strRegExPattern = "\\b" + Object.keys(data)[0] + "\\b";
    if (lType.match(new RegExp(strRegExPattern, "g"))) {
      if (parseInt(Object.values(data)) < parseInt(b)) {
        return 1;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  });
  let p = d.includes(1);
  return p ? 1 : 0;
}

// =============================== LEAVE TYPE ==============================================
//------------------------- Add_LeaveType -------------------------------------------------
module.exports.add_LeaveType = async (req, res) => {
  try {
    let { leaveType, ip_Address, companyId } = req.body;
    let { id, company_id } = req.user;
    let { branch_Id, access } = req.query;
    if (!leaveType) {
      return res
        .status(404)
        .json({ success: false, message: "leave type is required" });
    }
    var leaveDetail = await ConnectionUtil(
      `select * from leave_Type where isActive ='1' AND leave_Type='${leaveType}' AND company_Id = '${company_id}' AND branch_Id='${branch_Id}'`
    );
    if (leaveDetail == "") {
      let post = {
        leave_Type: leaveType,
        ip_Address: ip_Address,
        company_Id: company_id,
        branch_Id: branch_Id,
        created_By: id,
        updated_By: id,
      };
      let leaveAddQueryFind = await ConnectionUtil(
        `INSERT INTO leave_Type SET?`,
        post
      );
      if (leaveAddQueryFind.affectedRows != 0) {
        let leaveBalanceAddObjQueryFind = await ConnectionUtil(
          `Update user set leaveBalance=JSON_ARRAY_APPEND(leaveBalance, '$',CAST('{"` +
            leaveType +
            `": "0"}' as JSON) ) where company_id='${company_id}'
        `
        );
        res.status(200).json({
          success: true,
          message: "leave added successfully",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "something went wrong",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "leave type already exist",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//---------------------------- Delete_LeaveType --------------------------------------------
module.exports.delete_LeaveType = async (req, res) => {
  try {
    let { leaveTypeId, ip_Address, companyId } = req.body;
    let { id } = req.user;
    let userDetail = await ConnectionUtil(
      `select * from leave_Type where isActive='1' AND leaveType_id='${leaveTypeId}' AND company_Id = '${companyId}'`
    );
    if (userDetail.length > 0) {
      var departmentDeleteQuery = await ConnectionUtil(
        `update leave_Type set isActive='${0}',updated_By='${id}',ip_Address='${ip_Address}' where leaveType_id='${leaveTypeId}' AND company_Id = '${companyId}'`
      );
      if (departmentDeleteQuery.affectedRows != 0) {
        // ---
        let user = await ConnectionUtil(
          `Select * from user where company_id='${companyId}' AND role !='1' AND isActive='1' AND leaveBalance IS NOT NULL `
        );
        for (let userData of user) {
          let test = userData.leaveBalance;
          let userId = userData.user_id;
          let y = JSON.parse(test);
          arr = [];
          let str = userDetail[0].leave_Type;
          let leavestr = str.toLowerCase();
          var newArray = y.filter((value) => {
            let leaveKey = Object.keys(value)[0];
            let leaveKEY = leaveKey.toLowerCase();
            if (leaveKEY.replace(/\s/g, "") != leavestr.replace(/\s/g, "")) {
              return arr.push(value);
            }
          });
          let leaveJSON = JSON.stringify(newArray);
          let userDataUpdate = await ConnectionUtil(
            `update user set  leaveBalance='${leaveJSON}'  where user_id='${userId}'`
          );
        }
        // ---
        res.status(200).json({
          success: true,
          message: "Leave deleted successfully",
        });
      } else {
        res.status(403).json({
          success: false,
          message: "Leave not deleted",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "leaveTypeId not Found",
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

//------------------------------------- Show_LeaveType --------------------------------------
module.exports.show_LeaveType = async (req, res) => {
  try {
    let { company_id } = req.user;
    let { branch_Id, access } = req.query;
    let leaveDetail;
    if (access == 0) {
      leaveDetail = await ConnectionUtil(
        `select * from leave_Type where isActive='1' AND company_Id ='${company_id}' AND branch_Id='${branch_Id}'`
      );
    } else {
      leaveDetail = await ConnectionUtil(
        `select * from leave_Type where isActive='1' AND company_Id ='${company_id}'`
      );
    }
    res.status(200).json({
      success: true,
      message: "Show leave successfully",
      data: leaveDetail,
      dataS: company_id,
      branch_Id: branch_Id,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//---------------------------- update_LeaveType ---------------------------------------------
module.exports.update_LeaveType = async (req, res) => {
  try {
    let { leaveTypeId, ip_Address, companyId } = req.body;
    let { id } = req.user;
    let userDetail = await ConnectionUtil(
      `select * from leave_Type where isActive='1' AND leaveType_id='${leaveTypeId}' AND company_Id = '${companyId}'`
    );
    if (userDetail != "") {
      var departmentDeleteQuery = await ConnectionUtil(
        `update leave_Type set isActive='${0}',updated_By='${id}',ip_Address='${ip_Address}' where leaveType_id='${leaveTypeId}' AND company_Id = '${companyId}'`
      );
      if (departmentDeleteQuery != 0) {
        res.status(200).json({
          success: true,
          message: "Leave deleted successfully",
        });
      } else {
        res.status(403).json({
          success: false,
          message: "Leave not deleted",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "Leave not found",
        data: [],
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//------------------------------sandwichleave-------------------------------
module.exports.sandwichLeave = async (req, res) => {
  try {
    let { companyId, isSandwich } = req.body;
    let checkcompany = await ConnectionUtil(
      `select * from company where company_id='${companyId}' AND isActive='1'`
    );
    if (checkcompany != "") {
      let updateleave = await ConnectionUtil(
        `update company set is_sandwich='${isSandwich}' where company_id='${companyId}'`
      );
      if (updateleave.affectedRows != 0) {
        res.status(200).json({
          success: true,
          message: "sandwich leave update successfully",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "somethingwent wrong",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "invalid company please check your credintials",
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

//-----------------------------getSandwich--------------------------
module.exports.getSandwichLeave = async (req, res) => {
  try {
    let { companyId } = req.body;
    let getSandwich = await ConnectionUtil(
      `select is_sandwich from company where company_id='${companyId}' AND isActive='1'`
    );
    if (getSandwich != "") {
      res.status(200).json({
        success: true,
        message: "sadwich leave",
        data: getSandwich,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "invalid credintials",
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

//----------------------------- leaveDashboard_Graph --------------------------
module.exports.leaveDashboard_graph = async (req, res) => {
  try {
    let { company_Id } = req.body;
    let { branch_Id, access } = req.query;
    let leave_approved = await ConnectionUtil(`SELECT COALESCE(COUNT(*),0) as count FROM leave_details WHERE DATE_FORMAT(CURDATE(),'%Y-%m-%d') BETWEEN DATE_FORMAT(leave_From, '%Y-%m-%d') AND DATE_FORMAT(leave_To, '%Y-%m-%d') AND is_leave=1 AND company_Id='${company_Id}'`);

    let leave_pending =
      await ConnectionUtil(`select  COALESCE(COUNT(*),0) as count
    from leave_details where company_Id='${company_Id}' AND  is_leave=0 AND DATE_FORMAT(CURDATE(),'%Y-%m-%d')>=DATE_FORMAT(leave_From, '%Y-%m-%d') AND DATE_FORMAT(CURDATE(),'%Y-%m-%d')<=DATE_FORMAT(leave_To, '%Y-%m-%d')`);

    let leaveweekBy_department = await ConnectionUtil(`
    select COUNT(*) as count , department FROM leave_details as L JOIN user as U ON U.user_id=L.user_Id where (week(DATE_FORMAT(CURDATE(),'%Y-%m-%d')) = week(DATE_FORMAT(L.leave_from,'%Y-%m-%d')) OR week (DATE_FORMAT(CURDATE(),'%Y-%m-%d')) = week(DATE_FORMAT(L.leave_To,'%Y-%m-%d'))) AND  L.company_Id='${company_Id}' AND L.is_leave=1`);

    let leaves_takenMonth =
      await ConnectionUtil(`select COALESCE(leave_Name,'') as leave_Name,COALESCE(COUNT(*),0) as count from leave_details where year(DATE_FORMAT(CURDATE(),'%Y-%m-%d'))= year(DATE_FORMAT(leave_from,'%Y-%m-%d')) AND
    month(DATE_FORMAT(CURDATE(),'%Y-%m-%d')) = month(DATE_FORMAT(leave_from,'%Y-%m-%d')) AND company_Id='${company_Id}' AND  is_leave='1' GROUP BY leave_Name`);

    let total_LeavesType = await ConnectionUtil(
      `SELECT COUNT(*) as count , leave_Name , MONTHNAME(created_At) as month FROM leave_details WHERE MONTH(created_At) = MONTH(CURRENT_DATE) AND YEAR(created_At) = YEAR(CURRENT_DATE) AND is_Leave='1' AND company_id='${company_Id}' GROUP BY MONTH(created_At)`
    );

    let total_LeavesDepartment =
      await ConnectionUtil(`SELECT U.department ,COALESCE(COUNT(*),'') as count  
    FROM leave_details as L JOIN user as U ON U.user_id = L.user_Id   WHERE MONTH(L.leave_from) = MONTH(CURRENT_DATE) AND  YEAR(L.leave_from) = YEAR(CURRENT_DATE) AND  L.company_id='${company_Id}' GROUP BY U.department`);

    let obj = {
      leave_employeeToday: leave_approved[0].count,
      leave_pending: leave_pending[0].count,
      leaveweekBy_department: leaveweekBy_department,
      leaves_takenMonth: leaves_takenMonth,
      total_LeavesType: total_LeavesType,
      total_LeavesDepartment: total_LeavesDepartment,
    };

    res.status(200).json({
      success: true,
      message: "leave dashboard",
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

//------------------------- <leave challenge> -----------------------------

async function leaveChallenge(user_Id, company_Id) {
  let challengeDetail = await ConnectionUtil(
    `select age , age_From , age_To , Gender , genderType , Department , department_Name , company_Id , Reward , action_Required ,challenge_Configuration , DATE_FORMAT(expiry_Date , '%Y-%m-%d') expiry_Date, challengePredefined_Id , DATE_FORMAT(created_At , '%Y-%m-%d') created_At , challenges_id from challenges where  challengePredefined_Id = '4' AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND action_Required = '1'`
  );
  for (let Challenge of challengeDetail) {
    let challengeUserAssignDetail = await ConnectionUtil(
      `select * from userassign_challenges  where isCompleted='0' AND isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${user_Id}' `
    );
    
    if (Challenge.company_Id == 0) {
      if (Challenge.age == 0 && Challenge.Gender == 0) {
        if (challengeUserAssignDetail.length > 0) {
          await challengeTaskSickLeave(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskSickLeave(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskSickLeave(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskSickLeave(Challenge, user_Id, company_Id , challengeUserAssignDetail);
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
      }
    } else {
      if (Challenge.age == 0 && Challenge.Gender == 0 && Challenge.Department == 0) {
        if (challengeUserAssignDetail.length > 0) {
          await challengeTaskSickLeave(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskSickLeave(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskSickLeave(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskSickLeave(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskSickLeave(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskSickLeave(Challenge, user_Id, company_Id , challengeUserAssignDetail);
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
              await challengeTaskSickLeave(Challenge, user_Id, company_Id , challengeUserAssignDetail);
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
      }
    }

  }
}


async function challengeTaskSickLeave (Challenge, user_Id, company_Id , challengeUserAssignDetail) {
  // console.log(challengeUserAssignDetail, "challenfjghfd");

  let d1 = new Date(Challenge.created_At).getTime();
  let d2 = new Date(Challenge.expiry_Date).getTime();
  let differernceDays = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24) + 1);
  // console.log(differernceDays, "differernceDays");
  let y = JSON.parse(Challenge.challenge_Configuration);
  // console.log(y, "y");
  let valueCondition =
    y[0].value == "Less Than"
      ? "<"
      : y[0].value == "More Than"
      ? ">"
      : y[0].value == "Equal"
      ? "="
      : ">=";
  // console.log(valueCondition, "valueCondition");
  let valueTimes = y[1].value;
  // console.log(valueTimes, "valueTimes");
  let leaveChallengeArr = await ConnectionUtil(
    `SELECT * FROM leave_details WHERE leave_Name = 'Medical' AND company_Id = ${company_Id} AND user_Id = ${user_Id} AND is_leave = 1 AND DATE_FORMAT(created_At , '%Y-%m-%d') BETWEEN '${Challenge.created_At}' AND '${Challenge.expiry_Date}'`
  );
  let x = 0;
  for (let resp of leaveChallengeArr) {
    let d1 = new Date(resp.leave_From).getTime();
    let d2 = new Date(resp.leave_To).getTime();
    let differernceDays = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24) + 1);
    // console.log(differernceDays, "leaveDays");
    x += differernceDays;
    // console.log(x, "x");
  }
  console.log(x, "x");
  if (eval(x + " " + valueCondition + " " + valueTimes)) {
    console.log("condition satisfied of challenge");
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
  } else {
    console.log("challenge can not be completed in this duration");
  }
}

//-------------------------</leave challenge> -----------------------------
