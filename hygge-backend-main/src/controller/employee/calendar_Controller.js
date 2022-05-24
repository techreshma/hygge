const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let MAIL = require("../../config/email");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let bcrypt = require("bcryptjs");
let { issueJWT } = require("../../lib/helpers/jwt");
let randomToken = require("random-token");
let otp = require("../../lib/helpers/otp");
let moment = require("moment");
// ------------------------- add_Calender -----------------------------------
module.exports.add_Calender = async (req, res) => {
  try {
    let { company_id } = req.user;
    let {
      eventTitle,
      eventLocation,
      eventStartDate,
      eventEndDate,
      eventDescription,
      remind,
      repeatType,
      repeateTime,
      eventstartTime,
      eventendTime,
      ip_Address,
      companyId,
      userId,
    } = req.body;
    if (!eventTitle) {
      return res.status(404).json({
        success: false,
        message: "title is required",
      });
    }
    let calenderObj = {
      event_Title: eventTitle,
      event_Location: eventLocation,
      event_StartDate: eventStartDate.split("-").reverse().join("-"),
      event_EndDate: eventEndDate.split("-").reverse().join("-"),
      remind: remind !=null ||remind!=''||remind!=undefined?remind:'',
      repeatType: repeatType!=""?repeatType:"",
      user_Id: userId,
      company_Id: companyId,
      isType: "event",
      isAllday: 1,
      event_Description: eventDescription,
      repeateTime: repeateTime!="" ?repeateTime:"",
      ip_Address: ip_Address,
      created_By: userId,
      updated_By: userId,
      event_Type: 1, //user    //Employee   TO check User Entry denoted 1
      eventstartTime: eventstartTime,
      eventendTime: eventendTime,
    };
    let calenderInsertFindByQuery = await ConnectionUtil(
      `INSERT INTO calendar_Event SET?`,
      calenderObj
    );
    if (calenderInsertFindByQuery.insertId != 0) {
      res.status(200).json({
        success: true,
        message: "Event added successfully",
      });
    }
    else {
      res.status(404).json({
        success: false,
        message: "something went wrong",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: "something went wrong",
    });
  }
};

// ------------------------- show_Calender -----------------------------------
//0 ->day,1->week,2->month,3->all
module.exports.show_Calender = async (req, res) => {
  try {
    let { isType } = req.body;
    let { company_id, id } = req.user;
    let history=[]; 
     
    if (isType == 0) {
      let HolidayDetail = await ConnectionUtil(`select event_StartDate,event_Type,eventstartTime,event_Description,event_Title from calendar_Event where isType='holiday' AND  status='1' AND company_id ='${company_id}'`);

      let calenderDetail = await ConnectionUtil(
        `select event_StartDate,event_Type,eventstartTime,event_Description,event_Title from calendar_Event where status='1' 
        AND isActive = '1' AND ((company_id = '${company_id}' AND   Date(event_StartDate) = Date(CURDATE())) OR
        (user_Id='${id}' AND company_id ='${company_id}' AND Date(event_StartDate) = Date(CURDATE()))) AND isType='event'`
      );
      let newArr = [];
      for (let calender of calenderDetail) {
        calender.event_Type = calender.event_Type == 0 ? "By Hr" : "By Self";
        calender.userID = id
        newArr.push(calender);
      }
      return res.status(200).json({
        success: true,
        message: "Show calender list day",
        data: newArr,
        holiday:HolidayDetail
      });
    }
    if (isType == 1) {
      let HolidayDetail = await ConnectionUtil(
        `select event_StartDate,event_Type,eventstartTime,event_Description,event_Title from calendar_Event where isType='holiday' AND  status='1' AND company_id = '${company_id}'`);

      let calenderDetail = await ConnectionUtil(
        `select event_StartDate,event_Type,eventstartTime,event_Description,event_Title from calendar_Event where status='1' 
        AND isActive = '1' AND ((company_id = '${company_id}' AND   YEARWEEK(event_StartDate, 1) = YEARWEEK(CURDATE(), 1)) OR
        (user_Id='${id}' AND company_id ='${company_id}' AND YEARWEEK(event_StartDate, 1) = YEARWEEK(CURDATE(), 1))) AND isType='event'`
      );
      let newArr = [];
      for (let calender of calenderDetail) {
        calender.event_Type = calender.event_Type == 0 ? "By Hr" : "By Self";
        calender.userID = id
        newArr.push(calender);
      }
      return res.status(200).json({
        success: true,
        message: "Show calender list week",
        data: newArr,
        holiday:HolidayDetail
      });
    }
    if (isType == 2) {
      let HolidayDetail = await ConnectionUtil(`select event_StartDate,event_Type,eventstartTime,event_Description,event_Title from calendar_Event where isType='holiday' AND  status='1' AND company_id = '${company_id}'`);

      let calenderDetail = await ConnectionUtil(
        `select event_StartDate,event_Type,eventstartTime,event_Description,event_Title from calendar_Event where status='1' AND isActive = '1' AND ((company_id = '${company_id}' AND YEAR(Date(CURRENT_DATE()))<=YEAR(Date(event_StartDate)) AND Month(Date(CURRENT_DATE()))<=Month(Date(event_StartDate)))) OR (user_Id='${id}' AND company_id ='${company_id}' AND YEAR(Date(CURRENT_DATE()))<=YEAR(Date(event_StartDate)) AND Month(Date(CURRENT_DATE()))<=Month(Date(event_StartDate))) AND isType='event'`
      );
      let newArr = [];
      for (let calender of calenderDetail) {
        calender.event_Type = calender.event_Type == 0 ? "By Hr" : "By Self";
        calender.userID = id
        newArr.push(calender);
      }
      return res.status(200).json({
        success: true,
        message: "Show calender list month",
        data: newArr,
        holiday:HolidayDetail
      });
    } if(isType==3) {
      let HolidayDetail = await ConnectionUtil(
        `select event_StartDate,event_Type,eventstartTime,event_Description,event_Title from calendar_Event where  isType='holiday'  AND  status='1' AND company_id = '${company_id}'`); 


      let calenderDetail = await ConnectionUtil(
        `select event_StartDate,event_Type,eventstartTime,event_Description,event_Title from calendar_Event where status='1' AND isActive = '1' AND ((company_id = '${company_id}' AND Date(CURRENT_DATE())<=Date(event_StartDate) AND event_Type='0') OR (user_Id='${id}' AND company_id ='${company_id}' AND Date(CURRENT_DATE())<=Date(event_StartDate))) AND isType='event'`
      );
      let newArr = [];
      for (let calender of calenderDetail) {
        calender.event_Type = calender.event_Type == 0 ? "By Hr" : "By Self";
        // calender.event_StartDate=new Date(calender.event_StartDate);
        calender.userID = id
        newArr.push(calender);
      }
      
      res.status(200).json({
        success: true,
        message: "Show calender list",
        data: newArr,
        holiday:HolidayDetail
      });
    }else{
      res.status(200).json({
        success: true,
        message: "Show calender list",
        data: [],
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ------------------------- edit_Calender -----------------------------------
module.exports.edit_Calender = async (req, res) => {
  try {
    let { company_id, id } = req.user;
    let {
      eventTitle,
      eventLocation,
      eventStartDate,
      eventEndDate,
      remind,
      repeatType,
      userId,
      companyId,
      eventDescription,
      calendarEventId,
      ip_Address,
    } = req.body;
    let calenderDetail = await ConnectionUtil(
      `select * from calendar_Event where status='1' AND isActive = '1' AND user_Id='${id}'AND company_id ='${company_id}' AND calendarEvent_id='${calendarEventId}'`
    );
    let editCalenderUpdateByFnd = await ConnectionUtil(
      `update calendar_Event set
      event_Title       = '${eventTitle}',
      event_Location    = '${eventLocation}',
      event_StartDate   = '${eventStartDate}',
      event_EndDate     = '${eventEndDate}',
      remind            = '${remind}',
      repeatType        = '${repeatType}',
      user_Id           = '${userId}',
      company_Id        = '${companyId}',
      isType            = 'event',
      isAllday          =  '1',
      event_Description = '${eventDescription}', 
      ip_Address        = '${ip_Address}',
      updated_By        = '${userId}'
      where status='1' AND isActive = '1' AND user_Id='${id}'AND  company_id ='${company_id}' AND calendarEvent_id='${calendarEventId}'`
    );
    if (editCalenderUpdateByFnd) {
      res.status(200).json({
        success: true,
        message: "Update calender successfully",
        data: editCalenderUpdateByFnd,
      });
    } else {
      res.status(200).json({
        success: false,
        message: "SOme thing wrong",
        data: editCalenderUpdateByFnd,
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};
