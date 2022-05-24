const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);


// ------------------------- employeeReportBy_Leave -----------------------------------
module.exports.employeeReportBy_Leave = async (req, res) => {
  try {
    let { company_Id, start_date, end_date, page, pagination } = req.body;
    let offset = page * pagination;
    let limit = pagination
    let { branch_Id, access } = req.query;
    let newArr = [];
    let day = 365;
    let user_Detail;
    let leaveType;
    let user_leaveDetail;
    let userDataLength = 0;

    if (access == 0) {
      user_Detail = await ConnectionUtil(`select leaveBalance,COALESCE(reporting_Manager,'no name')as reporting_Manager , COALESCE(department,'department') as department, user_id,CONCAT(COALESCE(first_name,' '),' ',COALESCE(last_name,' ')) as name,user_id,company_id from user where  branch_id='${branch_Id}'AND company_id='${company_Id}' `)//LIMIT ${limit} OFFSET ${offset}`);

      user_leaveDetail = await ConnectionUtil(`select COALESCE(leaveBalance,'[]') as leaveBalance from user where  company_id='${company_Id}' AND branch_id='${branch_Id}'`);
     
      let userlength = await ConnectionUtil(`select * from user where  branch_id='${branch_Id}'AND company_id='${company_Id}'`);
      userDataLength = userlength.length;

      leaveType = await ConnectionUtil(
        `select leaveType_id , leave_Type from leave_Type where isActive='1' AND company_Id ='${company_Id}' AND branch_Id='${branch_Id}'`
      );
    } else {
      leaveType = await ConnectionUtil(
        `select leaveType_id , leave_Type from leave_Type where isActive='1' AND company_Id ='${company_Id}'`
      );
      user_Detail = await ConnectionUtil(`select leaveBalance,COALESCE(reporting_Manager,'no name') as reporting_Manager , COALESCE(department,'department') as department,user_id,CONCAT(COALESCE(first_name,' '),' ',COALESCE(last_name,' ')) as name,user_id,company_id from user where  company_id='${company_Id}'`)// LIMIT ${limit} OFFSET ${offset}`);
      
      user_leaveDetail = await ConnectionUtil(`select COALESCE(leaveBalance,'[]') as leaveBalance from user where  company_id='${company_Id}'`);
      
      let userlength = await ConnectionUtil(`select * from user where  company_id='${company_Id}'`);
      userDataLength = userlength.length;
    }
    let total_getleave = 0;
    let userLeaveRemain=[]
    for (let user of user_Detail) {
      let leaveArray = JSON.parse(user.leaveBalance);
      userLeaveRemain = await leaveBalance(leaveArray);
      let leave_taken = await takenleave(leaveType, user.user_id)
      await leave_taken.map((data) => { total_getleave += data.value })
      user.leaveTaken = total_getleave
      user.leave = leave_taken
      user.leave_balance = userLeaveRemain
      newArr.push(user)
    };

    let companyDetail = await ConnectionUtil(`select workingDay from company where company_id='${company_Id}'`);

    let holiday = await ConnectionUtil(`select * from calendar_Event where isType='holiday' AND isActive=1 AND company_Id='${company_Id}'`);

    let companyWorkingDay_arr = JSON.parse(companyDetail[0].workingDay);

    let first_saturday = !companyWorkingDay_arr[6].OnOff ? 0 : 26;
    let second_saturday = !companyWorkingDay_arr[7].OnOff ? 0 : 26;
    let totalDay_weekend = first_saturday + second_saturday + holiday.length + 52;
    let workingDayTotal = day - totalDay_weekend;
    let arr = [];
    for (let userleave of newArr) {
      arr.push(userleave.leave)
    }
    let val = arr.flat();
    let tot_leave = combinedItems(val);

    let obj = {
      man_day: workingDayTotal,
      leave_day: totalDay_weekend,
      user_Leave: newArr,
      leave_type: leaveType,
      total_leave:tot_leave// [{ key: "sick", value: 0 }, { key: "madical", value: 0 }]
    };
    res.status(200).json({
      success: true,
      message: "Leave report by employee",
      data: obj,
      length: userDataLength
    });
  } catch (err) {
    console.log(err)
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

async function takenleave(leaveType, userId) {
  let newArr = [];
  for (let typeLeaveObj of leaveType) {
    let userLeave = await ConnectionUtil(
      `select SUM(leave_Number) as count,leave_Name from leave_details where  is_leave ='1'  AND user_id ='${userId}' AND leaveType_Id='${typeLeaveObj.leaveType_id}' GROUP BY leave_Name`
    );
    let obj = { key: typeLeaveObj.leave_Type, value: userLeave.length > 0 ? userLeave[0].count : 0 };
    newArr.push(obj)
  }
  return newArr
}

async function leaveBalance(leaveArray) {
  let count_leave_remain = 0;
  if (leaveArray) {
    for (let leaveCount of leaveArray) {
      count_leave_remain = count_leave_remain + parseInt(Object.values(leaveCount)[0]);
    }
  }
  return count_leave_remain;
}

const combinedItems = (arr = []) => {
  const res = arr.reduce((acc, obj) => {
     let found = false;
     for (let i = 0; i < acc.length; i++) {
        if (acc[i].key === obj.key) {
           found = true;
          acc[i].value+=obj.value
        };
     }
     if (!found) {
        acc.push(obj);
     }
     return acc;
  }, []);
  return res;
}

module.exports.employeeReportBy_LeaveCalendar = async (req, res) => {
  let { company_Id, month, year } = req.body;
  let { branch_Id, access } = req.query;
  let leaveDetailSelectQuery;
  if (access == 0) {
    leaveDetailSelectQuery = await ConnectionUtil(`select COALESCE(COUNT(*),0) as count,leave_From  from leave_details where YEAR(leave_From) =${year} AND  MONTH(leave_From) = ${month} AND company_Id='${company_Id}' AND bracnh_Id='${branch_Id}'  GROUP BY DAYNAME(leave_From)`)
  } else {
    leaveDetailSelectQuery = await ConnectionUtil(`select COUNT(*) as count,leave_From as leave_report  from leave_details where YEAR(leave_From) =${year} AND  MONTH(leave_From) =${month}  AND company_Id='${company_Id}' GROUP BY DAYNAME(leave_From)`)
  }
  res.status(200).json({
    success: true,
    message: "Leave detail calender list",
    data: leaveDetailSelectQuery
  });
}

module.exports.employeeReportBy_LeaveDetail = async (req, res) => {
  let { date, company_Id } = req.body;
  let { branch_Id, access } = req.query;
  let userLeaveDetailSelectQuery;
  if (access == 0) {
    userLeaveDetailSelectQuery = await ConnectionUtil(`select COALESCE(L.leave_Name) as leave_name,CONCAT(COALESCE(U.first_name,' '),' ',COALESCE(U.last_name,' ')) as name,U.email,
    COALESCE(U.reporting_Manager,'') as reporting_Manager
    ,COALESCE(U.department,'') as department ,COALESCE(U.mobile,'') as mobile,COALESCE(L.leave_From,'') as leave_date
     from leave_details as L  JOIN user as U ON U.user_id=L.user_Id  where L.branch_Id=${branch_Id} AND L.company_Id=${company_Id} AND DATE_FORMAT(L.leave_From,'%Y-%m-%d')='${date}'`);
  } else {
    userLeaveDetailSelectQuery = await ConnectionUtil(`select COALESCE(L.leave_Name) as leave_name,CONCAT(COALESCE(U.first_name,' '),' ',COALESCE(U.last_name,' ')) as name,U.email,
    COALESCE(U.reporting_Manager,'') as reporting_Manager
    ,COALESCE(U.department,'') as department ,COALESCE(U.mobile,'') as mobile,COALESCE(L.leave_From,'') as leave_date from leave_details as L  JOIN user as U ON U.user_id=L.user_Id  where L.company_Id=${company_Id} AND DATE_FORMAT(L.leave_From,'%Y-%m-%d')='${date}'`);
  }
  res.status(200).json({
    success: true,
    message: "Leave detail user list",
    data: userLeaveDetailSelectQuery
  });
}
