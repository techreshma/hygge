const fs = require('fs');
const util = require('util');
let connection = require('../../config/database');
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let message = require("../../lib/helpers/message");


//------------------------ companyFaq ------------------------  
module.exports.companyFaq = async(req, res) => {
    try{
        var { id , company_id }=req.user; 
        // var companyFaqDetail= await ConnectionUtil(`select faq from company where company_id=?`,company_id)                      
        let companyFaqDetail = await ConnectionUtil(`select * from  faq  ORDER BY faq_id DESC`);
            res.status(200).json({"success":true,"message" : "Show faq data","data":companyFaqDetail})
        
    }catch(err){
        res.status(400).json(message.err)
    }
}

//------------------------ company_Privacy_Policy ------------------------
module.exports.company_Privacy_Policy = async(req, res) => {
    try{
        var { company_id } = req.user;                 
        // var privacyPolicyDetail= await ConnectionUtil(`select privacy_Policy from company where company_id=?`,company_id)                              
        let  privacyPolicyDetail=await ConnectionUtil(`select description from  privacypolicy`);
        res.status(200).json({ "success":true,"message" : "Show privacy policy data","data":privacyPolicyDetail})        
    }catch(err){
        res.status(400).json(message.err)
    }
}

//------------------------ company_WorkingDay ------------------------
module.exports.company_WorkingDay = async(req, res) => {
    try{
        var { company_id } = req.user;                 
        var privacyPolicyDetail= await ConnectionUtil(`select workingDay from company where company_id=?`,company_id)  
        let workingDay=JSON.parse(privacyPolicyDetail[0].workingDay)                            
        res.status(200).json({ "success":true,"message" : "Show privacy policy data","data":workingDay})        
    }catch(err){
        res.status(400).json(message.err)
    }
}

//------------------------ company_WorkingDay Update ------------------------
module.exports.company_WorkingDayUpdate = async(req, res) => {
    try{
        var {companyId,workingDay,ip_Address}=req.body;
        var { id} = req.user;                 
        var companyDetail= await ConnectionUtil(`select workingDay from company where isActive='1' AND company_id=?`,companyId)  
        if(companyDetail!=''){
            var companyUpdateQueryFind = await ConnectionUtil(`update company set workingDay='${workingDay}' , ip_Address='${ip_Address}',updated_By='${id}' where company_id ='${companyId}'`);
            if (companyUpdateQueryFind.affectedRows != 0) {
                res.status(200).json({
                    "success": true,
                    "message": " WorkingDays Update successfully"
                })
            } else {
                res.status(404).json({
                    "success": false,
                    "message": " CompanyDays Not Update",
                })
            } 
        }else{
            res.status(404).json({
                "success": false,
                "message": "Company dose not exist",
            })
        }
                                  
        // res.status(200).json({ "success":true,"message" : "show privacy policy data","data":workingDay})        
    }catch(err){
        res.status(400).json(message.err)
    }
}