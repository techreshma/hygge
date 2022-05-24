const CsvUploadEmployeeController   = require('./csvUploadEmployee_Controller');
const HrAdminUserController         = require('./hrAdminUser_Controller');
const CompanyFaqController          = require('./companyFaq_Controller');
const CompanyThemeController        = require('./companyTheme_Controller');
const CompanySMTPController         = require('./companySMTP_Controller');
const CompanyLeaveController        = require('./companyLeave_Controller');
const CompanyUploadController       = require('./Upload_Controller');
const CalendarEventController       = require('./CalendarEvent_Controller');
const UserRoleController            = require('./userRole_Controller');
const EmployeeUserController        = require('./employeeUser_Controller');
const RoleAccessController          = require('./roleAccess_Controller');
const EmpDocumentController         = require('./empDocument_Controller.js');
const InsuranceController           = require('./insurance_Controller');
const DepartmentController          = require ('./department_Controller');
const LeaveController               = require('./leave_Controller');
const SalaryController              = require('./salary_Controller');
const HolidayController             = require('./holiday_Controller');
const DocumentController            = require('./document_Controller');
const CompensationController        = require('./compensation_Controller');
const PaySlipController             = require('./paySlip_Controller')
const SurveyTypeController          = require('./survey_Controller');
const ChatController                = require('./chat_Controller');
const EmployeeDetailController      = require('./employeeDetails_Controller');
const RewardController              = require('./reward_Controller');
const ChallengeController           = require('./challenges_Contoller')
const NotificationController        = require('./notification_Controller');
const EmpolyeeRecordController      = require('./empolyeeRecord_Controller');
const CompanyBranchController       = require('./companyBranch_Controller');
const CsvEmployeeVerifyController   = require('./csvEmployeeVerify_Controller');
const ReportEmployeeController      = require('./reportEmployee_Controller');
const ReportATTENDANCEController    = require('./reportATTENDANCE_Controller');
const ReportLeaveController         = require('./reportLeave_Controller');
const ReportDocumentController      = require('./reportDocument_Controller');
const ReportSalaryController        = require('./reportSalary_Controller');
const ReportBadgesController        = require('./reportBadges_Controller');
const ReportSurveyController        = require('./reportSurvey_Controller');
const ReportChallengesController    = require('./reportChallenges_Controller');
const DashboardController           = require('./dashboard_Controller');
const HRAReportController           = require('./hraReport_Controller');
const companyReportController       = require('./companyReport-controller')
const hrAdmin = {
    CsvUploadEmployeeController      : CsvUploadEmployeeController,    
    CompanyFaqController             : CompanyFaqController,  
    HrAdminUserController            : HrAdminUserController,
    CompanyThemeController           : CompanyThemeController,
    CompanySMTPController            : CompanySMTPController,
    CompanyLeaveController           : CompanyLeaveController,
    CompanyUploadController          : CompanyUploadController,
    CalendarEventController          : CalendarEventController,
    UserRoleController               : UserRoleController,
    EmployeeUserController           : EmployeeUserController,
    RoleAccessController             : RoleAccessController,
    EmpDocumentController            : EmpDocumentController,
    InsuranceController              : InsuranceController,
    DepartmentController             : DepartmentController,
    LeaveController                  : LeaveController,
    SalaryController                 : SalaryController,
    HolidayController                : HolidayController,
    DocumentController               : DocumentController,
    CompensationController           : CompensationController,
    PaySlipController                : PaySlipController,
    SurveyTypeController             : SurveyTypeController,
    ChatController                   : ChatController,
    EmployeeDetailController         : EmployeeDetailController,
    RewardController                 : RewardController,
    ChallengeController              : ChallengeController,
    NotificationController           : NotificationController,
    EmpolyeeRecordController         : EmpolyeeRecordController,
    CompanyBranchController          : CompanyBranchController,
    CsvEmployeeVerifyController      : CsvEmployeeVerifyController,
    ReportEmployeeController         : ReportEmployeeController,
    ReportATTENDANCEController       : ReportATTENDANCEController,
    ReportLeaveController            : ReportLeaveController,
    ReportDocumentController         : ReportDocumentController,
    ReportChallengesController       : ReportChallengesController,
    ReportSurveyController           : ReportSurveyController,
    ReportSalaryController           : ReportSalaryController,
    ReportBadgesController           : ReportBadgesController,
    DashboardController              : DashboardController,
    HRAReportController              : HRAReportController,
    companyReportController          : companyReportController   
};

module.exports = hrAdmin;