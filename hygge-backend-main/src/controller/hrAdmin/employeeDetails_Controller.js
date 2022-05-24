const util = require('util');
let status = require('statuses');
let connection = require('../../config/database');
const { create } = require('domain');
let ConnectionUtil = util.promisify(connection.query).bind(connection);

//----------------------employeedetails----------------------------
module.exports.employeeDetails=async(req,res)=>{
    try{
        let{userid}=req.body;
        let getDetails=await ConnectionUtil(`select concat(first_name,last_name)as name,email,profile_picture,mobile,work_location,designation from user where user_id='${userid}' AND isActive='1'`);
        if(getDetails!=""){
            res.status(200).json({
                success:true,
                message:"Employee Details",
                data:getDetails
            })
        }
        else{
            res.status(400).json({
                success:false,
                message:"user not found in our records"
            })
        }
    }
    catch(err){
        console.log(err)
        res.status(400).json({
            success:true,
            message:"something went wrong"
        })
    }
}
