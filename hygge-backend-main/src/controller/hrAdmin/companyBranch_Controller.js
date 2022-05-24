const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let otp = require("../../lib/helpers/otp");
let sourceFile = require("../../config/globalStaticValue");
let bcrypt = require("bcryptjs");
let MAIL = require("../../config/email");
// -------------------------create_Branch-----------------------------------
module.exports.create_Branch = async (req, res) => {
  try {
    let {
      company_Id,
      company_Contact,
      company_YearEstablished,
      company_Address,
      ip_Address,
      access,
      company_WorkingHours,
      company_BusinessType,
      company_Industry,
      P_firstName,
      P_lastName,
      branch_Name,
      PC_Email,//Owner Detail
      P_Contact,//Owner Detail
      PC_Designation,//Owner Detail
      salaryTemplateID,
      branch_Type
    } = req.body;
    let { id } = req.user;
    let email = req.body.corporate_email;
    let user = await ConnectionUtil(`select * from user where email='${PC_Email}'`); 
    if(user.length==0){
    let obj = {
      company_Id: company_Id,
      company_Contact: company_Contact,
      corporate_Email: email,
      company_YearEstablished: company_YearEstablished,
      company_Address: company_Address,
      created_By: id,
      updated_By: id,
      ip_Address: ip_Address,
      scope: 0,
      access: JSON.stringify(access)
,
      branch_Type: branch_Type,
      workingDay: sourceFile.workingDay,
      company_BusinessType: company_BusinessType,
      number_Employee: 1,
      company_WorkingHours: company_WorkingHours,
      company_Industry: company_Industry,
      P_firstName: P_firstName,
      P_lastName: P_lastName,
      branch_Name: branch_Name,
      PC_Email: PC_Email,
      P_Contact: P_Contact,
      PC_Designation: PC_Designation,
      salary_TemplateID: salaryTemplateID,
      branch_Name: branch_Name
    };
    let addCompanyBranch = await ConnectionUtil(`INSERT INTO companybranch SET ?`, obj);
    if (addCompanyBranch.insertId != 0) {
      //User
      // -----
      var token = await otp.Otp_function();
      let hashpassword = await bcrypt.hash(token, await bcrypt.genSalt(10));
      let userPost = {
        first_name: P_firstName,
        last_name: P_lastName,
        email: PC_Email,
        password: hashpassword,
        profile_picture: "download.png",
        mobile: JSON.stringify(P_Contact),
        role: 1,
        company_id: company_Id,
        branch_Id: addCompanyBranch.insertId,
        ip_Address: ip_Address,
        created_By: id,
        updated_By: id,
        forget_Otp: token,
        isSubAdmin: 0,
      };
      await MAIL.NewCompanyEmail_function(PC_Email, token);
      let UserCreate = await ConnectionUtil(`INSERT INTO user SET ?`, userPost);
      // -----
      // SMTP
      // -----
      let smtpObj = {
        mail_Server: "",
        smtp_Port: 0,
        userName: "",
        password: "",
        server_Security: "",
        default_Sender: "",
        default_SenderName: "",
        ip_Address: ip_Address,
        company_Id: company_Id,
        branch_Id: addCompanyBranch.insertId,
        created_By: id,
        updated_By: id,
      };
      let smtpCreate = await ConnectionUtil(
        `INSERT INTO smtp_Setting SET ?`,
        smtpObj
      );
      // ----
      //Module_Access
      // ----
      AccessObj = {
        role: 1,
        modules: sourceFile.access_Modules,// JSON.stringify()
        company_Id: company_Id,
        branch_Id: addCompanyBranch.insertId,
        created_By: id,
        updated_By: id,
      };
      var roleAccessInsert = await ConnectionUtil(
        `INSERT INTO roleAccess_Assign  SET ?`,
        AccessObj
      );
      // ----
      //Compensation
      // ----
      let compensationObj = {
        "department": 1,
        "designation": 1,
        "passport": 1,
        "workLocation": 1,
        "templateId": salaryTemplateID != '' ? salaryTemplateID : 1,
        "company_Id": company_Id,
        "branch_Id": addCompanyBranch.insertId,
        "created_By": id,
        "updated_By": id,
        "ip_Address": ip_Address != "" ? ip_Address : ""
      }
      var compensationInsertByFind = await ConnectionUtil(`INSERT INTO compensation_Detail  SET ?`, compensationObj);
      // ----update compensation_Detail set  branch_Id=0 where branch_Id IS NULL
      res.status(200).json({
        success: true,
        message: "Branch created successfully",
        data: addCompanyBranch
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Branch created ",
        data: addCompanyBranch
      });
    }
  }else{
    res.status(403).json({
      success: false,
      message: "employee email already exist",
    });
  }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// -------------------------branch_List-----------------------------------
module.exports.branch_List = async (req, res) => {
  try {//
    let { company_id } = req.user;
    let selectQueryCompanyBranch = await ConnectionUtil(`select * from companybranch where  isActive='1' AND company_Id='${company_id}' ORDER BY branch_id DESC`);
    res.status(200).json({
      success: true,
      message: "Show Branch list successfully",
      data: selectQueryCompanyBranch
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// -------------------------branch_List-----------------------------------
module.exports.branch_Status = async (req, res) => {
  try {
    let { company_Id, branch_Id, status, ip_Address, user_Id } = req.body;
    let companyBranchDetail = await ConnectionUtil(`select * from companybranch where  branch_id='${branch_Id}' AND company_Id='${company_Id}'`);
    if (companyBranchDetail.length > 0) {
      let companyBranchUpdateStatus = await ConnectionUtil(`update companybranch set status='${status}' ,ip_Address='${ip_Address}',updated_By='${user_Id}'  where branch_id='${branch_Id}' AND company_Id='${company_Id}' `);
      res.status(200).json({
        success: true,
        message: "Update branch status successfully",
        data: companyBranchUpdateStatus
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Branch not found",
        data: []
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// -------------------------branch_Delete-----------------------------------
module.exports.branch_Delete = async (req, res) => {
  try {
    let { company_Id, branch_Id, isActive, ip_Address, user_Id } = req.body;
    let companyBranchDetail = await ConnectionUtil(`select * from companybranch where  branch_id='${branch_Id}' AND company_Id='${company_Id}'`);
    if (companyBranchDetail.length > 0) {
      let companyBranchUpdateStatus = await ConnectionUtil(`update companybranch set isActive='${isActive}' ,ip_Address='${ip_Address}',updated_By='${user_Id}'  where branch_id='${branch_Id}' AND company_Id='${company_Id}' `);
      res.status(200).json({
        success: true,
        message: "Branch delete successfully",
        data: companyBranchUpdateStatus
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Branch not found",
        data: []
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// -------------------------branch_DetailUpdate-----------------------------------
module.exports.branch_DetailUpdate = async (req, res) => {
  try {
    let { company_Contact, company_YearEstablished, company_Address, access, company_Id, branch_Id, ip_Address, user_Id, 
    workingDay,company_BusinessType,company_WorkingHours,company_Industry,P_firstName,P_lastName,PC_Email,P_Contact,PC_Designation,salary_TemplateID,branch_Name} = req.body;
        PC_Email,P_Contact,PC_Designation,salary_TemplateID,branch_Name

let {id}=req.user;
    let companyBranchDetail = await ConnectionUtil(`select * from companybranch where  branch_id='${branch_Id}' AND company_Id='${company_Id}'`);
    if (companyBranchDetail.length > 0) {
      let accessArr=JSON.stringify(access);
      let workDay=JSON.stringify(workingDay);
      let email = req.body.corporate_email;
      let companyBranchUpdateStatus = await ConnectionUtil(`update companybranch set 
        company_Contact         = '${company_Contact}',
        corporate_Email         = '${email}',
        company_YearEstablished = '${company_YearEstablished}',
        company_Address         = '${company_Address}',
        access                  = '${accessArr}',
        updated_By              = '${id}',
        ip_Address              = '${ip_Address}', 
        workingDay            = '${workDay}', 
        company_BusinessType  = '${company_BusinessType}',
        company_WorkingHours  = '${company_WorkingHours}',
        company_Industry      = '${company_Industry}',
        P_firstName           = '${P_firstName}',
        P_lastName            = '${P_lastName}',
        PC_Email              = '${PC_Email}',
        P_Contact             = '${P_Contact}',
        PC_Designation        = '${PC_Designation}',
        salary_TemplateID      = '${salary_TemplateID}',
        branch_Name           = '${branch_Name}'
        where branch_id='${branch_Id}' AND company_Id='${company_Id}' `);
      res.status(200).json({
        success: true,
        message: "Branch detail update successfully",
        data: companyBranchUpdateStatus
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Branch not found",
        data: []
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};