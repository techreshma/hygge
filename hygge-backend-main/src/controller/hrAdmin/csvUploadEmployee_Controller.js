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
//Storage the folder functionality
var storage = multer.diskStorage({
    destination: function (req, file, cd) {
        cd(null, 'upload/')
    },
    filename: function (req, file, cd) {
        cd(null, file.originalname)
    }
});
//upload the file function
var upload = multer({ storage: storage }).any('');
//------------------------csvFileUpload------------------------  
module.exports.csvFileUpload = (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            console.info("upload", err)
            res.send(err)
        } else {                     
            let companyID = req.query.company_id 
            let ipAddress = req.query.ip_Address
            let userID=req.query.userID;
            var imagename = req.files;           
            const map1 = imagename.map(async (file_data) => {
                var filepath = file_data;
                var Response=await csvConverts(file_data.path , companyID , ipAddress , userID)
                await fs.unlink(filepath.path, (err) => {
                    if (err) {
                        console.error(err)
                    } else {
                        console.info("CSV uploaded")
                    }
                })
                return res.json({
                    "success": Response.success,
                    "message": Response.message,                   
                });
            })
        }
    })
 }
//------------------------CSV file Convert Data function------------------------
async function csvConverts(csvData,companyID,ipAddress,userID) {   
    return new Promise(async(resolve) => {
        let csvUrl = csvData  
        let company = companyID
        await fs.createReadStream(csvUrl)
        .pipe(csv({mapHeaders: ({ header, index }) => header.trim()})).on('data', async (row) => {    
            let salaryArray=[];
            let leaveArray=[];                
            for(let KeyPair in row){                
                let leave=KeyPair.split('Leave_')[1];
                let salary=KeyPair.split('Salary_')[1];
                if(leave){                
                    leave = leave.trim();    
                    let Rows='Leave_'+leave;
                    let obj = {};
                    obj[leave] = row[Rows] ;
                    leaveArray.push(obj)
                }
                if(salary){
                    salary = salary.trim();    
                    let Rows='Salary_'+salary;                   
                    let obj = {};
                    obj[salary] = row[Rows] ;
                    salaryArray.push(obj)
                }
            } 
            let Email = row['Email']          
            var toCheckEmail = await ConnectionUtil(`select * from user where isActive = '1' AND company_id='${company}' AND email='${row['Email']}'`);          
            if (toCheckEmail.length == 0){//toCheckEmail == '' && row['Email']!='') {              
                var password = await otp.Otp_function();//randomToken(8);
                let joinDate = row['Employement_Date'].split("-").reverse().join("-");
                var post = {  
                        first_name           : row['First_Name'],
                        last_name            : row['Last_Name'] ,
                        email                : row['Email'] ,
                        password             : await bcrypt.hash(password, await bcrypt.genSalt(10)),
                        profile_picture      : "download.png",                      
                        role                 : 0 ,
                        department           : row['Department'],
                        designation          : row['Designation'], 
                        employee_joiningDate : joinDate,
                        insurance_plan_name  : row['Insurance_PlanName'],                                     
                        reporting_Manager    : row['Reporting Manager'],
                        working_HoursTo      : row ['working_HoursTo'],
                        working_HoursFrom	 : row ['working_HoursFrom'],
                        ip_Address           : ipAddress,
                        company_id           : companyID,
                        created_By           : userID,
                        updated_By           : userID,
                        salaryBalance        : JSON.stringify(salaryArray)!=''?JSON.stringify(salaryArray):'',
                        leaveBalance         : JSON.stringify(leaveArray)!=''?JSON.stringify(leaveArray):'',
                        isSubAdmin           : 0,
                        forget_Otp           :  password   
                }; 
                var user = await ConnectionUtil(`INSERT INTO user  SET ?`, post)         
                if (user.affectedRows != 0) {
                    let qrcode = row['Email'];
                    var tr = await MAIL.QRCode_Email_function(row['Email'], password, qrcode);
                    resolve({"success":true,"message":"CSV uploaded"})
                }
            }else{
                let salaryBalanceUpdate        = JSON.stringify(salaryArray)!=''?JSON.stringify(salaryArray):[];
                let leaveBalanceUpdate         = JSON.stringify(leaveArray)!=''?JSON.stringify(leaveArray):[];
                var userUpdate = await ConnectionUtil(`UPDATE user SET 
                    first_name           = '${row['First_Name']}',
                    last_name            = '${row['Last_Name']}',                      
                    department           = '${row['Department']}',
                    designation          = '${row['Designation']}', 
                    insurance_plan_name  = '${row['Insurance_PlanName']}',                                    
                    reporting_Manager    = '${row['Reporting Manager']}',
                    working_HoursTo      = '${row ['working_HoursTo']}',
                    working_HoursFrom	 = '${row ['working_HoursFrom']}',
                    updated_By           = '${userID}',
                    salaryBalance        = '${salaryBalanceUpdate}',
                    leaveBalance         = '${leaveBalanceUpdate}'
                where user_id='${toCheckEmail[0].user_id}'`); 
                resolve({"success":true,"message":"CSV uploaded"});
            }
        })
    });
} 

// ----------------------------------------------------------------------------------------------
module.exports.csvFileUpload = (req, res) => {
    let  body = req.body;
    let salaryArray=[];
    let leaveArray=[];   
    
    for(let KeyPair in row){                
        let leave=KeyPair.split('Leave_')[1];
        let salary=KeyPair.split('Salary_')[1];
        if(leave){                
            leave = leave.trim();    
            let Rows='Leave_'+leave;
            let obj = {};
            obj[leave] = row[Rows] ;
            leaveArray.push(obj)
        }
        if(salary){
            salary = salary.trim();    
            let Rows='Salary_'+salary;                   
            let obj = {};
            obj[salary] = row[Rows] ;
            salaryArray.push(obj)
        }
    }
} 
             
 
// let Email = row['Email']          
// var toCheckEmail = await ConnectionUtil(`select * from user where isActive = '1' AND company_id='${company}' AND email='${row['Email']}'`);          
// if (toCheckEmail.length == 0){//toCheckEmail == '' && row['Email']!='') {              
//     var password = await otp.Otp_function();//randomToken(8);
//     let joinDate = row['Employement_Date'].split("-").reverse().join("-");
//     var post = {  
//             first_name           : row['First_Name'],
//             last_name            : row['Last_Name'] ,
//             email                : row['Email'] ,
//             password             : await bcrypt.hash(password, await bcrypt.genSalt(10)),
//             profile_picture      : "download.png",                      
//             role                 : 0 ,
//             department           : row['Department'],
//             designation          : row['Designation'], 
//             employee_joiningDate : joinDate,
//             insurance_plan_name  : row['Insurance_PlanName'],                                     
//             reporting_Manager    : row['Reporting Manager'],
//             working_HoursTo      : row ['working_HoursTo'],
//             working_HoursFrom	 : row ['working_HoursFrom'],
//             ip_Address           : ipAddress,
//             company_id           : companyID,
//             created_By           : userID,
//             updated_By           : userID,
//             salaryBalance        : JSON.stringify(salaryArray)!=''?JSON.stringify(salaryArray):'',
//             leaveBalance         : JSON.stringify(leaveArray)!=''?JSON.stringify(leaveArray):'',
//             isSubAdmin           : 0,
//             forget_Otp           :  password   
//     }; 
//     var user = await ConnectionUtil(`INSERT INTO user  SET ?`, post)         
//     if (user.affectedRows != 0) {
//         let qrcode = row['Email'];
//         var tr = await MAIL.QRCode_Email_function(row['Email'], password, qrcode);
//         resolve({"success":true,"message":"CSV uploaded"})
//     }
// }else{
//     let salaryBalanceUpdate        = JSON.stringify(salaryArray)!=''?JSON.stringify(salaryArray):[];
//     let leaveBalanceUpdate         = JSON.stringify(leaveArray)!=''?JSON.stringify(leaveArray):[];
//     var userUpdate = await ConnectionUtil(`UPDATE user SET 
//         first_name           = '${row['First_Name']}',
//         last_name            = '${row['Last_Name']}',                      
//         department           = '${row['Department']}',
//         designation          = '${row['Designation']}', 
//         insurance_plan_name  = '${row['Insurance_PlanName']}',                                    
//         reporting_Manager    = '${row['Reporting Manager']}',
//         working_HoursTo      = '${row ['working_HoursTo']}',
//         working_HoursFrom	 = '${row ['working_HoursFrom']}',
//         updated_By           = '${userID}',
//         salaryBalance        = '${salaryBalanceUpdate}',
//         leaveBalance         = '${leaveBalanceUpdate}'
//     where user_id='${toCheckEmail[0].user_id}'`); 
//     resolve({"success":true,"message":"CSV uploaded"});
// }


