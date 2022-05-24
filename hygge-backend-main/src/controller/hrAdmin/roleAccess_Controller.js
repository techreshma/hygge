const util = require('util');
let status = require('statuses');
let connection = require('../../config/database');
const { stringify } = require('querystring');
let ConnectionUtil = util.promisify(connection.query).bind(connection);

// ------------------------- Access Allocation -----------------------------------
module.exports.access_Allocation = async (req, res) => {
    try {
        let { role, modules, ip_Address, companyId } = req.body;
        let { id } = req.user; 
        var roleAccessDetail = await ConnectionUtil(`select * from roleAccess_Assign where isActive= '1' AND company_Id='${companyId}' AND role='${role}'`)
        if (roleAccessDetail != '') {
            let modulesData = JSON.stringify(modules)
            var roleAccessUpdate = await ConnectionUtil(`update roleAccess_Assign set updated_By='${id}', modules='${modulesData}',ip_Address='${ip_Address}' where company_Id='${companyId}' AND role='${role}'`)
            res.status(200).json({
                "success": true,
                "message": "Access module updated successfully",
                "data": roleAccessUpdate
            })
        } else {
            res.status(404).json({
                "success": false,
                "message": "Role not exist"
            })
        }
    } catch (err) {
        res.status(400).json({
            "success": false,
            "message": err,
        })
    }
}

// ------------------------- show AccessDetail  -----------------------------------
module.exports.show_AccessDetail = async (req, res) => {
    try {
        let { role, companyId } = req.body;
        if (!role) {
            return res.status(404).json({
                "success": false,
                "message": "Role id required"
            })
        }
        if (!companyId) {
            return res.status(404).json({
                "success": false,
                "message": "CompanyId id required"
            })
        }
        var roleQueryFind = await ConnectionUtil(`select * from user_Role where isActive='1' AND company_Id='${companyId}' AND userRole_id='${role}'`);
        if (roleQueryFind != '') {
            var roleAccessDetail = await ConnectionUtil(`select modules from roleAccess_Assign where role='${role}' AND company_Id='${companyId}'`);
            let module = JSON.parse(roleAccessDetail[0].modules)
            res.status(200).json({
                "success": true,
                "message": "Show access detail hrAdmin",
                "data": module
            })
        } else {
            res.status(404).json({
                "success": false,
                "message": "Role does not exist"
            })
        }
    } catch (err) {
        res.status(400).json({
            "success": false,
            "message": err
        })
    }
}
