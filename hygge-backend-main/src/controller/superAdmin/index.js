const SuperAdminController         = require('./superAdmin_Controller');
const UserRoleController           = require('./userRole_Controller');
const SubscriptionPlanController   = require('./subscriptionPlan_Controller');
const RoleAccessController         = require('./roleAccess_Controller');
const CompanyCreateController      = require('./companyCreate_Controller');
const HealthRiskQuestionController = require('./health_Risk_Question');
const CoachingController           = require('./coaching_Controller');
const superChallengeController     = require('./challenges_Controller');
const RewardContoller              = require('./reward_Controller');
const BadgesController             = require('./badges_Controller');
const NotificationController       = require('./notification_Controller');
const ReportHRAController          = require('./reportHRA_Controller');
const DashboardController          = require('./dashboard_Controller');
const CompanyReportController      = require('./companyReport_Controller');
const ReportsController            = require('./reports_Controller');

const superAdmin = {
    SuperAdminController         : SuperAdminController,    
    UserRoleController           : UserRoleController,
    SubscriptionPlanController   : SubscriptionPlanController,
    RoleAccessController         : RoleAccessController,
    CompanyCreateController      : CompanyCreateController,
    HealthRiskQuestionController : HealthRiskQuestionController,
    CoachingController           : CoachingController ,
    superChallengeController     : superChallengeController,
    RewardContoller              : RewardContoller,
    BadgesController             : BadgesController,
    NotificationController       : NotificationController,
    ReportHRAController          : ReportHRAController,
    DashboardController          : DashboardController,
    CompanyReportController      : CompanyReportController,
    ReportsController            : ReportsController    
};
module.exports = superAdmin;
