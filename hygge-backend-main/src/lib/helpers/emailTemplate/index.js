const  PayslipTemplate           = require('./emailPayslip_template');
const  OTPTemplate               = require('./emailOTP_template');
const  HRAdminInvitationTemplate = require('./emailHRAdminInvitation_template');
const  ChatHistoryTemplate       = require('./emailChatHistory_template');
const  ForgotTemplate            = require('./emailForgot_template');
const  EmpInvitationTemplate     = require('./emailEmpInvitation_template');
const  DocExpiryTemplate         = require('./emailDocExpiry_template');
const  AdminInvitationTemplate   = require('./emailAdminInvitation_template');

const emailTemplate = {
    PayslipTemplate           : PayslipTemplate,    
    OTPTemplate               : OTPTemplate, 
    HRAdminInvitationTemplate : HRAdminInvitationTemplate,
    ChatHistoryTemplate       : ChatHistoryTemplate,
    ForgotTemplate            : ForgotTemplate,
    EmpInvitationTemplate     : EmpInvitationTemplate,
    DocExpiryTemplate         : DocExpiryTemplate, 
    AdminInvitationTemplate   : AdminInvitationTemplate
};

module.exports = emailTemplate;