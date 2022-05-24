const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let MAIL = require("../../config/email"); 
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let bcrypt = require("bcryptjs");
let { issueJWT } = require("../../lib/helpers/jwt");
let randomToken = require("random-token");
let otp = require("../../lib/helpers/otp");

// ------------------------- show_Insuracne -----------------------------------
module.exports.show_Insurance = async (req, res) => {
  try {
    let {company_id,id}=req.user;
    let {insuranceDetailId,companyId}=req.body;
    let insuranceId = await ConnectionUtil(`select * from user where user_id='${id}'`);
    if(insuranceId.length>0){
    let insuranceDetail = await ConnectionUtil(`select description,networkType,benefitType,company_id , insuranceDetail_id , insurance_Name , insurance_Plan , insurance_Benefit , network , expiry_Date from insurance_detail where isActive = '1' AND insuranceDetail_id='${insuranceId[0].insurance_plan_name}'AND  company_id ='${companyId}'`
      );
      res.status(200).json({
        success : true,
        message : "Show insurance list",
        data    : insuranceDetail
      });
    }else{
      res.status(200).json({
        success : true,
        message : "User insurance not alotted",
        data    : []
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};