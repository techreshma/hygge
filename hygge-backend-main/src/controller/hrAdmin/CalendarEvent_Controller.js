const fs = require("fs");
const util = require("util");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let message = require("../../lib/helpers/message");
let moment = require("moment");
//------------------------ companyleaveType ------------------------
module.exports.addCalendarEvent = async (req, res) => {
  try {
    let {
      event_Type,
      event_StartDate,
      event_EndDate,
      target_Audeince,
      event_Description,
      fileName,
      event_Title,
      event_Location,
      isAllday,
      repeatType, // 0->never,1->day,2->week,3->month,4->year
      // repeatArray,
      repeateTime,
      eventstartTime,
      eventendTime,
      department,
      ageFrom,
      ageTo,
      gender,
      isType
    } = req.body;
    let {
      id,
      company_id
    } = req.user;
    var CompanyDetail = await ConnectionUtil(
      `select company_id from company where isActive=1 AND company_id=?`,
      company_id
    );
    if (CompanyDetail) {
      let calendarEventObj = {
        user_Id: id,
        company_Id: company_id,
        event_Type: 0,//isType == "holiday" ? 1 : 0, //event_Type,   //hrAdmin   TO check HrAdmin Entry denoted 0
        event_StartDate: event_StartDate,
        event_EndDate: event_EndDate,
        event_Title: event_Title,
        // target_Audeince: target_Audeince,
        event_Description: event_Description,
        event_Location:event_Location,
        fileName: fileName,
        created_By: id,
        updated_By: id,
        isAllday: isAllday || 0,
        isType: event_Type == 0 ? "event" : "holiday",
        repeatType: repeatType,
        // repeatArray  : JSON.stringify(repeatArray),
        repeateTime: repeateTime,
        eventstartTime: eventstartTime,
        eventendTime: eventendTime,
        department: department,
        gender: gender,
        ageFrom: ageFrom,
        ageTo: ageTo,
        remind:0
      };
      var addCalendar;
      if (repeatType == 0) {
        addCalendar = await ConnectionUtil(
          `INSERT INTO calendar_Event SET ?`,
          calendarEventObj
        );
        res.status(200).json({
          success: true,
          message: "Add calendar Event successfully",
        });
      }
      if (repeatType == 1) {
        let addCalendar = await ConnectionUtil(
          `INSERT INTO calendar_Event SET?`,
          calendarEventObj
        );
        if (addCalendar.insertId != 0) {
          let weekDate = Tday(event_StartDate, event_EndDate, repeateTime);
          for (let weekDateObj of weekDate) {
            calendarEventObj.event_StartDate = weekDateObj.startDate;
            calendarEventObj.event_EndDate = weekDateObj.enddate;
            addCalendar = await ConnectionUtil(
              `INSERT INTO calendar_Event SET ?`,
              calendarEventObj
            );
          }
          res.status(200).json({
            success: true,
            message: "Add calendar Event successfully",
          });
        } else {
          res.status(404).json({
            success: false,
            message: "something went wrong"
          });
        }
      }
      if (repeatType == 2) {
        let addCalendar = await ConnectionUtil(
          `INSERT INTO calendar_Event SET ?`,
          calendarEventObj
        );
        if (addCalendar.insertId != 0) {
          let weekDate = Tweek(event_StartDate, event_EndDate, repeateTime);
          for (let weekDateObj of weekDate) {
            calendarEventObj.event_StartDate = weekDateObj.startDate;
            calendarEventObj.event_EndDate = weekDateObj.enddate;
            addCalendar = await ConnectionUtil(
              `INSERT INTO calendar_Event SET ?`,
              calendarEventObj
            );
          }
          res.status(200).json({
            success: true,
            message: "Add calendar Event successfully",
          });
        } else {
          res.status(404).json({
            success: false,
            message: "something went wrong"
          });
        }
      }
      if (repeatType == 3) {
        let addCalendar = await ConnectionUtil(
          `INSERT INTO calendar_Event SET ?`,
          calendarEventObj
        );
        if (addCalendar.insertId != 0) {
          let weekDate = Tmonth(event_StartDate, event_EndDate, repeateTime);
          for (let weekDateObj of weekDate) {
            calendarEventObj.event_StartDate = weekDateObj.startDate;
            calendarEventObj.event_EndDate = weekDateObj.enddate;
            addCalendar = await ConnectionUtil(
              `INSERT INTO calendar_Event SET ?`,
              calendarEventObj
            );
          }
          res.status(200).json({
            success: true,
            message: "Add calendar Event successfully",
          });
        } else {
          res.status(404).json({
            success: false,
            message: "something went wrong"
          });
        }
      }
      if (repeatType == 4) {
        let addCalendar = await ConnectionUtil(
          `INSERT INTO calendar_Event SET ?`,
          calendarEventObj
        );
        if (addCalendar.insertId != 0) {
          let weekDate = Tyear(event_StartDate, event_EndDate, repeateTime);
          for (let weekDateObj of weekDate) {
            calendarEventObj.event_StartDate = weekDateObj.startDate;
            calendarEventObj.event_EndDate = weekDateObj.enddate;
            addCalendar = await ConnectionUtil(
              `INSERT INTO calendar_Event SET ?`,
              calendarEventObj
            );
          }
          res.status(200).json({
            success: true,
            message: "Add calendar Event successfully",
          });
        } else {
          res.status(404).json({
            success: false,
            message: "something went wrong"
          });
        }
      }
    } else {
      res.status(403).json({
        success: false,
        message: "Company not exist"
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(message.err);
  }
};

// ======== addCalendarEvent module help function =======
function Tweek(startDate, endDate, day) {
  let sDate = startDate;
  let eDate = endDate;
  arr = [];
  for (var i = 1; i <= day; i++) {
    sDate = moment(sDate).add(7, "days");
    eDate = moment(eDate).add(7, "days");
    arr.push({
      startDate: moment(sDate).format("YYYY-MM-DD"),
      enddate: moment(eDate).format("YYYY-MM-DD"),
    });
  }
  return arr;
}

function Tmonth(startDate, endDate, day) {
  let sDate = startDate;
  let eDate = endDate;
  arr = [];
  for (var i = 1; i <= day; i++) {
    sDate = moment(sDate).add(1, "months");
    eDate = moment(eDate).add(1, "months");
    arr.push({
      startDate: moment(sDate).format("YYYY-MM-DD"),
      enddate: moment(eDate).format("YYYY-MM-DD"),
    });
  }
  return arr;
}

function Tyear(startDate, endDate, day) {
  let sDate = startDate;
  let eDate = endDate;
  arr = [];
  for (var i = 1; i <= day; i++) {
    sDate = moment(sDate).add(1, "years");
    eDate = moment(eDate).add(1, "years");
    arr.push({
      startDate: moment(sDate).format("YYYY-MM-DD"),
      enddate: moment(eDate).format("YYYY-MM-DD"),
    });
  }
  return arr;
}

function Tday(startDate, endDate, day) {
  let sDate = startDate;
  let eDate = endDate;
  arr = [];
  for (var i = 1; i <= day; i++) {
    sDate = moment(sDate).add(1, "days");
    eDate = moment(eDate).add(1, "days");
    arr.push({
      startDate: moment(sDate).format("YYYY-MM-DD"),
      enddate: moment(eDate).format("YYYY-MM-DD"),
    });
  }
  return arr;
}

// ======= addCalendarEvent module help function =======
//
// ------------------------------------------------
module.exports.showCalendarEvent = async (req, res) => {
  try {
    let {
      company_id,
      id
    } = req.user;
    let CompanyDetail = await ConnectionUtil(
      `select company_id from company where isActive=1 AND company_id=?`,
      company_id
    );
    if (CompanyDetail != "") {
      let CalendarEventDetail = await ConnectionUtil(
        `select * from calendar_Event where (event_Type='0' OR event_Type='1') AND isActive=1 AND company_Id='${company_id}'`
      );
      res.status(200).json({
        success: true,
        message: "Show event list",
        data: CalendarEventDetail,
      });
    } else {
      res.status(403).json({
        success: false,
        message: "Company not exist"
      });
    }
  } catch (err) {
    console.log(err)
    res.status(400).json({
        success: false,
        message: err.message
    })
  }
};

module.exports.updateCalendarEvent = async (req, res) => {
  try {
    let {
      calendarEvent_id,
      event_Type,
      event_StartDate,
      event_EndDate,
      // target_Audeince,
      event_Description,
      event_Location,
      fileName,
      event_Title,
      isAllday,
      repeatType, // 0->never,1->day,2->week,3->month,4->year
      // repeatArray,
      repeateTime,
      eventstartTime,
      eventendTime,
      department,
      gender,
      ageFrom,
      ageTo,
    } = req.body;
    let {
      company_id,
      id
    } = req.user;
    let CompanyDetail = await ConnectionUtil(
      `select company_id from company where isActive=1 AND company_id=?`,
      company_id
    );
    if (CompanyDetail) {
      let CalendarEventDetail = await ConnectionUtil(
        `select calendarEvent_id from calendar_Event where calendarEvent_id='${calendarEvent_id}' AND isActive=1 AND company_Id='${company_id}'`
      );
      if (CalendarEventDetail != "") {
        // let repeating = JSON.stringify(repeatArray);
        // target_Audeince = '${target_Audeince}' ,  '${event_Type}'
        let updateCalendar = await ConnectionUtil(
          `update calendar_Event set 
          event_Type ='0',
          event_Description = '${event_Description}' , 
          event_Location  = '${event_Location}',
          fileName       = '${fileName}',
          updated_By     ='${id}', 
          isAllday       = '${isAllday}' ,
          event_Title    = '${event_Title}' ,
          event_StartDate= '${event_StartDate}',
          event_EndDate  = '${event_EndDate}',
          repeatType     = '${repeatType}',
          repeateTime    ='${repeateTime}',
          eventstartTime ='${eventstartTime}' , 
          eventendTime   ='${eventendTime}',
          department     ='${department}',
          gender         ='${gender}',
          ageFrom        ='${parseInt(ageFrom)}' , 
          ageTo          ='${parseInt(ageTo)}'
          where isActive  = 1 AND company_Id = '${company_id}' AND calendarEvent_id = '${calendarEvent_id}'`
        );
        // repeatArray     = '${repeating}'
        if (updateCalendar.affectedRows != 0) {
          res.status(200).json({
            success: true,
            message: "Calendar event update successfully",
          });
        } else {
          res
            .status(403)
            .json({
              success: false,
              message: "Calendar id not match"
            });
        }
      } else {
        res
          .status(403)
          .json({
            success: false,
            message: "Calendar event not exits"
          });
      }
    } else {
      res.status(403).json({
        success: false,
        message: "Company not exist"
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(message.err);
  }
};

module.exports.deleteCalendarEvent = async (req, res) => {
  try {
    let {
      calendarEvent_id
    } = req.body;
    let {
      company_id,
      id
    } = req.user;
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
      if (CalendarEventDetail != "") {
        let deleteCalendar = await ConnectionUtil(
          `update  calendar_Event set isActive='${0}', updated_By='${id}' where isActive=1 AND company_id='${company_id}'AND calendarEvent_id='${calendarEvent_id}'`
        );
        if (deleteCalendar) {
          res.status(200).json({
            success: true,
            message: "Calendar event delete successfully",
          });
        } else {
          res
            .status(403)
            .json({
              success: false,
              message: "Calendar event id not match"
            });
        }
      } else {
        res
          .status(403)
          .json({
            success: false,
            message: "Calendar event not exits"
          });
      }
    } else {
      res.status(403).json({
        success: false,
        message: "Company not exits"
      });
    }
  } catch (err) {
    res.status(400).json(message.err);
  }
};