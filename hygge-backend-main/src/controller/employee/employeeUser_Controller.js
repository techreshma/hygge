const util = require("util");
let status = require("statuses");
let moment = require("moment");
let connection = require("../../config/database");
let MAIL = require("../../config/email");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let bcrypt = require("bcryptjs");
let { issueJWT } = require("../../lib/helpers/jwt");
let randomToken = require("random-token");
let otp = require("../../lib/helpers/otp");
let {
  helperNotification
} = require("../../lib/helpers/fcm");
let template =require('../../lib/helpers/emailTemplate/index');

// -------------------------login-----------------------------------
module.exports.Employee_login = async (req, res) => {
  try {
    var { email, password, device_Token ,device_Type,login_Date,login_Time, mobile_Id } = req.body;
    var userArr = [];
    var post = {
      email: email,
    };
    var user = await ConnectionUtil(
      ` select * from user where isActive='1' AND status='1' AND email = ? `,
      email
    ); //role=3 AND
    // var user = await ConnectionUtil(
    //   `select * from user JOIN company ON  user.company_id=company.company_id  where company.isActive='1'AND user.isActive='1' AND user.status='1' AND user.email=?`,
    //   email
    // );
    //email check condition
    if (user != "") {
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
        
        user[0].tokens = token;
        let fcmObj = {
          user_Id: user[0].user_id,
          company_Id: user[0].company_id,
          mobile_Id:mobile_Id,
          device_Token: device_Token,
          device_Type: device_Type,
          login_Date: login_Date,
          login_Time: login_Time,
          created_By: user[0].user_id,
          updated_By: user[0].user_id,
        };
        //FCM_Device_Token
        
        let fcmNotificationAddQuery = await ConnectionUtil(
          `select * from fcm_Notification where user_Id='${user[0].user_id}' AND mobile_Id='${mobile_Id}'`
        ); //AND device_Token='${device_Token}
        
        if (fcmNotificationAddQuery.length == 0) {
          fcmNotificationAddQuery = await ConnectionUtil(
            `INSERT INTO fcm_Notification SET?`,
            fcmObj
          );
        }else{
          fcmNotificationAddQuery = await ConnectionUtil(
            `update fcm_Notification SET  device_Token='${device_Token}',login_Date='${login_Date}',login_Time='${login_Time}'  where user_Id='${user[0].user_id}' AND mobile_Id='${mobile_Id}'`
          );
        }
        console.log(fcmNotificationAddQuery);
        let LoginFcmList = await ConnectionUtil(`SELECT deviceToken_id,device_Token,device_Type,mobile_Id,user_Id,login_Date,login_Time FROM fcm_Notification WHERE user_Id='${user[0].user_id}' ORDER BY updated_At DESC LIMIT 1`);
        user[0].device_Token = LoginFcmList[0].device_Token
        user[0].device_Type = LoginFcmList[0].device_Type
        user[0].login_Date = LoginFcmList[0].login_Date//LoginFcmList[0].loginDate
        user[0].login_Time = LoginFcmList[0].login_Time
        
        res.status(200).json({
          success: true,
          message: "user login successfull",
          data: user[0],
          notification: fcmNotificationAddQuery,
        });
      } else {
        res.status(200).json({
          success: false,
          message: "invalid password",
          data: [],
        });
      }
    } else {
      res.status(200).json({
        success: false,
        message: "email id does not match with our records",
        data: [],
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// -------------------------Show-----------------------------------
module.exports.Employee_Show = async (req, res) => {
  try {
    var { id } = req.user;
    var user = await ConnectionUtil(
      `select * from user where isActive =1 AND user_id=?`,
      id
    );
    user[0].DOB= user[0].DOB!=null ? user[0].DOB.split("-").reverse().join("-"):user[0].DOB ;
    res.status(200).json({
      success: true,
      message: "show admin_Profile",
      data: user,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// -------------------------Update-----------------------------------
module.exports.Employee_Update = async (req, res) => {
  try {
    let {
      userId,
      DOB,
      gender,
      mobile,
      marital_Status,
      nationality,
      national_Id,
      visa,
      passport,
      home_Location,
      work_location,
      profile_picture,
      country,
      workRegion,
      homeRegion,
    } = req.body;
    var { id } = req.user;
    let old_ProfilePicture = await ConnectionUtil(
      `select profile_picture , DOB from user where user_id=?`,
      userId
    );
    let ProfilePic;
    let dob;
    if (profile_picture == "") {
      ProfilePic = old_ProfilePicture[0].profile_picture;
      // dob=old_ProfilePicture[0].DOB
    }
    if (profile_picture != "") {
      ProfilePic = profile_picture;
      // dob = old_ProfilePicture[0].DOB
    }
    var user = await ConnectionUtil(
      `select * from user where status='1' AND isActive ='1' AND user_id=?`,
      userId
    );
    if (user != "") {
      let wR = JSON.stringify(workRegion);
      let hR = JSON.stringify(homeRegion);
      // let dobDate= new Date(DOB).toISOString().slice(0, 10); 
      let dt = DOB.split("-").reverse().join("-");
      let updateGender = gender != null && gender != "" && gender != undefined ? gender : "NA";
      var user = await ConnectionUtil(
        `update user set workRegion='${wR}',homeRegion='${hR}', DOB='${dt}',gender='${updateGender}',mobile='${mobile}',marital_Status='${marital_Status}',nationality='${nationality}',national_Id='${national_Id}',visa='${visa}',passport='${passport}',home_Location='${home_Location}',work_location='${work_location}',profile_picture='${ProfilePic}',country='${country}' where user_id = '${userId}'`
      ); //1608707815766-image.jpg
      var user = await ConnectionUtil(
        `select * from user where user_id='${userId}'`
      );
      // ----
      let dob     = (user[0].DOB!=null)||(user[0].DOB!='')?1:0;
      let Gender  = (user[0].gender!=null)||(user[0].gender!='')?1:0;
      let Mobile  = (user[0].mobile !=null)||(user[0].mobile !='') ?1:0;
      let Marital_Status=(user[0].marital_Status!=null)||(user[0].marital_Status!='')?1:0;
      let Nationality=(user[0].nationality!=null)||(user[0].nationality!='')?1:0;
      let National_Id=(user[0].national_Id!=null)||(user[0].national_Id!='')?1:0;
      let Visa=(user[0].visa!=null)||(user[0].visa=='')?1:0;
      let Passport=(user[0].passport!=null)||(user[0].passport!='')?1:0;
      let Home_Location=(user[0].home_Location!=null)||(user[0].home_Location!='')?1:0;
      let Work_location=(user[0].work_location!=null)||(user[0].work_location!='')?1:0;
      let Profile_picture=(user[0].profile_picture!=null)||(user[0].profile_picture!='')?1:0;
      let Country =(user[0].country!=null)||(user[0].country!='')?1:0;
      let totCount = dob+Gender+Mobile+Marital_Status+Nationality+National_Id+Visa+Passport+Home_Location+Work_location+Profile_picture+Country;
      if(totCount==12){
        let challengeDetail = await ConnectionUtil(`select company_Id , Reward , action_Required , expiry_Date , challengePredefined_Id , challenges_id from challenges where  challengePredefined_Id = '${6}' AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d')`);
        for(let Challenge of challengeDetail){
          let challengeUserAssignDetail = await ConnectionUtil(`select * from userassign_challenges  where isCompleted='0' AND isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${userId}' `);
          if(challengeUserAssignDetail){
            challengeUserAssignDetail.map(async(data)=>{ 
              let challengeUserAssignDetail = await ConnectionUtil(`update userassign_challenges set  isCompleted='1' where assignChallenge_id='${data.assignChallenge_id}'`);  
              var DATE = new Date().getDate();
              var MONTH = new Date().getMonth() + 1;
              var YEAR = new Date().getFullYear();
              let date=YEAR + '-' + MONTH + '-' + DATE;
              let obj={ 
                user_Id      : userId,
                reward_Id    : Challenge.challenges_id,//reward_Id,
                reward_point : Challenge.Reward,
                isDeposit    : 1,            
                redeem_Date  : date,
              }
              let addRewardRedeemInsertQuery = await ConnectionUtil(`INSERT INTO reward_redeem SET?`,obj); 
              let userDeviceToken = await ConnectionUtil(`select device_Token from fcm_Notification where user_Id='${userId}'`);
              let Arr = [];
              await userDeviceToken.map(async(data) => {
                  return Arr.push(data.device_Token)
              })
              let testMessage = {
                  title: "Challenge",
                  body: "Congratulation your challenge completed successfully"
              }
              await helperNotification(Arr, testMessage)
            })
          }
        }
      }
      // ----
      res.status(200).json({
        success: true,
        message: " update employee successfully...",
        data: profile_picture,
        DAtabase: ProfilePic,
        userData: user,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "user dose not exist ",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// -------------------------ResetPassword-----------------------------------
module.exports.Employee_ResetPassword = async (req, res) => {
  try {
    var { oldpassword, newpassword, confirmpassword } = req.body;
    var { id } = req.user;
    var userData = await ConnectionUtil(
      `select password from user where isActive=1 AND user_id=?`,
      id
    );
    let toCheck = await bcrypt.compare(oldpassword, userData[0].password);
    // if(toCheck!=true){
    //   return res.status(404).json({success: false,message: "Current password not match"});
    // }
    // if(!oldpassword){
    //   return res.status(404).json({success: false,message: "Old password is required"});
    // }
    // if(!newpassword){
    //   return res.status(404).json({success: false,message: "New password is required"});
    // }
    // if(!confirmpassword){
    //   return res.status(404).json({success: false,message: "Confirm password is required"});
    // }

    if (toCheck == true) {
      // if (newpassword == confirmpassword) {
      let hashpassword = await bcrypt.hash(
        newpassword,
        await bcrypt.genSalt(10)
      );
      var user = await ConnectionUtil(
        `update user set password = '${hashpassword}' where user_id = '${id}'`
      );
      res.status(200).json({
        success: true,
        message: " reset password successfull...",
      });
      // } else {
      //   res.status(403).json({
      //     success: false,
      //     message: "newpassword confirmpassword not match...",
      //   });
      // }
    } else {
      res.status(404).json({
        success: false,
        message: " oldpassword not match...",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// -------------------------forgetPassword-----------------------------------
module.exports.Employee_forgetPassword = async (req, res) => {
  try {
    var { email } = req.body;
    let toCheckEmail = await ConnectionUtil(
      `select * from user where isActive=1 AND email='${email}'`
    );
    if (toCheckEmail != "") {
      var OTP = await otp.Otp_function();
      var hrAdmin = await ConnectionUtil(
        `update user set forget_Otp = '${OTP}' where user_id = '${toCheckEmail[0].user_id}'`
      );
      let firstName=toCheckEmail[0].first_name!=null ?toCheckEmail[0].first_name:'';
      let lastname=toCheckEmail[0].last_name!=null  ?toCheckEmail[0].last_name:'';
      let name= firstName+''+lastname 
      let email_template = template.OTPTemplate.otpTemp(name,OTP);
      await MAIL.forgetPassword_function(email,email_template); //OTP
      res.status(200).json({
        success: true,
        message: "Please check email newpassword otp",
      });
    } else {
      res.status(403).json({
        success: false,
        message: "email id does not match with our records",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// ------------------------- forgetPasswordReset -----------------------------------
module.exports.Employee_forgetPasswordReset = async (req, res) => {
  try {
    var { otp, newPassword, confirmPassword } = req.body;
    if (!confirmPassword) {
      return res
        .status(404)
        .json({ success: false, message: "Confirm password is required" });
    }
    if (!newPassword) {
      return res
        .status(404)
        .json({ success: false, message: "New password is required" });
    }
    if (!otp) {
      return res
        .status(403)
        .json({ success: false, message: "Please enter otp" });
    }
    if (newPassword != confirmPassword) {
      return res
        .status(403)
        .json({ success: false, message: "Confirm & New password not match" });
    }
    let toCheckEmail = await ConnectionUtil(
      `select * from  user where isActive=1 AND forget_Otp = '${otp}'`
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
        message: "new password updated please login again",
      });
    } else {
      res.status(403).json({
        success: false,
        message: "otp not match",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// ------------------------- OtpVerify -----------------------------------
module.exports.Employee_OtpVerify = async (req, res) => {
  try {
    var { otp, email } = req.body;
    if (!otp) {
      res.status(403).json({ success: false, message: "OTP is required" });
    }
    if (!email) {
      res.status(403).json({ success: false, message: "Email is required" });
    }
    let toCheckEmail = await ConnectionUtil(
      `select * from  user where isActive=1 AND email='${email}'`
    );
    if (toCheckEmail != "") {
      if (toCheckEmail[0].forget_Otp == otp) {
        res.status(200).json({
          success: true,
          message: "otp verify successfully...",
        });
      } else {
        res.status(403).json({
          success: false,
          message: "invalid OTP...",
        });
      }
    } else {
      res.status(403).json({
        success: false,
        message: "email not exits...",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// ------------------------- Logout -----------------------------------
module.exports.Employee_Logout = async (req, res) => {
  try{
    let { device_Token , mobile_Id } = req.body;
    let { id } = req.user;
    let fcmSelectQuery = await ConnectionUtil(`select * from fcm_Notification where user_Id='${id}' AND mobile_Id='${mobile_Id}'`);
    if(fcmSelectQuery.length>0){
      let fcmDeleteQuery = await ConnectionUtil(`delete from fcm_Notification where user_Id='${id}' AND mobile_Id='${mobile_Id}'`);
      res.status(200).json({
        success: true,
        message: "logout successfully",
      });
    } else{
      res.status(200).json({
        success: true,
        message: "logout successfully",
      });  
    }
  }catch(err){
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}
// UserDummy table remove remember it 

async function test(){   
  let dob     = (user[0].DOB==null)||(user[0].DOB='')?1:0;
  let Gender  = (user[0].gender==null)||(user[0].gender=='')?1:0;
  let Mobile  = (user[0].mobile ==null)||(user[0].mobile =='') ?1:0;
  let Marital_Status=(user[0].marital_Status==null)||(user[0].marital_Status=='')?1:0;
  let Nationality=(user[0].nationality==null)||(user[0].nationality=='')?1:0;
  let National_Id=(user[0].national_Id==null)||(user[0].national_Id=='')?1:0;
  let Visa=(user[0].visa==null)||(user[0].visa=='')?1:0;
  let Passport=(user[0].passport==null)||(user[0].passport=='')?1:0;
  let Home_Location=(user[0].home_Location==null)||(user[0].home_Location=='')?1:0;
  let Work_location=(user[0].work_location==null)||(user[0].work_location=='')?1:0;
  let Profile_picture=(user[0].profile_picture==null)||(user[0].profile_picture=='')?1:0;
  let Country =(user[0].country==null)||(user[0].country=='')?1:0;
  let totCount = (dob+Gender+Mobile+Marital_Status+Nationality+National_Id+Visa+Passport+Home_Location+Work_location+Profile_picture+Country);
  if(totCount==12){
    let challengeDetail = await ConnectionUtil(`select company_Id , Reward , action_Required , expiry_Date , challengePredefined_Id , challenges_id from challenges where  challengePredefined_Id = '${6}' AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d')`);
    for(let Challenge of challengeDetail){
      let challengeUserAssignDetail = await ConnectionUtil(`select * from userassign_challenges  where  isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${userId}' `);
      if(challengeUserAssignDetail.length>0){
        challengeUserAssignDetail.map(async(data)=>{ 
          let challengeUserAssignDetail = await ConnectionUtil(`update userassign_challenges set  isCompleted='1' where assignChallenge_id='${data.assignChallenge_id}'`);  
          var DATE = new Date().getDate();
          var MONTH = new Date().getMonth() + 1;
          var YEAR = new Date().getFullYear();
          let date=YEAR + '-' + MONTH + '-' + DATE;
          let obj={ 
            user_Id      : userId,
            reward_Id    : Challenge.challenges_id,//reward_Id,
            reward_point : Challenge.Reward,
            isDeposit    : 1,            
            redeem_Date  : date,
          }
          let addRewardRedeemInsertQuery = await ConnectionUtil(`INSERT INTO reward_redeem SET?`,obj); 
        })
      }
    }
  }
}

 