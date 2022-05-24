const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let {
    commonNotification
} = require("../../lib/helpers/fcm");
//------------------------ Notification_list  ------------------------  
module.exports.notification_list = async(req, res) => {
    try{
        let {id,company_id}=req.user;
        let AnnouncementsSelectQuery = await ConnectionUtil(`select * from announcements where company_Id='0'`);  
        res.status(200).json({
            "success":true,
            "message" : "Notification list",
            data:AnnouncementsSelectQuery
        })
    }catch(err){
    console.log(err)
    res.status(400).json({
      success: false,
      message: err,
    });
  }
}

//------------------------ Notification_list  ------------------------  
module.exports.notificationSend_Filter = async(req, res) => {
    try{
        var { body,title, age_Type,gender_Type,company_Type,ageTo,ageFrom,company_Id,gender}=req.body;  
        var { id , company_id } =req.user;
        let newArr = [];
        let ageClause='';
        let genderClause='';
        let companyClause='';
        let msg={body:body,title:title};
        if(age_Type!=0){
            ageClause= `AND Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0)>=${ageFrom} AND Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0)<=${ageTo}`
        }
        if(gender_Type!=0){
            genderClause=`AND gender='${gender}'`
        }
        if(company_Type!=0){
            companyClause=`AND  company_id IN(${company_Id})`
        }
        let faqDeleteQuery  = await ConnectionUtil(`select * from user where isActive=1  ${companyClause} ${genderClause} ${ageClause}`);
        if( faqDeleteQuery.length > 0 ){
            for(let data of faqDeleteQuery){
                let NotificationSelectQuery  = await ConnectionUtil(`select * from fcm_Notification where user_Id='${data.user_id}'`);
                if(NotificationSelectQuery.length>0){
                    let len =NotificationSelectQuery[0].user_Id;
                    commonNotification(NotificationSelectQuery,msg)
                    newArr.push(len)
                }
            }
            let notifyObj={
                body       : body,
                title      : title,
                company_Id : 0,
                user_Id    : id,
                created_By : id,
                updated_By : id,
                userCount  : faqDeleteQuery.length//newArr.length
            }
            let insertNotification = await ConnectionUtil(`INSERT INTO announcements SET ?`, notifyObj);
            res.status(200).json({
                "success"  : true,
                "message"  : "notification send user ",
                data       : newArr
            })
        }else{
            res.status(200).json({
                success : true,
                message : "User filter request not find over record",
                data    : newArr
            });
        }
    } catch(err){
        console.log(err)
        res.status(400).json({
            success: false,
            message: err,
        });
    }
}

//------------------------ notification_Delete ------------------------  
module.exports.notification_Delete = async(req, res) => {
    try{
        var { announcements_id } = req.body;  
        let NotificationSelectQuery  = await ConnectionUtil(`Select * from announcements where announcements_id ='${announcements_id}'`);
        console.log(NotificationSelectQuery);
        if(NotificationSelectQuery.length>0){
            let NotificationDeleteQuery  = await ConnectionUtil(`delete from announcements where announcements_id ='${announcements_id}'`);
            res.status(200).json({
                success : true,
                message : "Delete notification successfully",
                data    : NotificationDeleteQuery
            });
        }else{
            res.status(404).json({
                success : false,
                message : "Data not found",
                data    : []
            });
        }
    } catch(err){
        console.log(err)
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}