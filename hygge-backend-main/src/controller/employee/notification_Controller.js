const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let MAIL = require("../../config/email");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let bcrypt = require("bcryptjs");
let { issueJWT } = require("../../lib/helpers/jwt");
let randomToken = require("random-token");
let otp = require("../../lib/helpers/otp");
let moment=require('moment');
let {
  helperNotification
} = require("../../lib/helpers/fcm");
// ------------------------------ show_Notification ------------------------------
module.exports.show_Notification = async (req, res) => {
  try {
    let { company_id, id } = req.user;
    let userDetail = await ConnectionUtil(
      `select * from user where isActive='1' AND user_id='${id}' AND company_id = '${company_id}'`
    );
    if (userDetail != "") {
      var notifiaction_Detail = await ConnectionUtil(
        `select * from notification where isActive='1' AND user_Id='${id}' AND company_Id = '${company_id}' ORDER BY notification_id DESC LIMIT 3`
      );
      newArr = [];
      for (let notify of notifiaction_Detail) {
        let dt=moment(new Date(notify.created_At)).add(5, "hour").add(30, "m").toDate()
        let u =moment(dt).format('LT');
        newArr.push({
          notificationType: notify.notification_Type,
          notificationText: notify.notification_Text,
          date : dt ,
          dateTime:u, 
          userId: notify.user_Id,
          company_Id: notify.company_Id,
        });
      }  //
      var HRASubmit = await ConnectionUtil(`select * from user_hrasubmission where  user_Id='${id}' AND company_Id = '${company_id}'`);
      var HRAExpire = await ConnectionUtil(`SELECT * from user_hrasubmit  where DATE_FORMAT(date,'%Y-%m-%d') + INTERVAL 3 MONTH >=DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND user_Id='${id}' AND company_Id = '${company_id}'`);
      let hra={
        HRA_submit   : HRASubmit.length>=51 && HRASubmit.length<=58 ?1:0 ,
        HRA_expire   : HRAExpire.length>0?0:1
      };
      var HRAExpire = await ConnectionUtil(`SELECT * from notification where user_Id='${id}'`);
      let len =HRAExpire.length;
      let obj={notifiaction_count: len };
      res.status(200).json({
        success      : true,
        message      : "Show Notification",
        data         : newArr,
        hraDetail    : hra,
        notifcount   : obj
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Company Data Not Found",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ------------------------------ CronJob_Notification ------------------------------
  module.exports.anniversaryfun = async(res,req)=> {
    let userDetail = await ConnectionUtil(`select user_id,CONCAT(COALESCE(first_name,' '),' ',COALESCE(last_name,' ')) as name from user where isActive='1' AND DATE_FORMAT(employee_joiningDate, '%Y-%m-%d')=DATE_FORMAT(CURDATE(), '%Y-%m-%d')`);
      for(let user of userDetail){
      let userDeviceToken = await ConnectionUtil(`select device_Token from fcm_Notification where user_Id='${user.user_id}'`);
      let Arr = [];
      await userDeviceToken.map((data) => {
          return Arr.push(data.device_Token)
      })
      let testMessage = {
        title: "Work Anniversary Notification",
        body:  `You’ve completed x years at company name. Happy Work Anniversary, `+user.name+`!` //`Happy work anniversary`+' '+user.first_name+" "+user.last_name
      }
      await helperNotification(Arr, testMessage)
    }
  }

  module.exports.birthdayfun = async (res,req)=> {
    let userDetail = await ConnectionUtil(`select user_id,CONCAT(COALESCE(first_name,' '),' ',COALESCE(last_name,' ')) as name from user where isActive='1' AND DATE_FORMAT(DOB,'%m-%d')=DATE_FORMAT(CURDATE(),'%m-%d')`);
    for(let user of userDetail){
      let userDeviceToken = await ConnectionUtil(`select device_Token from fcm_Notification where user_Id='${user.user_id}'`);
      let Arr = [];
      await userDeviceToken.map((data) => {
        return Arr.push(data.device_Token)
      })
      let testMessage = {
        title: "Birthday Notification",
        body:  `Happy Birthday, `+user.name+`!`//`Wish you many many happy return of the day`+' '+user.first_name+" "+user.last_name
      }
      await helperNotification(Arr, testMessage)
    }
  }
 
  module.exports.documentfun = async (res,req)=> {
    let DocumentDetail = await ConnectionUtil(`SELECT DD.user_Id,DT.document_Type FROM document_detail as DD JOIN document_type as DT ON DD.DocType=DT.documentType_id where  DATE_FORMAT(expiry_Date,'%y-%m-%d')=DATE_FORMAT(CURDATE(),'%y-%m-%d')`);
    if(DocumentDetail.length>0){
      for(let user of DocumentDetail){
      let userDeviceToken = await ConnectionUtil(`select device_Token from fcm_Notification where user_Id='${user.user_Id}'`);
      let userName = await ConnectionUtil(`select CONCAT(COALESCE(first_name,' '),' ',COALESCE(last_name,' ')) as name from user where user_id='${user.user_Id}'`);
      let Arr = [];
      await userDeviceToken.map((data) => {
          return Arr.push(data.device_Token)
      })
      let testMessage = {
        title: "Document Notification (Expiry)",
        body: `Hi `+userName[0].name+`! It’s time to update your <expired document name> document`//`Please Update your this document`+' '+user.document_Type
      }
      await helperNotification(Arr, testMessage)
      }
    }
  } 

// ------------------------------ notification_List ------------------------------
  module.exports.notification_List = async (req, res) => {
    try{
      let {id}=req.user;
      let notificaitonDetail = await ConnectionUtil(`select company_Id,user_Id,notification_Type,notification_Text,created_At from notification where  user_id='${id}' ORDER BY notification_id DESC`);
      let newArr=[];
      for(let notifiy of  notificaitonDetail){
        let  format1 = "DD/MM/YYYY, HH:mm"      
        let  date1 = moment(new Date(notifiy.created_At)).add(5, "hour").add(30, "m").toDate()
        let dateTime1 = moment(date1).format(format1);  
        let obj ={ 
          dateTime    : dateTime1,
          body        : notifiy.notification_Type!=null?notifiy.notification_Type:"",
          text        : notifiy.notification_Text!=null?notifiy.notification_Text:"",
          company_Id  : notifiy.company_Id,
          user_Id     : notifiy.user_Id
        }
        newArr.push(obj)
      } 
      res.status(200).json({
        success: true,
        message: "Notificaiton lsit",
        data:newArr
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }
  
// ------------------------------ notification_Delete ------------------------------
module.exports.notification_delete = async (req, res) => {
  try{
    let { id } =req.user;
    let notificaitonDelete = await ConnectionUtil(`delete from notification where user_Id=${id}`);
    res.status(200).json({
      success : true,
      message : "Notificaiton delete list",
      data    : notificaitonDelete
    });
  }catch(err){
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}
// {
// title:Document Notification (Expiry),
// body:Hi [First Name]! It’s time to update your <expired document name> document,
// info:
// Upload Now 
// Remind Me {Tonight / Tomorrow}
// }
// {
//  "title":Document Missing,
//  "body":Hi [First Name], something’s missing!,
//  info:Upload your <Missing document name> document
// }
// {
// title:Birthday Notification,
// body:Happy Birthday, [First Name]!,
// }
// {
// title:Work Anniversary Notification,
// body:You’ve completed x years at company name. Happy Work Anniversary, [First Name]!,
// }