const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let MAIL = require("../../config/email");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let { issueJWT } = require("../../lib/helpers/jwt");

//-------------------------------- showBadges_list -----------------------------------------------
module.exports.showBadges_list = async (req, res) => {
  try {
    let { id,company_id } = req.user;
    let Arr = [];
    let badgedetail = await ConnectionUtil(
      `select badges_id,badges_Name,badges_Description,points,badges_doc_Path as badgesPath,isActive  from  badges`
    );
    for (let data of badgedetail){
      let userAssignBadgeDetail = await ConnectionUtil(
        `SELECT * FROM badge_assigned WHERE user_Id='${id}' AND badges_Id='${data.badges_id}'`
      );
      data.user_Id = userAssignBadgeDetail!="" ? userAssignBadgeDetail[0].user_Id:id;
      data.badges_earned = userAssignBadgeDetail!="" ? userAssignBadgeDetail[0].badges_earned:0;
      data.status = userAssignBadgeDetail!="" ? userAssignBadgeDetail[0].isActive:'0';
      Arr.push(data);
    }
    res.status(200).json({
      success: true,
      message: "Show badges list",
      data: Arr,
    }); 
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
