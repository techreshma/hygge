const fs = require('fs');
const util = require('util');
let connection = require('../../config/database');
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let message = require("../../lib/helpers/message");


//------------------------ companyleaveType ------------------------  
module.exports.companyleaveType = async(req, res) => {
    try{
        let {company_id}=req.user;            
        var LeaveTypeDetail = await ConnectionUtil(`select leaveType_id,leave_Type from leave_Type where isActive=1 AND company_Id='${company_id}' `)                                      
        res.status(200).json({"success":true,"message" : "show leave Tpye","data":LeaveTypeDetail})    
    }catch(err){
        res.status(400).json(message.err)
    }
}