const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let message = require("../../lib/helpers/message");
let nodemailer = require('nodemailer');
let Excel = require('exceljs');
const { match } = require("assert");
let template =require('../../lib/helpers/emailTemplate/index');
//------------------------ CreateGroup_Chat ------------------------
module.exports.createGroup_Chat = async (req, res) => {
  try {
    let {
      group_Name,
      group_Description,
      profile_picture,
      groupAdmin_Id,
      company_Id,
      isGroup,
      ip_Address,
      userDetail,
    } = req.body;
    if (isGroup == 0) {
      newArr = [];
      newArr1 = [];
      let checkusergroup1 = await ConnectionUtil(`Select groupDetailChat_Id from userAssign_Chat where is_Group='0' AND user_Id='${userDetail[0].user_Id}' AND isActive='1'`)
      if(checkusergroup1!=""){
        var resultArray = Object.values(JSON.parse(JSON.stringify(checkusergroup1)))
        for (let value of resultArray) { 
          let groupId=value.groupDetailChat_Id;
          newArr.push(groupId)
        } 
      }
      let checkusergroup2 = await ConnectionUtil(`Select groupDetailChat_Id from userAssign_Chat where is_Group='0' AND user_Id='${userDetail[1].user_Id}' AND isActive='1'`)
      if(checkusergroup2!=""){
        var resultArray = Object.values(JSON.parse(JSON.stringify(checkusergroup2)))
        for (let value of resultArray) { 
          let groupId2=value.groupDetailChat_Id;
          newArr1.push(groupId2)
        } 
      }
      let getvalue=await getMatch(newArr, newArr1);
      if(getvalue){
        //(checkusergroup1 != "" && checkusergroup2 != "") {
          let userDetails = await ConnectionUtil(`select designation,CONCAT(first_name,' ',last_name) as name,profile_picture,user_id as user_Id from user where user_id=(SELECT  USER_Id FROM userAssign_Chat where groupDetailChat_Id='${getvalue}' AND user_Id!='${groupAdmin_Id}')`);
          let updateUser= await ConnectionUtil(`update userAssign_Chat set isUserDelete='1' where groupDetailChat_id='${getvalue}'`);
          res.status(200).json({
            success: true,
            message: "groupDetails",
            data:getvalue,
            userDetail:{
              profile_picture: userDetails.length>0 ? userDetails[0].profile_picture!=null?userDetails[0].profile_picture:"download.png" :"download.png",
              name:userDetails.length>0 ? userDetails[0].name!=null?userDetails[0].name:'' :'',
              description:userDetails.length>0 ? userDetails[0].designation!=null?userDetails[0].designation:'': ''
            }
          })//
        // res.status(200).json({
        //   success: true,
        //   message: "groupDetails",
        //   data:getvalue,
        //   userDetail:{profile_picture:"download.png",name:"TEst",description:"description"}
        // })
      }
      else {
        // var fs = require('fs');
        // var text2png = require('text2png');
        // let str=group_Name||'GROUP'
        // fs.writeFileSync('', text2png(str[0], {color: 'blue'}));
        let groupObj = {
          group_Name: group_Name,
          group_Description: group_Description,
          profile_picture: profile_picture || "download.png",
          isGroup: isGroup,
          groupAdmin_Id: groupAdmin_Id,
          ip_Address: ip_Address,
          company_Id: company_Id
        };
        let groupDetailChatInsert = await ConnectionUtil(
          `INSERT INTO  groupDetail_Chat SET?`,
          groupObj
        );
        if (groupDetailChatInsert.insertId != 0) {
          for (let userData of userDetail) {
            let userObj = {
              groupDetailChat_Id: groupDetailChatInsert.insertId,
              user_Id: userData.user_Id,
              is_Group: isGroup,
              ip_Address: userData.ip_Address,
              isUserDelete :1
            };
            let userAssignInsert = await ConnectionUtil(
              `INSERT INTO userAssign_Chat SET?`,
              userObj
            );
          }
        }
        let userDetails = await ConnectionUtil(`select designation,CONCAT(first_name,' ',last_name) as name,profile_picture,user_id as user_Id from user where user_id=(SELECT  USER_Id FROM userAssign_Chat where groupDetailChat_Id='${groupDetailChatInsert.insertId}' AND user_Id!='${groupAdmin_Id}')`);
        res.status(200).json({
          success: true,
          message: "Chat group create successfully",
          data:groupDetailChatInsert.insertId,
          userDetail:{
            profile_picture: userDetails.length>0 ? userDetails[0].profile_picture!=null?userDetails[0].profile_picture:"download.png" :"download.png",
            name:userDetails.length>0 ? userDetails[0].name!=null?userDetails[0].name:'' :'',
            description:userDetails.length>0 ? userDetails[0].designation!=null?userDetails[0].designation:'': ''
          }
        }) 
        // res.status(200).json({
        //   success: true,
        //   message: "Chat group create successfully",
        //   data:groupDetailChatInsert.insertId,
        //   userDetail:{profile_picture:"download.png",name:"TEst",description:"description"}
        // });
      }
    } else {
      let groupObj = {
        group_Name: group_Name,
        group_Description: group_Description,
        profile_picture: profile_picture || "download.png",
        isGroup: isGroup,
        groupAdmin_Id: groupAdmin_Id,
        ip_Address: ip_Address,
        company_Id: company_Id
      };
      let groupDetailChatInsert = await ConnectionUtil(
        `INSERT INTO  groupDetail_Chat SET?`,
        groupObj
      );
      if (groupDetailChatInsert.insertId != 0) {
        for (let userData of userDetail) {
          let userObj = {
            groupDetailChat_Id: groupDetailChatInsert.insertId,
            user_Id: userData.user_Id,
            is_Group: isGroup,
            ip_Address: userData.ip_Address,
            isUserDelete :1
          };
          let userAssignInsert = await ConnectionUtil(
            `INSERT INTO userAssign_Chat SET?`,
            userObj
          );
        }
      }
      res.status(200).json({
        success: true,
        message: "Chat group create successfully",
        data:groupDetailChatInsert.insertId,
        userDetail:{
          profile_picture: profile_picture || "download.png",
          name:group_Name,
          description:group_Description
        }
      });
    }
  }
  catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message
    })
  }
};

//----------------------------
function getMatch(newArr, newArr1) {
  let matches = [];
  for ( var i = 0; i < newArr.length; i++ ) {
      for ( var e = 0; e < newArr1.length; e++ ) {
          if ( newArr[i] === newArr1[e] ){
            matches.push( newArr[i] )
          }
      }
  }
  return matches[0];
 }
//----------------------------

//------------------------ Message_List ------------------------
module.exports.message_List = async (req, res) => {
  try {
    let {
      user_Id
    } = req.body;
    let arrNew = [];
    let obj = {};
    var chatUserDetail = await ConnectionUtil(`select * from userAssign_Chat where user_Id='${user_Id}'
     ORDER BY updated_At DESC`);
    for (let chatUser of chatUserDetail) {
      var chatGroup = await ConnectionUtil(`select * from groupDetail_Chat where
       groupDetailChat_id='${chatUser.groupDetailChat_Id}' ORDER BY updated_By DESC`);
      if (chatGroup[0].isGroup == 0) {
        let groupId = chatGroup[0].groupDetailChat_id;
        let userData = await GroupFind(groupId, user_Id)
        if (userData != undefined) {
          obj = {
            profile_picture: userData.profile_picture,
            description: userData.description,
            name: userData.name,
            oneToone: chatGroup[0].isGroup,
            readCount:chatUser.readCount,//0,
            isUserDelete:chatUser.isUserDelete,//default ->1,delete user-> 0 only for one to one
            groupDetailChat_Id: chatGroup[0].groupDetailChat_id,
            groupAdmin_Id: chatGroup[0].groupAdmin_Id,
            updated_At:chatGroup[0].updated_At,
            message: chatGroup[0].last_message,//"Test",
            time:  chatGroup[0].last_messageTime	,//"02:30",
          }
        }
      } else {
        obj = {
          profile_picture: "",
          description: chatGroup[0].group_Description,
          name: chatGroup[0].group_Name,
          oneTomany: chatGroup[0].isGroup,
          readCount:chatUser.readCount,
          isUserDelete:chatUser.isUserDelete,//default ->1,delete user-> 0 only for one to one
          groupDetailChat_Id: chatGroup[0].groupDetailChat_id,
          groupAdmin_Id: chatGroup[0].groupAdmin_Id,
          updated_At:chatGroup[0].updated_At,
          message: chatGroup[0].last_message,//"Test",
          time:  chatGroup[0].last_messageTime	,//"02:30",
        }
      }
      arrNew.push(obj)
    }
    arrNew.sort((a, b) => b.updated_At - a.updated_At);
    res.status(200).json({
      success: true,
      message: "Chat group create successfully",
      data: arrNew
    });
  } catch (err) {
    console.log(err);
    res.status(400).json(message.err);
  }
};

// ------------- Function_GroupFind -------------
async function GroupFind(groupId, userId) {
  var chatUser = await ConnectionUtil(`select * from userAssign_Chat where  user_Id!='${userId}' AND  groupDetailChat_id='${groupId}'`);
  if (chatUser != '') {
    var UserDetail = await ConnectionUtil(`select CONCAT(first_name,' ',last_name) as name,profile_picture from user where user_id='${chatUser[0].user_Id}'`);
    var Userobj;
    for (let user of UserDetail) {
      Userobj = {
        profile_picture: user.profile_picture,
        description: user.designation!=null?user.designation:'',
        name: user.name
      }
      return Userobj
    }
  }
}

//------------------------ Message_List ------------------------
module.exports.Chat_message = async (req, res) => {
  try {
    let {
      userAssignChat_Id,
      groupDetailChat_Id,
      search,
      offset
    } = req.body;
    var chatMessageDetail;
    let adminUserCheck = await ConnectionUtil(`select * from groupDetail_Chat where isActive='1' AND  groupAdmin_Id='${userAssignChat_Id}'  AND groupDetailChat_id='${groupDetailChat_Id}'`);
    if(adminUserCheck.length>0){
      if (search != "") {
        var chatMessageData = await ConnectionUtil(`select CONCAT(COALESCE(U.first_name,' '),COALESCE(U.last_name,' ')) as name,MC.* from messageDetail_Chat as MC JOIN user as U ON  MC.sender_Id=U.user_id where MC.userBy='1' AND MC.groupDetailChat_Id='${groupDetailChat_Id}' AND MC.message LIKE '%${search}%'`);
        // var chatMessageData = await ConnectionUtil(`SELECT * FROM messageDetail_Chat WHERE groupDetailChat_Id='${groupDetailChat_Id}' AND message LIKE '%${search}%'`);
        if (chatMessageData != '') {
          let id = chatMessageData[0].messageChat_id;
          let value = id - offset;
          value = Math.abs(value)
          chatMessageDetail = await ConnectionUtil(`select CONCAT(COALESCE(U.first_name,' '),COALESCE(U.last_name,' ')) as name,MC.* from messageDetail_Chat as MC JOIN user as U ON MC.sender_Id=U.user_id where MC.userBy='1' AND MC.groupDetailChat_Id='${groupDetailChat_Id}' ORDER BY MC.messageChat_id DESC LIMIT ${value} OFFSET ${offset}`);
          // chatMessageDetail = await ConnectionUtil(`SELECT * FROM messageDetail_Chat WHERE groupDetailChat_Id='${groupDetailChat_Id}' ORDER BY messageChat_id DESC LIMIT ${value} OFFSET ${offset}`);
          chatMessageDetail = chatMessageDetail || []
        } else {
          chatMessageDetail = [];
        }
      } else {
        chatMessageDetail = await ConnectionUtil(`select CONCAT(COALESCE(U.first_name,' '),COALESCE(U.last_name,' ')) as name,MC.* from messageDetail_Chat as MC JOIN user as U ON MC.sender_Id=U.user_id where MC.userBy='1' AND MC.groupDetailChat_Id='${groupDetailChat_Id}'  ORDER BY MC.messageChat_id DESC  LIMIT 20 OFFSET ${offset}`);
        // chatMessageDetail = await ConnectionUtil(`select * from messageDetail_Chat where  groupDetailChat_Id='${groupDetailChat_Id}'  ORDER BY messageChat_id DESC  LIMIT 20 OFFSET ${offset}`);
      }
      res.status(200).json({
        success: true,
        message: "Chat message",
        data: chatMessageDetail.reverse()
      });
    }else{
      if (search != "") {
        var chatMessageData = await ConnectionUtil(`select CONCAT(COALESCE(U.first_name,' '),COALESCE(U.last_name,' ')) as name,MC.* from messageDetail_Chat as MC JOIN user as U ON  MC.sender_Id=U.user_id where MC.userTo='1' AND MC.groupDetailChat_Id='${groupDetailChat_Id}' AND MC.message LIKE '%${search}%'`);
        // var chatMessageData = await ConnectionUtil(`SELECT * FROM messageDetail_Chat WHERE groupDetailChat_Id='${groupDetailChat_Id}' AND message LIKE '%${search}%'`);
        if (chatMessageData != '') {
          let id = chatMessageData[0].messageChat_id;
          let value = id - offset;
          value = Math.abs(value)
          chatMessageDetail = await ConnectionUtil(`select CONCAT(COALESCE(U.first_name,' '),COALESCE(U.last_name,' ')) as name,MC.* from messageDetail_Chat as MC JOIN user as U ON MC.sender_Id=U.user_id where MC.userTo='1' AND MC.groupDetailChat_Id='${groupDetailChat_Id}' ORDER BY MC.messageChat_id DESC LIMIT ${value} OFFSET ${offset}`);
          // chatMessageDetail = await ConnectionUtil(`SELECT * FROM messageDetail_Chat WHERE groupDetailChat_Id='${groupDetailChat_Id}' ORDER BY messageChat_id DESC LIMIT ${value} OFFSET ${offset}`);
          chatMessageDetail = chatMessageDetail || []
        } else {
          chatMessageDetail = [];
        }
      } else {
        chatMessageDetail = await ConnectionUtil(`select CONCAT(COALESCE(U.first_name,' '),COALESCE(U.last_name,' ')) as name,MC.* from messageDetail_Chat as MC JOIN user as U ON MC.sender_Id=U.user_id where MC.userTo='1' AND MC.groupDetailChat_Id='${groupDetailChat_Id}'  ORDER BY MC.messageChat_id DESC  LIMIT 20 OFFSET ${offset}`);
        // chatMessageDetail = await ConnectionUtil(`select * from messageDetail_Chat where  groupDetailChat_Id='${groupDetailChat_Id}'  ORDER BY messageChat_id DESC  LIMIT 20 OFFSET ${offset}`);
      }
      res.status(200).json({
        success: true,
        message: "Chat message",
        data: chatMessageDetail.reverse()
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(message.err);
  }
};

// ------------------------- User_NameList -----------------------------------
module.exports.username_List = async (req, res) => {
  try {
    let {
      company_id,
      user_Id
    } = req.body;
    let newArr = [];
    // designation,
    var UserListDetail = await ConnectionUtil(`select profile_picture,CONCAT(first_name,' ',last_name) as name,user_id from user where isActive='1' AND company_id='${company_id}'`);
    for (let user of UserListDetail) {
      let userid = user.user_id;
      if (userid != user_Id) {
        var groupList = await ConnectionUtil(`SELECT * FROM groupDetail_Chat  INNER JOIN userAssign_Chat ON groupDetail_Chat.groupDetailChat_id=userAssign_Chat.groupDetailChat_Id where  groupDetail_Chat.isGroup='0' AND user_Id='${userid}'`);
        if (groupList != '') {
          user.isType = '0'
        } else {
          user.isType = '1'
        }
        newArr.push(user)
      }
    }
    res.status(200).json({
      "success": true,
      "message": "Show user list",
      data: newArr
    })
  } catch (err) {
    res.status(400).json({
      "success": false,
      "message": err,
    })
  }
}

// ------------------------- Add_NewUserInGroup -----------------------------------  
module.exports.Add_NewUserInGroup = async (req, res) => {
  try {
    let {
      userDetail
    } = req.body;
    for (let userData of userDetail) {
      let userAssignFind = await ConnectionUtil(`select * from userAssign_Chat where groupDetailChat_Id='${userData.groupDetailChat_Id}' and  user_Id='${userData.user_Id}'`);
      if (userAssignFind == '') {
        let userObj = {
          groupDetailChat_Id: userData.groupDetailChat_Id,
          user_Id: userData.user_Id,
          ip_Address: userData.ip_Address,
          isUserDelete:1
        }
        let userAssignInsert = await ConnectionUtil(`INSERT INTO userAssign_Chat SET?`, userObj);
      }
    }
    res.status(200).json({
      "success": true,
      "message": "new user In group add successfully"
    })
  } catch (err) {
    res.status(400).json({
      "success": false,
      "message": err,
    })
  }
}

// ------------------------- Group_UserList -----------------------------------
module.exports.group_UserList = async (req, res) => {
  try {
    let {
      groupDetailChat_Id
    } = req.body;
    let groupMemberList = await ConnectionUtil(`select * from userAssign_Chat where groupDetailChat_Id='${groupDetailChat_Id}'`);
    let newArr = [];
    for (let groupList of groupMemberList) {
      let groupMemberList = await ConnectionUtil(`select CONCAT(first_name,' ',last_name) as name,profile_picture from user where user_id='${groupList.user_Id}'`);
      groupList.name = groupMemberList[0].name;
      groupList.profile_picture = groupMemberList[0].profile_picture
      newArr.push(groupList);
    }
    res.status(200).json({
      "success": true,
      "message": "Group user list",
      data: newArr
    })
  } catch (err) {
    res.status(400).json({
      "success": false,
      "message": err,
    })
  }
}

// ------------------------- user_LeaveGroup -----------------------------------
module.exports.user_LeaveGroup = async (req, res) => {
  try {
    let {
      groupDetailChat_Id,
      user_Id,
      ip_Address
    } = req.body;
    let toCheckGroup = await ConnectionUtil(`select isGroup from groupDetail_Chat where isActive='1' AND groupDetailChat_id='${groupDetailChat_Id}'`);
      if(toCheckGroup[0].isGroup==0){
        // let deleteGroup = await ConnectionUtil(`delete From groupDetail_Chat where  groupDetailChat_Id='${groupDetailChat_Id}'`);
        // let deleteGroupMember = await ConnectionUtil(`delete From userAssign_Chat where groupDetailChat_Id='${groupDetailChat_Id}'`);
        // let deleteGroupMessage = await ConnectionUtil(`delete From messageDetail_Chat where groupDetailChat_Id='${groupDetailChat_Id}'`);
        
        // let UpdateGroupMember  = await ConnectionUtil(`update userAssign_Chat set isUserDelete='0'  where user_Id='${user_Id}' AND groupDetailChat_Id='${groupDetailChat_Id}'`);  
        // let UpdateGroupMessage = await ConnectionUtil(`update messageDetail_Chat set  where groupDetailChat_Id='${groupDetailChat_Id}'`);
        // res.status(200).json({
        //   "success": true,
        //   "message": "Chat delete successfully"
        // })
        if(toCheckGroup[0].groupAdmin_Id==user_Id){
          let UpdateGroupMember  = await ConnectionUtil(`update userAssign_Chat set isUserDelete='0'  where user_Id='${user_Id}' AND groupDetailChat_Id='${groupDetailChat_Id}'`);  
          let UpdateGroupMessage = await ConnectionUtil(`update messageDetail_Chat set userBy='0' where groupDetailChat_Id='${groupDetailChat_Id}'`);
          res.status(200).json({
            "success": true,
            "message": "Chat delete successfully",
            // data: deleteGroup,deleteGroupMember,deleteGroupMessage
          })
        }else{
          let UpdateGroupMember  = await ConnectionUtil(`update userAssign_Chat set isUserDelete='0'  where user_Id='${user_Id}' AND groupDetailChat_Id='${groupDetailChat_Id}'`);  
          let UpdateGroupMessage = await ConnectionUtil(`update messageDetail_Chat set userTo='0' where groupDetailChat_Id='${groupDetailChat_Id}'`);
          res.status(200).json({
            "success": true,
            "message": "Chat delete successfully",
            // data: deleteGroup,deleteGroupMember,deleteGroupMessage
          }) 
      } 
      }else{
        let groupMemberList = await ConnectionUtil(`select * from userAssign_Chat where isActive='1' AND '${user_Id}' AND groupDetailChat_Id='${groupDetailChat_Id}'`);
      if (groupMemberList != '') {
        let userMemberDelete = await ConnectionUtil(`delete From userAssign_Chat where user_Id='${user_Id}' AND groupDetailChat_Id='${groupDetailChat_Id}'`);
        res.status(200).json({
          "success": true,
          "message": "User leave in group",
          data: userMemberDelete
        })
      } else {
        res.status(401).json({
          "success": false,
          "message": "User not found",
          data: []
        })
      }
    }
  } catch (err) {
    res.status(400).json({
      "success": false,
      "message": err,
    })
  }
}

// ------------------------- Delete_Group -----------------------------------
module.exports.delete_Group = async (req, res) => {
  try {
    let {
      groupDetailChat_Id,
      user_Id
    } = req.body;
    let adminUserCheck = await ConnectionUtil(`select * from groupDetail_Chat where isActive='1' AND groupAdmin_Id='${user_Id}' AND groupDetailChat_Id='${groupDetailChat_Id}'`);
    if (adminUserCheck != '') {
      let deleteGroup = await ConnectionUtil(`delete From groupDetail_Chat where groupAdmin_Id='${user_Id}' AND groupDetailChat_Id='${groupDetailChat_Id}'`);
      if (deleteGroup.affectedRows != 0) {
        let deleteGroupMember = await ConnectionUtil(`delete From userAssign_Chat where groupDetailChat_Id='${groupDetailChat_Id}'`);
        if (deleteGroupMember.affectedRows != 0) {
          let deleteGroupMessage = await ConnectionUtil(`delete From messageDetail_Chat where groupDetailChat_Id='${groupDetailChat_Id}'`);
          res.status(200).json({
            "success": true,
            "message": "Group delete successfully",
            data: deleteGroupMember
          })
        }
      }
    }
    else {
      res.status(200).json({
        "success": false,
        "message": "you already delete this chat",
        data: []
      })
    }
  } catch (err) {
    res.status(400).json({
      "success": false,
      "message": err,
    })
  }
}

// ------------------------- Delete_Group -----------------------------------
module.exports.vedioGroupCall = async (req, res) => {
  try {
    let {
      groupDetailChat_Id,
      user_Id
    } = req.body;
    let adminUserCheck = await ConnectionUtil(`select * from userAssign_Chat where user_Id='${user_Id}' AND groupDetailChat_Id = '${groupDetailChat_Id}'`);
    if (adminUserCheck != '') {
      res.status(200).json({
        "success": true,
        "message": "Group call started",
        data: process.env.JITSIBASE_URL + groupDetailChat_Id
      })
    } else {
      res.status(401).json({
        "success": false,
        "message": "User not found in group",
        data: ""
      })
    }
  } catch (err) {
    res.status(400).json({
      "success": false,
      "message": err,
    })
  }
}
// ------------------------- chat_History -----------------------------------
module.exports.chat_History = async (req, res) => {
  try {
    let {
      groupDetailChat_Id,
      email
    } = req.body;
    let data = [];
    email
    let userDetail = await ConnectionUtil(`select  * from user where  email='${email}'`);
// select  name , message , messageDate , messageTime from messageDetail_Chat where fileType=0 AND groupDetailChat_Id=286 AND   DATE_FORMAT(CURDATE(),'%Y-%m-%d')-interval 3 month>=DATE_FORMAT(messageDate,'%Y-%m-%d')
    let ChatHistory = await ConnectionUtil(`select  name , message , messageDate , messageTime from messageDetail_Chat where fileType=0 AND groupDetailChat_Id='${groupDetailChat_Id}' AND messageDate >= now()-interval 3 month`);
    if (ChatHistory != '') {
      const filename = 'Chat_History.xlsx';
      let workbook = new Excel.Workbook();
      let worksheet = workbook.addWorksheet('Chat');
      worksheet.columns = [{
        header: 'name',
        key: 'name'
      },
      {
        header: 'message',
        key: 'message'
      },
      {
        header: 'messageDate',
        key: 'messageDate'
      },
      {
        header: 'messageTime',
        key: 'messageTime'
      },
      ];
      for (let chat of ChatHistory) {
        data.push({
          name: chat.name,
          message: chat.message,
          messageDate: chat.messageDate,
          messageTime: chat.messageTime
        })
      }
      data.forEach((e) => {
        worksheet.addRow(e);
      });
      const buffer = await workbook.xlsx.writeBuffer();
      const transporter = await nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });
      // let email_template = template.DocExpiryTemplate.DocExpiryTemp(name);
      let firstName=userDetail[0].first_name!=null ?userDetail[0].first_name:'';
      let lastname=userDetail[0].last_name!=null  ?userDetail[0].last_name:'';
      let name= firstName+''+lastname;
      let email_template = template.ChatHistoryTemplate.ChatHistoryTemp(name);
      const mailOptions = {
        from    : process.env.EMAIL,
        to      : email,
        subject : 'Message log on Hygge  [insert date, time]',
        html    :  email_template,//"", //'<p>Chat history data last 3 month !!!!!!!!!</p>',
        attachments: [{
          filename,
          content: buffer,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },],
      };
      let mail = await transporter.sendMail(mailOptions);
      console.log(mail)
      res.status(200).json({
        "success": true,
        "message": "Chat history sent successfully",
        data: mail
      })

    } else {
      res.status(401).json({
        "success": false,
        "message": "Data not found",
      })
    }
  } catch (err) {
    res.status(400).json({
      "success": false,
      "message": err,
    })
  }
}
//------------------------ read_Message ------------------------
module.exports.read_Message = async (req, res) => {
  try{
    let {groupDetailChat_Id,user_Id}=req.body;
    let userRead = await ConnectionUtil(`update userAssign_Chat set readCount='${0}'  where groupDetailChat_Id='${groupDetailChat_Id}' AND user_Id='${user_Id}'`);         
    res.status(200).json({
      success: true,
      message: "User read message successfully"
    });
  }catch(err){
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}




