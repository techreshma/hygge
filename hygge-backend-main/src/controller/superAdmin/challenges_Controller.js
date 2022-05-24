const util = require('util');
let status = require('statuses');
let connection = require('../../config/database');
const { create } = require('domain');
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let message = require("../../lib/helpers/message");
let {
       helperNotification
} = require("../../lib/helpers/fcm");

//----------------- CreateChallenge -----------------
module.exports.create_Challenge = async (req, res) => {
    try {
        let { challengeName, description, challengeImage , challengeConfiguration , RewardPoints , ageFrom , Gender , age , ageTo , createdBy , expiryDate , ip_Address , company_Id , genderType  , challengePredefined_Id } = req.body;
        let newArr=[];
        let challengeDetail = await ConnectionUtil(`select * from challenges  where  challengePredefined_Id='${challengePredefined_Id}' AND action_Required='1'`);      
        await challengeDetail.map((data)=>{return  newArr.push(data.company_Id)})
        let y =await newArr.filter((data)=>{return data==0});
        if(y.length==0) {
            let challengeObj = {
                challenge_Name: challengeName,
                challenges_Description: description,
                challenge_Image: challengeImage,
                challenge_Configuration: JSON.stringify(challengeConfiguration),
                Reward:RewardPoints,
                age: age||0,
                Gender: Gender||0,
                genderType: genderType,
                age_From: ageFrom,
                age_To: ageTo,
                created_By: 0,//createdBy,
                updated_By:0,
                company_Id: 0,//company_Id,
                expiry_Date: expiryDate,
                ip_Address: ip_Address,
                challengePredefined_Id:challengePredefined_Id
            }
            let ageClause = '';
            let genderClause = '';
            let companyClause = '';
            let findCompanyClause='';
            if (company_Id != 0) {
                companyClause = `AND company_id='${company_Id}'`
            }
            if (age != 0) {
                if (ageFrom != 0 && ageTo != 0) {
                    ageClause = `AND Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0)>='${ageFrom}' AND Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0)<='${ageTo}'`;
                }
            }
            if (Gender != 0) {
                genderClause = `AND gender='${genderType}'`
            }
            if(newArr.length>0){
                findCompanyClause = `AND company_id NOT IN('${newArr}')`
            }
            let addChallenge = await ConnectionUtil(`INSERT INTO challenges SET isActive='1',?`, challengeObj);
            if (addChallenge.insertId !=0) {
                let UserDetails = await ConnectionUtil(`select user_id from user where role !='1' AND isActive='1' ${findCompanyClause}  ${ageClause} ${companyClause} ${genderClause} `);
                if (UserDetails.length>0) {   
                    let newArr = [];
                    for (let user of UserDetails) {
                        let userAssign = {
                            user_Id: user.user_id,
                            challenge_Id: addChallenge.insertId,
                            created_By: createdBy,
                            updated_By: createdBy,
                            company_Id: 0,//company_Id,
                            ip_Address: ip_Address
                        }; 
                        let userAssignChallenge = await ConnectionUtil(`INSERT INTO userassign_challenges SET ?`, userAssign)
                        let userDeviceToken = await ConnectionUtil(`select device_Token from fcm_Notification where user_Id='${user.user_id}'`);
                        let Arr = [];
                        await userDeviceToken.map((data) => {
                            return Arr.push(data.device_Token)
                        })
                        let testMessage = {
                            title: "New Challenge Activated",//"Challenge",
                            body: "Come back to Hygge: there is a new challenge waiting for you."//"Accept new challenge"
                        }
                        await helperNotification(Arr, testMessage)
                        newArr.push({userId:user.user_id});
                    }
                    res.status(200).json({
                        success: true,
                        message: "Challenge assigned to user",
                        data: newArr
                    })
                }
                else {
                    let UserDetails = await ConnectionUtil(`delete from  challenges where  challenges_id=${addChallenge.insertId}`);
                    // res.status(200).json({
                    //     success: false,
                    //     message: "Filter by user not found"
                    // })
                    res.status(200).json({
                        success: true,
                        message: "User filter request not find over record",
                        data: [],
                    });
                }
            }
            else {
                res.status(200).json({
                    success: false,
                    message: "challenge not found"
                })
            }
        }else{
            res.status(400).json({
                success: false,
                message: "Challenge already activated"
            }) 
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            message: "Something went wrong"
        })
    }
}

//----------------- Challenge -----------------
module.exports.challenege = async (req, res) => {
    try {
        let company_id = 0;
        let newArr = [];
        let challengePreDefDetails = await ConnectionUtil(`select * from challenge_predefined`);
        for(let challengePreDefObj of  challengePreDefDetails){
            let challengeDetails = await ConnectionUtil(`select * from challenges where company_id=${company_id} AND action_Required='1' AND challengePredefined_Id=${challengePreDefObj.challengePredefined_id}`);
            if(challengeDetails.length>0){               
               let count= await countEmployee(challengeDetails[0].challenges_id);
                challengePreDefObj.point  = challengeDetails[0].Reward!=undefined ?challengeDetails[0].Reward:'';
                challengePreDefObj.acceptedByTotalUser   = count.totalCount
                challengePreDefObj.acceptedByAcceptUser  = count.numCount; 
                challengePreDefObj.expiry  = challengeDetails[0].expiry_Date !=undefined ?challengeDetails[0].expiry_Date:''
                challengePreDefObj.actin_Required = challengeDetails[0].action_Required!=undefined?challengeDetails[0].action_Required:''
                challengePreDefObj.challenges_id = challengeDetails[0].challenges_id,
                challengePreDefObj.Details =challengeDetails
            }else{
                challengePreDefObj.point               = '-' ;
                challengePreDefObj.acceptedBy          = '-' ; 
                challengePreDefObj.expiry              = '-' ;
                challengePreDefObj.actin_Required      = 0 ; 
                challengePreDefObj.challengePredefined = '-' ;
                challengePreDefObj.challenges_id       = '-' ;
                challengePreDefObj.Details             = challengeDetails;
            }
            newArr.push(challengePreDefObj)
        } 
        res.status(200).json({
            success: true,
            message: "Challenge predefined list",
            data: newArr
        })
    }
    catch (err) {
        console.log(err)
        res.status(400).json({ 
            success: false,
            message: "something went wrong"
        })
    }
}

//----------------- countEmployee -----------------
async function countEmployee(challengesId){
    let checkuserAssignSelectQuery = await ConnectionUtil(`select * from userassign_challenges where challenge_Id='${challengesId}'`);
    let totalCount =checkuserAssignSelectQuery.length;
    let numCount=0
    checkuserAssignSelectQuery.map((data)=>{
      if(data.isAccept==1){
        numCount=numCount+1;
      }
    })
    let obj={
        totalCount:totalCount,
        numCount:numCount
    }
    return obj
}

//----------------- ActionRequired_Challenge -----------------
module.exports.actionRequired_Challenge  = async (req, res) => {
    try {
        let {challenges_id ,action_Required,ip_Address} = req.body;
        let { id,company_id} = req.user;
        let challengeSelectQuery = await ConnectionUtil(`SELECT * from challenges where  isActive='1' AND  challenges_id=${challenges_id}`); 
        if(challengeSelectQuery.length>0){
            let challengeUpdateQuery = await ConnectionUtil(`UPDATE  challenges SET updated_By='${id}' , ip_Address = '${ip_Address}' , action_Required='${action_Required}' where  challenges_id=${challenges_id}`);             
            res.status(200).json({
                success: true,
                message: "Challenge deactive successfully",
                data: challengeUpdateQuery
            })
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({ 
            success: false,
            message: "something went wrong"
        })
    }
}

//----------------- GraphDetail_Challenege -----------------
let arr = [];
module.exports.GraphDetail_Challenege  = async (req, res) => {
    try {
        let {company_Id} = req.body;
        let newArr=[];
        let challengeSelectQuery = await ConnectionUtil(`select * from challenges where action_Required = '1' AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND company_Id='${0}'`)
        for(let challengeObj of challengeSelectQuery){
            let userAssignSelectQuery = await ConnectionUtil(`select * from userassign_challenges where  challenge_Id='${challengeObj.challenges_id}'`)
            let countNum =await userfilterCount(challengeObj.challenges_id,userAssignSelectQuery)   
            newArr.push(countNum);
        } 
        res.status(200).json({ 
            success : true,
            message : "Challenge deactive successfully",
            data    : newArr
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({ 
            success: false,
            message: "something went wrong"
        })
    }
}

async function userfilterCount(challenegesId,userAssignSelectQuery){
    let femalecount   = 0;
    let malecount     = 0;
    for(let data of userAssignSelectQuery){
    let userMaleSelectQuery = await ConnectionUtil(`select gender from user where  gender='male' AND  user_id='${data.user_id}'`);
    let userFelmaleSelectQuery = await ConnectionUtil(`select gender from user where  gender='female' AND  user_id='${data.user_id}'`); 
        if(userMaleSelectQuery.length>0){
            malecount=malecount+1;
        }
        else if(userFelmaleSelectQuery.length>0){
            femalecount=femalecount+1;
        }       
    }
    return {challenegesId:challenegesId,male:malecount,female:femalecount}
}