const util = require('util');
let status = require('statuses');
let connection = require('../../config/database');
let ConnectionUtil = util.promisify(connection.query).bind(connection);

// ------------------------- Activity -----------------------------------
// GROUP denoted
// Private   -> 0
// Public    -> 1
// ===============
// File Type status denoted
//message    -> 0
//image      -> 1
//leavegroup -> 2
//jitsilink  -> 3
// ===============
//isUserDelete-> default -> 0 , deleteUser -> 1
//readCount-> message count 
module.exports.message_List = async (req, res) => {
  try {
    let {
      user_Id
    } = req.body;
    let arrNew = [];
    let obj = {};
    let chatUserDetail = await ConnectionUtil(`select * from userAssign_Chat where user_Id='${user_Id}'`);
    for (let chatUser of chatUserDetail) {
      let chatGroup = await ConnectionUtil(`select * from groupDetail_Chat where groupDetailChat_id='${chatUser.groupDetailChat_Id}' ORDER BY updated_By DESC`);
      if (chatGroup[0].isGroup == 0) {
        let groupId = chatGroup[0].groupDetailChat_id;
        let userData = await GroupFind(groupId, user_Id)
        if (userData != undefined) {
          obj = {
            profile_picture: userData.profile_picture,
            description: userData.description,
            name: userData.name,
            message: chatGroup[0].last_message,
            time:  chatGroup[0].last_messageTime,
            isGroup: chatGroup[0].isGroup,// Group->'1',Single->0
            oneToone: chatGroup[0].isGroup,
            readCount:chatUser.readCount,
            isUserDelete:chatUser.isUserDelete,
            // GroupStatus: chatGroup[0].isGroup,
            groupDetailChat_Id: chatGroup[0].groupDetailChat_id,
            groupAdmin_Id: chatGroup[0].groupAdmin_Id,
            updated_At:chatGroup[0].updated_At 
          }
        }
      } else {
        obj = {
          profile_picture: chatGroup[0].profile_picture || "",//"download.png",
          description: "Group",
          name: chatGroup[0].group_Name,
          message: chatGroup[0].last_message,
          time:  chatGroup[0].last_messageTime,
          isGroup: chatGroup[0].isGroup,
          oneTomany: chatGroup[0].isGroup,
          readCount:chatUser.readCount,
          isUserDelete:chatUser.isUserDelete,
          //  GroupStatus: chatGroup[0].isGroup,
          groupDetailChat_Id: chatGroup[0].groupDetailChat_id,
          groupAdmin_Id: chatGroup[0].groupAdmin_Id,
          updated_At:chatGroup[0].updated_At
        }
      }
      arrNew.push(obj)
    }
    arrNew.sort((a, b) => b.updated_At - a.updated_At);
    res.status(200).json({
      success: true,
      message: "Chat group create successfully",
      data: arrNew,
    });
  } catch (err) {
    console.log(err)
    res.status(400).json({
      "success": false,
      "message": err,
    })
  }
}

// ------------- Function_GroupFind -------------
async function GroupFind(groupId, userId) {
  var chatUser = await ConnectionUtil(`select * from userAssign_Chat where  user_Id!='${userId}' AND  groupDetailChat_id='${groupId}'`);
  if (chatUser != '') {
    let UserDetail = await ConnectionUtil(`select designation,CONCAT(first_name,' ',last_name) as name,profile_picture from user where user_id='${chatUser[0].user_Id}'`);
    let Userobj
    for (let user of UserDetail) {
      Userobj = {
        profile_picture: user.profile_picture,
        description: user.designation !=null? user.designation:'',
        name: user.name
      }
      return Userobj
    }
  } else {
    return {};
  }
}

// ------------------------- message_UserChatDelete -----------------------------------
module.exports.message_UserChatDelete = async (req, res) => {
  try {
    let {
      userId,
      companyId,
      groupDetailChatId
    } = req.body;
    res.status(200).json({
      "success": true,
      "message": "Chat delete successfully",
    })
  } catch (err) {
    res.status(400).json({
      "success": false,
      "message": err,
    })
  }
}

// ------------------------- User_NameList -----------------------------------
module.exports.username_List = async (req, res) => {
  try {
    let {
      company_id,
      user_Id,
      search
    } = req.body;
    let newArr = [];
    let UserListDetail;
    if (search == '') {
      UserListDetail = await ConnectionUtil(`select designation,profile_picture,CONCAT(first_name,' ',last_name) as name,user_id from user where isActive='1' AND user_Id!='${user_Id}' AND company_id='${company_id}' ORDER BY first_name ASC `);
    }
    if (search != '') {
      UserListDetail = await ConnectionUtil(`select designation,profile_picture,CONCAT(first_name,' ',last_name) as name,user_id from user where user_Id!='${user_Id}' AND first_name LIKE '%${search}%' OR
      last_name LIKE '%${search}%' AND isActive='1' AND company_id='${company_id}'`);
    }
    res.status(200).json({
      "success": true,
      "message": "Show user list",
      data: UserListDetail
    })
  } catch (err) {
    console.log(err)
    res.status(400).json({
      "success": false,
      "message": err,
    })
  }
}

//------------------------- user_LeaveGroup -----------------------------------
module.exports.user_LeaveGroup = async (req, res) => {
  try {
    let {
      groupDetailChat_Id,
      user_Id,
      ip_Address
    } = req.body;
    let adminUserCheck = await ConnectionUtil(`select * from groupDetail_Chat where isActive='1' AND  groupDetailChat_id='${groupDetailChat_Id}'`);
    if(adminUserCheck[0].isGroup==0){
        if(adminUserCheck[0].groupAdmin_Id== user_Id){
          let UpdateGroupMember  = await ConnectionUtil(`update userAssign_Chat set isUserDelete='0'  where user_Id='${user_Id}' AND groupDetailChat_Id='${groupDetailChat_Id}'`);  
          let UpdateGroupMessage = await ConnectionUtil(`update messageDetail_Chat set userBy='0' where groupDetailChat_Id='${groupDetailChat_Id}'`);
          res.status(200).json({
            "success": true,
            "message": "Chat delete successfully"
          })
        }else{
          let UpdateGroupMember  = await ConnectionUtil(`update userAssign_Chat set isUserDelete='0'  where user_Id='${user_Id}' AND groupDetailChat_Id='${groupDetailChat_Id}'`);  
          let UpdateGroupMessage = await ConnectionUtil(`update messageDetail_Chat set userTo='0' where groupDetailChat_Id='${groupDetailChat_Id}'`);
          res.status(200).json({
            "success": true,
            "message": "Chat delete successfully"
          }) 
      } 
    }else{
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
    } else {
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
    }
  } catch (err) {
    console.log(err)
    res.status(400).json({
      "success": false,
      "message": err,
    })
  }
}

//------------------------ Message_List ------------------------
module.exports.Chat_message = async (req, res) => {
  try {
    let {
      userAssignChat_Id,
      groupDetailChat_Id,
      search,
      offset,
      limit
    } = req.body;
    let {id} = req.user;
    let chatMessageDetail;
    let adminUserCheck = await ConnectionUtil(`select * from groupDetail_Chat where isActive='1' AND  groupAdmin_Id='${userAssignChat_Id}'  AND groupDetailChat_id='${groupDetailChat_Id}'`);
    if(adminUserCheck.length>0){
      if (search != ""){
        chatMessageDetail = await ConnectionUtil(`select CONCAT(COALESCE(U.first_name,' '),COALESCE(U.last_name,' ')) as name,MC.* from messageDetail_Chat as MC JOIN user as U ON MC.sender_Id=U.user_id where MC.userBy='1' AND MC.groupDetailChat_Id='${groupDetailChat_Id}' AND MC.message LIKE '%${search}%'`);
        chatMessageDetail||[]
        // var chatMessageData = await ConnectionUtil(`SELECT * FROM messageDetail_Chat WHERE groupDetailChat_Id='${groupDetailChat_Id}' AND message LIKE '%${search}%'`);
        // if (chatMessageData != '') {
        //   let id = chatMessageData[0].messageChat_id;
        //   let value = id - offset;
        //   value = Math.abs(value)
        //   chatMessageDetail = await ConnectionUtil(`select CONCAT(COALESCE(U.first_name,' '),COALESCE(U.last_name,' ')) as name,MC.* from messageDetail_Chat as MC JOIN user as U ON MC.sender_Id=U.user_id where MC.userBy='1' AND MC.groupDetailChat_Id='${groupDetailChat_Id}' ORDER BY MC.messageChat_id DESC LIMIT ${value} OFFSET ${offset}`);
        //   // chatMessageDetail = await ConnectionUtil(`SELECT * FROM messageDetail_Chat WHERE groupDetailChat_Id='${groupDetailChat_Id}' ORDER BY messageChat_id DESC LIMIT ${value} OFFSET ${offset}`);
        //   chatMessageDetail = chatMessageDetail || []
        // } else {
        //   chatMessageDetail = [];
        // }
      } else {
        let lit = offset * limit ;
        chatMessageDetail = await ConnectionUtil(`select CONCAT(COALESCE(U.first_name,' '),COALESCE(U.last_name,' ')) as name,MC.* from messageDetail_Chat as MC JOIN user as U ON MC.sender_Id=U.user_id where MC.userBy='1' AND MC.groupDetailChat_Id='${groupDetailChat_Id}'  ORDER BY MC.messageChat_id DESC  LIMIT ${lit} OFFSET 0`);
        // chatMessageDetail = await ConnectionUtil(`select * from messageDetail_Chat where  groupDetailChat_Id='${groupDetailChat_Id}'  ORDER BY messageChat_id DESC  LIMIT 20 OFFSET ${offset}`);
      }
      res.status(200).json({
        success: true,
        message: "Chat message",
        data: chatMessageDetail.reverse()
      });
    }else{
      if (search != ""){
        let chatMessageDetail = await ConnectionUtil(`select CONCAT(COALESCE(U.first_name,' '),COALESCE(U.last_name,' ')) as name,MC.* from messageDetail_Chat as MC JOIN user as U ON MC.sender_Id=U.user_id where MC.userTo='1' AND MC.groupDetailChat_Id='${groupDetailChat_Id}' AND MC.message LIKE '%${search}%'`);
        chatMessageDetail = chatMessageDetail || []
        // var chatMessageData = await ConnectionUtil(`SELECT * FROM messageDetail_Chat WHERE groupDetailChat_Id='${groupDetailChat_Id}' AND message LIKE '%${search}%'`);
        // if (chatMessageData != '') {
        //   let id = chatMessageData[0].messageChat_id;
        //   let value = id - offset;
        //   value = Math.abs(value)
        //   chatMessageDetail = await ConnectionUtil(`select CONCAT(COALESCE(U.first_name,' '),COALESCE(U.last_name,' ')) as name,MC.* from messageDetail_Chat as MC JOIN user as U ON MC.sender_Id=U.user_id where MC.userTo='1' AND MC.groupDetailChat_Id='${groupDetailChat_Id}' ORDER BY MC.messageChat_id DESC LIMIT ${value} OFFSET ${offset}`);
        //   // chatMessageDetail = await ConnectionUtil(`SELECT * FROM messageDetail_Chat WHERE groupDetailChat_Id='${groupDetailChat_Id}' ORDER BY messageChat_id DESC LIMIT ${value} OFFSET ${offset}`);
        //   chatMessageDetail = chatMessageDetail || []
        // } else {
        //   chatMessageDetail = [];
        // }
      } else {
        let lit = offset * limit ; 
        chatMessageDetail = await ConnectionUtil(`select CONCAT(COALESCE(U.first_name,' '),COALESCE(U.last_name,' ')) as name,MC.* from messageDetail_Chat as MC JOIN user as U ON MC.sender_Id=U.user_id where MC.userTO='1' AND MC.groupDetailChat_Id='${groupDetailChat_Id}'  ORDER BY MC.messageChat_id DESC  LIMIT ${lit} OFFSET 0 `);
        // chatMessageDetail = await ConnectionUtil(`select * from messageDetail_Chat where  groupDetailChat_Id='${groupDetailChat_Id}'  ORDER BY messageChat_id DESC  LIMIT 20 OFFSET ${offset}`);
      }
      res.status(200).json({
        success: true,
        message: "Chat message",
        data: chatMessageDetail.reverse(),
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

//------------------------ chat_Media ------------------------
module.exports.chat_Media = async (req, res) => {
  try{
    let {groupDetailChat_Id,isType}=req.body;
    let {id}=req.user;
    let userRead;
    if(isType == 'media'){
      userRead = await ConnectionUtil(`select * from messageDetail_Chat where (file_Extention='JPEG' OR file_Extention='JPG' OR file_Extention='PNG') AND 
    groupDetailChat_Id='${groupDetailChat_Id}'`);
    }
    else if(isType == 'document'){
      userRead = await ConnectionUtil(`select * from messageDetail_Chat where 
     file_Extention='docx' OR file_Extention='pdf' AND groupDetailChat_Id='${groupDetailChat_Id}'`);
    }
    else{
      userRead = await ConnectionUtil(`select * from messageDetail_Chat where 
      fileType='1' AND groupDetailChat_Id='${groupDetailChat_Id}'`);
    }
    res.status(200).json({
      success : true,
      message : "Show media list",
      data    :userRead
    });
  }catch(err){
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}