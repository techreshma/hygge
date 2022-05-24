const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let message = require("../../lib/helpers/message");

//------------------------- Add_Compensation -------------------------
module.exports.add_Compensation = async (req, res) => {
  try {
    let {
      salaryTemplateID,
      companyId,
      ip_Address
    } = req.body;
    let { id, company_id } = req.user;
    let{branch_Id,access}=req.query;
    let userDetail = await ConnectionUtil(
      `select * from user where isActive=1 AND company_Id='${companyId}' AND user_id='${userId}' `
    );
    if (userDetail != "") {
      let compensationObject = {
        "department"   : 1,	
        "designation"  : 1,	
        "passport"	   : 1,
        "workLocation" : 1,
        "templateId"   : salaryTemplateID != '' ?salaryTemplateID : 1 ,
        "company_Id"   : companyId,
        "created_By"   : id,
        "updated_By"   : id,
        "ip_Address"   : ip_Address != "" ? ip_Address : "",
        "branch_Id"    : branch_Id
      };
      var CompensationInsertByFind = await ConnectionUtil(
        `INSERT INTO compensation_Detail SET ?`,
        compensationObject
      );
      if (CompensationInsertByFind.affectedRows != 0) {
        res.status(200).json({
          success: true,
          message: "Compensation add successfully",
          data: CompensationInsertByFind,
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Some went wrong",
        });
      }
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

//------------------------- edit_Compensation -------------------------
module.exports.edit_CompensationTemplate = async (req, res) => {
  try {
    let {
      compensationId,
      department,	
      designation,	
      passport,
      workLocation,
      templateId, 
      ip_Address
    } = req.body;
    let { id, company_id } = req.user;
    let userDetail = await ConnectionUtil(
      `select * from user where isActive=1 AND company_Id='${company_id}' AND user_id='${id}' `
    );
    if (userDetail != "") {      
      var CompensationUpdateByFind = await ConnectionUtil(`update compensation_Detail set
            department   = '${department}',	
            designation  = '${designation}',	
            passport	   = '${passport}',
            workLocation = '${workLocation}',
            templateId   = '${templateId}' ,            
            updated_By   = '${id}',
            ip_Address   = '${ip_Address}'   
            where  company_Id = '${company_id}' AND compensation_id = '${compensationId}'`);
            // employee_Name ='${employeeName}' 
            // "user_Id"               = '${userId}',
            // company_Id            = '${companyId}',
            // employee_Detail       = '${empDetail}',
            // employee_SalaryDetail ='${empSalaryDetail}',
            // salary_Date           = '${salaryDate}',
            // file_Path             = '${filePath}',
            // created_By            = '${id}',
            // updated_By            = '${id}',
            // ip_Address            = '${ip_Address}'
      if (CompensationUpdateByFind.affectedRows != 0) {
        res.status(200).json({
          success: true,
          message: "Salary slip updated successfully",
          data: CompensationUpdateByFind,
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Some went wrong",
        });
      }
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

//------------------------- show_Compensation -------------------------
module.exports.show_Compensation = async (req, res) => {
  try {
    let { id, company_id } = req.user;
    let{branch_Id,access}=req.query;
    // let userDetail = await ConnectionUtil(
    //   `select * from user where isActive=1 AND company_Id='${company_id}' AND user_id='${id}' `
    // );
    // if (userDetail != "") {
      var compensationDetail;
      if(access==0){
        compensationDetail = await ConnectionUtil(
          `select * from compensation_Detail where isActive='1' AND status='1' AND branch_Id='${branch_Id}' AND company_Id = '${company_id}' ORDER BY compensation_id DESC`
        );
      }else{
        compensationDetail = await ConnectionUtil(
          `select * from compensation_Detail where isActive='1' AND status='1' AND company_Id = '${company_id}' ORDER BY compensation_id DESC`
        );
      }
      res.status(200).json({
        success: true,
        message: "Show compensation list",
        data: compensationDetail,
      });
    // } else {
    //   res.status(404).json({
    //     success: false,
    //     message: "user not exist",
    //   });
    // }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};
