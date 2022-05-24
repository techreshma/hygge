const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let internalIp = require("internal-ip");
let {
    helperNotification,messageNotification
  } = require("../../lib/helpers/fcm");

// -------------------------Add_Role-----------------------------------
let socketFun={ 
  socketMessage: async function (message) {
    let msg = message.message;
    var extention ='';
    if(message.fileType ==1){
      var str = msg;
      var dotIndex = str.lastIndexOf(".");
      var ext = str.substring(dotIndex);
      extention = ext.split(".")[1];
     }
    let messageObj={
      "userAssignChat_Id":message.userAssignChat_Id,
      "groupDetailChat_Id":message.groupDetailChat_Id,
      "sender_Id":message.sender_Id,
      "message": msg.trim(),  //message.message,
      "ip_Address":message.ip_Address,
      "fileType":message.fileType,//0 ->message , 1->file, 2 ->(add ,remove)User status manage , 3 -> vedio call Status
      "file_Extention":extention,
      "messageTime":message.messageTime,
      "messageDate":message.messageDate,
      "name":message.name,
      "userTo":1,
      "userBy":1
    }       
      let deleteUserResendMsg = await ConnectionUtil(`Update userAssign_Chat set isUserDelete='1' where groupDetailChat_Id='${message.groupDetailChat_Id}' AND  user_Id != '${message.sender_Id}' AND is_Group='0' AND isUserDelete='0' `);
      addChatMessage = await ConnectionUtil(`INSERT INTO messageDetail_Chat SET ?`,messageObj);    
      roleUpdateQueryFind = await ConnectionUtil(`update groupDetail_Chat set last_message='${msg.trim()}' , last_messageTime='${message.messageTime}' , ip_Address='${message.ip_Address}' where groupDetailChat_Id='${message.groupDetailChat_Id}'`);
      let getuserDetails=await ConnectionUtil(`select *  from userAssign_Chat where groupDetailChat_Id='${message.groupDetailChat_Id}' AND user_Id!='${message.sender_Id}'`)
        
        getuserDetails.map(async(data)=>{
          let count=await ConnectionUtil(`select readCount from  userAssign_Chat where groupDetailChat_Id='${message.groupDetailChat_Id}' AND user_Id='${data.user_Id}'`);
          let userRead = await ConnectionUtil(`update userAssign_Chat set  
          readCount='${count[0].readCount+1}'  where groupDetailChat_Id='${message.groupDetailChat_Id}' AND user_Id='${data.user_Id}'`);         
        })
        
        for(let userid of getuserDetails){
          let getuserid=userid.user_Id;
          let Arr=[];
          let newArrUser=[];
          let userID=[];
          let userDeviceToken = await ConnectionUtil(`select device_Token from fcm_Notification where user_Id='${getuserid}'`);
          userID.push(getuserid);
          await userDeviceToken.map((data) => { return Arr.push(data.device_Token) })
          let testMessage = {
            title: "Message",
            body: message.message,
            // data:[{
            //   groupDetailChat_Id:message.groupDetailChat_Id,
            //   profile_picture: "download.png",//data.profile_picture,
            //   username:"Developer",//data.name,
            //   designation:"Develooper",//data.designation,
            //   user_Id:"1"//data.user_id
            // }] 
          }
          await messageNotification(Arr, testMessage,userID,message.groupDetailChat_Id)
        }
       return  messageObj
    },
  appUsage: async function(data){
    let obj={
      user_Id                 : data.user_Id,
      company_Id              : data.company_Id,
      challengePredefined_Id  : data.challengePredefined_Id,
      Challenge_Id            : data.Challenge_Id,
      date                    : data.date,
      time                    : data.time,
      duration                : data.duration
    }
    let TaskInsert = await ConnectionUtil(`INSERT INTO userchallenge_task SET ?`,obj);   
    let taskData = await ConnectionUtil(`select * from  userchallenge_task where user_Id='${user_Id}' AND company_Id='${company_Id}' AND challengePredefined_Id='${challengePredefined_Id}' ORDER BY challengeTask_id DESC`);
    return taskData
  }  
}
  
module.exports=socketFun

//var emoji = require('node-emoji');
// module.exports.test=async(req,res)=>{
//     obj={
//         id:1,
//         text:emoji.get('sad')+"Hello"
//     }
//     let addFoodLogInsertQuery = await ConnectionUtil(`INSERT INTO tt SET?` , obj);   
//     let FoodLog = await ConnectionUtil(`select * from  tt `);
//     res.send({data:FoodLog})
// }
// ALTER TABLE messageDetail_Chat MODIFY message TEXT CHARSET utf8mb4;
// ,
  // appUsage: async function(data){
  //   {
  //     user_Id:data.user_Id,
  //     company_Id:data.company_Id
  //     challengePredefined_Id:data.challengePredefined_Id
  //     Challenge_Id:data.Challenge_Id
  //     date:data.date,
  //     time:data.time,
  //     duration:data.duration
  //   }
  // }  
  // test()
  // async function test(){
  //   let t=[2,50];
  //   let inClause = t.map(id=>"'"+id+"'").join();
  //   let val=await ConnectionUtil(`select user_id, CONCAT(COALESCE(designation,' ')) as designation ,CONCAT(COALESCE(profile_picture,' ')) as profile_picture ,CONCAT(COALESCE(first_name,' ')," ",COALESCE(last_name,' ')) as name from user where user_id IN(${inClause})`);
  //   console.log(val);
  // }
  // profile_picture: "download.png",//data.profile_picture,
  // username:"Developer",//data.name,
  // designation:"Develooper",//data.designation,
  // user_Id:"1"//data.user_id