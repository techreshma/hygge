// const express = require("express");
// const app = express();
// let http = require("http").createServer(app);
// let {anniversaryfun,birthdayfun,documentfun} = require('./src/controller/employee/notification_Controller')
// let cron = require('node-cron');
// let port = 6000;

// // '0 0 */12 * * *'
// cron.schedule("*/10 * * * * *",async () => {
//   console.log('running a task every minute');
//   // await anniversaryfun();
//   // await birthdayfun();
//   // await documentfun();
// });

// http.listen(port, () => console.log("server running on port:" + port));

// Importing required libraries
const cron = require("node-cron");
const express = require("express");

app = express(); // Initializing app

// Creating a cron job which runs on every 10 second
cron.schedule("*/10 * * * * *", function() {
	console.log("running a task every 10 second");
});

app.listen(3000);




                  // // ----challenge
                  // let surveyDetail = await ConnectionUtil(`select * from survey_Type`);     
                  // let challengeDetail = await ConnectionUtil(`select challenge_Configuration,company_Id , 
                  // Reward , action_Required , expiry_Date , challengePredefined_Id , challenges_id from challenges where  challengePredefined_Id = '${7}' AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d')`);
                  // let SurveyAlotted = await ConnectionUtil(`SELECT *
                  // FROM survey_Type as ST
                  // JOIN challenges as  C ON DATE_FORMAT(C.expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(ST.created_At,'%Y-%m-%d') where 
                  // C.challengePredefined_Id = 7 AND 
                  // (ST.company_Id=1 OR ST.company_Id=0) AND (C.company_Id=1 OR C.company_Id=0) AND
                  // DATE_FORMAT(C.created_At, '%Y-%m-%d') =DATE_FORMAT(ST.created_At,'%Y-%m-%d')`);
                  // if(SurveyAlotted.length>0){
                  //   for(let data of SurveyAlotted){
                  //     let userSurvey = await ConnectionUtil(`select * from userAssign_Survey as US JOIN survey_Type as ST ON  ST.surveyType_id = US.surveyType_Id where US.isActiveSurvey='0' AND US.surveyType_id='${data.surveyType_Id}' AND US.user_Id = '${userId}'`); 
                  //     let Count=userSurvey.length;
                  //     for(let Challenge of challengeDetail){
                  //     let config = JOSN.parse(Challenge.challenge_Configuration);
                  //         if(y[0].value.replace(/\s+/g, '')=="MoreThan"){
                  //             if(Count>=y[1].value){
                  //                 let challengeUserAssignDetail = await ConnectionUtil(`select * from userassign_challenges  where isCompleted='0' AND isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${userId}' `);
                  //                 if(challengeUserAssignDetail){
                  //                     challengeUserAssignDetail.map(async(data)=>{ 
                  //                         let challengeUserAssignDetail = await ConnectionUtil(`update userassign_challenges set  isCompleted='1' where assignChallenge_id='${data.assignChallenge_id}'`);  
                  //                         var DATE = new Date().getDate();
                  //                         var MONTH = new Date().getMonth() + 1;
                  //                         var YEAR = new Date().getFullYear();
                  //                         let date=YEAR + '-' + MONTH + '-' + DATE;
                  //                         let obj={ 
                  //                             user_Id      : userId,
                  //                             reward_Id    : Challenge.challenges_id,
                  //                             reward_point : Challenge.Reward,
                  //                             isDeposit    : 1,            
                  //                             redeem_Date  : date,
                  //                         }
                  //                         let addRewardRedeemInsertQuery = await ConnectionUtil(`INSERT INTO reward_redeem SET?`,obj); 
                  //                     })
                  //                 }
                  //             }
                  //         }   
                  //         if(y[0].value.replace(/\s+/g, '')=="LessThan"){
                  //             if(Countr<=y[1].value){
                  //                 let challengeUserAssignDetail = await ConnectionUtil(`select * from userassign_challenges  where isCompleted='0' AND isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${userId}' `);
                  //                 if(challengeUserAssignDetail){
                  //                     challengeUserAssignDetail.map(async(data)=>{ 
                  //                     let challengeUserAssignDetail = await ConnectionUtil(`update userassign_challenges set  isCompleted='1' where assignChallenge_id='${data.assignChallenge_id}'`);  
                  //                     var DATE = new Date().getDate();
                  //                     var MONTH = new Date().getMonth() + 1;
                  //                     var YEAR = new Date().getFullYear();
                  //                     let date=YEAR + '-' + MONTH + '-' + DATE;
                  //                         let obj={ 
                  //                             user_Id      : userId,
                  //                             reward_Id    : Challenge.challenges_id,
                  //                             reward_point : Challenge.Reward,
                  //                             isDeposit    : 1,            
                  //                             redeem_Date  : date,
                  //                         }
                  //                         let addRewardRedeemInsertQuery = await ConnectionUtil(`INSERT INTO reward_redeem SET?`,obj); 
                  //                     })
                  //                 }
                  //             }
                  //         }
                  //         if(y[0].value.replace(/\s+/g, '')=="Equal"){
                  //             if(Count==y[1].value){
                  //                 let challengeUserAssignDetail = await ConnectionUtil(`select * from userassign_challenges  where isCompleted='0' AND isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${userId}' `);
                  //                 if(challengeUserAssignDetail){
                  //                     challengeUserAssignDetail.map(async(data)=>{ 
                  //                     let challengeUserAssignDetail = await ConnectionUtil(`update userassign_challenges set  isCompleted='1' where assignChallenge_id='${data.assignChallenge_id}'`);  
                  //                     var DATE = new Date().getDate();
                  //                     var MONTH = new Date().getMonth() + 1;
                  //                     var YEAR = new Date().getFullYear();
                  //                     let date=YEAR + '-' + MONTH + '-' + DATE;
                  //                         let obj={ 
                  //                             user_Id      : userId,
                  //                             reward_Id    : Challenge.challenges_id,
                  //                             reward_point : Challenge.Reward,
                  //                             isDeposit    : 1,            
                  //                             redeem_Date  : date,
                  //                         }
                  //                         let addRewardRedeemInsertQuery = await ConnectionUtil(`INSERT INTO reward_redeem SET?`,obj); 
                  //                     })
                  //                 }
                  //             }
                  //         }  
                  //     }
                  //   }  
                  // }
                  // // ----challenge