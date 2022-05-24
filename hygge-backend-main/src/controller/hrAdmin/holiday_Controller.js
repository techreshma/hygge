const util = require('util');
let status = require('statuses');
let connection = require('../../config/database');
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let internalIp = require('internal-ip');
let MAIL = require('../../config/email');
let bcrypt = require('bcryptjs');
let randomToken = require('random-token');
let otp = require("../../lib/helpers/otp");
let message = require("../../lib/helpers/message");
let moment = require("moment");

async function date(date) {
  var today = new Date(date);
  var dd = today.getDate();

  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  today = yyyy + '-' + mm + '-' + dd;
  return today;
}

//------------------------ Add Holiday ------------------------
module.exports.add_Holiday = async (req, res) => {
  try {
    let {
      event_Type,
      event_StartDate,
      event_EndDate,
      target_Audeince,
      event_Description,
      fileName,
      event_Title,
      isAllday,
      // repeatType ,
      // repeatArray
    } = req.body;
    let { id, company_id } = req.user;
    if (!event_Type) {
      res
        .status(403)
        .json({ success: false, message: "event type is required" });
    }
    var CompanyDetail = await ConnectionUtil(
      `select company_id from company where isActive=1 AND company_id=?`,
      company_id
    );
    if (CompanyDetail) {
      let calendarEventObj = {
        user_Id: id,
        company_Id: company_id,
        event_Type: 0,//event_Type-> hradmin 0 is denoted 
        event_StartDate: (moment(event_StartDate).add(5, "hour").add(30, "m").toDate()).toISOString().slice(0, 10),//moment(event_StartDate).format("YYYY-MM-DD"),
        event_EndDate: (moment(event_EndDate).add(5, "hour").add(30, "m").toDate()).toISOString().slice(0, 10),//moment(event_EndDate).format("YYYY-MM-DD"),
        event_Title: event_Title,
        target_Audeince: target_Audeince,
        event_Description: "holiday",//event_Description,
        fileName: fileName,
        created_By: id,
        updated_By: id,
        isAllday: isAllday || 0,
        isType: 'holiday',
        repeatType: 0,  //new Add To 
        remind: 0,
        event_Location: "holiday",
        repeateTime: 0,
        eventstartTime: "00:00",
        eventendTime: "00:00",
        department: 0,
        ageFrom: 0,
        ageTo: 0,
        gender: 0,
        ip_Address: "12.22.12.12", //new Add from
        repeatArray: JSON.stringify([])
      };
      var addCalendar = await ConnectionUtil(
        `INSERT INTO calendar_Event SET ?`,
        calendarEventObj
      );
      if (addCalendar.insertId != 0) {
        res
          .status(200)
          .json({ success: true, message: "Event added successfully" });
      } else {
        res.status(404).json({ success: false, message: "Data not found" });
      }
    } else {
      res.status(403).json({ success: false, message: "Company not exist" });
    }
  } catch (err) {
    console.log(err)
    res.status(400).json(message.err);
  }
};

//------------------------ Show Holiday ------------------------
module.exports.show_Holiday = async (req, res) => {
  try {
    let { company_id, id } = req.user;
    let CompanyDetail = await ConnectionUtil(
      `select company_id from company where isActive=1 AND company_id=?`,
      company_id
    );
    if (CompanyDetail) {
      let CalendarEventDetail = await ConnectionUtil(
        `select * from calendar_Event where isType='holiday' AND isActive=1 AND company_Id='${company_id}'`
      );
      res
        .status(200)
        .json({
          success: true,
          message: "Show holiday",
          data: CalendarEventDetail,
        });
    } else {
      res.status(403).json({ success: false, message: "Company not exist" });
    }
  } catch (err) {
    res.status(400).json(message.err);
  }
};

//------------------------ Delete Holiday ------------------------
module.exports.delete_Holiday = async (req, res) => {
  try {
    let { calendarEvent_id } = req.body;
    let { company_id, id } = req.user;
    let CompanyDetail = await ConnectionUtil(
      `select company_id from company where isActive=1 AND company_id=?`,
      company_id
    );
    if (CompanyDetail) {
      //    let CompanyDetail = await ConnectionUtil(
      //   `select company_id from company where isActive=1 AND company_id=?`,
      //   company_id
      // );       
      let CalendarEventDetail = await ConnectionUtil(
        `select calendarEvent_id from calendar_Event where calendarEvent_id='${calendarEvent_id}' AND isActive=1 AND company_Id='${company_id}'`
      );
      if (CalendarEventDetail != '') {

        let deleteCalendar = await ConnectionUtil(
          `update  calendar_Event set isActive='${0}', updated_By='${id}' where isActive=1 AND company_id='${company_id}'AND calendarEvent_id='${calendarEvent_id}'`
        );
        if (deleteCalendar) {
          res.status(200).json({ success: true, message: "Event deleted successfully" });
        } else {
          res.status(403).json({ success: false, message: "Event id not match" });
        }
      } else {
        res.status(403).json({ success: false, message: "Event not exist" });
      }
    } else {
      res.status(403).json({ success: false, message: "Company not exist" });
    }
  } catch (err) {
    res.status(400).json(message.err);
  }
};



      // target_Audeince:0,
      // event_Description:"holiday",

      // event_Location:"holiday",
      // isAllday,
      // repeatType, // 0->never,1->day,2->week,3->month,4->year
      // // repeatArray,
      // event_Description:"holiday",event_Location:"holiday",repeatType:0,repeateTime:0,eventstartTime:"00:00",eventendTime:"00:00",department:0,ageFrom:0,ageTo:0,gender:0,ip_Address:"12.22.12.12"
