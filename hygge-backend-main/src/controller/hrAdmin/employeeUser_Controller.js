const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let MAIL = require("../../config/email");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let bcrypt = require("bcryptjs");
let { issueJWT } = require("../../lib/helpers/jwt");
let message = require("../../lib/helpers/message");
let randomToken = require("random-token");
let internalIp = require("internal-ip");
let otp = require("../../lib/helpers/otp");
let template =require('../../lib/helpers/emailTemplate/index')
// ------------------------- Register Employee -----------------------------------
module.exports.Employee_Register = async (req, res) => {
  try {
    // first_name,last_name,email,profile_picture,password,address,role
    var {
      first_name, //1
      last_name, //2
      email, //3
      department,
      designation,
      address,
      reporting_Manager,
      employee_joiningDate,
      insurance_plan_name,
      working_HoursTo,
      working_HoursFrom,
      company_id,
      role,
      created_By,
      updated_By,
      ip_Address,
      salaryBalance, //total,basic,home_Allowance,transportation_Allowance,other_Allowance,
      leaveBalance, //maternity,medical,annual,unpaid_Leaves,others,
      isType,
      profile_picture,
      branch_Id
    } = req.body;
    let { id } = req.user;
    let fullName = first_name+ ' '+ last_name;
    if (!first_name) {
      return res.status(403).json({
        success: false,
        message: "first_name is required",
      });
    }
    if (!last_name) {
      return res.status(403).json({
        success: false,
        message: "last_name is required",
      });
    }
    if (!email) {
      return res.status(403).json({
        success: false,
        message: "email is required",
      });
    }
    // if (role!=0) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "role is required",
    //   });
    // }
    var EmployeeDetail = await ConnectionUtil(
      `select * from user where  email='${email}' AND isActive='1'`
    );

    let licenseCheckArr = await ConnectionUtil (
      `SELECT * FROM company WHERE company_id = ${company_id}`
    )
    let licenseCheck ;
    licenseCheckArr.map((data) => {
      licenseCheck = data.license
    })
if (licenseCheck != 0) {
  
  if (EmployeeDetail == "") {
    let BlankArray = [];
    var token = await otp.Otp_function()//randomToken(10);
    let hashpassword = await bcrypt.hash(token, await bcrypt.genSalt(10));
    let employeeObj = {
      first_name: first_name != "" ? first_name : "",
      last_name: last_name != "" ? last_name : "",
      email: email,
      password: hashpassword,
      reporting_Manager: reporting_Manager,
      employee_joiningDate:
        employee_joiningDate != "" ? employee_joiningDate : "",
      department: department != "" ? department : "",
      designation: designation != "" ? designation : "",
      insurance_plan_name:
        insurance_plan_name != "" ? insurance_plan_name : "",
      // total: total,
      // basic: basic,
      // home_Allowance: home_Allowance,
      // transportation_Allowance: transportation_Allowance,
      // other_Allowance: other_Allowance,
      // maternity: maternity,
      // medical: medical,
      // annual: annual,
      // unpaid_Leaves: unpaid_Leaves,
      // others: others,
      working_HoursTo: working_HoursTo != "" ? working_HoursTo : "",
      working_HoursFrom: working_HoursFrom != "" ? working_HoursFrom : "",
      company_id: company_id,
      role: 0,//role,
      created_By: created_By != "" ? created_By : id,
      updated_By: updated_By != "" ? updated_By : id,
      ip_Address: ip_Address != "" ? ip_Address : "",
      profile_picture: "", //download.png
      salaryBalance:
        JSON.stringify(salaryBalance) != ""
          ? JSON.stringify(salaryBalance)
          : JSON.stringify(BlankArray),
      leaveBalance:
        JSON.stringify(leaveBalance) != ""
          ? JSON.stringify(leaveBalance)
          : JSON.stringify(BlankArray),
      isSubAdmin: isType != '' ? isType : 0,
      forget_Otp: token,//isType == 1 ? token : 0,
      address: address != "" ? address : "",
      branch_Id: branch_Id != "" ? branch_Id : 0
    };
    let qrcode = email;
    var employeeInsertQuery = await ConnectionUtil(
      `INSERT INTO user SET ?`,
      employeeObj
    );
    licenseCheck--
    let updateLicenseDetails = await ConnectionUtil (
      `UPDATE company SET license = ${licenseCheck} WHERE company_id = ${company_id}`
    )
    console.log(updateLicenseDetails , "updatelicenseDetail")
    // var companyUpdateQueryFind = ConnectionUtil(`update company set number_Employee='${}' where company_id ='${company_id}'`);
    if (employeeInsertQuery.insertId != 0) {
      if (reporting_Manager == "") {
        let first_nam = first_name != "" ? first_name : "";
        let last_nam = last_name != "" ? last_name : "";
        let name = first_nam + " " + last_nam
        var companyUpdateQueryFind = ConnectionUtil(`update user set reporting_Manager='${name} where user_id='${employeeInsertQuery.insertId}'`)
      }
      // if (isType == 1) {
      //   var SubAdminMail = await MAIL.NewCompanyEmail_function(email, token);
      //   res.status(200).json({
      //     success: true,
      //     message: "subAdmin registed successfully",
      //   });
      // }
      // if (isType == 0) {
      let email_template = template.EmpInvitationTemplate.EmpInvitationTemp(email,token,qrcode,fullName); 
      var EmployeeMail = await MAIL.QRCode_Email_function(email,email_template,qrcode);
      res.status(200).json({
        success: true,
        message: "Employee registred successfully",
      });
    }
    // } 
    else {
      res.status(404).json({
        success: false,
        message: "something went wrong",
      });
    }
  } else {
    res.status(403).json({
      success: false,
      message: "employee email already exist",
    });
  }
} else {
  res.status(401).json({
    success: false,
    message: "out of license",
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
// ------------------------- show Employee Detail -----------------------------------
module.exports.Show_EmployeeDetail = async (req, res) => {
  try {
    let { company_id } = req.user;
    let { branch_Id, access } = req.query;
    var NewArr = [];
    var EmployeeDetail;
    if (access == 0) {
      EmployeeDetail = await ConnectionUtil(
        `select * from user where isActive=1 AND company_id='${company_id}' AND branch_Id='${branch_Id}' ORDER BY user_id DESC`
      );  //role!=1 AND
    } else {
      EmployeeDetail = await ConnectionUtil(
        `select * from user where isActive=1 AND company_id='${company_id}'  ORDER BY user_id DESC`
      );  //role!=1 AND
    }
    if (EmployeeDetail != "") {
      for (let employee of EmployeeDetail) {
        var roletype = await ConnectionUtil(
          `select role_Type from user_Role where status=1 AND isActive=1 AND userRole_id='${employee.role}'`
        );
        employee.roleName = roletype.length > 0 ? roletype[0].role_Type : "";
        NewArr.push(employee);
      }
      res.status(200).json({
        success: true,
        message: "Show employee detail",
        data: NewArr,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User companyID not exist",
        data: [],
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message
    });
    // res.status(400).json(message.err);
  }
};

// ------------------------- update_Employee Detail -----------------------------------
module.exports.Edit_Employee = async (req, res) => {
  try {
    let {
      user_id,
      first_name,
      last_name,
      email,
      department,
      designation,
      reporting_Manager,
      employee_joiningDate,
      insurance_plan_name,
      working_HoursTo,
      working_HoursFrom,
      company_id,
      role,
      updated_By,
      ip_Address,
      salaryBalance,
      leaveBalance,
      isType,
      branch_Id
    } = req.body;
    let { id } = req.user;
    // total,
    // basic,
    // home_Allowance,
    // transportation_Allowance,
    // other_Allowance,
    // maternity,
    // medical,
    // annual,
    // unpaid_Leaves,
    // others,

    var EmployeeDetail = await ConnectionUtil(
      `select * from user where isActive =1 AND user_id='${user_id}' AND company_id='${company_id}'`
    );
    if (EmployeeDetail != "") {
      var s = JSON.stringify(salaryBalance);
      var l = JSON.stringify(leaveBalance);
      var user = await ConnectionUtil(`update user set
      first_name='${first_name}',
      last_name='${last_name}', 
      email='${email}',          
      department='${department}',      
      reporting_Manager='${reporting_Manager}',
      employee_joiningDate='${employee_joiningDate}',
      insurance_plan_name='${insurance_plan_name}',     
      working_HoursTo='${working_HoursTo}'	,
      working_HoursFrom='${working_HoursFrom}',
      updated_By='${id}',
      role='${role}',
      ip_Address='${ip_Address}',
      salaryBalance = '${s}',
      leaveBalance ='${l}',
      isSubAdmin='${isType}',
      designation='${designation}',
      branch_Id='${branch_Id}' 
      where user_id = '${user_id}' AND company_id='${company_id}'`);

      // UPDATE `user` SET `leave`='[{"Basic Pay":1212},{"Accommodation ":3000000},{"Communication":121},{"value ":""},{"id test":12}]';
      res.status(200).json({
        success: true,
        message: "Employee detail updated successfully",
        data: user, //EmployeeDetail,
      });
      //total='${total}',
      //basic='${basic}',
      //home_Allowance='${home_Allowance}',
      //transportation_Allowance='${transportation_Allowance}',
      //other_Allowance='${other_Allowance}',
      //maternity='${maternity}',
      //medical='${medical}',
      //annual='${annual}',
      //unpaid_Leaves='${unpaid_Leaves}',
      //others='${others}',
    } else {
      res.status(404).json({
        success: false,
        message: "Employee not exist",
      });
    }
  } catch (err) {
    console.log(err)
    res.status(400).json({
      success: false,
      message: err.message
    })
  }
};

// ------------------------- delete_Employee -----------------------------------
module.exports.Delete_Employee = async (req, res) => {
  try {
    let { user_id, company_id } = req.body;
    let { id } = req.user;
    var EmployeeDetail = await ConnectionUtil(
      `select * from user where isActive =1 AND user_id='${user_id}' AND company_id='${company_id}'`
    );
    if (EmployeeDetail || EmployeeDetail != "") {
      var user = await ConnectionUtil(
        `update user set  updated_By='${id}', isActive='${0}'  where user_id = '${user_id}' `
      );
      res.status(200).json({
        success: true,
        message: "Employee deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Employee not exist",
      });
    }
  } catch (err) {
    res.status(400).json(message.err);
  }
};

// ------------------------- Register Employee or Hr manager -----------------------------------
module.exports.status_Employee = async (req, res) => {
  try {
    let { user_id, company_id, status } = req.body;
    let { id } = req.user;
    var EmployeeDetail = await ConnectionUtil(
      `select * from user where isActive =1 AND user_id='${user_id}' AND company_id='${company_id}'`
    );
    if (EmployeeDetail != "") {
      var user = await ConnectionUtil(
        `update user set  status='${status}', updated_By='${id}'  where user_id = '${user_id}' `
      );
      let msg = status == 1 ? "activated" : "deactivated";
      res.status(200).json({
        success: true,
        message: "Employee" + " " + msg,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Employee does not exit",
      });
    }
  } catch (err) {
    res.status(400).json(message.err);
  }
};

// ------------------------- Share Link -----------------------------------
module.exports.employee_InvitationLink = async (req, res) => {
  try {
    let { user_id, company_id } = req.body;
    // let { id } = req.user;
    var EmployeeDetail = await ConnectionUtil(
      `select * from user where isActive ='1' AND user_id='${user_id}' AND company_id='${company_id}'`
    );
    if (EmployeeDetail != '') {
      let emailId = EmployeeDetail[0].email;
      let fullName = EmployeeDetail[0].first_name + ' ' + EmployeeDetail[0].last_name;
      var token = await otp.Otp_function();
      let qrcode = emailId;
      let userUpdateOtpQuery = await ConnectionUtil(`update user set forget_Otp='${token}' where user_id='${user_id}' AND email='${emailId}' AND company_id='${company_id}'`);
      if (userUpdateOtpQuery.affectedRows != 0) {
        let email_template = template.EmpInvitationTemplate.EmpInvitationTemp(emailId,token,qrcode,fullName);
        var EmployeeMail = await MAIL.QRCode_Email_function(emailId,email_template,qrcode);
        // await MAIL.NewCompanyEmail_function(emailId, token);
        // await MAIL.InvitationEmployee_function(emailId); 
        res.status(200).json({
          success: true,
          message: "Invitation link send successfully",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Somthing went wrong",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "Email does not found",
      });
    }
  } catch (err) {
    res.status(400).json(message.err);
  }
};

// ------------------------- Share Link -----------------------------------
module.exports.dummy_CSVColumn = async (req, res) => {
  try {
    let { company_id } = req.user;
    var salaryTypeDetail = await ConnectionUtil(
      `select salary_Type from salary_type where isActive='1' AND company_Id ='${company_id}'`
    );
    var leaveTypeDetail = await ConnectionUtil(
      `select leave_Type from leave_Type where isActive='1' AND company_Id ='${company_id}'`
    );
    let arr = [
      "S.NO",
      "First_Name",
      "Last_Name",
      "Email",
      "Department",
      "Designation",
      "Reporting Manager",
      "Employement_Date",
      "Insurance_PlanName",
      "working_HoursFrom",
      "working_HoursTo",
      "branch_Id"
    ];
    for (let leaves of leaveTypeDetail) {
      let leave = "Leave_" + leaves.leave_Type.trim();
      // leave.trim();
      arr.push(leave);
    }
    for (let column of salaryTypeDetail) {
      let salary = "Salary_" + column.salary_Type.trim();
      // salary.trim();
      arr.push(salary);
    }
    res.status(200).json({
      success: true,
      message: "show csv header",
      data: arr,
    });
  } catch (err) {
    res.status(400).json(message.err);
  }
};

// ------------------------- Share Link -----------------------------------
module.exports.EmployeeCount = async (req, res) => {
  try {
    let { company_id } = req.user;
    let userDetail = await ConnectionUtil(
      `select * from user where  company_Id ='${company_id}'`
    );
    // let salaryTypeDetail = await ConnectionUtil(`select * from Attendance where isActive='1' AND company_Id ='${company_id}'`);
    res.status(200).json({
      success: true,
      message: "user deatial",
      data: userDetail,
    });
  } catch (err) {
    res.status(400).json(message.err);
  }
};

// ------------------------- SubAdmin list -----------------------------------
module.exports.subAdminHrList = async (req, res) => {
  try {
    let { company_id } = req.user;
    let NewArr = [];
    let userDetail = await ConnectionUtil(
      `select * from user where  isActive='1'  AND  company_Id ='${company_id}' AND isSubAdmin='1'`);
    if (userDetail != "") {
      for (let employee of userDetail) {
        var roletype = await ConnectionUtil(
          `select role_Type from user_Role where status=1 AND isActive=1 AND userRole_id='${employee.role}'`
        );
        employee.roleName = roletype.length > 0 ? roletype[0].role_Type : "";
        NewArr.push(employee);
      }
      res.status(200).json({
        success: true,
        message: "Show subAdmin hr list",
        data: NewArr,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Show subAdmin hr list",
        data: [],
      });
    }
  } catch (err) {
    res.status(400).json(message.err);
  }
};

//Test Api
//---------------------
module.exports.Testleave = async (req, res) => {
  let val = JSON.stringify(req.body.val)
  var user = await ConnectionUtil(`update user set leaveBalance ='${val}' where status='${req.body.status}'`);
  res.json({ data: user })
}


module.exports.employee_GraphDetail = async (req, res) => {
  try {
    let { company_Id } = req.body;
    let { branch_Id, access } = req.query;
    let userCount, lateEmployee_Today, userDetailByAge, userDetailByDeparment, userDetailByGender, employee_count_monthwise, averagehour_department, leave_employeeToday;
    let user_details = await ConnectionUtil(`SELECT TIME_FORMAT(working_HoursFrom, "%T") as EntryTime, user_id,company_id,isActive,status,working_HoursTo,branch_Id FROM user WHERE company_id='${company_Id}'`);
    if(user_details.length>0){
    if (access == 0) {
      // userCount
      userCount = await ConnectionUtil(
        `select COALESCE(COUNT(*),0) as total_employee from user where isActive=1 AND  company_id='${company_Id}'`
      );

      // lateEmployee_Today
      for(let details of user_details){
        lateEmployee_Today = await ConnectionUtil(`SELECT * FROM Attendance WHERE check_In>'${details.EntryTime}' AND date=CURRENT_DATE() AND company_id='${company_Id}' GROUP BY user_Id`);
      }
      //leave_employeeToday
      leave_employeeToday = await ConnectionUtil(`SELECT * FROM leave_details WHERE DATE_FORMAT(CURDATE(),'%Y-%m-%d') BETWEEN DATE_FORMAT(leave_From, '%Y-%m-%d') AND DATE_FORMAT(leave_To, '%Y-%m-%d') AND is_leave=1 AND company_Id='${company_Id}'`);

      // ----
      // Age
      userDetailByAge = await ConnectionUtil(`select  Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0) as age from user where  isActive=1 AND  company_id='${company_Id}' AND DOB IS NOT NULL`);

      // department
      userDetailByDeparment = await ConnectionUtil(`select department,COUNT(*) as employee from user where isActive=1 AND company_id='${company_Id}' AND department IS NOT NULL Group By department`);

      // gender
      userDetailByGender = await ConnectionUtil(`select gender,COUNT(*) as employee from user where isActive=1 AND company_id='${company_Id}'AND gender!='' AND gender IS NOT NULL Group By gender`);

      // new_ Employee
      employee_count_monthwise = await ConnectionUtil(`SELECT COUNT(user_id) as value ,MONTHNAME(created_At) as month FROM user WHERE isActive=1 AND YEAR(created_At)= YEAR(CURRENT_DATE) AND company_id='${company_Id}' GROUP BY MONTH(created_At)`);
     
      //averageHour_department
      averagehour_department = await ConnectionUtil(`SELECT (COALESCE(SUM(total_time),0)/COALESCE(COUNT(*),0)) as totalcount,department FROM Attendance as A JOIN user as U ON U.user_id = A.user_Id WHERE U.isActive ='1' AND A.company_id = '${company_Id}' AND MONTH(A.date) = MONTH(CURRENT_DATE()) AND YEAR(A.date) = YEAR(CURRENT_DATE()) GROUP BY U.department`);
      // ---- branchId add pending

    } else {

      //UserCount
      userCount = await ConnectionUtil(
        `select COALESCE(COUNT(*),0) as total_employee from user where isActive='1'  AND  company_id='${company_Id}'`
      );
      //LateEmployee_Today
    
      for(let details of user_details){
        lateEmployee_Today = await ConnectionUtil(`SELECT * FROM Attendance WHERE check_In>'${details.EntryTime}' AND date=CURRENT_DATE() AND company_id='${company_Id}' GROUP BY user_Id`);
      }
      
      //leave_employeeToday
      leave_employeeToday = await ConnectionUtil(`SELECT * FROM leave_details WHERE DATE_FORMAT(CURDATE(),'%Y-%m-%d') BETWEEN DATE_FORMAT(leave_From, '%Y-%m-%d') AND DATE_FORMAT(leave_To, '%Y-%m-%d') AND is_leave=1 AND company_Id='${company_Id}'`);

      //Age
      userDetailByAge = await ConnectionUtil(`select  Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0) as age from user where  isActive = '1' AND  company_id='${company_Id}' AND DOB IS NOT NULL`);

      //department
      userDetailByDeparment = await ConnectionUtil(`select department,COUNT(*) as employee from user where isActive = '1' AND company_id='${company_Id}' AND department IS NOT NULL Group By department`);

      //gender
      userDetailByGender = await ConnectionUtil(`select gender,COUNT(*) as employee from user where isActive = '1' AND company_id='${company_Id}'AND gender!='' AND gender IS NOT NULL Group By gender`);

      //new_ Employee
      employee_count_monthwise = await ConnectionUtil(`SELECT COUNT(user_id) as value ,MONTHNAME(created_At) as month FROM user WHERE isActive = '1' AND YEAR(created_At) = YEAR(CURRENT_DATE) AND company_id='${company_Id}' GROUP BY MONTH(created_At)`);

      //averageHour_department
      averagehour_department = await ConnectionUtil(`SELECT (COALESCE(SUM(total_time),0)/COALESCE(COUNT(*),0)) as totalcount,department FROM Attendance as A JOIN user as U ON U.user_id = A.user_Id WHERE U.isActive = '1' AND  A.company_id = '${company_Id}' AND MONTH(A.date) = MONTH(CURRENT_DATE()) AND YEAR(A.date) = YEAR(CURRENT_DATE()) GROUP BY U.department`);    
    }

    let lateEmployeeLen = lateEmployee_Today.length > 0? lateEmployee_Today.length : 0;
    let leaveEmployeeLen = leave_employeeToday.length > 0? leave_employeeToday.length : 0;

    let countAge = 0;
    let ageOne = 0;
    let ageTwo = 0;
    let ageThree = 0;
    let ageFour = 0;
    let ageFive = 0;
    let ageSix = 0;
    let ageAverageArr = [];
    // let totalUserAge = userDetailByAge.length;
    await userDetailByAge.map((data) => {
      countAge = countAge + data.age

      if (data.age >= 18 && data.age <= 30) {
        ageOne = ageOne + 1;
      }
      if (data.age >= 31 && data.age <= 40) {
        ageTwo = ageTwo + 1;
      }
      if (data.age >= 41 && data.age <= 50) {
        ageThree = ageThree + 1;
      }
      if (data.age >= 51 && data.age <= 60) {
        ageFour = ageFour + 1;
      }
      if (data.age >= 61 && data.age <= 70) {
        ageFive = ageFive + 1;
      }
      if (data.age >= 70) {
        ageSix = ageSix + 1;
      }
    })
    // let ageAverage = Math.trunc(countAge/totalUserAge);  
    ageAverageArr.push(
      { ageKey: "18-30", ageEmp: ageOne },
      { ageKey: "31-40", ageEmp: ageTwo },
      { ageKey: "41-50", ageEmp: ageThree },
      { ageKey: "51-60", ageEmp: ageFour },
      { ageKey: "61-70", ageEmp: ageFive },
      { ageKey: "+70", ageEmp: ageSix })
    obj = {
      total_employee: userCount[0].total_employee,
      late_employeeToday: lateEmployeeLen,
      leave_employeeToday: leaveEmployeeLen, 
      age_average: ageAverageArr,
      department: userDetailByDeparment,
      gender: userDetailByGender,
      new_employee: employee_count_monthwise,
      averageworkhour_department: await calcualatemilisecode_convertHour(averagehour_department)
    }
    res.status(200).json({
      success: true,
      message: "Show Employee count",
      data: obj,
    });
  }else{
    res.status(400).json({
      success: false,
      message:"There is no user in this Company",
    })
  }
  } catch (err) {
    console.log(err);
    res.status(404).json({
      success: false,
      message: err.message
    });
  }
}
//---------- function Toconvert milisecond to hour and key formate ---------- 
async function calcualatemilisecode_convertHour(averagehour_department) {
  let newArr = [];
  for (let department_wisehourAvg of averagehour_department) {
    obj = {
      department: department_wisehourAvg.department,
      value: await parseMillisecondsIntoReadableTime(department_wisehourAvg.totalcount) + ' ' + 'hr'
    }
    newArr.push(obj);
  }
  return newArr
}

// ---------- function parseMillisecondsIntoReadableTime ----------
async function parseMillisecondsIntoReadableTime(milliseconds) {
  //Get hours from milliseconds
  var hours = milliseconds / (1000 * 60 * 60);
  var absoluteHours = Math.floor(hours);
  var h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;

  //Get remainder from hours and convert to minutes
  var minutes = (hours - absoluteHours) * 60;
  var absoluteMinutes = Math.floor(minutes);
  var m = absoluteMinutes > 9 ? absoluteMinutes : '0' + absoluteMinutes;

  //Get remainder from minutes and convert to seconds
  var seconds = (minutes - absoluteMinutes) * 60;
  var absoluteSeconds = Math.floor(seconds);
  var s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds;
  return h +'.'+ m ;
}