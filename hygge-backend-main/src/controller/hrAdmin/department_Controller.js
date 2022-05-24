const util = require('util');
let status = require('statuses');
let connection = require('../../config/database');
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let message = require("../../lib/helpers/message");


//-------------------------Add_DepartmentType-------------------------
module.exports.add_DepartmentType = async (req, res) => {
    try {

        let { departmentType, ip_Address, companyId } = req.body;
        let { id } = req.user;
        var userDetail = await ConnectionUtil(`select * from department where isActive ='1' AND department_Type='${departmentType}' AND company_Id = '${companyId}'`);
        if (userDetail == '') {
            let post = {
                "department_Type": departmentType,
                "ip_Address": ip_Address,
                "company_Id": companyId,
                "created_By": id,
                "updated_By": id
            };
            let departmentAddQueryFind = await ConnectionUtil(`INSERT INTO department SET?`, post);
            if (departmentAddQueryFind.affectedRows != 0) {
                res.status(200).json({
                    "success": true,
                    "message": "Department add successfully"
                })
            } else {
                res.status(404).json({
                    "success": false,
                    "message": "Department data not added"
                })
            }
        } else {
            res.status(404).json({
                "success": false,
                "message": "Department already exist"
            })
        }
    } catch (err) {
        res.status(400).json({
            "success": false,
            "message": err,
        })
    }
}

//----------------------------Delete_DepartmentType ------------------------------
module.exports.delete_DepartmentType = async (req, res) => {
    try {
        let { departmentId, companyId, ip_Address } = req.body;
        let { id } = req.user;
        let userDetail = await ConnectionUtil(`select * from department where isActive='1' AND department_id='${departmentId}' AND company_Id = '${companyId}'`);
        if (userDetail != '') {
            var departmentDeleteQuery = await ConnectionUtil(`update department set isActive='${0}',updated_By='${id}',ip_Address='${ip_Address}' where department_id='${departmentId}' AND company_Id = '${companyId}'`);
            if (departmentDeleteQuery != 0) {
                res.status(200).json({
                    "success": true,
                    "message": "Department deleted successfully"
                })
            } else {
                res.status(403).json({
                    "success": false,
                    "message": "Department not deleted"
                })
            }
        } else {
            res.status(404).json({
                "success": false,
                "message": "Department data not found",
                "data": []
            })
        }

    } catch (err) {
        res.status(400).json({
            "success": false,
            "message": err,
        })
    }
}

//-------------------------------- Show_DepartmentType -------------------------------
module.exports.show_DepartmentType = async (req, res) => {
    try {
        let { company_id } = req.user;
        var userDetail = await ConnectionUtil(`select * from department where isActive='1' AND company_Id ='${company_id}'`);
        res.status(200).json({
            "success": true,
            "message": "Show  department list",
            "data": userDetail
        })
    } catch (err) {
        res.status(400).json({
            "success": false,
            "message": err,
        })
    }
}