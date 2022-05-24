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
let moment = require("moment");
let date = new Date();
let currentDate = moment(date).format("YYYY-MM-DD")
let template =require('../../lib/helpers/emailTemplate/index');

// -------------------------login-----------------------------------
module.exports.hradmin_login = async (req, res) => {
  try {
    var { email, password } = req.body;
    
    var userArr = [];
    var post = {
      email: email,
    };
    // Tocheck User table and Company table
    var user = await ConnectionUtil(
      `select * from user JOIN company ON  user.role!=0  AND  user.company_id=company.company_id  where  company.isActive='1'AND user.isActive='1' AND user.status='1' AND user.email=?`,
      email
    ); //Replace Query->`select * from user JOIN company ON  user.company_id=company.company_id  where  isActive='1' AND status='1' AND email=?`,
    //email check condition

    if (user.length != 0) {

      var comapnyDetail = await ConnectionUtil(
        `select plan_EndDate,status from company where  isActive='1' AND company_id='${user[0].company_id}'`
      );
      //email check condition
      if (comapnyDetail[0].status == 0) {
        return res.status(404).json({
          success: false,
          message: "your account is deactivated"
        });
      }
      // $2a$10$nwGrqeCsNaM4FEt6dolhc.JabKfTynmMV/kRwBuE9jlS2ovZijUAO
      if (currentDate >= comapnyDetail[0].plan_EndDate) {
        return res.status(404).json({
          success: false,
          message: "Your subscription to plan has expired",
        });
      } else {
        let compare = await bcrypt.compare(password, user[0].password);
        //password check condition
        if (compare == true) {
          const payload = {
            id: user[0].user_id,
            password: user[0].password,
            email: user[0].email,
            first_name: user[0].first_name,
            last_name: user[0].last_name,
            role: user[0].role,
            created_By: user[0].created_By,
            updated_By: user[0].updated_By,
            company_id: user[0].company_id,
          };
          const token = await issueJWT(payload);
          var roleAccessDetail = await ConnectionUtil(
            `select modules from roleAccess_Assign where isActive='1' AND company_Id='${user[0].company_id}' AND role='${user[0].role}'`
          );
          var roletype = await ConnectionUtil(
            `select role_Type from user_Role where status=1 AND isActive=1 AND userRole_id=${user[0].role}`
          );
          var branch
          if (user[0].branch_Id) {
            branch = await ConnectionUtil(
              `select * from companybranch where status=1 AND isActive=1 AND branch_id=${user[0].branch_Id}`
            );
          }


          user[0].roleName = roletype[0].role_Type;
          user[0].tokens = token;
          user[0].moduleAccess = JSON.parse(roleAccessDetail[0].modules);
          user[0].companyBranch = branch != undefined || branch != null ? branch : []
          res.status(200).json({
            success: true,
            message: "User login successfully",
            data: user[0],
          });
        } else {
          res.status(404).json({
            success: false,
            message: "Invalid password",
            data: [],
          });
        }
      }
    } else {
      res.status(404).json({
        success: false,
        message: "Email id does not exist",
        data: [],
      });
    }
  } catch (err) {
    console.log(err)
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// -------------------------ResetPassword---------------------------
module.exports.hradmin_ResetPassword = async (req, res) => {
  try {
    var { oldpassword, newpassword, confirmpassword } = req.body;
    var { id } = req.user;
    // oldpassword, newpassword, confirmpassword
    if (!oldpassword) {
      return res.status(404).json({
        success: false,
        message: "Old password is required",
      });
    }
    if (!newpassword) {
      return res.status(404).json({
        success: false,
        message: "New password is required",
      });
    }
    if (!confirmpassword) {
      return res.status(404).json({
        success: false,
        message: "Confirm password is required",
      });
    }
    var userData = await ConnectionUtil(
      `select password from user where status='1' AND isActive ='1' AND user_id=?`,
      id
    );
    let toCheck = await bcrypt.compare(oldpassword, userData[0].password);
    if (toCheck == true) {
      let hashpassword = await bcrypt.hash(
        newpassword,
        await bcrypt.genSalt(10)
      );
      var user = await ConnectionUtil(
        `update user set password = '${hashpassword}' where user_id = '${id}'`
      );
      res.status(200).json({
        success: true,
        message: " Reset password successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Incorrect old password",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// -------------------------forgetPassword-----------------------
module.exports.hradmin_forgetPassword = async (req, res) => {
  try {
    var { email } = req.body;
    let toCheckEmail = await ConnectionUtil(
      `select * from user where  status='1' AND isActive ='1' AND email='${email}'`
    );
    if (toCheckEmail.length) {
      // var token = randomToken(16);
      var OTP = await otp.Otp_function();
      var hrAdmin = await ConnectionUtil(
        `update user set forget_Otp = '${OTP}' where user_id = '${toCheckEmail[0].user_id}'`
      );
      let firstName=toCheckEmail[0].first_name!=null ?toCheckEmail[0].first_name:'';
      let lastname=toCheckEmail[0].last_name!=null  ?toCheckEmail[0].last_name:'';
      let name= firstName+' '+lastname; 
      let email_template = template.OTPTemplate.otpTemp(name,OTP);
      await MAIL.forgetPassword_function(email,email_template); //OTP
      // await MAIL.forgetPassword_function(email, OTP);
      res.status(200).json({
        success: true,
        message: "Please check email for OTP",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Email id does not exist",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//------------------------- forgetPasswordReset -------------------------
module.exports.hradmin_forgetPasswordReset = async (req, res) => {
  try {
    var { otp, newPassword, confirmPassword } = req.body;
    if (!otp) {
      res.status(400).json({ success: false, message: "Token is required" });
    }
    if (newPassword != confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Confirmpassword or new password not match",
      });
    }
    let toCheckEmail = await ConnectionUtil(
      `select * from user where status='1' AND isActive ='1' AND forget_Otp = '${otp}'`
    );
    if (toCheckEmail != "") {
      var hashpassword = await bcrypt.hash(
        newPassword,
        await bcrypt.genSalt(10)
      );
      var user = await ConnectionUtil(
        `update user set forget_Otp = '${0}',password='${hashpassword}'  where forget_Otp = '${otp}'`
      );
      res.status(200).json({
        success: true,
        message: "New password updated please login again",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Invalid OTP",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// // ------------------------- Register Employee or Hr manager -----------------------------------
// module.exports.Employee_Register=async (req,res)=>{
// 	try{
// 		// var { first_name ,
// 			//  last_name ,
// 			//   email ,
// 			//   password ,
// 			//   profile_picture ,
// 			//   address ,
// 			//    mobile ,
// 			//    role:,
// 			//    department:,
// 			//    designation:,
// 			//    gender:,
// 			//    employee_joiningDate:
// 			//    insurance_plan_name:
// 			// //    created_By
// 			// //    update_By
// 			//    ip_Address
// 			//    isActive
// 			//    company_id
// 			//    Reporting Manager
// 			//    DOB
// 			//    marital_Status
// 			//    nationality
// 			//    work_Location
// 			//    home_Location
// 			// }=req.body;

// 		// var user= await ConnectionUtil(`select * from superadmin where email=?`,email)
// 		// if(user[0].role==1){
// 		// 	res.status(403).json(message.superAdminExits)
// 		// }
// 		// if(!user.length){
// 		// 	let hashpassword=await bcrypt.hash(password, await bcrypt.genSalt(10));
// 		// 	var post={
// 		// 		first_name      : first_name ,
// 		// 		last_name       : last_name ,
// 		// 		email           : email ,
// 		// 		password        : hashpassword ,
// 		// 		profile_picture : profile_picture || process.env.URL_GLOBAL+"download.png" ,
// 		// 		address         : address ,
// 		// 		mobile          : mobile,
// 		// 		role			: role,
// 		// 		ip_Address      : await internalIp.v4()
// 		// 	}
// 		// 	var user= await ConnectionUtil(`INSERT INTO superadmin  SET ?`, post)
// 		// 	var userId= await ConnectionUtil(`update superadmin set created_By='${user.insertId}',updated_By='${user.insertId}' where superAdmin_id = '${user.insertId}'`)
// 		// 	res.status(200).json(message.register)
// 		// } else{
// 		// 	res.status(409).json(message.exits)
// 		// }
// 	}catch(err){
// 		res.status(400).json(message.err)
// 	}
// }
//
