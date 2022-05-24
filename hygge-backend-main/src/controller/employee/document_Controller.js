const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let MAIL = require("../../config/email");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let bcrypt = require("bcryptjs");
let { issueJWT } = require("../../lib/helpers/jwt");
// let randomToken = require("random-token");
// let otp = require("../../lib/helpers/otp");
let moment = require("moment");
let { helperNotification } = require("../../lib/helpers/fcm");

// ------------------------- Add_Document -----------------------------------
module.exports.add_Document = async (req, res) => {
  try {
    let {
      userId,
      companyId,
      document_Title,
      expiry_Date,
      file_Path,
      ip_Address,
      DocType,
      dependentType,
    } = req.body;
    let { id, company_id } = req.user;
    let documentDetail = await ConnectionUtil(
      `select * from document_Detail where isActive='1' AND user_id='${userId}' AND company_id='${company_id}'  AND DocType='${DocType}' AND dependentType='${dependentType}'`
    ); //AND DocType='${DocType}'
    let EmpDocObj = {
      company_Id: company_id,
      user_Id: userId,
      document_Title: document_Title != "" ? document_Title : "",
      expiry_Date:
        expiry_Date != ""
          ? moment(expiry_Date).format("YYYY-MM-DD 00:00:00")
          : null,
      file_Path: file_Path,
      ip_Address: ip_Address,
      created_By: id,
      updated_By: id,
      DocType: DocType != "" ? DocType : 0,
      dependentType: dependentType != "" ? dependentType : 0,
    };
    if (documentDetail == "") {
      let EmpDocumentDetail = await ConnectionUtil(
        `INSERT INTO document_Detail SET ?`,
        EmpDocObj
      );
      // ---Challenge
      let Challenge_documentTypeDetail = await ConnectionUtil(
        `select isCheck,dependent,documentType_id,document_Type from document_Type where  status ='1' AND isActive='1' AND company_id='${companyId}'`
      );
      let newArr = [];
      for (let docTypeID of Challenge_documentTypeDetail) {
        if (docTypeID.isCheck == 1) {
          let Challenge_documentDetail = await ConnectionUtil(
            `select * from document_Detail where (expiry_Date IS NULL or DATE_FORMAT(expiry_Date,'%Y-%m-%d')>=DATE_FORMAT(CURDATE(), '%Y-%m-%d')) AND dependentType = '0' AND status ='1' AND isActive='1'  AND user_id='${userId}' AND DocType='${docTypeID.documentType_id}'`
          );
          if (Challenge_documentDetail.length == 0) {
            newArr.push(docTypeID);
          }
        }
      }
      if (newArr.length == 0) {
        let challengeDetail = await ConnectionUtil(
          `select company_Id , Reward , action_Required ,challenge_Configuration , DATE_FORMAT(expiry_Date , '%Y-%m-%d') expiry_Date, challengePredefined_Id , DATE_FORMAT(created_At , '%Y-%m-%d') created_At , challenges_id from challenges where  challengePredefined_Id = '1' AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND action_Required = '1'`
        );
        for (let Challenge of challengeDetail) {
          let challengeUserAssignDetail = await ConnectionUtil(
            `select * from userassign_challenges  where isCompleted='0' AND isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${userId}' `
          );
          if (challengeUserAssignDetail.length > 0) {
            challengeUserAssignDetail.map(async (data) => {
              let challengeUserAssignDetail = await ConnectionUtil(
                `update userassign_challenges set  isCompleted='1' where assignChallenge_id='${data.assignChallenge_id}'`
              );
              let DATE = new Date().getDate();
              let MONTH = new Date().getMonth() + 1;
              let YEAR = new Date().getFullYear();
              let date = YEAR + "-" + MONTH + "-" + DATE;
              let obj = {
                user_Id: userId,
                reward_Id: Challenge.challenges_id, //reward_Id,
                reward_point: Challenge.Reward,
                isDeposit: 1,
                redeem_Date: date,
              };
              let addRewardRedeemInsertQuery = await ConnectionUtil(
                `INSERT INTO reward_redeem SET?`,
                obj
              );
              let userDeviceToken = await ConnectionUtil(
                `select device_Token from fcm_Notification where user_Id='${userId}'`
              );
              let Arr = [];
              await userDeviceToken.map(async (data) => {
                return Arr.push(data.device_Token);
              });
              let testMessage = {
                title: "Challenge",
                body: "Congratulation your challenge completed successfully",
              };
              await helperNotification(Arr, testMessage);
            });
          }
        }
      }
      // ---Challenge
      return res.status(200).json({
        success: true,
        message: "Employee document uploaded successfully",
        data: EmpDocumentDetail,
      });
    }
    if (documentDetail[0].dependentType == 1) {
      let EmpDocumentDetail = await ConnectionUtil(
        `INSERT INTO document_Detail SET ?`,
        EmpDocObj
      );
      return res.status(200).json({
        success: true,
        message: "Employee document uploaded successfully",
        data: EmpDocumentDetail,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "This document type already exist",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ------------------------- show_Document -----------------------------------
module.exports.show_Document = async (req, res) => {
  try {
    let { id, company_id } = req.user;
    let { page, limit } = req.query;
    page = page || 1;
    limit = limit || 10;
    let offset = 0;
    if (page > 1) {
      offset = (page - 1) * limit;
    }

    let documentDetails = await ConnectionUtil(
      `select dependentType,DocType,documentDetail_id,document_Title, expiry_Date, file_Path, user_Id from document_Detail where isActive = '1' AND user_Id='${id}' AND company_Id='${company_id}' ORDER BY documentDetail_id DESC LIMIT ${limit} OFFSET ${page}`
    );
    if (documentDetails != "") {
      let DocDetailNewArr = [];
      for (let docTypeID of documentDetails) {
        let documentDetails = await ConnectionUtil(
          `select * from document_Type where documentType_id='${docTypeID.DocType}' AND  company_Id='${company_id}'`
        );
        if (documentDetails == "") {
          docTypeID.document_Title = "";
          docTypeID.DocType = "";
          docTypeID.documentType_id = "";
        }
        if (documentDetails != "") {
          docTypeID.document_Title =
            documentDetails[0].document_Type != ""
              ? documentDetails[0].document_Type
              : "";
          docTypeID.DocType =
            documentDetails[0].document_Type != ""
              ? documentDetails[0].document_Type
              : "";
          docTypeID.documentType_id =
            documentDetails[0].documentType_id != ""
              ? documentDetails[0].documentType_id
              : "";
        }
        docTypeID.pdfPath = "pdf-icon.png";
        docTypeID.docPath = "docFileIcon.png";
        //
        // docTypeID.dependent =
        //   documentDetails[0].dependent != "" ? documentDetails[0].dependent : 0;
        DocDetailNewArr.push(docTypeID);
      }
      let documentLength = await ConnectionUtil(
        `select dependentType,DocType,documentDetail_id,document_Title, expiry_Date, file_Path, user_Id from document_Detail where isActive = '1' AND user_Id='${id}'`
      );

      res.status(200).json({
        success: true,
        message: "Show Data",
        data: DocDetailNewArr,
        limit: documentDetails.length,
        page: Math.ceil(documentLength.length / limit),
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User Detail Not Found",
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

// ------------------------- Update_Document -----------------------------------
module.exports.update_Document = async (req, res) => {
  try {
    let {
      userId,
      documentDetailId,
      document_Title,
      expiry_Date,
      file_Path,
      ip_Address,
      DocType,
      dependentType,
    } = req.body;
    let { id, company_id } = req.user;
    let userDetail = await ConnectionUtil(
      `select * from user where isActive='1' AND user_id='${id}' AND company_id='${company_id}'`
    );
    if (userDetail != "") {
      let dType = dependentType != "" ? dependentType : 0;
      expiry_Date =
        expiry_Date == ""
          ? null
          : moment(expiry_Date).format("YYYY-MM-DD 00:00:00"); // new Date(expiry_Date).toISOString().slice(0, 10);

      let documentUpdateQuery = await ConnectionUtil(
        `UPDATE document_Detail SET dependentType='${dType}',DocType='${DocType}',document_Title='${document_Title}',
        expiry_Date='${expiry_Date}', file_Path='${file_Path}',ip_Address='${ip_Address}',created_By='${id}',updated_By='${id}'
        WHERE documentDetail_id='${documentDetailId}'`
      );

      // var documentUpdateQuery = await ConnectionUtil(
      //   `update document_Detail set  dependentType='${dType}',DocType='${DocType}',document_Title='${document_Title}',expiry_Date='${expiry_Date}', file_Path='${file_Path}', ip_Address='${ip_Address}',created_By='${id}',updated_By='${id}' where isActive='1' AND user_id='${id}' AND documentDetail_id='${documentDetailId}' AND company_id='${company_id}'`
      // );
      res.status(200).json({
        success: true,
        message: "Document Updated Successfully",
        data: documentUpdateQuery,
      });
    } else {
      res.status(404).json({
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

// ------------------------- showBadges_list -----------------------------------
module.exports.showBadges_list = async (req, res) => {
  try {
    let showBadges_list = {
      notification: "",
    };
    res.status(200).json({
      success: true,
      message: "show notification",
      data: showBadges_list,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//------------------------ delete_Employeedocument ------------------------
module.exports.delete_Document = async (req, res) => {
  try {
    let { documentId, ip_Address } = req.body;
    let { id, company_id } = req.user;
    let userDetail = await ConnectionUtil(
      `select * from user where isActive='1' AND user_id='${id}' AND company_id='${company_id}'`
    );
    if (userDetail != "") {
      let documentUpdate;
      documentUpdate = await ConnectionUtil(
        `update document_Detail set isActive='${0}',updated_By='${id}',ip_Address='${ip_Address}' where  company_Id='${company_id}' AND documentDetail_id ='${documentId}'`
      );
      res.status(200).json({
        success: true,
        message: "Document deleted successfully",
        data: documentUpdate,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }
  } catch (err) {
    res.status(400).json(message.err);
  }
};

module.exports.show_DocumentType = async (req, res) => {
  try {
    let { company_id } = req.user;
    let {isType} = req.query

    if (isType == 1 ) {
      var documentDetail = await ConnectionUtil(
        `select * from document_Type where isActive='1' AND company_Id ='${company_id}' AND dependent = '1'`
      );
    }
     else {
      var documentDetail = await ConnectionUtil(
        `select * from document_Type where isActive='1' AND company_Id ='${company_id}'  AND isCheck='1'`
      );
    }

    res.status(200).json({
      success: true,
      message: "Show  document list",
      data: documentDetail,
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
