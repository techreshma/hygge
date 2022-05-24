var express 	= require('express');
var router 		= express.Router();
const controller = require('../controller/hrAdmin/index');
const { verifyTokenFn } = require(".././lib/helpers/jwt");
const { finished } = require('stream');

// HrAdmin Module
router.post('/login', controller.HrAdminUserController.hradmin_login );
router.post('/resetPassword', verifyTokenFn , controller.HrAdminUserController.hradmin_ResetPassword);
router.post('/forgetPassword' , controller.HrAdminUserController.hradmin_forgetPassword);
router.post('/forgetPasswordReset', controller.HrAdminUserController.hradmin_forgetPasswordReset);
// router.get ('/show_detail' , verifyTokenFn , controller.UserController.user_Show );
// router.post('/delete' , verifyTokenFn , controller.UserController.user_Delete );
// router.post('/update' , verifyTokenFn , controller.UserController.user_Update );

router.post('/companyFaq',verifyTokenFn,controller.CompanyFaqController.companyFaq);
router.post('/companyPrivacyPolicy',verifyTokenFn,controller.CompanyFaqController.company_Privacy_Policy)
router.post('/CompanyAddTheme',verifyTokenFn,controller.CompanyThemeController.companyAddTheme)
router.post('/companyUpdateTheme',verifyTokenFn,controller.CompanyThemeController.companyUpdateTheme)
router.get('/companyShowTheme',verifyTokenFn,controller.CompanyThemeController.companyShowTheme)
router.post('/companyThemeUpload',controller.CompanyThemeController.companyThemeUpload)

//SMTP show
router.get('/companyShowSMTP',verifyTokenFn,controller.CompanySMTPController.companyShowSMTP)
router.post('/companyUpdateSMTP',verifyTokenFn,controller.CompanySMTPController.companyUpdateSMTP)
router.post('/testmailSMTP',controller.CompanySMTPController.SMTPTest_Mail)

//leave Type
router.get('/leaveType',verifyTokenFn,controller.CompanyLeaveController.companyleaveType)

//upload EventIcon
router.post('/uploadEventIcon',controller.CompanyUploadController.companyEventIcon)

//company_Calendar_Event_Curd
router.post('/companyAddCalendarEvent',verifyTokenFn,controller.CalendarEventController.addCalendarEvent) // repeat=>0->never,1->day,2->week,3->month,4->year
router.get('/companyShowCalendarEvent',verifyTokenFn,controller.CalendarEventController.showCalendarEvent)
router.post('/companyUpdateCalendarEvent',verifyTokenFn,controller.CalendarEventController.updateCalendarEvent) //repeat=>0->never,1->day,2->week,3->month,4->year
router.post('/companyDeleteCalendarEvent',verifyTokenFn,controller.CalendarEventController.deleteCalendarEvent)   

// RoleAdmin
router.post('/addRole' ,verifyTokenFn ,controller.UserRoleController.add_Role );
router.get('/showRole',verifyTokenFn, controller.UserRoleController.show_Role);
router.post('/editRole' ,verifyTokenFn, controller.UserRoleController.edit_Role );
router.post('/deleteRole',verifyTokenFn, controller.UserRoleController.delete_Role);
router.post('/statusRole',verifyTokenFn, controller.UserRoleController.status_Role);

// Employee Register
router.post('/addEmployee',verifyTokenFn,controller.EmployeeUserController.Employee_Register);
router.get('/showEmployee',verifyTokenFn,controller.EmployeeUserController.Show_EmployeeDetail);
router.post('/editEmployee',verifyTokenFn,controller.EmployeeUserController.Edit_Employee);
router.post('/deleteEmployee',verifyTokenFn, controller.EmployeeUserController.Delete_Employee);
router.post('/statusEmployee',verifyTokenFn, controller.EmployeeUserController.status_Employee);
router.post('/csvFileUpload',controller.CsvUploadEmployeeController.csvFileUpload); //csv employee list 
router.post('/invitationLink',controller.EmployeeUserController.employee_InvitationLink); //employee send invit link Via Hr
router.post('/EmpCount',verifyTokenFn,controller.EmployeeUserController.EmployeeCount);
router.get('/subAdminHrList',verifyTokenFn,controller.EmployeeUserController.subAdminHrList);

router.post('/employeeGraphDetail',verifyTokenFn,controller.EmployeeUserController.employee_GraphDetail);

//access
router.post('/accessAllocation', verifyTokenFn , controller.RoleAccessController.access_Allocation);
router.post('/accessDetail' , controller.RoleAccessController.show_AccessDetail);
 
// companyWorking
router.get('/companyWorkingDay',verifyTokenFn,controller.CompanyFaqController.company_WorkingDay);
router.post('/companyWorkingDayUpdate',verifyTokenFn,controller.CompanyFaqController.company_WorkingDayUpdate);

//employee Document
router.post('/addEmpDocument',verifyTokenFn,controller.EmpDocumentController.addEmpDocument); // dependentType ->[ myDocument->0 / dependent->1]
router.get('/showEmployeeName',verifyTokenFn,controller.EmpDocumentController.showEmployeeName);
router.post('/documentUpload',controller.EmpDocumentController.documentUpload);
router.post('/showEmployeeDocument',verifyTokenFn,controller.EmpDocumentController.showEmployeeDocument);
router.post('/statusEmployeeDocument',verifyTokenFn,controller.EmpDocumentController.documentStatus);
router.post('/deleteEmployeeDocument',verifyTokenFn,controller.EmpDocumentController.documentDelete);
router.get('/birthdayEmployeeList',verifyTokenFn,controller.EmpDocumentController.birthdayEmployeeList);
router.post('/employeeNotification',verifyTokenFn,controller.EmpDocumentController.EmployeeNotification);
router.post('/employeeDocMissingList',verifyTokenFn,controller.EmpDocumentController.employeeDocumentRemainig); //MissDocument mailsend (isType->1(myDocument)/isType->2(Dependent)/isType->0(Show Document))
router.get('/documentTypeList',controller.EmpDocumentController.DocumentTypeList);
router.post('/updateEmpDocument',verifyTokenFn,controller.EmpDocumentController.update_Document);

//Insurance
router.post('/addInsurance',verifyTokenFn,controller.InsuranceController.add_Insurance); //(networkType" ->0 : Link , 1 : document") (benefitType"->0 : Link , 1 : document)
router.get('/showInsurance',verifyTokenFn,controller.InsuranceController.show_Insurance);
router.post('/deleteInsurance',verifyTokenFn,controller.InsuranceController.delete_Insurance);
router.post('/updateInsurance',verifyTokenFn,controller.InsuranceController.update_Insurance);//(networkType" ->0 : Link , 1 : document") (benefitType"->0 : Link , 1 : document)

//Department Type
router.post('/addDepartment',verifyTokenFn,controller.DepartmentController.add_DepartmentType);
router.get('/showDepartment',verifyTokenFn,controller.DepartmentController.show_DepartmentType);
router.post('/deleteDepartment',verifyTokenFn,controller.DepartmentController.delete_DepartmentType);

//Leave Type
// addLeaveType , showLeaveType , deleteLeaveType
router.post('/addLeaveType',verifyTokenFn,controller.LeaveController.add_LeaveType);
router.get('/showLeaveType',verifyTokenFn,controller.LeaveController.show_LeaveType);
router.post('/deleteLeaveType',verifyTokenFn,controller.LeaveController.delete_LeaveType);

//Salary Type
// addSalaryType , showSalaryType , deleteSalaryType
router.post('/addSalaryType',verifyTokenFn,controller.SalaryController.add_SalaryType); 
router.get('/showSalaryType',verifyTokenFn,controller.SalaryController.show_SalaryType);
router.post('/deleteSalaryType',verifyTokenFn,controller.SalaryController.delete_SalaryType);

//Holiday Type
// addHoliday , showHoliday , deleteHoliday
router.post('/addHoliday',verifyTokenFn,controller.HolidayController.add_Holiday); // repeat=>0->never,1->day,2->week,3->month,4->year
router.get('/showHoliday',verifyTokenFn,controller.HolidayController.show_Holiday);
router.post('/deleteHoliday',verifyTokenFn,controller.HolidayController.delete_Holiday);

//Document Type
// addDocumentType , showDocumentType , deleteDocumentType
router.post('/addDocumentType',verifyTokenFn,controller.DocumentController.add_DocumentType);
router.get('/showDocumentType',verifyTokenFn,controller.DocumentController.show_DocumentType);
router.post('/deleteDocumentType',verifyTokenFn,controller.DocumentController.delete_DocumentType);
router.post('/updateDocumentType',verifyTokenFn,controller.DocumentController.update_DocumentType);

//Dynamic CSV header sample Employee
router.get('/csvColumn',verifyTokenFn,controller.EmployeeUserController.dummy_CSVColumn);

//Employee Leave 
router.post('/addLeaveEmployee',verifyTokenFn,controller.LeaveController.add_LeaveEmployee);
router.post('/showLeaveEmployeeList',verifyTokenFn,controller.LeaveController.show_EmployeeLeaveList);
router.post('/manageEmployeeleaveBalance',verifyTokenFn,controller.LeaveController.manage_EmployeeleaveBalance);
router.post('/requestEmployeeleave',verifyTokenFn,controller.LeaveController.request_Employeeleave);
router.post('/modifyEmployeeleave',verifyTokenFn,controller.LeaveController.modify_Employeeleave); //(isType->modify ,request->()

//sandwich leave
router.post('/sandwichLeave',controller.LeaveController.sandwichLeave)
router.post('/getsandwichleave',controller.LeaveController.getSandwichLeave)

//compensation template
router.post('/addCompensation',verifyTokenFn,controller.CompensationController.add_Compensation);
router.post('/editCompensationTemplate',verifyTokenFn,controller.CompensationController.edit_CompensationTemplate);
router.get('/showCompensationTemplate',verifyTokenFn,controller.CompensationController.show_Compensation);

//paySlip
router.post('/addPaySlip',verifyTokenFn,controller.PaySlipController.add_PaySlip);
router.get('/showLastPaySlipId',verifyTokenFn,controller.PaySlipController.show_LastPaySlipId);
router.post('/payslipMail',verifyTokenFn,controller.PaySlipController.sendPaySlipByEmail); //find =>isType:1->email payslip,isType:0->paySlip id and base64 image responsed
router.get('/showDepartmentSalary',verifyTokenFn,controller.PaySlipController.show_DepartmentSalary); 
router.post('/showPaySliptemplate',controller.PaySlipController.show_PaySliptemplate); // find=> isType:1->template Id,isType:0->update template ID Company table 
router.post('/showPaySlipReport',controller.PaySlipController.show_PaySlipReport)

//survey
router.post('/addSurveyQuestion',controller.SurveyTypeController.add_SurveyQuestion);
router.post('/showSurveyQuestion',controller.SurveyTypeController.Show_SurveyQuestion);
router.post('/initiatedSurvey',controller.SurveyTypeController.Initiated_Survey); // status->0 Initiated pending show    /1->Initiated Active not show
router.post('/activeSurvey',controller.SurveyTypeController.Active_Survey);
router.post('/detailSurvey',controller.SurveyTypeController.Detail_Survey);
router.post('/attemptedQuestionSurvey',controller.SurveyTypeController.AttemptedQuestion_Survey);
router.post('/questionSubmissionSurvey',controller.SurveyTypeController.QuestionSubmission_Survey); 
router.post('/userAssignListSurvey',controller.SurveyTypeController.UserAssignList_Survey);
router.post('/individualResponsesSurvey',controller.SurveyTypeController.IndividualResponses_Survey); 
router.post('/reminderAllUserSurvey',controller.SurveyTypeController.ReminderAllUser_Survey); 
router.post('/reminderByUSerSurvey',controller.SurveyTypeController.ReminderByUSer_Survey); 
router.post('/surveyTypeByQuestion',controller.SurveyTypeController.SurveyTypeByQuestion);
router.post('/surveyDelete',controller.SurveyTypeController.survey_Delete);
router.post('/surveyEdit',controller.SurveyTypeController.survey_Edit);
router.post('/expirySurveyList',controller.SurveyTypeController.survey_Expiry);
router.post('/expiryEndSurvey',controller.SurveyTypeController.survey_ExpiryEndSurvey); 
router.post('/endActive_Survey',controller.SurveyTypeController.endActive_Survey);
router.post("/copyApastSurvey",controller.SurveyTypeController.copy_APastSurvey);
router.post("/surveyDashboard",verifyTokenFn,controller.SurveyTypeController.surveyDashboard);

//Survey Static Question Data
router.get('/getTemplate',controller.SurveyTypeController.get_Templates);
router.post('/getTemplateQuestions',controller.SurveyTypeController.get_TemplateQuestions)

//Chat message System
router.post('/createGroup',controller.ChatController.createGroup_Chat); //0->private,public->1
router.post('/contactList',controller.ChatController.message_List);
router.post('/chatMessage',controller.ChatController.Chat_message);
router.post('/addNewUserInGroup',controller.ChatController.Add_NewUserInGroup);  
router.post('/userList',controller.ChatController.username_List);
router.post('/groupUserList',controller.ChatController.group_UserList);
router.post('/userLeaveByGroup',controller.ChatController.user_LeaveGroup);
router.post('/deleteGroup',controller.ChatController.delete_Group);
router.post('/chatHistory',controller.ChatController.chat_History);
router.post('/readMessage',verifyTokenFn,controller.ChatController.read_Message);

//Jitsi
router.post('/vedioGroupCall',controller.ChatController.vedioGroupCall); //Both->(private,public)

//EmployeeDetails
router.post('/employeeDetails',controller.EmployeeDetailController.employeeDetails);

//Challenges
router.post('/publishChallenge',controller.ChallengeController.create_Challenge); 
router.get('/challeneges',verifyTokenFn,controller.ChallengeController.challenege);
router.post('/actionRequiredChallenge',verifyTokenFn,controller.ChallengeController.actionRequired_Challenge); 
router.post('/graphDetailChallenege',controller.ChallengeController.GraphDetail_Challenege);

//rewards
router.post('/createReward',verifyTokenFn,controller.RewardController.createReward);
router.post('/updateRewards',verifyTokenFn,controller.RewardController.update_Rewards);
router.post('/deleteRewards',verifyTokenFn,controller.RewardController.Delete_Rewards);
router.get('/showRewards',verifyTokenFn,controller.RewardController.show_Rewards);
router.post('/graphDetailReward',verifyTokenFn,controller.RewardController.reward_GraphDetail);
router.post('/rewardStatus',verifyTokenFn,controller.RewardController.reward_Status);
router.post('/rewardsDetails',verifyTokenFn,controller.RewardController.rewards_Details);
router.post('/rewardDetailById',verifyTokenFn,controller.RewardController.reward_DetailById);
router.post('/topRedeemReward',verifyTokenFn,controller.RewardController.topRedeem_Reward);
router.post('/redeemGraphReward',verifyTokenFn,controller.RewardController.redeemGraph_Reward);

//Notifiction
router.get('/notificationList', verifyTokenFn , controller.NotificationController.notification_list);
router.post('/notificationSendFilter', verifyTokenFn , controller.NotificationController.notificationSend_Filter);

//Report 
router.post('/employeeRecordDetail', verifyTokenFn , controller.EmpolyeeRecordController.employeeRecord_Detail);

//sub_Branch 
router.post('/createBranch', verifyTokenFn , controller.CompanyBranchController.create_Branch);
router.get('/branchList', verifyTokenFn , controller.CompanyBranchController.branch_List);
router.post('/branchStatus', verifyTokenFn , controller.CompanyBranchController.branch_Status);
router.post('/branchDelete', verifyTokenFn , controller.CompanyBranchController.branch_Delete);
router.post('/branchDetailUpdate' ,verifyTokenFn, controller.CompanyBranchController.branch_DetailUpdate);

//CsvEmployeeVerify
router.post('/employeeRaw_CSV_TO_DB',controller.CsvEmployeeVerifyController.employeeRaw_Csv_TO_Db);


//Dummy test not use
router.post('/Testleave',controller.EmployeeUserController.Testleave);

//Report
router.post('/employeeByCount',controller.ReportEmployeeController.employeeBy_Count);
router.post('/employeeReportByAttendance',controller.ReportATTENDANCEController.employeeBy_Attendance);
router.post('/employeeReportByLeave',controller.ReportLeaveController.employeeReportBy_Leave);
router.post('/employeeReportByDocument',controller.ReportDocumentController.employeeReportBy_Document);
router.post('/employeeReportByChallenge',controller.ReportChallengesController.employeeReportBy_Challenge);
router.post('/employeeReportBySurvey',controller.ReportSurveyController.employeeReportBy_Survey);
router.post('/employeeReportBySalary',controller.ReportSalaryController.employeeReportBy_Salary);
router.post('/employeeReportByLeaveCalendar',controller.ReportLeaveController.employeeReportBy_LeaveCalendar);
router.post('/employeeReportByLeaveDetail',controller.ReportLeaveController.employeeReportBy_LeaveDetail);
router.post('/employeeReportByBadges',controller.ReportBadgesController.employeeReportBy_Badges);


//Dashboard Graph
router.post('/dashboardDetail',controller.DashboardController.dashboard_detail);
router.post('/HealthAndWellnessDashboard',controller.DashboardController.HealthAndWellness_Dashboard);

//salaryDashboard
router.post('/salaryDashboard',controller.DashboardController.salaryManagement_DashBoard);

//leaveDashboard Graph
router.post('/leaveDashboardGraph',controller.LeaveController.leaveDashboard_graph);

//HRA Report 
router.post('/hra_reportEmployee',controller.HRAReportController.hra_reportEmployee);

//Company Report
router.get('/companyReportCalculation',verifyTokenFn,controller.companyReportController.companyReport_calculations)

module.exports=router   