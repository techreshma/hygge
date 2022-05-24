var express = require('express');
var router 	= express.Router();
const controller = require('../controller/employee/index');
const { verifyTokenFn } = require(".././lib/helpers/jwt");

// Employee module router  
router.post('/login', controller.EmployeeUserController.Employee_login);
router.get ('/showProfile',verifyTokenFn ,controller.EmployeeUserController.Employee_Show);
router.post('/updateProfile' , verifyTokenFn , controller.EmployeeUserController.Employee_Update);
router.post('/resetPassword',verifyTokenFn,controller.EmployeeUserController.Employee_ResetPassword);
router.post('/forgetPassword',controller.EmployeeUserController.Employee_forgetPassword);
router.post('/forgetPasswordReset',controller.EmployeeUserController.Employee_forgetPasswordReset);
router.post('/verifyOtp',controller.EmployeeUserController.Employee_OtpVerify);
router.post('/profileUpload',controller.ProfileImageUploadController.profileImageUpload);
router.post('/logout',verifyTokenFn,controller.EmployeeUserController.Employee_Logout);

//Setting
router.post('/statusNotification',controller.SettingController.status_Notification)//notification_Update); //verifyTokenFn
router.post('/showNotificationStatus',controller.SettingController.show_StatusNotification) //verifyTokenFn
router.get('/showTermCondition',controller.SettingController.show_termCondition)
router.get('/showFaq',controller.SettingController.show_Faq)
router.post('/showMenuStatus',verifyTokenFn,controller.SettingController.showMenuStatus)

//Card
router.get('/activitiesCard',controller.SettingController.show_Activity); //verifyTokenFn
router.get('/rewardCard',verifyTokenFn,controller.SettingController.show_Reward); //verifyTokenFn
router.get('/assignTargetCard',controller.SettingController.show_AssignTarget); //verifyTokenFn

//showBadgesList
router.get('/showBadgesList',verifyTokenFn,controller.BadgesContoller.showBadges_list);//, verifyTokenFn

//Calorie Calculater
router.post('/calorieCalculater',controller.CalorieCalculaterController.calorie_Calculater);

//attendance
router.post('/attendance',controller.AttendanceController.User_Attendance);
router.post('/showAttendanceDetail',controller.AttendanceController.show_AttendanceDetail);
router.post('/attendanceGraphDetail',verifyTokenFn,controller.AttendanceController.attendance_Graph);
// router.post('/attendanceSingleday',verifyTokenFn,controller.AttendanceController.attendance_singleDay);


//Notification
router.get('/showNotification',verifyTokenFn,controller.NotificationController.show_Notification);
router.get('/listNotification',verifyTokenFn,controller.NotificationController.notification_List);
router.get('/notificationDelete',verifyTokenFn,controller.NotificationController.notification_delete);

//suggestionMember
router.post('/employeeSuggestionMember',verifyTokenFn,controller.SuggestionController.employee_SuggestionMember);
router.post('/searchSuggestionMember',verifyTokenFn,controller.SuggestionController.search_SuggestionMember);

//Leave module
router.post('/addLeave',verifyTokenFn,controller.LeaveController.add_Leave); //status use ->(pending->0,Approve->1,reject->2,cancel->3)
router.post('/showLeave',controller.LeaveController.show_Leave);
router.post('/cancelLeave',verifyTokenFn,controller.LeaveController.cancel_Leave);
router.post('/updateLeave',controller.LeaveController.update_Leave);
router.post('/leaveList',verifyTokenFn,controller.LeaveController.leave_List);
router.post('/allEmployeeList',controller.LeaveController.allEmployee_List);
router.post('/leaveBalance',controller.LeaveController.balance_Leave);
router.get('/onLeave',controller.LeaveController.onLeave);
router.post('/approveLeaveCancel',controller.LeaveController.approveLeaveCancel);
router.get('/showLeaveType',verifyTokenFn,controller.LeaveController.show_LeaveType);

//Document module
router.post('/addDocument',verifyTokenFn,controller.DocumentController.add_Document); // status use -> show dependentType ->[ myDocument->0 / dependent->1],[DocType->Document list data id ],[isExpire->0 NO,isExpire->1 Yes]
router.get('/showDocument',verifyTokenFn,controller.DocumentController.show_Document);
router.post('/updateDocument',verifyTokenFn,controller.DocumentController.update_Document); //status use -> dependentType ->[ myDocument->0 / dependent->1]
router.post('/deletedocument',verifyTokenFn,controller.DocumentController.delete_Document); //status use -> dependentType ->[ myDocument->0 / dependent->1]
router.get('/showDocumentType',verifyTokenFn,controller.DocumentController.show_DocumentType)

//show salary list 
router.get('/showSalaryList',verifyTokenFn,controller.CompensationController.show_salarylist);
router.post('/showSalaryDetail',verifyTokenFn,controller.CompensationController.show_salaryDetail);

//insurance  
router.post('/showInsurance',verifyTokenFn,controller.InsuranceController.show_Insurance);

//calendar
router.post('/showCalendar',verifyTokenFn,controller.CalendarController.show_Calender);
router.post('/addCalendar',verifyTokenFn,controller.CalendarController.add_Calender);
router.post('/editCalendar',verifyTokenFn,controller.CalendarController.edit_Calender);

//
//Employee survey allotted
router.post('/showAllottedSurvey',controller.Survey_Controller.show_AllottedSurvey);
router.post('/showSurveyQuestions',verifyTokenFn,controller.Survey_Controller.show_SurveyQuestions);
router.post('/surveySubmission',controller.Survey_Controller.surveySubmission);
router.post('/surveyAnswerList',controller.Survey_Controller.survey_AnswerList);

//Chat 
router.post('/contactList',controller.ChatController.message_List);
router.post('/userChatDelete',controller.ChatController.message_UserChatDelete);
router.post('/userList',controller.ChatController.username_List);
router.post('/userLeaveByGroup',controller.ChatController.user_LeaveGroup);
router.post('/chatMessage',verifyTokenFn,controller.ChatController.Chat_message);
router.post('/readMessage',verifyTokenFn,controller.ChatController.read_Message);
router.post('/chatMedia',verifyTokenFn,controller.ChatController.chat_Media);

//challenges Alotted
router.get('/challengeslist',verifyTokenFn,controller.ChallengesController.Challenges_list);
router.post('/acceptChallenge',verifyTokenFn,controller.ChallengesController.Accept_challenge);
router.post('/detailChallenge',verifyTokenFn,controller.ChallengesController.Detail_challenge);
router.post('/leaderboardlist',verifyTokenFn,controller.ChallengesController.Leaderboard_list);

//challenges task 
// FOOD
router.post('/addFoodlog',verifyTokenFn,controller.ChallengesController.Addfood_log);
router.post('/editFoodlog',verifyTokenFn,controller.ChallengesController.editfood_log);
router.post('/showFoodlog',verifyTokenFn,controller.ChallengesController.showfood_log);
router.post('/foodlogUpload',verifyTokenFn,controller.ChallengesController.foodlogUpload);
router.post('/foodlogCategoryList',controller.ChallengesController.Foodlog_CategoryList);
router.post('/foodlogGraph',controller.ChallengesController.foodLog_graph);
router.get('/deleteImage',controller.ChallengesController.delete_FoodlogImage);
router.post('/deleteFoodLog',controller.ChallengesController.delete_FoodLog);


//Task
router.post('/challengeTaskStatus',verifyTokenFn,controller.ChallengesController.Challenge_TaskStatus);
router.post('/challengeSurveyStatus',verifyTokenFn,controller.ChallengesController.Challenge_SurveyStatus);
router.post('/ChallengeAttendanceStatus',verifyTokenFn,controller.ChallengesController.Challenge_AttendanceStatus);

//reward
router.post('/rewardList',verifyTokenFn,controller.RewardController.reward_List);
router.get('/rewardHistory',verifyTokenFn,controller.RewardController.reward_History);
router.post('/rewardRedeem',controller.RewardController.reward_Redeem);

//HRA 
router.post('/hraQuestionList',verifyTokenFn,controller.HRAController.health_Risk_Analysis);
router.post('/healthSubmission',verifyTokenFn,controller.HRAController.health_Submission);
router.post('/hraSubmit',verifyTokenFn,controller.HRAController.HRA_submit);
router.post('/hraExpire',verifyTokenFn,controller.HRAController.HRA_expire);
router.post('/totalScoreHRA',verifyTokenFn,controller.HRAController.HRA_Score);
router.get('/hraReportDownload',verifyTokenFn,controller.HRAController.hraReportDownload);
router.post('/hraCategoryByUser',verifyTokenFn,controller.HRAController.hraCategoryBy_user);
router.get('/hraSegmentWiseCalculation',verifyTokenFn,controller.HRAController.hraSegmentWiseCalculation)
// router.post('/hraPdf',controller.HRAController.uploadHtml)

//activity card 
router.post('/ActivityCardList',verifyTokenFn,controller.ActivityCardController.ActivityCardList);
router.post('/userLifestylehabit',verifyTokenFn,controller.ActivityCardController.user_Lifestylehabit);//status use    -> 1 
router.post('/userMyHealthTracker',verifyTokenFn,controller.ActivityCardController.user_MyHealthTracker);//status use  -> 2
router.post('/userMyHealthRecord',verifyTokenFn,controller.ActivityCardController.user_MyHealthRecord);//status use    -> 3
router.post('/addActivityCard',verifyTokenFn,controller.ActivityCardController.addActivity_Card);
router.post('/cardShuffle',controller.ActivityCardController.cardShuffle);
//country
router.get('/country',controller.ActivityCardController.country);

//CoachingController
router.get('/coachingCategory',verifyTokenFn,controller.CoachingController.coaching_Category);
router.post('/coachingSubCategory',verifyTokenFn,controller.CoachingController.coaching_subCategory);

//variable
router.post('/variableRawData',verifyTokenFn,controller.VariableController.variable_RawData);
router.get('/variableWatchList',verifyTokenFn,controller.VariableController.variableWatch_List);
router.post('/selectVariableWatch',verifyTokenFn,controller.VariableController.select_VariableWatch);
router.get('/VariableWatchByUser',verifyTokenFn,controller.VariableController.VariableWatch_ByUser);

//programs
router.post('/currentBodyMeasurement',controller.GoalController.current_BodyMeasurement);
router.post('/desiredBodyMeasurement',controller.GoalController.desired_BodyMeasurement);

//goal
router.post('/showGoal',verifyTokenFn,controller.GoalController.show_Goal);
router.post('/goalContent',controller.GoalController.goal_Content);
router.post('/goalToggle',verifyTokenFn,controller.GoalController.goal_Toggle);
router.post('/goalStart',verifyTokenFn,controller.GoalController.goal_Start);
router.post('/goalDailyStatus',verifyTokenFn,controller.GoalController.goal_DailyStatus);
router.post('/goalSubmit',verifyTokenFn,controller.GoalController.goal_Submit);
router.get('/showGoalDailyStatus',verifyTokenFn,controller.GoalController.showGoal_DailyStatus);
router.get('/showActiveGoal',verifyTokenFn,controller.GoalController.showActiveGoal);

//nutritionist
router.post('/showNutritionist',verifyTokenFn,controller.NutritionistController.show_Nutritionist);
router.post('/mealDay',controller.NutritionistController.meal_Day);
router.post('/mealPlanWise',controller.NutritionistController.meal_planWise);
router.post('/showViewNutritionList',verifyTokenFn,controller.NutritionistController.showViewNutritionList);
router.post('/LikeDislikeNutritionList',verifyTokenFn,controller.NutritionistController.LikeDislikeNutritionList);
router.get('/getMealDayId' ,verifyTokenFn,controller.NutritionistController.getMealId );
router.post('/glossaryPostViews',verifyTokenFn,controller.NutritionistController.glossaryPostViews);
router.post('/mealPlanPostViews',verifyTokenFn,controller.NutritionistController.mealPlanPostViews);
router.post('/recipesPostViews',verifyTokenFn,controller.NutritionistController.recipesPostViews);

// CardActivity
router.post('/cardActivity',verifyTokenFn,controller.CardActivityController.card_Activity);
router.post('/valueUpdateActivity',verifyTokenFn,controller.CardActivityController.valueUpdate_Activity);
router.get('/foodInstantlist',verifyTokenFn,controller.CardActivityController.foodInstant_list);
router.post('/addFoodInstant',verifyTokenFn,controller.CardActivityController.add_foodInstant);
router.get('/foodCategory',controller.CardActivityController.food_category);
router.post('/foodSubcategory',controller.CardActivityController.food_Subcategory)
router.get('/deviceToken',controller.CardActivityController.deviceToken)
router.post('/durationMaintain',verifyTokenFn,controller.CardActivityController.durationMaintain)
// router.post('/averageDuration',controller.CardActivityController.averageDuration)


// verifyTokenFn
module.exports=router;   