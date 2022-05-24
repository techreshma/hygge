const csv = require('csv-parser');
const fs = require('fs');
const multer = require('multer');
let MAIL = require('../../config/email');
const util = require('util');
let connection = require('../../config/database');
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let bcrypt = require('bcryptjs');
let randomToken = require('random-token');
let otp = require("../../lib/helpers/otp");

const { count } = require('console');

//------------------------csvFileUpload------------------------  
module.exports.employeeRaw_Csv_TO_Db = async (req, res) => {
    try {
        let { company_id, ip_Address, userID } = req.query;
        let Arr = [];
        let salaryArray = [];
        let leaveArray = [];
        for (let empData of req.body) {
            for (let empDataKey in empData) {
                let leave = empDataKey.split('Leave_')[1];
                let salary = empDataKey.split('Salary_')[1];
                if (leave) {
                    leave = leave.trim();
                    let rows = 'Leave_' + leave;
                    let obj = {};
                    obj[leave] = empData[rows];
                    leaveArray.push(obj)
                }
                if (salary) {
                    salary = salary.trim();
                    let rows = 'Salary_' + salary;
                    let obj = {};
                    obj[salary] = empData[rows];
                    salaryArray.push(obj)
                }
            }
            // --------------
            let Email = empData.Email;
            var toCheckEmail = await ConnectionUtil(`select * from user where isActive = '1' AND company_id='${company_id}' AND email='${Email}'`);
            if (toCheckEmail.length == 0) {//toCheckEmail == '' && row['Email']!='') {              
                var password = await otp.Otp_function();//randomToken(8);
                let joinDate = empData['Employement_Date'].split("-").reverse().join("-");
                var post = {
                    first_name: empData.First_Name,
                    last_name: empData.Last_Name,
                    email: empData.Email,
                    password: await bcrypt.hash(password, await bcrypt.genSalt(10)),
                    profile_picture: "download.png",
                    role: 0,
                    department: empData.Department,
                    designation: empData.Designation,
                    employee_joiningDate: joinDate,
                    insurance_plan_name: empData.Insurance_PlanName,
                    reporting_Manager: empData['Reporting Manager'],
                    working_HoursTo: empData.working_HoursTo,
                    working_HoursFrom: empData.working_HoursFrom,
                    ip_Address: ip_Address,
                    company_id: company_id,
                    created_By: userID,
                    updated_By: userID,
                    salaryBalance: JSON.stringify(salaryArray) != '' ? JSON.stringify(salaryArray) : '',
                    leaveBalance: JSON.stringify(leaveArray) != '' ? JSON.stringify(leaveArray) : '',
                    isSubAdmin: 0,
                    forget_Otp: password,
                    branch_Id:empData['branch_Id']
                };
    
                var user = await ConnectionUtil(`INSERT INTO user  SET ?`, post)
                if (user.affectedRows != 0) {
                    let qrcode = Email;
                    var tr = await MAIL.QRCode_Email_function(Email, password, qrcode);
                    salaryArray = [];
                    leaveArray = [];
                    Arr.push(post);
                }
            }else{
                let salaryBalanceUpdate        = JSON.stringify(salaryArray)!=''?JSON.stringify(salaryArray):[];
                    let leaveBalanceUpdate         = JSON.stringify(leaveArray)!=''?JSON.stringify(leaveArray):[];
                    var userUpdate = await ConnectionUtil(`UPDATE user SET 
                        first_name           = '${empData['First_Name']}',
                        last_name            = '${empData['Last_Name']}',                      
                        department           = '${empData['Department']}',
                        designation          = '${empData['Designation']}', 
                        insurance_plan_name  = '${empData['Insurance_PlanName']}',                                    
                        reporting_Manager    = '${empData['Reporting Manager']}',
                        working_HoursTo      = '${empData ['working_HoursTo']}',
                        working_HoursFrom	 = '${empData ['working_HoursFrom']}',
                        updated_By           = '${userID}',
                        salaryBalance        = '${salaryBalanceUpdate}',
                        leaveBalance         = '${leaveBalanceUpdate}',
                        branch_Id            = '${empData['branch_Id']}'
                    where user_id='${toCheckEmail[0].user_id}'`); 
                         salaryArray = [];
                         leaveArray = [];
                    Arr.push(userUpdate);    
               
            }
            // --------------
        }
        res.status(200).json({
            success: true,
            message: "Employee data inserted successfully",
            data: Arr
        }) 
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
      }
    }