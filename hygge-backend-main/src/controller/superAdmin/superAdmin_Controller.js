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
let template =require('../../lib/helpers/emailTemplate/index');

// -------------------------Register-----------------------------------
module.exports.admin_Register = async (req, res) => {
  try {
    var {
      first_name,
      last_name,
      email,
      profile_picture,
      password,
      address,
      mobile,
      role,
      ip_Address,
    } = req.body;
    var { id } = req.user;
    if (!email) {
      return res
        .status(404)
        .json({ success: false, message: "Email is required" });
    }
    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: "Role type is required" });
    }
    if (role == 1) {
      return res.status(403).json({
        success: false,
        message: "Role already exits",
      });
    } else {
      var user = await ConnectionUtil(
        `select * from superadmin where  isActive='1' AND email=?`,
        email
      );
      if (!user.length) {
        var token = randomToken(10);
        let hashpassword = await bcrypt.hash(token, await bcrypt.genSalt(10));
        var post = {
          first_name: first_name,
          last_name: last_name,
          email: email,
          password: hashpassword,
          profile_picture: profile_picture || "download.png",
          address: address,
          mobile: mobile || 0,
          role: role,
          ip_Address: ip_Address,
          forget_Otp: token,
          created_By: id,
          updated_By: id,
        };
        await MAIL.email_function(email, token);
        var user = await ConnectionUtil(`INSERT INTO superadmin SET ?`, post);
        // var userId= await ConnectionUtil(`update superadmin set created_By='${user.insertId}',updated_By='${user.insertId}' where superAdmin_id = '${user.insertId}'`);
        res.status(200).json(message.register);
      } else {
        res.status(409).json(message.exits);
      }
    }
  } catch (err) {
    res.status(400).json(message.err);
  }
};

//------------------------- login -------------------------
module.exports.admin_login = async (req, res) => {
  try {
    var { email, password, ip_Address } = req.body;
    var userArr = [];
    var post = {
      email: email,
    };
    var user = await ConnectionUtil(
      `select * from superadmin where isActive='1' AND email=?`,
      email
    );
    if (user.length != 0) {
     var superadminRoleDetail = await ConnectionUtil(
      `select * from superadmin_Role where isActive='1' AND superadminRole_id='${user[0].role}'`
    );  
    //email check condition
    if (user[0].status == 0) {
      return res.status(404).json({
        success: false,
        message: "your account is deactivated",
      });
    }
      if (superadminRoleDetail[0].status == 0) {
        return res.status(404).json({
          success: false,
          message: "Role is temporary locked",
        });
      }else{
      let compare = await bcrypt.compare(password, user[0].password);
      //password check condition
      if (compare == true) {
        const payload = {
          id: user[0].superAdmin_id,
          password: user[0].password,
          email: user[0].email,
          first_name: user[0].first_name,
          last_name: user[0].last_name,
          role: user[0].role,
          created_By: user[0].created_By,
          updated_By: user[0].updated_By,
        };
        const token = await issueJWT(payload);
        var roleAccessDetail = await ConnectionUtil(
          `select modules from roleAccess_Assign where role='${user[0].role}'`
        );
        user[0].tokens = token;
        user[0].moduleAccess = JSON.parse(roleAccessDetail[0].modules);
        res.status(200).json({
          success: true,
          message:
            user[0].role == 1
              ? "Superadmin Login successfully"
              : "Login successfully",
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
      message: err,
    });
  }
};

//------------------------- Show -------------------------
module.exports.admin_Profile = async (req, res) => {
  try {
    var NewArr = [];
    var UserProfile = await ConnectionUtil(
      `select * from superadmin Where role!=1 AND isActive='1' ORDER BY superAdmin_id DESC`
    );
    if (UserProfile.length) {
      for (let user of UserProfile) {
        var roletype = await ConnectionUtil(
          `select role_Type from superadmin_Role where  superadminRole_id=${user.role}`
        ); //status='1' AND isActive='1' AND
        user.roleName = roletype[0].role_Type;

        NewArr.push(user);
      }
      res.status(200).json({
        success: true,
        message: "Show admin_Profile",
        data: NewArr,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found ",
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

//------------------------- Update -------------------------
module.exports.admin_Update = async (req, res) => {
  try {
    // address , mobile
    var {
      superAdmin_id,
      first_name,
      last_name,
      email,
      profile_picture,
      role,
    } = req.body;
    var { id } = req.user;
    var userDetail = await ConnectionUtil(
      `select * from  superadmin  where status='1' AND isActive = '1' AND superAdmin_id = '${superAdmin_id}'`
    );
    if (userDetail != "") {
      var user = await ConnectionUtil(
        `update superadmin set first_name = '${first_name}' , last_name = '${last_name}' , email = '${email}' , profile_picture = '${profile_picture}', role = '${role}' ,updated_By='${id}' where superAdmin_id = '${superAdmin_id}'`
      );
      // address='${address}' , mobile = '${mobile}' ,
      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
      });
    } else {
      res.status(403).json({
        success: false,
        message: "User not exits",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//------------------------- ResetPassword -------------------------
module.exports.admin_ResetPassword = async (req, res) => {
  try {
    var { oldpassword, newpassword } = req.body;
    var id = req.user.id;
    var userData = await ConnectionUtil(
      `select password from superadmin where superAdmin_id=?`,
      id
    );
    let toCheck = await bcrypt.compare(oldpassword, userData[0].password);
    if (toCheck == true) {
      let hashpassword = await bcrypt.hash(
        newpassword,
        await bcrypt.genSalt(10)
      );
      var user = await ConnectionUtil(
        `update superadmin set password = '${hashpassword}' where superAdmin_id = '${id}'`
      );
      res.status(200).json({
        success: true,
        message: " Reset password successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: " Oldpassword not match ",
      });
    }
  } catch (err) {
    console.log(err)
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//------------------------- forgetPassword -------------------------
module.exports.admin_forgetPassword = async (req, res) => {
  try {
    var { email } = req.body;
    let toCheckEmail = await ConnectionUtil(
      `select * from superadmin where status='1' AND isActive='1' AND email='${email}'`
    );
    if (toCheckEmail.length) {
      // var otp = randomToken(6);
      var OTP = await otp.Otp_function();
      var superAdmin = await ConnectionUtil(
        `update superadmin set forget_Otp = '${OTP}' where superAdmin_id = '${toCheckEmail[0].superAdmin_id}'`
      );
      let firstName=toCheckEmail[0].first_name!=null ?toCheckEmail[0].first_name:'';
      let lastname=toCheckEmail[0].last_name!=null  ?toCheckEmail[0].last_name:'';
      let name= firstName+''+lastname 
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
module.exports.admin_forgetPasswordReset = async (req, res) => {
  try {
    var { otp, newPassword, confirmPassword } = req.body;
    if (!otp) {
      res.status(400).json({ success: false, message: "Otp is required" });
    }
    if (newPassword != confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Confirmpassword or new password not match",
      });
    }
    let toCheckEmail = await ConnectionUtil(
      `select * from superadmin where forget_Otp = '${otp}'`
    );    
    if (toCheckEmail != "") {
      var hashpassword = await bcrypt.hash(
        newPassword,
        await bcrypt.genSalt(10)
      );
      var user = await ConnectionUtil(
        `update superadmin set forget_Otp = '${0}',password='${hashpassword}'  where forget_Otp = '${otp}'`
      );
      res.status(200).json({
        success: true,
        message: "New password updated please login again",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "OTP does not match",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//------------------------- Profile Delete -------------------------
module.exports.admin_Delete = async (req, res) => {
  try {
    let { superAdmin_id } = req.body;
    let { id } = req.user;

    var user = await ConnectionUtil(
      `select * from superadmin Where  isActive ='1' AND superAdmin_id='${superAdmin_id}'`
    );
    if (user.length>0) {
      var user = await ConnectionUtil(
        `update superadmin set isActive ='0',updated_By='${id}' where superAdmin_id = '${superAdmin_id}'`
      );
      res.status(200).json({
        success: true,
        message: "Profile delete successfully...",
      });
    } else {
      res.status(403).json({
        success: false,
        message: "User not exits...",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//------------------------- Profile Status -------------------------
module.exports.admin_Profilestatus = async (req, res) => {
  try {
    let { superAdmin_id, status, ip_Address } = req.body;
    let { id } = req.user;
    var profileQueryFind = await ConnectionUtil(
      `select * from  superadmin  where isActive = 1 AND superAdmin_id=${superAdmin_id}`
    );
    if (profileQueryFind != "") {
      var profileStatusQueryUpdate = await ConnectionUtil(
        `update superadmin set status='${status}',updated_By='${id}', ip_Address='${ip_Address}' where isActive = 1 AND superAdmin_id=${superAdmin_id}`
      );
      if (profileStatusQueryUpdate.affectedRows != 0) {
        let ProfileStatus = status == 1 ? "activated" : "deactivated"; //
        res.status(200).json({
          success: true,
          message: "Role status " + ProfileStatus,
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Role not update successfull",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Data not found",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//------------------ show_ByUserProfile ------------------  
module.exports.show_ByUserProfile = async(req, res) => {
  try{
    let {superAdmin_Id} = req.body;
    let { id }=req.user; 
    let superAdminDetail= await ConnectionUtil(`select superAdmin_id,first_name,last_name,email,profile_picture,address,mobile from superadmin where superAdmin_id='${superAdmin_Id}'`);                      
    res.status(200).json({
      "success":true,
      "message" : "Show user profile",
      "data":superAdminDetail
    })
  } catch(err){
    res.status(400).json({
      success: false,
      message: err,
    });
  }
}

//------------------ update_ByUserProfile ------------------ 
module.exports.update_ByUserProfile = async(req, res) => {
  try{
    let {superAdmin_id,first_name,last_name,email,profile_picture,address,mobile,ip_Address} = req.body;
    let { id }=req.user; 
    let superAdminDetail = await ConnectionUtil(`select superAdmin_id,first_name,last_name,email,profile_picture,address,mobile from superadmin where superAdmin_id='${superAdmin_id}'`)                      
    if(superAdminDetail){
      let superAdminUpdateQuery = await ConnectionUtil(`update superadmin set
        first_name='${first_name}',
        last_name='${last_name}',
        email='${email}',
        profile_picture='${profile_picture}',
        address ='${address}',
        mobile ='${mobile}',
        ip_Address ='${ip_Address}'
        where superAdmin_id='${superAdmin_id}'`) 
    let superAdminDetail= await ConnectionUtil(`select * from superadmin where superAdmin_id='${superAdmin_id}'`);
      res.status(200).json({
        "success" : true,
        "message" : "Show user profile",
        "data"    : superAdminDetail
      })
    }else{
      res.status(404).json({
        "success"  : false,
        "message"  : "User not found",
        "data"     : []
      }) 
    }
  } catch(err){
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
}

//------------------------ add_Faq ------------------------  
module.exports.add_Faq = async(req, res) => {
  try{
      var { question,answer,ip_Address,category_Name }=req.body; 
      let obj={
        //  category_Name:category_Name,
         question:question,
         answer:answer,
         ip_Address:ip_Address      
      }      
       var faqInsertQuery = await ConnectionUtil(`INSERT INTO faq SET ?`, obj);      
        res.status(200).json({
          "success":true,
          "message" : "Add faq successfully",
          data:faqInsertQuery
        })
  }catch(err){
    res.status(400).json({
      success: false,
      message: err,
    });
  }
}

//------------------------ show_Faq ------------------------  
module.exports.show_Faq = async(req, res) => {
  try{
    var faqSelectQuery = await ConnectionUtil(`select * from  faq  ORDER BY faq_id DESC`);      
    res.status(200).json({
      "success"  : true,
      "message"  : "Show  faq list",
      data       : faqSelectQuery
    })
  }catch(err){
    res.status(400).json({
      success: false,
      message: err,
    });
  }
}

//------------------------ edit_Faq ------------------------  
module.exports.edit_Faq = async(req, res) => {
  try{
      var { faq_id,question,answer,ip_Address }=req.body; 
      let faqUpdateQuery  = await ConnectionUtil(`UPDATE faq set
      question   = '${question}',
      answer     = '${answer}',
      ip_Address = '${ip_Address}'
      where faq_id='${faq_id}'`)
      res.status(200).json({
        "success"  : true,
        "message"  : "Edit  faq successfully",
        "data"     : faqUpdateQuery
      })
  }catch(err){
    res.status(400).json({
      success: false,
      message: err,
    });
  }
}

//------------------------ delete_Faq ------------------------  
module.exports.delete_Faq = async(req, res) => {
  try{
      var { faq_id }=req.body; 
      let faqDeleteQuery  = await ConnectionUtil(`delete from faq where faq_id='${faq_id}'`);
      res.status(200).json({
        "success"  : true,
        "message"  : "Delete  faq successfully",
        "data"     : faqDeleteQuery
      })
  }catch(err){
    res.status(400).json({
      success: false,
      message: err,
    });
  }
}

//------------------------ show_privacyPolicy ------------------------  
module.exports.show_privacyPolicy = async(req, res) => {
  try{
    let  privacyPolicyDetail=await ConnectionUtil(`select * from  privacypolicy`);
      res.status(200).json({
        "success"  : true,
        "message"  : "Show privacy Policy detail",
        "data"     : privacyPolicyDetail
      })
  }catch(err){
    res.status(400).json({
      success: false,
      message: err,
    });
  }
}

//------------------------ update_privacyPolicy ------------------------  
module.exports.update_privacyPolicy = async(req, res) => {
  try{
      var { privacyPolicy_id,description,ip_Address }=req.body; 
      let faqUpdateQuery  = await ConnectionUtil(`UPDATE privacypolicy set
      description     = '${description}',
      ip_Address = '${ip_Address}'
      WHERE privacyPolicy_id='${privacyPolicy_id}'`)

      res.status(200).json({
        "success"  : true,
        "message"  : "Edit  privacy Policy successfully",
        "data"     : faqUpdateQuery
      })
  }catch(err){
    res.status(400).json({
      success: false,
      message: err,
    });
  }
}