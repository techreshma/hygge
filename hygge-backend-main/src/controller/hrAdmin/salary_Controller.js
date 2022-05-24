const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let message = require("../../lib/helpers/message");

//-------------------------Add_Salary-------------------------
module.exports.add_SalaryType = async (req, res) => {
  try {
    let { salaryType, ip_Address, companyId, } = req.body;
    let { id, company_id } = req.user;
    let { branch_Id, access } = req.query;
    var leaveDetail = await ConnectionUtil(
      `select * from salary_type where isActive ='1' AND salary_Type='${salaryType}' AND company_Id = '${company_id}'`
    );
    if (leaveDetail == "") {
      let post = {
        salary_Type: salaryType,
        ip_Address: ip_Address,
        company_Id: company_id,
        branch_Id: branch_Id,
        created_By: id,
        updated_By: id,
      };
      let leaveAddQueryFind = await ConnectionUtil(
        `INSERT INTO salary_type SET?`,
        post
      );
      if (leaveAddQueryFind.affectedRows != 0) {
        let salaryBalanceAddObjQueryFind = await ConnectionUtil(
          `Update user
          set  salaryBalance=JSON_ARRAY_APPEND(salaryBalance, '$', '{"${salaryType}": "5000"}')
          where company_id='${companyId}'
        `)
        res.status(200).json({
          success: true,
          message: "Salary added successfully",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Something went wrong",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "Salary already exist",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//----------------------------Delete_Salary----------------------------------------------------
module.exports.delete_SalaryType = async (req, res) => {
  try {
    let { salaryTypeId, ip_Address, companyId } = req.body;
    let { id } = req.user;
    let salaryDetail = await ConnectionUtil(
      `select * from salary_type where isActive='1' AND salaryType_id='${salaryTypeId}' AND company_Id = '${companyId}'`
    );
    if (salaryDetail != "") {
      var salaryDeleteQuery = await ConnectionUtil(
        `update salary_type set isActive='${0}',updated_By='${id}',ip_Address='${ip_Address}' where salaryType_id='${salaryTypeId}' AND company_Id = '${companyId}'`
      );
      if (salaryDeleteQuery != 0) {
        res.status(200).json({
          success: true,
          message: "Salary deleted successfully",
        });
      } else {
        res.status(403).json({
          success: false,
          message: "Salary deleted failed",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "Salary type not found",
      });
    }
    //
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//-------------------------------------Show_Salary--------------------------------------
module.exports.show_SalaryType = async (req, res) => {
  try {
    let { company_id } = req.user;
    let { branch_Id, access } = req.query;
    var salaryDetail;
    if (access == 0) {
      salaryDetail = await ConnectionUtil(
        `select * from salary_type where isActive='1' AND company_Id ='${company_id}'`);
    } else {
      salaryDetail = await ConnectionUtil(
        `select * from salary_type where isActive='1' AND company_Id ='${company_id}' AND branch_Id='${branch_Id}'`
      );
    }
    res.status(200).json({
      success: true,
      message: "Show  salary list",
      data: salaryDetail,
      RR: company_id,
      branch_Id: branch_Id
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//----------------------------update_Salary----------------------------------------------------
module.exports.update_SalaryType = async (req, res) => {
  try {
    let { leaveTypeId, ip_Address, companyId } = req.body;
    let { id } = req.user;
    let userDetail = await ConnectionUtil(
      `select * from leave_Type where isActive='1' AND leaveType_id='${leaveTypeId}' AND company_Id = '${companyId}'`
    );
    if (userDetail != "") {
      var departmentDeleteQuery = await ConnectionUtil(
        `update leave_Type set isActive='${0}',updated_By='${id}',ip_Address='${ip_Address}' where leaveType_id='${leaveTypeId}' AND company_Id = '${companyId}'`
      );
      if (departmentDeleteQuery != 0) {
        res.status(200).json({
          success: true,
          message: " Salary deleted successfully",
        });
      } else {
        res.status(403).json({
          success: false,
          message: "Salary not deleted",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "Salary not Found",
        data: [],
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};
