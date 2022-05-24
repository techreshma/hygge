const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let { issueJWT } = require("../../lib/helpers/jwt");
let moment = require('moment')
// const { survey_AnswerList } = require("./survey_Controller");

// ------------------------- Activity -----------------------------------
module.exports.show_Activity = async (req, res) => {
  try {
    // let{company_Rank, steps, total_Distance} = req.body;
    let activ = [
      {
        company_Rank: 5,
        steps: 500,
        total_Distance: "50",
      },
      {
        company_Rank: 10,
        steps: 800,
        total_Distance: "50",
      },
    ];
    res.status(200).json({
      success: true,
      message: "Show Notification",
      data: activ,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// ------------------------- Reward -----------------------------------
module.exports.show_Reward = async (req, res) => {
  try {
    let { id } = req.user;
    //Reward Point
    let Earnpoint = await ConnectionUtil(`SELECT SUM(reward_point) as Total_point  from reward_redeem where DATE_FORMAT(redeem_Date, '%Y-%m-%d')= DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND isDeposit='1' AND user_Id='${id}'`);
    let EarnpointD = await ConnectionUtil(`SELECT SUM(reward_point) as Total_point  from reward_redeem where isDeposit='1' AND user_Id='${id}'`);
    let redeemReward = await ConnectionUtil(`SELECT *  from reward_redeem where isDeposit='0' AND user_Id='${id}'`);
    let total_point = EarnpointD != null && EarnpointD[0].Total_point != null ? EarnpointD[0].Total_point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0
    let todayEarn = Earnpoint[0].Total_point != null ? Earnpoint[0].Total_point : 0;

    let Rewards = [
      {
        Earn_Today: todayEarn.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        Total_Rewards: redeemReward.length > 0 ? redeemReward.length : 0,//1500,
        Expiring_This_Month: 350,
        Life_Time_Earned: parseInt(await getNumberUnit(total_point))//total_point//"1.5M",
      }
    ];
    res.status(200).json({
      success: true,
      message: "Show Rewards",
      data: Rewards,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//------- function unit ------- 
getNumberUnit = function (num) {
  var units = ["M", "B", "T", "Q", "Q", "S"];
  var unit = Math.floor((num / 1.0e+1).toFixed(0).toString().length);
  var r = unit % 3;
  var x = Math.abs(Number(num)) / Number('1.0e+' + (unit - r)).toFixed(2);
  let str = units[Math.floor(unit / 3) - 2] != undefined ? units[Math.floor(unit / 3) - 2] : "";
  return x.toFixed(2) + ' ' + str;
}
//------------------------- Assing Target -----------------------------------
module.exports.show_AssignTarget = async (req, res) => {
  try {
    let AssignTarget = [
      {
        target_Category: "8 Glass Water",
        target_Description: "Intakes 2 Glass",
      },
      {
        target_Category: "30 Mins yoga",
        target_Description: "Not Attempted Yet!",
      },
      {
        target_Category: "5 KM Running",
        target_Description: "completed 2 KM",
      },
    ];
    res.status(200).json({
      success: true,
      message: "show Assigntarget",
      data: AssignTarget,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//--------------------------Terms & Condition--------------------------------------------
module.exports.show_Faq = async (req, res) => {
  try {
    var all = [
      {
        catName: "payment",
        faq: [
          {
            question: "many desktop publishing packages",
            answer: "publishing packages",
          },
          { question: "company details", answer: "publishing packages" },
        ],
      },
      {
        catName: "leave",
        faq: [
          { question: "what is you name", answer: "publishing packages" },
          { question: "what is you name", answer: "publishing packages" },
        ],
      },
      {
        catName: "hr",
        faq: [
          { question: "what is you name", answer: "publishing packages" },
          { question: "what is you name", answer: "publishing packages" },
        ],
      },
      {
        catName: "other",
        faq: [
          { question: "what is you name", answer: "publishing packages" },
          { question: "what is you name", answer: "publishing packages" },
        ],
      },
    ];
    res.status(200).json({
      success: true,
      message: "Array Exist",
      data: all,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//--------------------------Terms & Condition--------------------------------------------
module.exports.show_termCondition = async (req, res) => {
  try {
    var termCondition = [
      {
        Category: "Category1",
        Text:
          "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures.",
      },
      {
        Category: "Category2",
        Text:
          "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable... If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures.",
      },
    ];
    res.status(200).json({
      success: true,
      message: "Array Exist",
      data: termCondition,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// ------------------------- Notification Status -----------------------------------
module.exports.status_Notification = async (req, res) => {
  try {
    let {
      isToggle,
      isChat,
      isActivity,
      isReward,
      isOther,
      ip_Address,
      userId,
      companyId,
    } = req.body;
    let toggle = isToggle != true ? 1 : 0;
    let chat = isChat != true ? 1 : 0;
    let activity = isActivity != true ? 1 : 0;
    let reward = isReward != true ? 1 : 0;
    let other = isOther != true ? 1 : 0;

    var userDetail = await ConnectionUtil(
      `select * from notification_status where user_Id ='${userId}' AND company_Id='${companyId}'`
    );
    if (userDetail != "") {
      if (toggle == 1) {
        var notificationUpdateQueryFind = await ConnectionUtil(
          `update notification_status set isChat='${chat}' ,isActivity='${activity}',isReward='${reward}',isOther='${other}' ,ip_Address='${ip_Address}',updated_By='${userId}' where user_Id ='${userId}' AND company_Id ='${companyId}'`
        );
        if (notificationUpdateQueryFind.affectedRows == 1) {
          res.status(200).json({
            success: true,
            message: "update notification",
            data: notificationUpdateQueryFind,
          });
        } else {
          res.status(404).json({
            success: false,
            message: "somthing went wrong",
          });
        }
      } else {
        var notificationUpdateQueryFind = await ConnectionUtil(
        `update notification_status set isToggle='${toggle}',
        isChat='${chat}',
        isActivity='${activity}',
        isReward='${reward}',
        isOther='${other}',
        ip_Address='${ip_Address}',
        updated_By='${userId}' 
        where user_Id ='${userId}' AND company_Id ='${companyId}'`
        );
        res.status(200).json({
          success: true,
          message: "update notification",
          data: notificationUpdateQueryFind
        });
      }
    } else {
      let post = {
        isToggle: toggle,
        isChat: chat,
        isActivity: activity,
        isReward: reward,
        isOther: other,
        ip_Address: ip_Address,
        user_Id: userId,
        company_Id: companyId,
      };
      let User = await ConnectionUtil(
        `INSERT INTO notification_status SET ?`,
        post
      );
      res.status(200).json({
        success: true,
        message: "new status created",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// ------------------------- Show_Notification -----------------------------------
module.exports.show_StatusNotification = async (req, res) => {
  try {
    let { userId, companyId } = req.body;
    var userDetail = await ConnectionUtil(
      `select user_Id,company_Id,isToggle,isChat,isActivity,isOther,isReward from notification_status where isActive ='1' AND user_Id ='${userId}' AND company_Id='${companyId}'`
    );
    if (userDetail != "") {
      res.status(200).json({
        success: true,
        message: "show notification",
        data: userDetail,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "user does id and company id not match",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};


// ------------------------- Show_Notification -----------------------------------
module.exports.showMenuStatus = async (req, res) => {
  try {
    let { company_id, id } = req.user;
    //Document 
    let documentCount = await ConnectionUtil(`Select * from document_Detail where isActive = '1' AND MONTH(expiry_Date) = MONTH(CURRENT_DATE()) AND YEAR(expiry_Date) = YEAR(CURRENT_DATE()) AND user_Id='${id}' AND company_Id='${company_id}' `);
    //Reward Point
    let Earnpoint = await ConnectionUtil(`SELECT SUM(reward_point) as Total_point  from reward_redeem where DATE_FORMAT(redeem_Date, '%Y-%m-%d')= DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND isDeposit='1' AND user_Id='${id}'`);
    //Salary_Slip
    let Salary_Slip = await ConnectionUtil(`select Year(CURRENT_DATE()) as year `);
    //Survey
    let Survey = await ConnectionUtil(`select Year(created_At) as year from  userAssign_Survey where company_Id='${company_id}' AND user_Id='${id}' ORDER BY created_At DESC`);
    //attendance
    let attendance = await ConnectionUtil(`select * from Attendance where MONTH(date) = MONTH(CURRENT_DATE()) AND 
    YEAR(date) = YEAR(CURRENT_DATE()) AND company_Id='${company_id}' AND user_Id=${id} GROUP BY date `);


    const endOfMonth   = moment().endOf('month').format('DD');
    
    let workingDays =  Number(endOfMonth - 8)

    let attendance_percentage= Math.round(((attendance.length)/workingDays)*100);
    
    obj = {
      attendance:attendance_percentage,
      reward: Earnpoint != null && Earnpoint[0].Total_point != null ? Earnpoint[0].Total_point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0,
      document: documentCount.length,
      salary_Slip: Salary_Slip[0].year,
      survey: Survey.length > 0 ? Survey[0].year != null ? Survey[0].year : 0 : 0
    };
    res.status(200).json({
      success: true,
      message: "Show menu status",
      data: obj
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};