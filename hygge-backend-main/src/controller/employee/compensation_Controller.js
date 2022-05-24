const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let MAIL = require("../../config/email");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let moment = require("moment");
// ------------------------- ShowSalaryList -----------------------------------
module.exports.show_salarylist = async (req, res) => {
  try {
    let { id, company_id } = req.user;
    var userDetail = await ConnectionUtil(
      `select * from user where isActive='1' AND user_id='${id}' AND company_id='${company_id}'`
    );
    if (userDetail.length > 0 ) {
      var salaryDetail = await ConnectionUtil(
        `select salaryDate,salary_id,paySlipId from salary_Detail where isActive='1' AND user_Id='${id}'AND  YEAR(salaryDate) = YEAR(CURRENT_DATE()) AND company_Id ='${company_id}'  ORDER BY salary_id DESC `
      );
      if (salaryDetail.length > 0 ) {
        let newArr = [];
        for (let salDetail of salaryDetail) {
          salDetail.salaryDate =
            salDetail.salaryDate != null
              ? moment(salDetail.salaryDate).format('L')//.format("LL")
              : "";
          salDetail.monthName =
            salDetail.salaryDate != null
              ? moment(salDetail.salaryDate).format("MMMM")
              : moment(new Date()).format("MMMM");
          salDetail.salaryDate;
          newArr.push(salDetail);
        }
        res.status(200).json({
          success: true,
          message: "Show salary list",
          data: newArr,
        });
      } else {
        res.status(200).json({
          success: true,
          message: "Show salary list",
          data: [],
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "user not exist",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// ------------------------- showSalaryDetail -----------------------------------
module.exports.show_salaryDetail = async (req, res) => {
  try {
    let { paySlipId,userId,companyId} = req.body;
    var userDetail = await ConnectionUtil(
      `select * from user where isActive='1' AND user_id='${userId}'`
    );
    if (userDetail.length > 0 ) {
      var salaryDetail = await ConnectionUtil(
        `select paySlip_Image from salary_Detail where paySlipId='${paySlipId}'`
      );
        res.status(200).json({
          success: true,
          message: "Show salary detail",
          data: salaryDetail
        });  
       } else {
      res.status(404).json({
        success: false,
        message: "user not exist",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};