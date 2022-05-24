const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let moment = require("moment");
let message = require("../../lib/helpers/message");
var nDate = new Date().toLocaleString("en-US", {
  timeZone: "Asia/Calcutta",
});

//------------------------- Leave_Add -------------------------------------
module.exports.add_Leave = async (req, res) => {
  try {
    let {
      leaveType_Id,
      leave_Type,
      leave_Name,
      leave_description,
      leave_Number,
      ip_Address,
      user_Id,
      company_Id,
      leave_From,
      leave_To,
      user_reason,
      to_Hour,
      from_Hour,
      is_Short,
    } = req.body;
    let { id } = req.user;
  
    let userDetails = await ConnectionUtil(
      `select * from user where isActive = '1' AND user_id = '${user_Id}' AND company_id ='${company_Id}'`
    );
    if (userDetails != "") {
       //Day
      if( is_Short==0){
      // ----
      // let salaryKey = {};
      // let answer = JSON.parse(userDetails[0].leaveBalance).map((item) => {
      // for (var ck in item) {
      // if (ck == leave_Type) {
      // return (salaryKey = item);
      // }
      // }
      // });
      // var size = Object.keys(salaryKey).length;
      // if (size != 0) {
      // let value = Object.values(salaryKey);
      // let val=parseInt(value);
      // if ( val>= leave_Number) {
      // if (is_Short == 0) {
      // console.log("DDD")
      // if (leave_To < leave_From) {
      // return res.status(404).json({
      // success: false,
      // message: "Invalid Date",
      // });
      // ---
      let leaveDetail = await ConnectionUtil(
        `select * from leave_details where isActive = '1' AND company_Id ='${company_Id}' AND (('${leave_From}'<=leave_To) AND ('${leave_From}'>=leave_From)) AND user_Id ='${user_Id}'`
      );
      let leaveData = await ConnectionUtil(
        `select * from leave_details where isActive = '1' AND company_Id ='${company_Id}' AND (('${leave_To}' <= leave_To) AND ('${leave_To}' >= leave_From)) AND user_Id='${user_Id}'`
      );
      if ((leaveDetail == "") & (leaveData == "")) {
        let post = {
          leaveType_Id: leaveType_Id,
          leave_Name: leave_Name,
          leave_description: leave_description,
          leave_Number: leave_Number,
          created_By: id,
          updated_By: id,
          ip_Address: ip_Address,
          user_Id: user_Id,
          company_Id: company_Id,
          leave_From: moment(leave_From).format("YYYY-MM-DD"),
          leave_To: moment(leave_To).format("YYYY-MM-DD"),
          user_reason: user_reason,
          to_Hour: moment("00:00:00", "HH:mm:ss").format("HH:mm:ss"),
          from_Hour: moment("00:00:00", "HH:mm:ss").format("HH:mm:ss"),
        };
        let leaveData = await ConnectionUtil(
          `INSERT INTO leave_details SET?`,
          post
        );

       
          

        res.status(200).json({
          success: true,
          message: "leave applied successfully",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "You have already added leave for these date",
        });
      }
    } //hourly 
    // --
    else{
    let to   =  moment(to_Hour, "HH:mm:ss").format("HH:mm:ss");
    let from =  moment(from_Hour, "HH:mm:ss").format("HH:mm:ss");
      let leaveDetail = await ConnectionUtil(
        `select * from leave_details where isActive = '1' AND company_Id ='${company_Id}' AND user_Id ='${user_Id}' AND leave_From ='${leave_From}'`
      );
      if ((leaveDetail == "") ) {
        let post = {
          leaveType_Id: leaveType_Id,
          leave_Name: leave_Name,
          leave_description: leave_description,
          leave_Number: leave_Number,
          created_By: id,
          updated_By: id,
          ip_Address: ip_Address,
          user_Id: user_Id,
          company_Id: company_Id,
          is_leave:0,
          leave_From: moment(leave_From).format("YYYY-MM-DD"),
          leave_To: moment(leave_From).format("YYYY-MM-DD"),
          user_reason: user_reason,
          to_Hour: moment(to_Hour, "HH:mm:ss").format("HH:mm:ss"),
          from_Hour: moment(from_Hour, "HH:mm:ss").format("HH:mm:ss")
        };
        let leaveData = await ConnectionUtil(
          `INSERT INTO leave_details SET?`,
          post
        );

        

        res.status(200).json({
          success: true,
          message: "leave applied successfully",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "You have already added leave for this hour",
        });
      }
    // }else{
    //   // let val="";
    //   // if(leaveDefineDetail[0].is_leave==0){
    //   //   val="pending";
    //   // }
    //   // if(leaveDefineDetail[0].is_leave==1){
    //   //   val="approved"
    //   // }
    //   res.status(404).json({
    //     success: false,
    //     message: "Leave apply already for same date"
    //   }); 
    // }
    }
    
    // --
    } else {
      res.status(200).json({
        success: false,
        message: "User Not Found",
      });
    }
  } catch (err) {
    console.log(err)
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};




// ------------------------- Leave_Show -----------------------------------
module.exports.show_Leave = async (req, res) => {
  try {
    let { user_id, company_id } = req.body;
    var arr = [];
    let userData = await ConnectionUtil(
      `select 	leave_description,leaveDetails_id,leave_Name, created_At, leave_From, leave_To, leave_Number, status, user_reason, hr_reason, is_leave  from leave_details where is_leave='0' AND isActive = '1' AND user_id='${user_id}' AND company_id='${company_id}'  ORDER BY leaveDetails_id DESC`
    );
    for (let test of userData) {
      test.created_At = moment(test.created_At)
        .add(5, "hour")
        .add(29, "m")
        .toDate();
      test.is_leave = "Pending";
      arr.push(test);
    }
    res.status(200).json({
      success: true,
      message: "Show Data",
      data: arr,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// ------------------------- Leave_cancel ------------------------------------
module.exports.cancel_Leave = async (req, res) => {
  try {
    let { user_id, ip_Address, company_id, leaveDetailsId } = req.body;
    let { id } = req.user;
    if (!user_id) {
      return res
        .status(404)
        .json({ success: false, message: "User id is requied" });
    }
    if (!ip_Address) {
      return res
        .status(404)
        .json({ success: false, message: "Ip address is requied" });
    }
    if (!company_id) {
      return res
        .status(404)
        .json({ success: false, message: "Company id is requied"});
    }
    let leaveDetail = await ConnectionUtil(
      `select * from leave_details where isActive = '1' AND user_id='${user_id}' AND company_id='${company_id}' AND leaveDetails_id='${leaveDetailsId}'`
    );
    if (leaveDetail != "") {
      if (leaveDetail[0].is_leave == 0) {
        let leaveCancelQuery = await ConnectionUtil(
          `delete from leave_details where isActive = '1' AND user_id='${user_id}' AND company_id='${company_id}' AND leaveDetails_id='${leaveDetailsId}'`
        );
   
        // var leaveCancelQuery = await ConnectionUtil(
          // `update leave_details set is_leave='${3}', updated_By='${id}', ip_Address='${ip_Address}'  where isActive = '1' AND user_id='${user_id}' AND company_id='${company_id}' AND leaveDetails_id='${leaveDetailsId}'`
    
          // );
        return res.status(200).json({
          success: true,
          message: "Your leave cancelled successfully",
          data: leaveCancelQuery,
        });
      }
      // if (leaveDetail[0].is_leave == 1) {
      //   return res.status(200).json({
      //     success: true,
      //     message: "Your leave already approved please contact hr",
      //   });
      // }
      // if (leaveDetail[0].is_leave == 2) {
      //   return res.status(200).json({
      //     success: true,
      //     message: "Your leave already rejected",
      //   });
      // }
    } else {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err,
    });
  }
};

// ------------------------- Leave_Update -----------------------------------
module.exports.update_Leave = async (req, res) => {
  try {
    let {
      leaveType_Id,
      leave_Name,
      leave_description,
      leave_Number,
      updated_By,
      ip_Address,
      user_Id,
      company_Id,
      leave_From,
      leave_To,
      reason,
    } = req.body;
    let userData = await ConnectionUtil(
      `select * from leave_details where isActive = '1' AND user_id='${user_id}' AND company_id='${company_id}'`
    );
    if (userData != "") {
      var leaveUpdateQuery = await ConnectionUtil(
        `update leave_details set leaveType_Id='${leaveType_Id}', leave_Name='${leave_Name}', leave_description='${leave_description}',leave_Number='${leave_Number}',ip_Address='${ip_Address}',user_Id='${user_Id}',company_Id='${company_Id}',leave_From='${leave_From}',leave_To='${leave_To}',reason='${reason}' where isActive='1' AND user_Id ='${user_Id}'`
      );
      res.status(200).json({
        success: true,
        message: "Leave Updated Successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "User data not found",
        data: [],
      });
    }
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err,
    });
  }
};

//----------------------------Leave_List--------------------------
module.exports.leave_List = async (req, res) => {
  try {
    let { user_Id, company_Id, search } = req.body;
    let history = [];
    var date = new Date();
    let holidays = await ConnectionUtil(
      `select event_Description, event_StartDate , event_EndDate , event_Title from calendar_Event where isType='holiday' AND isActive = '1' AND company_Id='${company_Id}' AND YEAR(event_StartDate) = YEAR(CURRENT_DATE())  ORDER BY event_StartDate ASC`
    );
    let userDataHistory;
    if (search == "all" || search == "") {
      userDataHistory = await ConnectionUtil(
        `select * from leave_details where (is_leave ='1' or is_leave='2' or  is_leave='3') AND isActive = '1' AND user_id='${user_Id}' AND company_id='${company_Id}' ORDER BY leaveDetails_id DESC`
      );
    } else if (search != "") {
      userDataHistory = await ConnectionUtil(
        `select * from leave_details where leave_Name LIKE '${search}%' AND  isActive = '1' AND user_id='${user_Id}' AND company_id='${company_Id}' ORDER BY leaveDetails_id DESC`
      );
    } else {
      userDataHistory = await ConnectionUtil(
        `select * from leave_details where is_leave ='1' or is_leave='2' or  is_leave='3' AND isActive = '1' AND user_id='${user_Id}' AND company_id='${company_Id}' ORDER BY leaveDetails_id DESC`
      );
    }
    for (var userHistory of userDataHistory) {
      let userName = await ConnectionUtil(
        `select CONCAT(first_name,' ',last_name) as username from user where user_id='${userHistory.updated_By}' AND company_id='${company_Id}'`
      );
      if (userHistory.is_leave == 1) {
        userHistory.is_leave = "Approved";
        userHistory.approved_By =
          userName[0].username != "" ? userName[0].username : "ByHr";
      } else if (userHistory.is_leave == 3) {
        userHistory.is_leave = "Cancelled";
        // userHistory.approved_By ="";
        userHistory.hr_reason = userHistory.hr_reason;
      } else {
        userHistory.is_leave = "Rejected";
        userHistory.approved_By =
          userName[0].username != "" ? userName[0].username : "ByHr";
      }
      history.push(userHistory);
    }
    res.status(200).json({
      success: true,
      message: "Show Data",
      history: history,
      holiday: holidays,
    });
  } catch (err) {
    res.status(403).json({
      success: false,
      message: err,
    });
  }
};

//----------------------------All_Employee_Whos_Are_On_Leave--------------------------
module.exports.allEmployee_List = async (req, res) => {
  try {
    let { user_Id, company_Id } = req.body;

    let leaveDetail = await ConnectionUtil(
      `select * from leave_details where is_leave='1'  AND isActive = '1' AND company_Id ='${company_Id}'`
    ); // AND user_Id='${user_Id}'
    let arr = [];
    if (leaveDetail != "") {
      for (var test of leaveDetail) {
        if (test.user_Id != user_Id) {
          arr.push(test);
        }
      }
      res.status(200).json({
        success: true,
        message: "show leave data",
        data: leaveDetail, //arr,
      });
    } else {
      res.status(403).json({
        success: false,
        message: "User data not found",
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

// ----------------------------- Leave_Balance -----------------------------
module.exports.balance_Leave = async (req, res) => {
  try {
    let { user_Id, company_Id } = req.body;
    let userDetails = await ConnectionUtil(
      `select * from user where user_id ='${user_Id}' AND company_Id='${company_Id}' AND leaveBalance IS NOT NULL`
    );
    if(userDetails.length>0){
    let userLeave = await ConnectionUtil(
      `select SUM(leave_Number) as count,leave_Name from leave_details where  is_leave ='1'  AND user_id ='${user_Id}' AND company_Id='${company_Id}' GROUP BY leave_Name`
    );
    let leaveNewArr;
    let arr = [];
    var LeaveArray = JSON.parse(userDetails[0].leaveBalance);
    for (let leaveObj of LeaveArray) {
      let obj={};
      let leaveGiveCount = userLeave.filter((data) => {
        var strRegExPattern = '\\b'+Object.keys(leaveObj)[0]+'\\b'; 
        return data.leave_Name.match(new RegExp(strRegExPattern,'g'));
      });
      if (leaveGiveCount.length) {
        obj={
          leaveName:(Object.keys(leaveObj)[0].replace(/\s/g, "")).replace('leave',''), 
          totalLeave:Object.values(leaveObj)[0],
          count:leaveGiveCount[0].count
        }
      }else{
        obj={
          leaveName:(Object.keys(leaveObj)[0].replace(/\s/g, "")).replace('leave',''), 
          totalLeave:Object.values(leaveObj)[0],
          count:0
        }
      }
      arr.push(obj)
    }
    res.status(200).json({
      success : true,
      message : "Show leave balance",
      data    : arr
    });
  }else{
    res.status(200).json({
      success : true,
      message : "Show leave balance",
      data    : []
    });
  }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// ----------------------------- Leave_Balance -----------------------------
module.exports.onLeave = async (req, res) => {
  try {
    let { companyId } = req.body;
    let date = new Date();
    const currentDateMomentformat = moment(date).format("YYYY-MM-DD 00:00:00");
    let leaveDetails = await ConnectionUtil(
      `SELECT leave_description,leaveDetails_id,leave_Name, created_At, leave_From, leave_To, leave_Number, status, user_reason, hr_reason, is_leave,user_Id,company_Id FROM leave_details WHERE is_leave='1' AND company_Id='${companyId}' AND   '${currentDateMomentformat}' between leave_From AND leave_To`
    );
    res.status(200).json({
      success: true,
      message: "Show leave balance",
      data: leaveDetails,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json(message.err);
  }
};

// ----------------------------- Leave_Balance -----------------------------
module.exports.approveLeaveCancel= async (req, res) => {
  try {
    let { leaveDetails_Id , ip_Address ,user_Id , company_Id } =req.body;
    let leaveDetails = await ConnectionUtil(`SELECT * FROM leave_details WHERE is_leave='1' AND leaveDetails_id='${leaveDetails_Id}' AND  company_Id='${company_Id}' AND user_Id='${user_Id}'`);
    if(leaveDetails.length>0){
      let leaveUpdateDetails = await ConnectionUtil(`Update leave_details set  is_leave='3',ip_Address='${ip_Address}', updated_By='${user_Id}' WHERE leaveDetails_id='${leaveDetails_Id}' AND company_Id='${company_Id}' AND user_Id='${user_Id}'`);
      if(leaveUpdateDetails.affectedRows!=0){
        let userDetails = await ConnectionUtil(`SELECT leaveBalance FROM user WHERE  user_Id='${user_Id}'`);
        let userLeave=JSON.parse(userDetails[0].leaveBalance) 
        let newLeaveBal = [];
        await userLeave.map((item) => {
          for (var leaveBal in item) {            
              let lType = leaveDetails[0].leave_Name;              
          //     if (leaveTypeDetails[0].leave_Type == "ShortHourly") {
          //       lType = leaveTypeDetails[0].leave_Type.replace(
          //         "ShortHourly",
          //         "AnnualLeave"
          //       );
          //     }
            if (leaveBal ==lType){ 
              let leaveKey = {};
              item[leaveBal] = (
                parseInt(item[leaveBal]) +
                parseInt(leaveDetails[0].leave_Number)
              ).toString();
            }
          }
          newLeaveBal.push(item);
        });
        let leave=JSON.stringify(newLeaveBal)
        let userLeaveUpdateDetails = await ConnectionUtil(`Update user set leaveBalance='${leave}', ip_Address='${ip_Address}', updated_By='${user_Id}' WHERE company_id='${company_Id}' AND user_id='${user_Id}'`);
        res.status(200).json({
          success: true,
          message: "Leave cancel successfully",
          data:userLeaveUpdateDetails,
          user:await ConnectionUtil(`SELECT leaveBalance FROM user WHERE  user_Id='${user_Id}'`)
        }); 
      }
    }else{
      res.status(404).json({
        success: false,
        message: "Leave is not found",
        data:[]
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message
  })
  }
};

//------------------------------------- Show_LeaveType --------------------------------------
module.exports.show_LeaveType = async (req, res) => {
  try {
    let { company_id } = req.user;
    var leaveDetail = await ConnectionUtil(
      `select * from leave_Type where isActive='1' AND company_Id ='${company_id}'`
    );
    if (leaveDetail.length>0) {
       leaveDetail = [...leaveDetail, {leaveType_id: 0,leave_Type: "Short_leave",status: 1,created_At: "2021-06-15T17:16:28.000Z",updated_At: "2021-06-15T17:16:28.000Z",created_By: 1,updated_By:1,ip_Address:"12.43.33.33",isActive: 1,company_Id:company_id}]; 
      res.status(200).json({
        success: true,
        message: "Show leave successfully",
        data: leaveDetail,
        dataS: company_id,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Leave not exist",
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













