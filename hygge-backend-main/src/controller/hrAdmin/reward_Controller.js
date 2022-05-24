const util = require('util');
let status = require('statuses');
let connection = require('../../config/database');
const { create } = require('domain');
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let message = require("../../lib/helpers/message");
let {
    helperNotification
} = require("../../lib/helpers/fcm");


//------------------------- createReward -----------------------
module.exports.createReward = async (req, res) => {
    try {
        let { reward_Name, reward_Description, reward_Image, reward_Points, reward_limit, start_Date, end_Date, company_Id, age_Type, age_From, age_To, gender_Type, gender, department_Type, department_Name, terms_Condition, ip_Address } = req.body;
        let { id, company_id } = req.user;
        let { branch_Id, access } = req.query;
        let rewardobj = {
            reward_Name: reward_Name,
            reward_Description: reward_Description,
            reward_Image: reward_Image,
            reward_Points: reward_Points,
            reward_limit: reward_limit,
            start_Date: start_Date,
            end_Date: end_Date,
            company_Id: company_Id,
            age_Type: age_Type,
            age_From: age_From,
            age_To: age_To,
            gender_Type: gender_Type,
            gender: gender,
            department_Type: department_Type,
            department_Name: department_Name,
            terms_Condition: terms_Condition,
            created_By: id,
            updated_By: id,
            ip_Address: ip_Address,
            branch_Id : branch_Id !="" || branch_Id !=undefined ? branch_Id : 0
        }
        let ageClause = '';
        let genderClause = '';
        let departmentClause = '';
        // let companyClause = '';

        // if (company_Id != "") {
        //     companyClause = `AND company_id='${company_Id}'`
        // }
        if (age_Type != 0) {
            if (age_From != 0 && age_To != 0) {
                ageClause = `AND Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0)>='${age_From}' AND Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0)<='${age_To}'`;
            }
        }
        if (gender_Type != 0) {
            genderClause = `AND gender='${gender}'`
        }
        if (department_Type != 0) {
            departmentClause = `AND department='${department_Name}'`
        }
        let setReward = await ConnectionUtil(`insert into rewards  SET ?`, rewardobj);
        if (setReward.insertId != 0) {
            let UserDetails;
            if(access==0){
                UserDetails = await ConnectionUtil(`select * from user where role !='1' AND isActive='1' AND branch_Id='${branch_Id}' AND company_id='${company_id}' ${ageClause} ${genderClause} ${departmentClause}`);
            }else{
                UserDetails = await ConnectionUtil(`select * from user where role !='1' AND isActive='1'  AND company_id='${company_id}' ${ageClause} ${genderClause} ${departmentClause}`);
            }
            if (UserDetails != "") {
                for (let user of UserDetails) {
                    let userAssign = {
                        user_id: user.user_id,
                        reward_Id  : setReward.insertId,
                        created_By : id,
                        updated_By : id,
                        company_Id : company_Id,
                        ip_Address : ip_Address,
                        branch_Id  : branch_Id
                    };
                    let userAssignRewards = await ConnectionUtil(`INSERT INTO userassign_rewards SET ?`, userAssign)
                    let userDeviceToken = await ConnectionUtil(`select * from fcm_Notification where user_Id='${user.user_id}'`);
                    let Arr = [];
                    await userDeviceToken.map((data) => {
                        Arr.push(data.device_Token)
                    })
                    let testMessage = {
                        title: "New Reward Available",//"Rewards",
                        body: "A fantastic new reward has been added to Hygge. Earn more points to redeem.",//"Your Rewards assigned successfully"
                    }
                    await helperNotification(Arr, testMessage)
                    // newArr.push(user.user_id);
                }
                res.status(200).json({
                    success: true,
                    message: "Reward added successfully",
                    // data:newArr
                })
            } else {
                let setRewardY = await ConnectionUtil(`delete from rewards where reward_id='${setReward.insertId}'`);
                res.status(200).json({
                    success : true,
                    message : "User filter request not find over record",
                    data    : []
                });
            }
        } else {
            res.status(404).json({
                success: false,
                message: "somrthing went wrong",
            });
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}

//------------------------- updateRewards -----------------------
module.exports.update_Rewards = async (req, res) => {
    try {
        let { reward_Id, reward_Name, reward_Description, reward_Image, reward_Points, reward_limit, start_Date, end_Date, company_Id, age_Type, age_From, age_To, gender_Type, gender, department_Type, department_Name, terms_Condition, ip_Address } = req.body;
        let { id, company_id } = req.user;
        let updateRewards = await ConnectionUtil(`update rewards  set 
            reward_Name        = '${reward_Name}',
            reward_Description = '${reward_Description}',
            reward_Image       = '${reward_Image}',
            reward_Points      = '${reward_Points}',
            reward_limit       = '${reward_limit}',
            start_Date         = '${start_Date}',
            end_Date           = '${end_Date}',
            company_Id         = '${company_Id}',
            age_Type           = '${age_Type}',
            age_From           = '${age_From}',
            age_To             = '${age_To}',
            gender_Type        = '${gender_Type}',
            gender             = '${gender}',
            department_Type    = '${department_Type}',
            department_Name    = '${department_Name}',
            terms_Condition    = '${terms_Condition}',
            updated_By         =  ${id},
            ip_Address         = '${ip_Address}'
            where reward_id = ${reward_Id} AND is_Active='1' AND company_id='${company_id}'`)
        if (updateRewards.affectedRows != 0) {
            res.status(200).json({
                success: true,
                message: "Reward edited successfully"
            })
        } else {
            res.status(404).json({
                success: false,
                message: "rewards not updated"
            })
        }
    }
    catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            message: err.message
        })
    }
}

//------------------------- Delete_rewards -------------------------
module.exports.Delete_Rewards = async (req, res) => {
    try {
        let { reward_id, company_Id, ip_Address } = req.body;
        let { id, company_id } = req.user;
        let delete_rewards = await ConnectionUtil(`update rewards set is_Active='0',updated_By='${id}',ip_Address='${ip_Address}'
         where reward_id='${reward_id}' AND company_id='${company_Id}'`)
        if (delete_rewards.affectedRows != 0) {
            let rewardsUserassign = await ConnectionUtil(`update userassign_rewards set is_Active='0',updated_By='${id}',ip_Address='${ip_Address}'
            where reward_Id='${reward_id}' AND company_Id='${company_Id}'`)
            res.status(200).json({
                success: true,
                message: "Reward deleted successfully"
            })
        }
        else {
            res.status(404).json({
                success: false,
                message: "Reward delete not successfully"
            })
        }
    }
    catch (err) {
        console.log(err)
        res.status(200).json({
            success: false,
            message: err.message
        })
    }
}

//------------------------- showRewardslist -------------------------
module.exports.show_Rewards = async (req, res) => {
    try {
        let newArr = [];
        let { id, company_id } = req.user;
        let { branch_Id, access } = req.query;
        let show_rewards;
        if(access==0){
            show_rewards = await ConnectionUtil(`select * from rewards where company_Id='${company_id}' AND branch_Id='${branch_Id}' AND is_Active='1' ORDER BY reward_id DESC`);
        }else{
            show_rewards = await ConnectionUtil(`select * from rewards where company_Id='${company_id}' AND is_Active='1' ORDER BY reward_id DESC`);
        }
        for (let show_rewardsObj of show_rewards) {
            let userAssignRewardsSelectQuery = await ConnectionUtil(`select * from userassign_rewards where is_Active='1' AND reward_Id='${show_rewardsObj.reward_id}' `)
            let Num = userAssignRewardsSelectQuery.length;
            show_rewardsObj.totalReward = Num;
            show_rewardsObj.acceptedReward = 0;
            newArr.push(show_rewardsObj)
        }
        res.status(200).json({
            success: true,
            message: "Rewards List",
            data: newArr//show_rewards
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            message: err.message
        })
    }
}

//------------------------- reward status -------------------------
module.exports.reward_Status = async (req, res) => {
    try {
        let { reward_id, company_Id, status, ip_Address } = req.body;
        let { id, company_id } = req.user;
        let updateStatus = await ConnectionUtil(`update rewards set status='${status}',ip_Address='${ip_Address}',updated_By='${id}' where reward_id='${reward_id}' AND company_id='${company_Id}' AND is_Active='1'`)
        if (updateStatus.affectedRows != 0) {
            //status update query remaing userassign_reward    
            let updateStatusUSER = await ConnectionUtil(`update userassign_rewards set status='${status}',ip_Address='${ip_Address}',updated_By='${id}' where reward_Id='${reward_id}' AND company_Id='${company_Id}' AND is_Active='1'`)
            res.status(200).json({
                success: true,
                message: "Reward  status updated successfully", updateStatusUSER
            })
        }
        else {
            res.status(404).json({
                success: false,
                message: "Reward status not updated"
            })
        }
    }
    catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            message: err.message
        })
    }
}

//------------------------- rewardDetails -------------------------
module.exports.rewards_Details = async (req, res) => {
    try {
        let { reward_id, company_Id } = req.body;
        let newArr = [];
        let RewardsDetail = await ConnectionUtil(`select reward_Image,reward_Description from rewards where reward_id='${reward_id}' AND company_Id='${company_Id}' AND is_Active='1'`)
        for (let rewardsDetailObj of RewardsDetail) {
            let RewardsDetail = await ConnectionUtil(`select  DATE_FORMAT(RR.redeem_Date, '%d-%m-%Y') as redemption_Date,RR.reward_point as points_Value,Concat(U.first_name,' ',U.last_name) as employee_Name  from reward_redeem as RR JOIN user as U ON U.user_id=RR.user_Id where RR.reward_Id='${reward_id}'`);
            rewardsDetailObj.history = RewardsDetail
            // [{employee_Name:"Test",points_Value:1000, redemption_Date:'2021-04-29'}]
            newArr.push(rewardsDetailObj)
        }
        res.status(200).json({
            success: true,
            message: "Reward detail description",
            data: newArr
        })
        // }
    }
    catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            message: err.message
        })
    }
}

//------------------------- reward_ByIdDetail -------------------------
module.exports.reward_DetailById = async (req, res) => {
    try {
        let { reward_id, company_Id } = req.body;
        let RewardsDetail = await ConnectionUtil(`select * from rewards where reward_id='${reward_id}' AND company_Id='${company_Id}' AND is_Active='1'`)
        res.status(200).json({
            success: true,
            message: "reward detail list ",
            data: RewardsDetail
        })
    }
    catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            message: err.message
        })
    }
}

//----------------- reward_GraphDetail -----------------
module.exports.reward_GraphDetail = async (req, res) => {
    try {
        let { company_Id } = req.body;
        let { branch_Id, access } = req.query;
        let newArr = [];
        let rewardSelectQuery;
        if(access==0){
            rewardSelectQuery = await ConnectionUtil(`select reward_id,end_Date from rewards where is_Active ='1' AND status ='1' AND DATE_FORMAT(CURDATE(),'%Y-%m-%d')>=DATE_FORMAT(start_Date, '%Y-%m-%d') AND
        DATE_FORMAT(CURDATE(),'%Y-%m-%d')<=DATE_FORMAT(end_Date, '%Y-%m-%d') AND company_Id='${company_Id}' AND branch_Id='${branch_Id}'`);
        }else{
            rewardSelectQuery = await ConnectionUtil(`select reward_id,end_Date from rewards where is_Active ='1' AND status ='1' AND DATE_FORMAT(CURDATE(),'%Y-%m-%d')>=DATE_FORMAT(start_Date, '%Y-%m-%d') AND
        DATE_FORMAT(CURDATE(),'%Y-%m-%d')<=DATE_FORMAT(end_Date, '%Y-%m-%d') AND company_Id='${company_Id}'`);
        }
        for (let rewardObj of rewardSelectQuery) {
            let userAssignSelectQuery = await ConnectionUtil(`select assignReward_id,reward_Id,user_Id,company_Id from userassign_rewards where  reward_Id='${rewardObj.reward_id}' AND company_Id='${company_Id}'`)
            let countNum = await userRewardGraph(rewardObj.reward_id, userAssignSelectQuery)
            newArr.push(countNum);
        }
        res.status(200).json({
            success: true,
            message: "Reward graph data",
            data: newArr
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            message: err.message
        })
    }
}

async function userRewardGraph(rewardId, userAssignSelectQuery) {
    let femalecount = 0;
    let malecount = 0;
    let departmentArr = [];
    let DepartmentnewArray;
    for (let data of userAssignSelectQuery) {
        let userMaleSelectQuery = await ConnectionUtil(`select gender from user where company_id='${data.company_Id}' and gender='male' AND  user_id='${data.user_Id}'`);
        let userFelmaleSelectQuery = await ConnectionUtil(`select gender from user where company_id='${data.company_Id}' and gender='female' AND  user_id='${data.user_Id}'`);
        if (userMaleSelectQuery.length > 0) {
            malecount = malecount + 1;
        }
        else if (userFelmaleSelectQuery.length > 0) {
            femalecount = femalecount + 1;
        }
    }
    for (let data of userAssignSelectQuery) {
        let userDepartmentSelectQuery = await ConnectionUtil(`select department from user where company_id='${data.company_Id}' and role=0 AND  user_id ='${data.user_Id}'`);
        if (userDepartmentSelectQuery.length > 0) {
            if (userDepartmentSelectQuery[0].department != '') {
                departmentArr.push(userDepartmentSelectQuery[0].department);
                DepartmentnewArray = await compressArray(departmentArr);
            }
        }
    }
    DepartmentnewArray = DepartmentnewArray || []
    return { rewardId: rewardId, male: malecount, female: femalecount, DepartmentnewArray }
}

// -------- compressArray -------- //this function ref : https://gist.github.com/ralphcrisostomo/3141412
function compressArray(original) {
    var compressed = [];
    // make a copy of the input array
    var copy = original.slice(0);
    // first loop goes over every element
    for (var i = 0; i < original.length; i++) {
        var myCount = 0;
        // loop over every element in the copy and see if it's the same
        for (var w = 0; w < copy.length; w++) {
            if (original[i] == copy[w]) {
                // increase amount of times duplicate is found
                myCount++;
                // sets item to undefined
                delete copy[w];
            }
        }
        if (myCount > 0) {
            var a = new Object();
            a.department = original[i];
            a.count = myCount;
            compressed.push(a);
        }
    }
    return compressed;
};

//----------------- topRedeem_Reward -----------------
module.exports.topRedeem_Reward = async (req, res) => {
    try {
        let { company_Id } = req.body;
        let { branch_Id, access } = req.query;
        let newArr = [];
        let rewardTopRedeemSelectQuery;
        if(access==0){
            rewardTopRedeemSelectQuery = await ConnectionUtil(`SELECT reward_id,reward_Name,redeem_Point from rewards WHERE company_Id='${company_Id}' AND branch_Id='${branch_Id}'  ORDER BY redeem_Point DESC LIMIT 5 `);
        }else{
            rewardTopRedeemSelectQuery = await ConnectionUtil(`SELECT reward_id,reward_Name,redeem_Point from rewards WHERE company_Id='${company_Id}'  ORDER BY redeem_Point DESC LIMIT 5 `);
        }
        res.status(200).json({
            success: true,
            message: "Top redeem reward graph data",
            data: rewardTopRedeemSelectQuery
        });
    } catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}

//----------------- redeemGraph_Reward -----------------
module.exports.redeemGraph_Reward = async (req, res) => {
    try {
        let { company_Id } = req.body;
        let { branch_Id, access } = req.query;
        // let newArr=[];
        // let rewardTopRedeemSelectQuery = await ConnectionUtil(`SELECT reward_id,reward_Name,redeem_Point from rewards WHERE company_Id='${company_Id}'  ORDER BY redeem_Point DESC LIMIT 5 `)                   
        res.status(200).json({
            success: true,
            message: "Reward redeem graph",
            data: [
                { month: "January", reward_Number: 34, reward_point: 1 },
                { month: "February", reward_Number: 2, reward_point: 10 },
                { month: "March", reward_Number: 12, reward_point: 20 },
                { month: "April", reward_Number: 56, reward_point: 30 },
                { month: "May", reward_Number: 76, reward_point: 40 },
                { month: "June", reward_Number: 23, reward_point: 50 },
                { month: "July", reward_Number: 2, reward_point: 60 },
                { month: "August", reward_Number: 30, reward_point: 70 },
                { month: "September", reward_Number: 45, reward_point: 10 },
                { month: "October", reward_Number: 34, reward_point: 50 },
                { month: "November", reward_Number: 50, reward_point: 80 },
                { month: "December", reward_Number: 12, reward_point: 30 }
            ]
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}