const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
const { title } = require("process");
let ConnectionUtil = util.promisify(connection.query).bind(connection);

// ------------------------- hra_reportEmployee -----------------------------------
module.exports.company_report = async (req, res) => {
  try {
    let companyDetail = await ConnectionUtil(`select * from company where isActive='1'`);
    let userDetail = await ConnectionUtil(`select * from user where isActive='1'`);
    let user_count = await ConnectionUtil(`SELECT COUNT(user_id) as user ,MONTHNAME(created_At) as month FROM user WHERE isActive=1 AND YEAR(created_At)='2021'  GROUP BY MONTH(created_At)`);
    let company_count = await ConnectionUtil(`SELECT COUNT(company_id) as company ,MONTHNAME(created_At) as month FROM company WHERE isActive=1 AND YEAR(created_At)='2021'  GROUP BY MONTH(created_At)`);
    let user_gender = await ConnectionUtil(`select gender,COUNT(*) as employee from user where isActive=1 AND gender!='' AND gender IS NOT NULL Group By gender`);
    let activeUser_count = await ConnectionUtil(`SELECT COUNT(user_id) as value ,MONTHNAME(created_At) as month FROM user WHERE isActive = '1' AND YEAR(created_At) = YEAR(CURRENT_DATE)  GROUP BY MONTH(created_At)`);
    let planTypeBased_companySize = await ConnectionUtil(`select Count(U.user_id) as count ,COALESCE(company_BusinessType,'') as company_BusinessType, COALESCE(plan_Name,'') as plan_Name from company as C JOIN user as U ON U.company_id = C.company_id AND U.isActive=1  group by C.plan_Name,C.company_BusinessType`);
    let mobile_user = await ConnectionUtil(`select  COUNT(role) as count  from user where isActive=1 AND role = 0 `);
    let web_user = await ConnectionUtil(`select  COUNT(role) as count  from user where isActive=1 AND role != 0 `);
    let tot_lite = 0;
    let tot_plus = 0;
    let tot_premium = 0;
    for (let planCount of companyDetail) {
      if (planCount.plan_Name == 'lite') {
        tot_lite = tot_lite + 1;
      }
      if (planCount.plan_Name == 'Plus') {
        tot_plus = tot_plus + 1;
      }
      if (planCount.plan_Name == 'Premium') {
        tot_premium = tot_premium + 1;
      }
    }
    let plan_count = {
      lite: tot_lite,
      Plus: tot_plus,
      Premium: tot_premium
    }
    let obj = {
      total_companies: companyDetail.length,
      companiesBased_plan: plan_count,
      new_companies_Users_Monthly: { user: user_count.length > 0 ? user_count : [], company: company_count.length > 0 ? company_count : [] },
      total_user: userDetail.length,
      planTypeBased_companySize: planTypeBased_companySize.length > 0 ? planTypeBased_companySize : [],
      activeUser_count: activeUser_count.length > 0 ? activeUser_count : [],
      user_gender: user_gender.length > 0 ? user_gender : [],
      user_usage: [{
        Platform: "mobile_user", 
        value: mobile_user.length > 0 ? mobile_user[0].count : [],
      },
      {
        Platform:"web_user" ,
        value: web_user.length > 0 ? web_user[0].count : []

      }
    ]
    }
    res.status(200).json({
      success: true,
      message: "Company report detail",
      data: obj
    });
  } catch (err) {
    console.log(err)
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
}