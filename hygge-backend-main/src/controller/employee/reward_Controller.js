const util = require('util');
let status = require('statuses');
let connection = require('../../config/database');
const { create } = require('domain');
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let message = require("../../lib/helpers/message");
let {
       helperNotification
} = require("../../lib/helpers/fcm");
const moment = require("moment");
//----------------- reward_List -----------------
module.exports.reward_List = async (req, res) => {
    try {
        let {company_Id} = req.body;
        let {id,company_id } = req.user;
        let arrNew = [];
        let userAssignRewardSelectQuery = await ConnectionUtil(`SELECT * from userassign_rewards WHERE (company_Id='${0}' or company_Id='${company_Id}') AND user_ID='${id}'  ORDER BY assignReward_id DESC`);  //AND isUsed='1'
        for(let userAssignRewardObj of   userAssignRewardSelectQuery){
            let rewardSelectQuery = await ConnectionUtil(`SELECT reward_id,end_Date,reward_Name,reward_Image,reward_Description,reward_Points,DATEDIFF(end_Date,start_Date) as Expires_in from rewards WHERE DATE_FORMAT(start_Date, '%Y-%m-%d')>=DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND
            DATE_FORMAT(CURDATE(),'%Y-%m-%d')<=DATE_FORMAT(end_Date, '%Y-%m-%d') and status='1' AND is_Active='1' AND reward_id='${userAssignRewardObj.reward_Id}'`)
            if(rewardSelectQuery.length>0){
                rewardSelectQuery[0].reward_Points=rewardSelectQuery[0].reward_Points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            arrNew.push(rewardSelectQuery[0])
            }
        }
        let EarnpointD = await ConnectionUtil(`SELECT SUM(reward_point) as Total_point  from reward_redeem where isDeposit='1' AND user_Id='${id}'`);
        let EarnpointW = await ConnectionUtil(`SELECT SUM(reward_point) as Total_point  from reward_redeem where isDeposit='0' AND user_Id='${id}'`);
        let reward={};
        reward={
            current_point:EarnpointD!=null&& EarnpointD[0].Total_point!=null? (EarnpointD[0].Total_point - EarnpointW[0].Total_point).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","):0, //!=null?Earnpoint[0].Total_point:0,
            total_point: EarnpointD!=null && EarnpointD[0].Total_point!=null ?  EarnpointD[0].Total_point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")  :0 //500
        };
        res.status(200).json({
            success     : true,
            message     : "Reward show list",
            data        : arrNew,
            rewardPoint : reward
         }) 
    } catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            message: err.message
        })
    }
}

//----------------- reward_History -----------------
module.exports.reward_History = async (req, res) => {
    try {
        let {id,company_id } = req.user;
            let newArr = []; 
            let rewardSelectQuery = await ConnectionUtil(`SELECT * from reward_redeem WHERE user_Id='${id}' ORDER BY rewardRedeem_id DESC`);
              for(let data of rewardSelectQuery){
                let obj={};
                if(data.isDeposit==0){
                let rewardSelectQuery = await ConnectionUtil(`SELECT end_Date,reward_Name from rewards WHERE reward_id='${data.reward_Id}'`)
                    obj={
                        challenege_Name : rewardSelectQuery[0].reward_Name,
                        reward_Name     : rewardSelectQuery[0].reward_Name,
                        end_Date        : "",//moment(rewardSelectQuery[0].end_Date).format('DD/MM/YYYY'),
                        redeem_Date     : moment(data.redeem_Date).format('DD/MM/YYYY') ,
                        amount          : data.reward_point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                        Deposit         : data.isDeposit
                    }
                }
               if(data.isDeposit==1){
                let rewardSelectQuery = await ConnectionUtil(`SELECT challenge_Name,expiry_Date from challenges WHERE challenges_id='${data.reward_Id}'`);
                    obj={
                        challenege_Name : rewardSelectQuery[0].challenge_Name,
                        reward_Name     : rewardSelectQuery[0].challenge_Name,
                        end_Date        : moment(rewardSelectQuery[0].expiry_Date).format('DD/MM/YYYY'),
                        redeem_Date     : moment(data.redeem_Date).format('DD/MM/YYYY') ,
                        amount          : data.reward_point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                        Deposit         : data.isDeposit
                    }
                }
                newArr.push(obj)      
            }
            let EarnpointD = await ConnectionUtil(`SELECT SUM(reward_point) as Total_point  from reward_redeem where isDeposit='1' AND user_Id='${id}'`);
            let EarnpointW = await ConnectionUtil(`SELECT SUM(reward_point) as Total_point  from reward_redeem where isDeposit='0' AND user_Id='${id}'`);
            let reward={};
            reward={
                current_point:EarnpointD!=null&& EarnpointD[0].Total_point!=null? (EarnpointD[0].Total_point - EarnpointW[0].Total_point).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","):0, //!=null?Earnpoint[0].Total_point:0,
                total_point: EarnpointD!=null && EarnpointD[0].Total_point!=null ?  EarnpointD[0].Total_point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")  :0 //500
            };
        res.status(200).json({
            success : true,
            message : "Reward history list",
            data    : newArr,
            rewardPoint : reward
        }) 
    } catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            message: err.message
        })
    }
}

//----------------- reward_Redeem -----------------
module.exports.reward_Redeem = async (req, res) => {
    try {
        let {user_Id,reward_Id,reward_point,redeem_Date}=req.body;
        //reward_point=reward_point.replace(/\,/g,''); // 1125, but a string, so convert it to number
        let reward = await ConnectionUtil(`SELECT * from rewards where DATE_FORMAT(CURDATE(),'%Y-%m-%d')>= DATE_FORMAT(start_Date, '%Y-%m-%d') AND DATE_FORMAT( CURDATE() , '%Y-%m-%d') <= DATE_FORMAT( end_Date ,'%Y-%m-%d') AND reward_id ='${reward_Id}'`);
        if(reward.length>0){
            let redeemReward = await ConnectionUtil(`SELECT * from reward_redeem where isDeposit='0' AND reward_Id='${reward_Id}' AND user_Id='${user_Id}'`);  
            let rewardCount=redeemReward.length;
            rewardCount=rewardCount+1
            let rewardlimit = await ConnectionUtil(`SELECT * from rewards where reward_Id='${reward_Id}' AND reward_limit<'${rewardCount}'`);
            if(rewardlimit.length==0){
                reward_point=parseInt(reward_point); 
                let EarnpointD = await ConnectionUtil(`SELECT SUM(reward_point) as Total_point  from reward_redeem where isDeposit='1' AND user_Id='${user_Id}'`);
                let EarnpointW = await ConnectionUtil(`SELECT SUM(reward_point) as Total_point  from reward_redeem where isDeposit='0' AND user_Id='${user_Id}'`);
                let point=Math.abs(EarnpointD[0].Total_point-EarnpointW[0].Total_point)
                if(reward_point<=point){
                    let obj={
                        user_Id      : user_Id,
                        reward_Id    : reward_Id,
                        reward_point : reward_point,
                        isDeposit    : 0,
                        redeem_Date  : redeem_Date,
                    }
                    let addRewardRedeemInsertQuery = await ConnectionUtil(`INSERT INTO reward_redeem SET?`,obj);
                    //if(addRewardRedeemInsertQuery.insertId!=0){
                    // let addRewardRedeemInsertQuery = await ConnectionUtil(`Update userassign_rewards SET isUsed='0' where user_Id='${user_Id}' AND reward_Id='${reward_Id}'`);
                    let userDeviceToken = await ConnectionUtil(`select device_Token from fcm_Notification where user_Id='${user_Id}'`);
                    let Arr = [];
                    await userDeviceToken.map(async(data) => {
                        return Arr.push(data.device_Token)
                    })
                    let testMessage = {
                        title: "Reward",
                        body: "Reward redeem successfully"
                    }
                    await helperNotification(Arr, testMessage)
                    res.status(200).json({
                            success : true,
                            message : "Reward redeem successfully"
                    }) 
                    // }
                }else{
                    res.status(404).json({
                        success : false,
                        message : "Reward point not sufficient to redeem"
                    }) 
                }
            }else{
                res.status(404).json({
                    success : false,
                    message : "Out of reward point limit"
                })
            }
        }else{
            res.status(404).json({
                success : false,
                message : "Reward start date after some day"
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