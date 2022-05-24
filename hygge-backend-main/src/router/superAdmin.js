var express 	= require('express');
var router 		= express.Router();
const controller = require('../controller/superAdmin/index');
const { verifyTokenFn } = require(".././lib/helpers/jwt");

//Register subAdmin Register
router.post('/register',verifyTokenFn,controller.SuperAdminController.admin_Register );
router.post('/login', controller.SuperAdminController.admin_login );
router.get('/getProfile' , controller.SuperAdminController.admin_Profile );
router.post('/updateProfile',verifyTokenFn,  controller.SuperAdminController.admin_Update);
router.post('/deleteProfile' ,verifyTokenFn, controller.SuperAdminController.admin_Delete);
router.post('/forgetPassword', controller.SuperAdminController.admin_forgetPassword );
router.post('/forgetPasswordReset', controller.SuperAdminController.admin_forgetPasswordReset );
router.post('/resetPassword', verifyTokenFn , controller.SuperAdminController.admin_ResetPassword );
router.post('/profileStatus', verifyTokenFn,controller.SuperAdminController.admin_Profilestatus);

// Role superAdmin
router.post('/addRole',verifyTokenFn  , controller.UserRoleController.add_Role );
router.get('/showRole' ,verifyTokenFn, controller.UserRoleController.show_Role);
router.post('/editRole' ,verifyTokenFn, controller.UserRoleController.edit_Role );
router.post('/deleteRole',verifyTokenFn, controller.UserRoleController.delete_Role);
router.post('/statusRole',verifyTokenFn, controller.UserRoleController.status_Role);

// subscriptionPlan
router.get('/subscriptionPlan',controller.SubscriptionPlanController.show_SubscriptionPlan);

//Role Access
router.post('/accessModuleList',controller.RoleAccessController.show_AccessModule);
router.post('/accessAllocation', verifyTokenFn , controller.RoleAccessController.access_Allocation);
router.post('/accessDetail' , controller.RoleAccessController.show_AccessDetail); 
 
// Company Create
router.post('/addCompnay',verifyTokenFn,controller.CompanyCreateController.add_Company);
router.post('/editCompany',verifyTokenFn,controller.CompanyCreateController.edit_Company);
router.post('/deleteCompany',verifyTokenFn,controller.CompanyCreateController.delete_Company);
router.get('/showCompany',controller.CompanyCreateController.show_Company);
router.post('/statusCompany',verifyTokenFn,controller.CompanyCreateController.status_Company);
router.post('/showCompanyByID',verifyTokenFn,controller.CompanyCreateController.showCompanyByID);
router.get('/contactDesignationList',controller.CompanyCreateController.primaryContactDesignation_List);
router.post('/companyInvitation',controller.CompanyCreateController.companyInvitation);
router.get('/listCurrency',controller.CompanyCreateController.list_Currency);

//HRA 
router.post('/addHraRiskQuestion',verifyTokenFn,controller.HealthRiskQuestionController.add_HealthRiskQuestions);
router.get('/showHraRiskQuestion',controller.HealthRiskQuestionController.show_HealthRiskQuestions);
router.post('/editHraRiskQuestion',verifyTokenFn,controller.HealthRiskQuestionController.edit_HealthRiskQuestions);
router.post('/showHraRiskQuestionById',verifyTokenFn,controller.HealthRiskQuestionController.show_HealthRiskQuestionsById);
router.post('/questionDelete',controller.HealthRiskQuestionController.questionDelete);

//HRA gender define
router.get('/showHraGenderData',controller.HealthRiskQuestionController.hra_genderData)

//HRA company list
router.get('/showHraCompanyList',controller.ReportHRAController.hraCompany_list)

//Coaching
// coaching Category
router.get('/coachingCategory',controller.CoachingController.coaching_Category);
router.post('/coachingsubCategory',controller.CoachingController.coaching_subCategory);
router.post('/coachingAddPost',controller.CoachingController.coachingAdd_Post);
router.post('/postList',controller.CoachingController.PostList);
router.post('/updatePost',controller.CoachingController.updatePostList);
router.post('/deletePost',controller.CoachingController.deletePostList);
router.post('/updatestatusPost',controller.CoachingController.updatestatusPostList);
router.post('/postdetails',controller.CoachingController.Postdetails);

// Glossary
router.post('/addGlossary',controller.CoachingController.Add_Glossary);
router.get('/listGlossary',controller.CoachingController.List_Glossary);
router.post('/deleteGlossary',controller.CoachingController.Delete_Glossary);
router.post('/editGlossary',controller.CoachingController.Edit_Glossary);
router.post('/detailGlossary',controller.CoachingController.Detail_Glossary);
router.post('/updatestatusGlossaryList',controller.CoachingController.updatestatusGlossaryList);

// Recipe
router.post('/addRecipes',controller.CoachingController.Add_Recipes);
router.get('/listRecipes',controller.CoachingController.List_Recipes);
router.post('/deleteRecipes',controller.CoachingController.Delete_Recipes);
router.post('/editRecipes',controller.CoachingController.Edit_Recipes);
router.post('/detailRecipes',controller.CoachingController.Detail_Recipes);
router.post('/updatestatusRecipesList',controller.CoachingController.updatestatusRecipesList);

//mealplan
router.post('/addmealPlans',controller.CoachingController.add_mealPlans);
router.post('/deletemealPlans',controller.CoachingController.delete_mealPlans);
router.post('/editmealPlans',controller.CoachingController.edit_mealPlans);
router.get('/mealPlanlist',controller.CoachingController.mealPlanlist);
router.post('/statusMealPlan',controller.CoachingController.updatestatusMealPlan);
router.post('/detailMealPlan',controller.CoachingController.Detail_MealPlan);

//health program
router.post('/getprogramgoals',controller.CoachingController.getprogramGoals);
router.post('/editgoal',controller.CoachingController.editGoal);

//Challenges
router.post('/publishChallenge',controller.superChallengeController.create_Challenge)
router.get('/challeneges',verifyTokenFn,controller.superChallengeController.challenege);
router.post('/actionRequiredChallenge',verifyTokenFn,controller.superChallengeController.actionRequired_Challenge);
router.post('/graphDetailChallenege',controller.superChallengeController.GraphDetail_Challenege);

//rewards
router.post('/createReward',verifyTokenFn,controller.RewardContoller.createReward)
router.post('/updateRewards',verifyTokenFn,controller.RewardContoller.update_Rewards)
router.post('/deleteRewards',verifyTokenFn,controller.RewardContoller.Delete_Rewards)
router.get('/showRewards',verifyTokenFn,controller.RewardContoller.show_Rewards)
router.post('/graphDetailReward',verifyTokenFn,controller.RewardContoller.reward_GraphDetail)
router.post('/rewardStatus',verifyTokenFn,controller.RewardContoller.reward_Status)
router.post('/rewardsDetails',verifyTokenFn,controller.RewardContoller.rewards_Details)
router.post('/rewardDetailById',verifyTokenFn,controller.RewardContoller.reward_DetailById)
router.post('/topRedeemReward',verifyTokenFn,controller.RewardContoller.topRedeem_Reward)
router.post('/redeemGraphReward',verifyTokenFn,controller.RewardContoller.redeemGraph_Reward)

//Reports
router.get('/surveyReport',controller.ReportsController.survey_Report);
router.get('/ChallengesReport',controller.ReportsController.Challenges_Report);
router.get('/employeeReport',controller.ReportsController.Employee_Report);
router.get('/companyReport',controller.ReportsController.company_Report);
router.get('/monthlyAverageAndDuration',controller.ReportsController.monthlyAverageAndDuration)


//Badges
router.get('/BadgesList',verifyTokenFn,controller.BadgesController.BadgesList);

//faq
router.post('/addFaq', verifyTokenFn , controller.SuperAdminController.add_Faq);
router.post('/editFaq', verifyTokenFn , controller.SuperAdminController.edit_Faq);
router.get('/showFaq', verifyTokenFn , controller.SuperAdminController.show_Faq);
router.post('/deleteFaq', verifyTokenFn , controller.SuperAdminController.delete_Faq);

//user Profile
router.post('/showByUserProfile', verifyTokenFn , controller.SuperAdminController.show_ByUserProfile );
router.post('/updateByUserProfile', verifyTokenFn , controller.SuperAdminController.update_ByUserProfile);

//privacy policy
router.get('/showPrivacyPolicy', verifyTokenFn , controller.SuperAdminController.show_privacyPolicy);
router.post('/updatePrivacyPolicy', verifyTokenFn , controller.SuperAdminController.update_privacyPolicy);

//Notifiction
router.get('/notificationList', verifyTokenFn , controller.NotificationController.notification_list);
router.post('/notificationSendFilter', verifyTokenFn , controller.NotificationController.notificationSend_Filter);
router.post('/notificationDelete' , controller.NotificationController.notification_Delete);

//convert to company to company branch 
router.get('/companyData', controller.CompanyCreateController.companyData);

//Report HRA
router.post('/hraUserList',controller.ReportHRAController.hrauser_list);
router.post('/hraScoreByUser',controller.ReportHRAController.hraScoreBy_user);

//DashboardController
router.post('/dashboardDetail',controller.DashboardController.dashboard_detail);
router.post("/surveyDashboard",controller.DashboardController.surveyDashboard);

//CompanyReport
router.get('/companyReportDetail',controller.CompanyReportController.company_report);
router.get('/hra_reportEmployee',controller.HealthRiskQuestionController.hra_report);

module.exports=router;   


