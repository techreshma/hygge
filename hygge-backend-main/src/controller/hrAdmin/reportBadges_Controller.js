const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);


// ------------------------- employeeReportBy_Document -----------------------------------
module.exports.employeeReportBy_Badges = async (req, res) => {
  try {  
    let { company_Id,start_date, end_date,page, pagination } = req.body;
    let { branch_Id, access } = req.query;
    let TotalNoOfBadgesEarned = await ConnectionUtil(`SELECT COUNT(*) AS TotalBadegsEarned FROM badge_assigned AS BA JOIN user AS U ON BA.user_Id = U.user_id WHERE U.company_id ='${company_Id}' AND U.isActive='1'`);
    let TotalBadgesEarnedByUserList = await ConnectionUtil(`SELECT CONCAT(U.first_name,' ',U.last_name) as name,U.department,U.reporting_Manager,U.marital_Status,SUM(BA.badges_earned) AS badges_earn FROM badge_assigned AS BA JOIN user AS U ON BA.user_Id = U.user_id WHERE U.company_id='${company_Id}' AND U.isActive='1' GROUP BY U.user_id ORDER BY badges_earn DESC`);
    let TopFiveEmployees = await ConnectionUtil(`SELECT CONCAT(U.first_name,' ',U.last_name) as name,SUM(BA.badges_earned) AS badges_earn FROM badge_assigned AS BA JOIN user AS U ON BA.user_Id = U.user_id WHERE U.company_id='${company_Id}' AND U.isActive='1' GROUP BY U.user_id ORDER BY badges_earn DESC LIMIT 5`);
    let TopFiveBadges = await ConnectionUtil(`SELECT B.badges_Name, SUM(BA.badges_earned) AS Totalbadges FROM badge_assigned AS BA JOIN badges AS B ON BA.badges_Id = B.badges_id JOIN user AS U ON BA.user_Id = U.user_id WHERE U.company_id='${company_Id}' AND U.isActive='1' GROUP BY BA.badges_Id ORDER BY Totalbadges DESC LIMIT 5`);

    let obj={
      total_badges:TotalNoOfBadgesEarned[0].TotalBadegsEarned,
      topFiveEmployee: TopFiveEmployees,
      topFiveBadges: TopFiveBadges,
      user:TotalBadgesEarnedByUserList
    }
    
    res.status(200).json({
      success: true,
      message: "Badges report list",
      data: obj
    });
  }catch(err){
    console.log(err)
    res.status(404).json({
        success: false,
        message: err.message,
    });
  }
}