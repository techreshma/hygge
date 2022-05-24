// const fs = require('fs');
// const util = require('util');
// let connection = require('../../config/database');
// let ConnectionUtil = util.promisify(connection.query).bind(connection);
// let message = require("../../lib/helpers/message");


// //------------------------ companyleaveType ------------------------  
// module.exports.companyleaveType = async(req, res) => {
//     try{            
//         var LeaveTypeDetail = await ConnectionUtil(`select leave_Type from department where isActive=1`)                                      
//         res.status(200).json({"success":true,"message" : "show leave Tpye","data":LeaveTypeDetail})    
//     }catch(err){
//         res.status(400).json(message.err)
//     }
// }