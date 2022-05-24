const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let { commonNotification } = require("../../lib/helpers/fcm");
//------------------------ Notification_list  ------------------------
module.exports.notification_list = async (req, res) => {
  try {
    let { company_id } = req.user;
    let { branch_Id, access } = req.query;
    let AnnouncementsSelectQuery;
    if (access == 0) {
      AnnouncementsSelectQuery = await ConnectionUtil(
        `select * from announcements where company_Id='${company_id}'`
      );
    } else {
      AnnouncementsSelectQuery = await ConnectionUtil(
        `select * from announcements where company_Id='${company_id}'`
      );
    }
    res.status(200).json({
      success: true,
      message: "Notification list",
      data: AnnouncementsSelectQuery,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//------------------------ Notification_list  ------------------------
module.exports.notificationSend_Filter = async (req, res) => {
  try {
    let {
      body,
      title,
      company_Id,
      age_Type,
      gender_Type,
      department_Type,
      user_Type,
      user,
      ageTo,
      ageFrom,
      department,
      gender,
    } = req.body;
    let { id, company_id } = req.user;
    let { branch_Id, access } = req.query;
    let newArr = [];
    let ageClause = "";
    let genderClause = "";
    let departmentClause = "";
    let userClause = "";
    let msg = { body: body, title: title };
    if (age_Type != 0) {
      ageClause = `AND Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0)>=${ageFrom} AND Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0)<=${ageTo}`;
    }
    if (gender_Type != 0) {
      genderClause = `AND gender='${gender}'`;
    }
    if (department_Type != 0) {
      let inClause = department.map((id) => "'" + id + "'").join();
      departmentClause = `AND department IN(${inClause})`;
    }
    if (user_Type != 0) {
      userClause = `AND user_id IN(${user})`;
    }
    let faqDeleteQuery;
    if (access == 0) {
      faqDeleteQuery = await ConnectionUtil(
        `select * from user where isActive=1 AND branch_Id='${branch_Id}' AND company_Id='${company_Id}' ${userClause} ${departmentClause} ${genderClause} ${ageClause}`
      );
    } else {
      faqDeleteQuery = await ConnectionUtil(
        `select * from user where isActive=1 AND company_Id='${company_Id}' ${userClause} ${departmentClause} ${genderClause} ${ageClause}`
      );
    }

    if (faqDeleteQuery.length > 0) {
      for (let data of faqDeleteQuery) {
        let NotificationSelectQuery = await ConnectionUtil(
          `select * from fcm_Notification where user_Id='${data.user_id}'`
        );
        if (NotificationSelectQuery.length > 0) {
          let len = NotificationSelectQuery[0].user_Id;
          commonNotification(NotificationSelectQuery, msg);
          newArr.push(len);
        }
      }

      for (let data of newArr) {
        await notificaiton_userSave("0", data, company_Id, msg.body);
      }

      let notifyObj = {
        body: body,
        title: title,
        company_Id: company_Id,
        user_Id: id,
        created_By: id,
        updated_By: id,
        userCount: faqDeleteQuery.length, //newArr.length
      };
      let insertNotification = await ConnectionUtil(
        `INSERT INTO announcements SET ?`,
        notifyObj
      );
      res.status(200).json({
        success: true,
        message:
          newArr.length != 0 ? "notification send user " : "user not found",
        data: newArr,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User filter request not find over record",
        data: newArr,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

async function notificaiton_userSave(
  user_Id,
  EmpUser_Id,
  company_Id,
  notification
) {
  let obj = {
    send_to: user_Id,
    user_Id: EmpUser_Id,
    company_Id: company_Id,
    notification_Type: "Announcement",
    notification_Text: notification,
  };
  let notificationObj = await ConnectionUtil(
    `INSERT INTO notification SET?`,
    obj
  );
}
