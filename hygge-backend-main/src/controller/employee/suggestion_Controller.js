const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);

// ------------------------- Employee_SuggestionMember -----------------------------------
module.exports.employee_SuggestionMember = async (req, res) => {
  try {
    let { userId, companyId } = req.body;
    var userDetail = await ConnectionUtil(
      `select user_id,CONCAT(first_name," ",last_name) as username  , profile_picture, role, company_id from user where isActive='1' AND company_id ='${companyId}'`
    );
    var userData = [];
    if (userDetail != "") {
      for (let test of userDetail) {
        if (test.user_id != userId) {
          var userRoleDetail = await ConnectionUtil(
            `select role_Type from user_Role where isActive ='1' AND company_Id ='${companyId}'`
          );
          test.roleType =
            userRoleDetail[0].role_Type != ""
              ? userRoleDetail[0].role_Type
              : "";
          userData.push(test);
        } 
      }
      res.status(200).json({
        success: true,
        message: "Show Employee suggestion",
        data: userData,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "name not find",
        data:[]
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// ------------------------- search_SuggestionMember -----------------------------------
module.exports.search_SuggestionMember = async (req, res) => {
  try {
    let { userId, companyId,search } = req.body;
    let {id,company_id}=req.user;
    var userDetail = await ConnectionUtil(
      `select user_id,first_name , last_name , profile_picture, role, company_id from user where  first_name  LIKE '%${search}%' AND  isActive='1' AND company_id ='${company_id}' `)
   
    var userData = [];
    if (userDetail != "") {
      for (let test of userDetail) {
        if (test.user_id != id){
          var userRoleDetail = await ConnectionUtil(
            `select role_Type from user_Role where isActive ='1' AND company_Id ='${company_id}'`
          );
          test.roleType =
            userRoleDetail[0].role_Type != ""
              ? userRoleDetail[0].role_Type
              : "";
              test.username=userRoleDetail[0].first_name+" "+userRoleDetail[0].last_name 
          userData.push(test);
        } 
      }
      res.status(200).json({
        success: true,
        message: "Show Employee suggestion",
        data: userData,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Name not found",
        data:[]
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};
