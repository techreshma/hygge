const fs = require("fs");
const util = require("util");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let message = require("../../lib/helpers/message");
let MAIL = require("../../config/email");
//------------------------ companyFaq ------------------------
module.exports.companyShowSMTP = async (req, res) => {
  try {
    var { id, company_id } = req.user;
    let{branch_Id,access}=req.query;
    var companyShowSMTP = await ConnectionUtil(
      `select * from smtp_Setting where isActive=1 AND company_id='${company_id}' AND branch_Id ='${branch_Id}'`
    );
    res.status(200)
      .json({
        success: true,
        message: "Show smtp server",
        data: companyShowSMTP[0],
      });
  } catch (err) {
    res.status(400).json(message.err);
  }
};

//------------------------ company_Privacy_Policy ------------------------
module.exports.companyUpdateSMTP = async (req, res) => {
  try {
    var {
      smtpId,
      mail_Server,
      smtp_Port,
      userName,
      password,
      server_Security,
      default_Sender,
      default_SenderName,
      ip_Address,
      companyId,
    } = req.body;
    var { id, company_id } = req.user;
    var smtpSettingDetail = await ConnectionUtil(
      `select * from smtp_Setting where company_id='${companyId}'`
    );
    if (smtpSettingDetail != "") {
      var SMPTUpdateQueryFind = await ConnectionUtil(
        `update smtp_Setting set mail_Server ='${mail_Server}',smtp_Port='${smtp_Port}',userName='${userName}',password='${password}',server_Security='${server_Security}',default_Sender='${default_Sender}',default_SenderName='${default_SenderName}',ip_Address='${ip_Address}',company_id='${company_id}',updated_By='${id}' where smtp_id = '${smtpId}'`
      );
      res
        .status(200)
        .json({
          success: true,
          message: "Smtp data update successfully",
          data: SMPTUpdateQueryFind,
        });
    } else {
      res
        .status(404)
        .json({
          success: false,
          message: "Smtp not found",
          data: privacyPolicyDetail[0],
        });
    }
  } catch (err) {
    res.status(400).json(message.err);
  }
};

//-----------------------------------------SMTP_MAIL------------------------------------------------------
module.exports.SMTPTest_Mail = async (req, res) => {
  try {
    let { user_id, company_id, email } = req.body;
    let userDetail = await ConnectionUtil(
      `select * from user where isActive='1' AND user_id='${user_id}' AND company_id='${company_id}'`
    );
    if (userDetail != "") {
    await MAIL.SmtpEmail_function(email);
    res.status(200).json({
      success: true,
      message: "SMTP test mail send successfully",
    });
  } else {
      res.status(404).json({
        success: false,
        message: "User not exist",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// ,userName='${userName}',password='${password}',server_Security='${server_Security}',default_Sender='${default_Sender}',default_SenderName='${default_SenderName}',ip_Address='${ip_Address}',company_id='${company_id}',updated_By='${updated_By}'

// module.exports.companyUpdateSMTP = async(req, res) => {
//     try{
//     var {smtpId, mail_Server, smtp_Port, userName, password, server_Security, default_Sender, default_SenderName, ip_Address, company_id, updated_By} = req.body;
//     var privacyPolicyDetail = await ConnectionUtil(`select * from smtp_Setting where smtp_id =?`,smtp_Id);

//     if (privacyPolicyDetail != '') {
//     var SMPTUpdateQueryFind = await ConnectionUtil(`update smtp_Setting set mail_Server ='${mail_Server}',smtp_Port='${smtp_Port}',userName='${userName}',password='${password}',server_Security='${server_Security}',default_Sender='${default_Sender}',default_SenderName='${default_SenderName}',ip_Address='${ip_Address}',company_id='${company_id}',updated_By='${updated_By}' where smtp_id = '${smtp_Id}'`)
//     if (SMPTUpdateQueryFind != 0) {
//     res.status(200).json({
//     "success": true,
//     "message": " SMPT Update"
//     })
//     } else {
//     res.status(404).json({
//     "success": false,
//     "message": " SMPT Not update"
//     })
//     }
//     } else {
//     res.status(400).json({
//     "success": false,
//     "message": "data not found"
//     })
//     }
//     }catch(err){
//     res.status(400).json(message.err)
//     }
//     }
