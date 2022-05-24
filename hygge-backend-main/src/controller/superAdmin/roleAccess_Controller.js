const util = require('util');
let status = require('statuses');
let connection = require('../../config/database');
const { stringify } = require('querystring');
let ConnectionUtil = util.promisify(connection.query).bind(connection);

// -------------------------Add_Role-----------------------------------
module.exports.show_AccessModule = async (req, res) => {	
	try {
        let {isType}=req.body; 
        if(isType==0){
        var user= await ConnectionUtil(`select * from role_Access  where isActive='1' AND isType=0`)             
            res.status(200).json({
					"success": true,
                    "message": "Show access module superAdmin",
                    "data":user
                })
        }else{
            var user= await ConnectionUtil(`select * from role_Access where isActive='1' AND isType=1`)             
            res.status(200).json({
					"success": true,
                    "message": "Show access module hr Admin",
                    "data":user
                })
        }
                
	} catch (err) {
		res.status(400).json({
			"success": false,
			"message": err,
		})
	}
}

// ------------------------- Access Allocation -----------------------------------
module.exports.access_Allocation= async (req, res) => {	
	try {
           let{ role , modules, ip_Address }=req.body; 
           let {id}=req.user;
            var roleAccessDetail = await ConnectionUtil(`select * from roleAccess_Assign where isActive= '1' AND  role='${role}' AND company_Id='0'`)
            console.log(roleAccessDetail,"WWWWWWWWWWWWWWWWWWWWWWWWWWWW")
            if(roleAccessDetail.length > 0 ){              
                let modulesData = JSON.stringify(modules)
                var roleAccessUpdate= await ConnectionUtil(`update roleAccess_Assign set updated_By='${id}', modules='${modulesData}',ip_Address='${ip_Address}' where company_Id='0' AND role='${role}'`)
                res.status(200).json({
                    "success": true,
                    "message": "Access module updated successfully",
                    "data"   : roleAccessUpdate
                })  
            }else{
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
module.exports.show_AccessDetail= async (req, res) => {	
	try {
        let{role}=req.body;        
        var roleQueryFind = await ConnectionUtil(`select * from superadmin_Role where isActive='1' AND superadminRole_id='${role}' `);            
        if(roleQueryFind!=''){
            var roleAccessDetail= await ConnectionUtil(`select modules from roleAccess_Assign where  company_Id='0' AND role='${role}'`); 
            let module=JSON.parse(roleAccessDetail[0].modules)
            res.status(200).json({
                "success" : true,
                "message" : "Show access detail",
                "data"    : module 
            })         
        }else{
            res.status(404).json({
                "success" : false,
                "message" : "Role does not exist" 
            })
        }
	} catch (err) {
		res.status(400).json({
			"success": false,
			"message": err
		})
	}
}           
