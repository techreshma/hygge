const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let message = require("../../lib/helpers/message");
let moment = require("moment");
var multer = require("multer");
const { count } = require("console");
var upload = multer({ dest: "upload/document" });
let nodemailer = require("nodemailer");
let MAIL = require("../../config/email");
var storage = multer.diskStorage({
  destination: function (req, file, cd) {
    cd(null, "upload/document");
  },

  filename: function (req, file, cd) {
    var str = file.originalname;
    var dotIndex = str.lastIndexOf(".");
    var ext = str.substring(dotIndex);
    var val = ext.split(".")[1];
    cd(null, Date.now() + "-image." + val);
  },
});

var upload = multer({
  storage: storage,
}).any("");
let template = require("../../lib/helpers/emailTemplate/index");
// ------------------------- add_EmployeeDocument -----------------------------------
module.exports.addEmpDocument = async (req, res) => {
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
    let { branch_Id, access } = req.query;
    var documentDetail = await ConnectionUtil(
      `select * from document_Detail where isActive='1' AND user_id='${userId}' AND company_id='${company_id}'  AND DocType='${DocType}' AND dependentType='${dependentType}'`
    );
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
      branch_Id: branch_Id != "" ? branch_Id : 0,
    };
    if (documentDetail == "") {
      var EmpDocumentDetail = await ConnectionUtil(
        `INSERT INTO document_Detail SET ?`,
        EmpDocObj
      );
      return res.status(200).json({
        success: true,
        message: "Employee document uploaded successfully",
        data: EmpDocumentDetail,
      });
    }
    if (documentDetail[0].dependentType == 1) {
      var EmpDocumentDetail = await ConnectionUtil(
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
    // } else {
    //   res.status(404).json({
    //     success: false,
    //     message: "User does not exist",
    //   });
    // }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// ------------------------- show_EmployeeName -----------------------------------
module.exports.showEmployeeName = async (req, res) => {
  try {
    let { company_id } = req.user;
    let { branch_Id, access } = req.query;
    let userDetail;
    if (access == 0) {
      userDetail = await ConnectionUtil(
        `select CONCAT(first_name,' ',last_name) as name,user_id from user where status='1' AND isActive='1' AND branch_Id = '${branch_Id}' AND company_id='${company_id}'`
      );
    } else {
      userDetail = await ConnectionUtil(
        `select CONCAT(first_name,' ',last_name) as name,user_id from user where status='1' AND isActive='1' AND company_id='${company_id}'`
      );
    }
    res.status(200).json({
      success: true,
      message: "Show employee",
      data: userDetail,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//------------------------ show_EmployeeDocument ------------------------
module.exports.showEmployeeDocument = async (req, res) => {
  try {
    let { company_id } = req.user;
    let { userID, expiryDate, DocumentType } = req.body;
    let { branch_Id, access } = req.query;
    // expiryDate = new Date(expiryDate).toISOString().slice(0 ,10);
    let ExDate = moment(expiryDate).format("YYYY-MM-DD 00:00:00");
    let ExDateCheck = moment(expiryDate).format("YYYY-MM-DD");

    let whereClause;
    if (userID == "" && expiryDate == "" && DocumentType == "") {
      whereClause = `select * from document_Detail where status='1' AND isActive='1' AND company_Id='${company_id}' ORDER BY documentDetail_id DESC`;
    }

    //============ userID && expiryDate && DocumentType
    else if (userID != "" && expiryDate != "" && DocumentType != "") {
      whereClause = `select * from document_Detail where status='1' AND isActive='1' AND company_id='${company_id}' AND  user_Id	='${userID}'  AND  Date('${ExDateCheck}')>= Date(expiry_Date) AND  DocType='${DocumentType}' ORDER BY documentDetail_id DESC`;

      // whereClause = `select * from document_Detail where status='1' AND isActive='1' AND company_id='${company_id}' AND  user_Id	='${userID}'  AND  expiry_Date <= '${ExDate}' AND  DocType='${DocumentType}' ORDER BY documentDetail_id DESC`;
    }

    //============ expiryDate && DocumentType
    else if (expiryDate != "" && DocumentType != "" && userID == "") {
      whereClause = `select * from document_Detail where status='1' AND isActive='1' AND company_id='${company_id}' AND  Date('${ExDateCheck}')>= Date(expiry_Date)  AND  DocType='${DocumentType}' ORDER BY documentDetail_id DESC`;
    }

    //============ userID && DocumentType
    else if (userID != "" && DocumentType != "" && expiryDate == "") {
      whereClause = `select * from document_Detail where status='1' AND isActive='1' AND company_id='${company_id}' AND user_Id	='${userID}' AND DocType='${DocumentType}' ORDER BY documentDetail_id DESC`;
    }

    //============ userId && expiryDate
    if (userID != "" && expiryDate != "" && DocumentType == "") {
      whereClause = `select * from document_Detail where status='1' AND isActive='1' AND company_id='${company_id}'AND  user_Id='${userID}'  AND Date('${ExDateCheck}')>= Date(expiry_Date) ORDER BY documentDetail_id DESC`;
    }
    //============ expiryDate
    if (expiryDate != "" && DocumentType == "" && userID == "") {
      whereClause = `select * from document_Detail where status='1' AND isActive='1' AND company_id='${company_id}'  AND  Date('${ExDateCheck}')>= Date(expiry_Date) ORDER BY documentDetail_id DESC`;
    } //<=
    //============ DocumentType
    if (DocumentType != "" && expiryDate == "" && userID == "") {
      whereClause = `select * from document_Detail where status='1' AND isActive='1' AND company_id='${company_id}' AND DocType = '${DocumentType}' ORDER BY documentDetail_id DESC`;
    }

    //============ DocumentType
    if (userID != "" && DocumentType == "" && expiryDate == "") {
      whereClause = `select * from document_Detail where status='1' AND isActive='1' AND company_id='${company_id}' AND user_Id='${userID}'  ORDER BY documentDetail_id DESC`;
    }

    var employeDocument = await ConnectionUtil(whereClause);

    newArr = [];
    if (employeDocument != "") {
      for (let empDOc of employeDocument) {
        var userDetail = await ConnectionUtil(
          `select CONCAT(first_name,' ',last_name) as name,profile_picture from user where company_id='${company_id}' AND status='1' AND isActive='1' AND user_id='${empDOc.user_Id}'`
        );
        var docTypeNameDetail = await ConnectionUtil(
          `select document_Type	 from document_Type where status='1' AND isActive='1' AND documentType_id='${empDOc.DocType}' AND company_Id='${company_id}'`
        );
        empDOc.DocTypeName =
          docTypeNameDetail[0].document_Type != ""
            ? docTypeNameDetail[0].document_Type
            : "";
        const currentDate = new Date().toISOString().slice(0, 10);
        const expiryDate =
          empDOc.expiry_Date != null ? empDOc.expiry_Date : new Date();
        const diffInMs = new Date(expiryDate) - new Date(currentDate);
        const diffInDay = diffInMs / (1000 * 60 * 60 * 24);

        empDOc.name =
          userDetail.length > 0 &&
          userDetail[0].name != "" &&
          userDetail[0].name != null &&
          userDetail[0].name != undefined
            ? userDetail[0].name
            : "";

        empDOc.profileImage =
          process.env.BASE_URL +
          (userDetail.length > 0 && userDetail[0].profile_picture != undefined
            ? userDetail[0].profile_picture
            : "");
        if (empDOc) {
          if (
            empDOc.expiry_Date != null &&
            empDOc.expiry_Date != "null" &&
            empDOc.expiry_Date != "Invalid date"
          ) {
            let expDate = new Date(empDOc.expiry_Date).getTime();
            let dd = new Date().getTime();
            if (dd > expDate) {
              empDOc.expired = true;
            } else {
              empDOc.expired = false;
            }
          }
        } else {
          newArr.push(`expired : "-"`)
        }

        empDOc.Action_Required = empDOc.expiry_Date != null ? diffInDay : "-";

        empDOc.expiry_Date =
          empDOc.expiry_Date != null
            ? moment(empDOc.expiry_Date).format("DD/MM/YYYY")
            : "-";

        let dd = new Date();
        let date = new Date(moment(dd).format("DD/MM/YYYY"));
    
        newArr.push(empDOc);
      }
      res.status(200).json({
        success: true,
        message: "Show employee document detail ",
        data: newArr,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Show employee document detail",
        data: [],
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "err",
      data: err,
    });
  }
};

//------------------------ document_UploadFile ------------------------
module.exports.documentUpload = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      var imagename = req.files;
      console.log(imagename);
      path = await imagename.map((data) => {
        return data.filename;
      });
      console.log(path);
      res.status(200).json({
        success: true,
        message: "Image upload successfully",
        data: path, //'http://157.245.104.180:4000/'+
      });
    });
  } catch (err) {
    res.status(400).json(message.err);
  }
};

//------------------------ status_Employeedocument -----------------------
module.exports.documentStatus = async (req, res) => {
  try {
    let { documentId, status, ip_Address } = req.body;
    let { id, company_id } = req.user;
    let msg = status == 1 ? "actived" : "blocked";
    var userDetail = await ConnectionUtil(
      `select * from user where isActive='1' AND user_id='${id}' AND company_id='${company_id}'`
    );
    if (userDetail != "") {
      var documentUpdate = await ConnectionUtil(
        `update document_Detail set status='${status}',updated_By='${id}',ip_Address='${ip_Address}' where  company_Id='${company_id}' AND documentDetail_id ='${documentId}'`
      );
      res.status(200).json({
        success: true,
        message: "Document status " + msg,
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

//------------------------ delete_Employeedocument ------------------------
module.exports.documentDelete = async (req, res) => {
  try {
    let { documentId, ip_Address } = req.body;
    let { id, company_id } = req.user;
    let msg = status == 1 ? "actived" : "blocked";
    let userDetail = await ConnectionUtil(
      `select * from user where isActive='1' AND user_id='${id}' AND company_id='${company_id}'`
    );
    if (userDetail != "") {
      var documentUpdate;
      let count = 0;
      for (let docId of documentId) {
        documentUpdate = await ConnectionUtil(
          `update document_Detail set isActive='${0}',updated_By='${id}',ip_Address='${ip_Address}' where  company_Id='${company_id}' AND documentDetail_id ='${docId}'`
        );
        if (documentUpdate.affectedRows != 0) {
          count++;
        }
      }
      res.status(200).json({
        success: true,
        message: "Employee document deleted successfully",
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

// ------------------------- Update_EmployeeDocument ----------------------
module.exports.update_Document = async (req, res) => {
  try {
    let {
      userId,
      companyId,
      documentDetailId,
      document_Title,
      expiry_Date,
      file_Path,
      ip_Address,
      DocType,
      dependentType,
    } = req.body;
    let { id, company_id } = req.user;
    var userDetail = await ConnectionUtil(
      `select * from user where isActive='1' AND user_id='${userId}' AND company_id='${companyId}'`
    );
    if (userDetail != "") {
      expiry_Date =
        expiry_Date != ""
          ? moment(expiry_Date).format("YYYY-MM-DD 00:00:00")
          : null;
      // new Date(expiry_Date).toISOString().slice(0, 10);
      var documentUpdateQuery = await ConnectionUtil(
        `update document_Detail set dependentType='${dependentType}' ,DocType='${DocType}',document_Title='${document_Title}',expiry_Date='${expiry_Date}', file_Path='${file_Path}', ip_Address='${ip_Address}',created_By='${id}',updated_By='${id}' where isActive='1' AND user_id='${userId}' AND documentDetail_id='${documentDetailId}' AND company_id='${companyId}'`
      );
      res.status(200).json({
        success: true,
        message: "Document Updated Successfully",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// ------------------------- Update_EmployeeDocument ----------------------
module.exports.birthdayEmployeeList = async (req, res) => {
  try {
    let { company_id } = req.user;
    let todayDATE = new Date().toISOString().slice(0, 10);
    var userDetail = await ConnectionUtil(
      `select CONCAT(first_name,' ',last_name),department,profile_picture,"Say Happy Birthhday" as Birthhday from user where DOB='${todayDATE}' AND status ='1' AND isActive='1' AND company_id='${company_id}'`
    );
    res.status(200).json({
      success: true,
      message: "Show birthday list employee",
      data: userDetail,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// ------------------------ EmployeeDocument(manuallyNotificationByEmail)----------------------
module.exports.EmployeeNotification = async (req, res) => {
  try {
    let { userId, companyId, docType } = req.body;
    let { company_id } = req.user;
    var userDetail = await ConnectionUtil(
      `select * from user where  status ='1' AND isActive='1' AND company_id='${companyId}' AND user_id='${userId}'`
    );
    // let message = "Please Update your document " + docType;

    let firstName =
      userDetail[0].first_name != null ? userDetail[0].first_name : "";
    let lastname =
      userDetail[0].last_name != null ? userDetail[0].last_name : "";
    let name = firstName + "" + lastname;
    let expire_date = "2021-12-31";
    let email_template = template.DocExpiryTemplate.DocExpiryTemp(
      name,
      docType,
      expire_date
    );
    await MAIL.DocumentExpireNotification_function(
      userDetail[0].email,
      email_template, //message
      docType
    );
    res.status(200).json({
      success: true,
      message: "notification send employee document expiry",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// ------------------------ EmployeeDocument Remainig----------------------
module.exports.employeeDocumentRemainig = async (req, res) => {
  try {
    let { userId, companyId, isType } = req.body;
    let NewArr = [];
    var documentTypeDetail = await ConnectionUtil(
      `select isCheck,dependent,documentType_id,document_Type from document_Type where  status ='1' AND isActive='1' AND company_id='${companyId}'`
    );
    let newArr = [];
    let dependentArray = [];
    for (let docTypeID of documentTypeDetail) {
      if (docTypeID.isCheck == 1) {
        var documentDetail = await ConnectionUtil(
          `select DocType from document_Detail where dependentType = '0' AND status ='1' AND isActive='1' AND company_id='${companyId}' AND user_id='${userId}' AND DocType='${docTypeID.documentType_id}'`
        );
        if (documentDetail.length == 0) {
          newArr.push(docTypeID);
        }
      }
      if (docTypeID.dependent == 1) {
        var documentDetail = await ConnectionUtil(
          `select DocType from document_Detail where dependentType = '1' AND status ='1' AND isActive='1' AND company_id='${companyId}' AND user_id='${userId}' AND DocType='${docTypeID.documentType_id}'`
        );
        if (documentDetail.length == 0) {
          dependentArray.push(docTypeID);
        }
      }
    }
    if (isType == 1) {
      var html = "<table border='1|1'>";
      for (var i = 0; i < newArr.length; i++) {
        html += "<tr>";
        html += "<td>Document->" + newArr[i].document_Type + "</td>";
        html += "</tr>";
      }
      html += "</table>";
      var userDetail = await ConnectionUtil(
        `select email from user where user_id='${userId}' AND company_id='${companyId}'`
      );
      let transporter = await nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: process.env.EMAIL,
        to: userDetail[0].email,
        subject: "Missing Document List ✔",
        text: "Missing Document",
        html: html,
      });
      var mailSend = await transporter.sendMail(info);
      console.log(mailSend);

      res.status(200).json({
        success: true,
        message: "mail send Successfully ",
        // data: newArr,
      });
    }
    if (isType == 2) {
      var html = "<table border='1|1'>";
      for (var i = 0; i < dependentArray.length; i++) {
        html += "<tr>";
        html += "<td>Document->" + dependentArray[i].document_Type + "</td>";
        html += "</tr>";
      }
      html += "</table>";
      var userDetail = await ConnectionUtil(
        `select email from user where user_id='${userId}' AND company_id='${companyId}'`
      );
      let transporter = await nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: process.env.EMAIL,
        to: userDetail[0].email,
        subject: "Missing Document List ✔",
        text: "Missing Document",
        html: html,
      });
      var mailSend = await transporter.sendMail(info);
      console.log(mailSend);

      res.status(200).json({
        success: true,
        message: "mail send Successfully ",
        // data: newArr,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Employee document remainig",
        data: newArr,
        dependent: dependentArray,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// ------------------------ EmployeeDocument Remainig----------------------
module.exports.DocumentTypeList = async (req, res) => {
  try {
    let DocumentTypeList = [
      {
        DocType: "Passport",
        imagePath: "passport.png",
      },
      {
        DocType: "Visa",
        imagePath: "passport.png",
      },
      {
        DocType: "Emirates ID",
        imagePath: "passport.png",
      },
      {
        DocType: "Picture",
        imagePath: "passport.png",
      },
      {
        DocType: "Ejari/ Title Deed",
        imagePath: "passport.png",
      },
      {
        DocType: "Employment Contract",
        imagePath: "passport.png",
      },
      {
        DocType: "Labor Card",
        imagePath: "passport.png",
      },
      {
        DocType: "Driving License",
        imagePath: "passport.png",
      },
      {
        DocType: "Vehicle Registration",
        imagePath: "passport.png",
      },
      {
        DocType: "Education Certificate",
        imagePath: "passport.png",
      },
      {
        DocType: "Marriage Certificate",
        imagePath: "passport.png",
      },
      {
        DocType: "Birth Certificate",
        imagePath: "passport.png",
      },
    ];

    res.status(200).json({
      success: true,
      message: "Document type list",
      data: DocumentTypeList,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// "documentDetailId":"277",
// "document_Title":"VAlue",
// "expiry_Date":"2020-12-31",
// "file_Path":"http://",
// "ip_Address":"12.32.221.11",
// "userId":"2",
// "companyId":"1",
// "DocType":"6",
// "dependentType":"1"
