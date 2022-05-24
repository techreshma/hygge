const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let {
    commonNotification
} = require("../../lib/helpers/fcm");
//------------------------ Notification_list  ------------------------  
module.exports.dashboard_detail = async (req, res) => {
    try {
        let companyDetail = await ConnectionUtil(`select * from company where isActive='1'`);
        let activeCompanyData = await ConnectionUtil(`select * from company where isActive='1' AND 
        DATE_FORMAT(plan_EndDate, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d')`)
        let active_user = await ConnectionUtil(`SELECT COUNT(user_id) as value ,MONTHNAME(created_At) as month FROM user WHERE isActive = '1' AND YEAR(created_At) = YEAR(CURRENT_DATE)  GROUP BY MONTH(created_At)`);
        let activeChallenges_tot = await ConnectionUtil(`SELECT * FROM challenges where company_id=0 AND DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND action_Required='1'`);
        let company_id = 0;
        let newArr = [];
        let challengePreDefDetails = await ConnectionUtil(`select challengePredefined_id,challenege_Name from challenge_predefined`);
        for (let challengePreDefObj of challengePreDefDetails) {
            let challengeDetails = await ConnectionUtil(`select * from challenges where company_id=${company_id} AND action_Required='1' AND challengePredefined_Id=${challengePreDefObj.challengePredefined_id}`);
            if (challengeDetails.length > 0) {
                let count = await countEmployee(challengeDetails[0].challenges_id)
                challengePreDefObj.acceptedByTotalUser = count.totalCount
            } else {
                challengePreDefObj.acceptedByTotalUser = 0
            }
            newArr.push(challengePreDefObj)
        }

        let rewardRedeem_detail = await ConnectionUtil(`select MONTHNAME(redeem_Date) as month ,COUNT(rewardRedeem_id) as count from reward_redeem as RR JOIN rewards as R ON R.reward_id = RR.reward_id 
        where R.company_Id = '0' AND RR.isDeposit='0' group by MONTHNAME(redeem_Date)`);

        let survey_count = await ConnectionUtil(`select * from initiate_Survey where company_Id=0 AND DATE_FORMAT(survey_ExpiryDate, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d')`);

        let expiry_count = await ConnectionUtil(`select * from company where isActive='1' AND 
        DATE_FORMAT(plan_EndDate, '%Y-%m-%d') <=DATE_FORMAT(CURDATE(),'%Y-%m-%d')`)

        let superDashboard_obj = {
            active_Companies: activeCompanyData.length,
            number_activeUserMonthly: active_user,
            Open_action: { contract_expiry: expiry_count.length,notification:0,messages:0 },//notification:0,messages:0
            hra_point: {lifestyle:35, body: 45, mind: 23},
            companies_basedOnSubscription : [
                {count: 50 , name: 'plan 1'},
                {count: 20 , name: 'plan 2'},
                {count: 20 , name: 'plan 3'},
             ],
            calendar: 0,
            activeChallenges_count: activeChallenges_tot.length > 0 ? activeChallenges_tot.length : 0,
            participants_Challenge: newArr,
            rewardsRedeemed_monthly: rewardRedeem_detail,
            activeSurveys_count: survey_count.length
        }
        res.status(200).json({
            "success": true,
            "message": "dashboard list",
            data: superDashboard_obj
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
}

//----------------- countEmployee -----------------
async function countEmployee(challengesId) {
    let checkuserAssignSelectQuery = await ConnectionUtil(`select * from userassign_challenges where challenge_Id='${challengesId}'`);
    let totalCount = checkuserAssignSelectQuery.length;
    let numCount = 0
    checkuserAssignSelectQuery.map((data) => {
        if (data.isAccept == 1) {
            numCount = numCount + 1;
        }
    })
    let obj = {
        totalCount: totalCount,
        numCount: numCount
    }
    return obj
}

module.exports.surveyDashboard = async (req,res) => {
    try{
       let {
          companyId
        } = req.body;
       let { branch_Id , access } = req.query;
       let Arr = [];
       let activeSurveys;
       let totalActiveSurveyCount;
       let surveyByMonth;
       let lastTenSurveys; 
       if(access==0){
          activeSurveys = await ConnectionUtil(`select DISTINCT surveyQuestions_Id,company_Id,branch_Id from initiate_Survey where DATE_FORMAT(survey_ExpiryDate, '%Y-%m-%d') >= DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND company_Id='${companyId}' AND branch_Id='${branch_Id}' ORDER BY initiateSurvey_id DESC`);
          totalActiveSurveyCount = activeSurveys.length;
          surveyByMonth = await ConnectionUtil(`SELECT count(surveyType_Id) as numbersof_survey,month,year FROM(SELECT DISTINCT surveyQuestions_Id AS surveyType_Id,MONTHNAME(created_At) AS month, YEAR(created_At) as year FROM initiate_Survey WHERE company_Id='${companyId}' AND branch_Id='${branch_Id}' GROUP BY surveyQuestions_Id,month,year ORDER BY month,year) AS C GROUP BY month,year ORDER BY month,year`);
          lastTenSurveys = await ConnectionUtil(`SELECT DISTINCT ins.surveyQuestions_Id,st.survey_Name AS survey_name FROM initiate_Survey ins JOIN survey_Type st ON ins.surveyQuestions_Id = st.surveyType_id WHERE ins.company_Id='${companyId}' AND ins.branch_Id='${branch_Id}' ORDER BY ins.created_At DESC LIMIT 10`);
        }else{
          activeSurveys = await ConnectionUtil(`select DISTINCT surveyQuestions_Id,company_Id,branch_Id from initiate_Survey where DATE_FORMAT(survey_ExpiryDate, '%Y-%m-%d') >= DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND company_Id='${companyId}' ORDER BY initiateSurvey_id DESC`);
          totalActiveSurveyCount = activeSurveys.length;
          surveyByMonth = await ConnectionUtil(`SELECT count(surveyType_Id) as numbersof_survey,month,year FROM(SELECT DISTINCT surveyQuestions_Id AS surveyType_Id,MONTHNAME(created_At) AS month, YEAR(created_At) as year FROM initiate_Survey WHERE company_Id='${companyId}' GROUP BY surveyQuestions_Id,month,year ORDER BY month,year) AS C GROUP BY month,year ORDER BY month,year`);
          lastTenSurveys = await ConnectionUtil(`SELECT DISTINCT ins.surveyQuestions_Id,st.survey_Name AS survey_name FROM initiate_Survey ins JOIN survey_Type st ON ins.surveyQuestions_Id = st.surveyType_id WHERE ins.company_Id='${companyId}' ORDER BY ins.created_At DESC LIMIT 10`);  
        }
       for (let data of lastTenSurveys){
          let lastTenSurveyRespondent = await ConnectionUtil(`SELECT COUNT(DISTINCT user_Id) AS numberof_responded FROM survey_Submission WHERE surveyType_Id ='${data.surveyQuestions_Id}'`);
          data.numberof_responded = lastTenSurveyRespondent[0].numberof_responded;
          Arr.push(data);
       }
       let survey_DashboardObj = {
          surveyConductedByMonth : surveyByMonth,
          respondedSurveys : Arr,
          numberResponsesRecieved : { total: 50 , received: 20 },
          numberActiveSurvey : totalActiveSurveyCount
       }
       res.status(200).json({
           success : true,
           message : "Survey Dashboard List",
           data : survey_DashboardObj
       })
    }catch(err){
      res.status(400).json({
          success: false,
          message: err.message,
      });
    }
};