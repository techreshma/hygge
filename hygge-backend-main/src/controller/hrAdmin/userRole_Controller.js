const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let internalIp = require("internal-ip");
const { count } = require("console");

// -------------------------Add_Role-----------------------------------
module.exports.add_Role = async (req, res) => {
  try {
    let { role_Type, status, ip_Address, modules } = req.body;
    let { id, company_id } = req.user;
    let post = {
      role_Type: role_Type,
      status: status || 1,
      ip_Address: ip_Address,
      created_By: id,
      updated_By: id,
      company_Id: company_id,
    };
    let roleData = await ConnectionUtil(
      `select * from user_Role where isActive='1' AND company_Id='${company_id}' AND role_Type ='${role_Type}' `
    );
    if (roleData == "") {
      let user = await ConnectionUtil(`INSERT INTO user_Role SET ?`, post);
      if (user.affectedRows == 1) {
        AccessObj = {
          role: user.insertId,
          modules: JSON.stringify(modules),
          company_Id: company_id,
          created_By: id,
          updated_By: id,
        };
        var roleAccessInsert = await ConnectionUtil(
          `INSERT INTO roleAccess_Assign  SET ?`,
          AccessObj
        );

        res.status(200).json({
          success: true,
          message: "New role added successfully",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "Role type allready exits",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// -------------------------Show_Role-----------------------------------
module.exports.show_Role = async (req, res) => {
  try {
    let { company_id } = req.user;
    let roleData = await ConnectionUtil(
      `select * from user_Role where userRole_id != 1 AND isActive = '1' AND company_Id='${company_id}' ORDER BY userRole_id DESC`
    );
    var Newarr = [];
    if (roleData != "") {
      for (let userRoleCount of roleData) {
        let userData = await ConnectionUtil(
          `select Count(*) as total from user where isActive='1' AND role = '${userRoleCount.userRole_id}'`
        );
        userRoleCount.userCount = userData[0].total ? userData[0].total : 0;
        let roleAccess_Assign = await ConnectionUtil(
          `select modules from roleAccess_Assign where  isActive='1' AND role = '${userRoleCount.userRole_id}' AND company_Id='${company_id}'`
        );
        //ternary condition
        roleAccess_Assign != "" && roleAccess_Assign != null
          ? roleAccess_Assign.map((data) => {
            var checkAccess = true;
            JSON.parse(data.modules) != null
              ? JSON.parse(data.modules).map((item) => {
                if (item.both == false) {
                  checkAccess = false;
                } else {
                  if (item.children.length > 0) {
                    item.children.map((SubItem) => {
                      if (SubItem.both == false) {
                        checkAccess = false;
                      }
                    });
                  }
                }
              })
              : "";
            userRoleCount.accessLevel =
              checkAccess == true ? "Full Access" : "partial";
            Newarr.push(userRoleCount);
          })
          : "";
      }
      res.status(200).json({
        success: true,
        message: "Show role list",
        data: Newarr, //roleData
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Role data not found",
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

// -------------------------Delete_Role-----------------------------------
module.exports.delete_Role = async (req, res) => {
  try {
    var { userRole_id, isActive, ip_Address } = req.body;
    let { id, company_id } = req.user;
    var roleAccessFind = await ConnectionUtil(
      `select * from user where isActive='1' AND company_Id='${company_id}' AND role='${userRole_id}'`
    );
    if (roleAccessFind == "") {
      var roleDeleteQueryFind = await ConnectionUtil(
        `select * from user_Role where isActive=1 AND company_Id='${company_id}' AND userRole_id=?`,
        userRole_id
      );
      if (roleDeleteQueryFind != "") {
        var user = await ConnectionUtil(
          `update user_Role set isActive='${0}' ,updated_By='${id}',ip_Address='${ip_Address}' where userRole_id = '${userRole_id}'`
        );
        if (user.affectedRows != 0) {
          var user = await ConnectionUtil(
            `update roleAccess_Assign set isActive='${0}' ,updated_By='${id}',ip_Address='${ip_Address}' where company_Id='${company_id}' AND role = '${userRole_id}'`
          );
          res.status(200).json({
            success: true,
            message: " Role deleted successfully",
          });
        } else {
          res.status(404).json({
            success: false,
            message: "Role not deleted ",
          });
        }
      } else {
        res.status(404).json({
          success: false,
          message: "Role not exist",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message:
          "Unable to delete this role because its assigned to some users....",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// -------------------------Edit_Role-----------------------------------
module.exports.edit_Role = async (req, res) => {
  try {
    let { userRole_id, role_Type, ip_Address } = req.body;
    let { id, company_id } = req.user;
    var roleQueryFindType = await ConnectionUtil(
      `select * from user_Role where isActive='1' AND role_Type='${role_Type}' AND company_Id='${company_id}'`
    );
    if (
      roleQueryFindType == "" ||
      roleQueryFindType[0].userRole_id == userRole_id
    ) {
      var roleUpdateQueryFind = await ConnectionUtil(
        `select * from user_Role where userRole_id=?`,
        userRole_id
      );
      if (roleUpdateQueryFind != "") {
        var roleUpdateQueryFind = await ConnectionUtil(
          `update user_Role set role_Type='${role_Type}',updated_By='${id}',ip_Address='${ip_Address}' where userRole_id = '${userRole_id}'`
        );
        if (roleUpdateQueryFind.affectedRows != 0) {
          res.status(200).json({
            success: true,
            message: " Role updated successfull",
          });
        } else {
          res.status(404).json({
            success: false,
            message: " Role not update successfull",
          });
        }
      } else {
        res.status(400).json({
          success: false,
          message: "Data not found",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "Role type already exist",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// ------------------------- Role Active/DeActive -----------------------------------
module.exports.status_Role = async (req, res) => {
  try {
    let { userRole_id, status, ip_Address } = req.body;
    let { id } = req.user;
    var roleUpdateQueryFind = await ConnectionUtil(
      `select * from user_Role where userRole_id=?`,
      userRole_id
    );
    if (roleUpdateQueryFind != "") {
      var roleUpdateQueryFind = await ConnectionUtil(
        `update user_Role set status='${status}',updated_By='${id}',ip_Address='${ip_Address}' where userRole_id = '${userRole_id}'`
      );
      if (roleUpdateQueryFind.affectedRows != 0) {
        let RoleStatus = status == 1 ? "activated" : "deactivated";
        res.status(200).json({
          success: true,
          message: "Role status " + RoleStatus,
        });
      } else {
        res.status(404).json({
          success: false,
          message: " Role not update successfull",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Data not found",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};
