const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let internalIp = require("internal-ip");

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
    };
    let roleData = await ConnectionUtil(
      `select * from superadmin_Role where isActive=1 AND role_Type = ? `,
      role_Type
    );
    if (roleData == "") {
      let user = await ConnectionUtil(
        `INSERT INTO superadmin_Role SET ?`,
        post
      );
      if (user.affectedRows == 1) {
        AccessObj = {
          role: user.insertId,
          modules: JSON.stringify(modules),
          company_Id: 0,
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
          data: roleAccessInsert,
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

// -------------------------Show_Role-----------------------------------
module.exports.show_Role = async (req, res) => {
  try {
    let roleData = await ConnectionUtil(
      `select * from superadmin_Role where superadminRole_id !='1' AND isActive = 1 ORDER BY superadminRole_id DESC`
    );
    var Newarr = [];
    if (roleData) {
      for(let superadminCount of roleData){
      let userData = await ConnectionUtil(`select Count(*) as total from superadmin where isActive='1' AND role = '${superadminCount.superadminRole_id}' `);
      superadminCount.userCount = userData[0].total?userData[0].total:0;
      let roleAccess_Assign = await ConnectionUtil(`select modules from roleAccess_Assign where  isActive='1'  AND role = '${superadminCount.superadminRole_id}' AND company_Id='0'`); 
      //ternary condition
      roleAccess_Assign!=''||roleAccess_Assign!=null ? 
       roleAccess_Assign.map((data)=>{
         
        var checkAccess = true;
        JSON.parse(data.modules)!=null ?
        JSON.parse(data.modules).map((item)=>{
          if(item.both==false){
            checkAccess = false
            }else{
              if(item.children){
              if(item.children.length > 0){
                item.children.map((SubItem)=>{
                  if(SubItem.both==false){
                    checkAccess = false
                  }
                })}}
            }
        }): '' ;
        superadminCount.accessLevel= checkAccess==true? 'Full Access':'partial';
      Newarr.push(superadminCount);
      }):'';
      }
      res.status(200).json({
        success: true,
        message: "Show role list",
        data: Newarr
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

// ------------------------- Delete_Role -----------------------------------
module.exports.delete_Role = async (req, res) => {
  try {
    var { superadminRole_id, isActive, ip_Address } = req.body;
    let { id } = req.user;
    var roleAccessFind = await ConnectionUtil(
      `select * from superadmin where isActive='1'  AND role='${superadminRole_id}'`
    );
    if (roleAccessFind == "") {
      var roleDeleteQueryFind = await ConnectionUtil(
        `select * from superadmin_Role where isActive=1  AND superadminRole_id=?`,
        superadminRole_id
      );
      if (roleDeleteQueryFind != "") {
        var user = await ConnectionUtil(
          `update superadmin_Role set isActive='${0}' ,updated_By='${id}',ip_Address='${ip_Address}' where superadminRole_id = '${superadminRole_id}'`
        );
        if (user.affectedRows != 0) {
          var user = await ConnectionUtil(
            `update roleAccess_Assign set isActive='${0}' ,updated_By='${id}',ip_Address='${ip_Address}' where company_Id='${0}' AND role = '${superadminRole_id}'`
          );//
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
          message: "Role not exits...",
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

// -------------------------edit_Role-----------------------------------
module.exports.edit_Role = async (req, res) => {
  try {
    let { superadminRole_id, role_Type, ip_Address } = req.body;
    let { id } = req.user;
    var roleQueryFindType = await ConnectionUtil(
      `select * from superadmin_Role where isActive='1' AND role_Type='${role_Type}'`
    );
    if (roleQueryFindType == "" || roleQueryFindType[0].superadminRole_id==superadminRole_id) {
      var roleQueryFind = await ConnectionUtil(
        `select * from superadmin_Role where  superadminRole_id=?`,
        superadminRole_id
      );
      if (roleQueryFind != "") {
        var roleUpdateQueryFind = await ConnectionUtil(
          `update superadmin_Role set role_Type='${role_Type}',updated_By='${id}',ip_Address='${ip_Address}' where superadminRole_id = '${superadminRole_id}'`
        );
        if (roleUpdateQueryFind.affectedRows != 0) {
          // var roleUpdateQueryFind = await ConnectionUtil(`update roleAccess_Assign set role='${role}',updated_By='${id}',ip_Address='${ip_Address}',modules='${moduleData}', where roleAssign_id = '${superadminRole_id}'`)
          res.status(200).json({
            success: true,
            message: "Role updated successfully",
          });
        } else {
          res.status(404).json({
            success: false,
            message: "Role not update successfully",
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
    let { superadminRole_id, status, ip_Address } = req.body;
    let { id } = req.user;
    var roleUpdateQueryFind = await ConnectionUtil(
      `select * from superadmin_Role where superadminRole_id=?`,
      superadminRole_id
    );
    if (roleUpdateQueryFind != "") {
      var roleUpdateQueryFind = await ConnectionUtil(
        `update superadmin_Role set status='${status}',updated_By='${id}',ip_Address='${ip_Address}' where superadminRole_id = '${superadminRole_id}'`
      );
      if (roleUpdateQueryFind.affectedRows != 0) {
        let RoleStatus = status == 1 ? "activated" : "deactivated";
        res.status(200).json({
          success: true,
          message: "SubAdmin status " + RoleStatus,
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

// // -------------------------Delete_Role-----------------------------------
// module.exports.delete_Role = async (req, res) => {
// 	try {
// 		var { superadminRole_id ,isActive,ip_Address} = req.body;
// 		let {id}=req.user;
// 		var roleDeleteQueryFind = await ConnectionUtil(`select * from superadmin_Role where isActive=1 AND superadminRole_id=?`,superadminRole_id);
// 		if (roleDeleteQueryFind != '') {
// 			var user = await ConnectionUtil(`update superadmin_Role set isActive='${0}' ,updated_By='${id}',ip_Address='${ip_Address}' where superadminRole_id = '${superadminRole_id}'`)
// 			if (user.affectedRows != 0) {
// 				res.status(200).json({
// 					"success": true,
// 					"message": " role deleted successfully..."
// 				})
// 			} else {
// 				res.status(403).json({
// 					"success": false,
// 					"message": "role not deleted "
// 				})
// 			}
// 		} else {
// 			res.status(403).json({
// 				"success": false,
// 				"message": "role not exits..."
// 			})
// 		}
// 	} catch (err) {
// 		res.status(400).json({
// 			"success": false,
// 			"message": err,
// 		})
// 	}
// }

