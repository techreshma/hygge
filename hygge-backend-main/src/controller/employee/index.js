const EmployeeUserController = require('./employeeUser_Controller');
const AttendanceController = require('./attendance_Controller');
const SettingController = require('./setting_Controller');
const BadgesContoller = require('./badges_Controller');
const CalorieCalculaterController  = require('./calorieCalculater_Controller');
const ProfileImageUploadController = require('./profileImageUpload_Controller');
const NotificationController       = require('./notification_Controller')
const SuggestionController         = require('./suggestion_Controller');
const LeaveController              = require('./leave_Controller');
const DocumentController           = require('./document_Controller');
const CompensationController       = require('./compensation_Controller')
const InsuranceController          = require('./insurance_Controller')
const CalendarController           = require('./calendar_Controller');
const Survey_Controller            = require('./survey_Controller');
const ChatController               = require('./chat_Controller');
const ChallengesController         = require('./challenges_Contoller');
const RewardController             = require('./reward_Controller');
const HRAController                = require('./health_Risk_Analysis');
const ActivityCardController       = require('./activityCard_Controller');
const CoachingController           = require('./coaching_Controller');
const VariableController           = require('./variable_Controller');
const GoalController               = require('./goal_Controller');
const NutritionistController       = require('./nutritionist_Controller');
const CardActivityController   = require('./cardActivity_Controller');
const employee = {
    EmployeeUserController      : EmployeeUserController,    
    SettingController           : SettingController,
    BadgesContoller             : BadgesContoller,
    CalorieCalculaterController : CalorieCalculaterController,
    AttendanceController        : AttendanceController,
    ProfileImageUploadController: ProfileImageUploadController,
    NotificationController      : NotificationController,
    SuggestionController        : SuggestionController,
    LeaveController             : LeaveController,
    DocumentController          : DocumentController,
    CompensationController      : CompensationController,
    InsuranceController         : InsuranceController,
    CalendarController          : CalendarController,
    Survey_Controller           : Survey_Controller,
    ChatController              : ChatController,
    ChallengesController        : ChallengesController,
    RewardController            : RewardController,
    HRAController               : HRAController,
    ActivityCardController      : ActivityCardController,
    CoachingController          : CoachingController,
    VariableController          : VariableController,
    GoalController              : GoalController,
    NutritionistController      : NutritionistController,
    CardActivityController      : CardActivityController
};

module.exports = employee; 