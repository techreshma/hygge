const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let moment = require("moment");

// ------------------------- employeeBy_Attendance -----------------------------------
module.exports.employeeBy_Attendance = async (req, res) => {
  try {
    let { company_Id, start_date, end_date } = req.body;
    let { branch_Id, access } = req.query;
    let day = 365;
    let companyDetail = await ConnectionUtil(`select workingDay from company where company_id='${company_Id}'`);
    let holiday = await ConnectionUtil(`select * from calendar_Event where isType='holiday' AND isActive=1 AND company_Id='${company_Id}'`);
    let companyWorkingDay_arr = JSON.parse(companyDetail[0].workingDay);
    let first_saturday = !companyWorkingDay_arr[6].OnOff ? 0 : 26;
    let second_saturday = !companyWorkingDay_arr[7].OnOff ? 0 : 26;
    let totalDay_weekend = first_saturday + second_saturday + holiday.length + 52;
    let workingDayTota = day - totalDay_weekend;
    let userArr = [];
    let lateHours=0;
    let lateDays=0;
    let workHour=0;
    let TotalHourWork=0;
    let userDetail;
    if(access==0){
      userDetail = await ConnectionUtil(`SELECT * from user where   company_id='${company_Id}' AND isActive =1 AND role!=1 AND  branch_id='${branch_Id}'`);
    }else{
      userDetail = await ConnectionUtil(`SELECT * from user where   isActive =1 AND role!=1 AND company_id='${company_Id}'`);
    } 
    for (let user of userDetail) {

      let workHome = user.working_HoursFrom;
      let userAttendanceDetail = await ConnectionUtil(`SELECT t1.date,t1.check_In,t1.user_Id
      FROM Attendance t1
      WHERE t1.check_In = (SELECT MIN(t2.check_In) FROM Attendance t2 WHERE t2.date =t1.date AND t2.user_Id = t1.user_Id AND 
      DATE_FORMAT(date,  '%Y-%m-%d') >='${start_date}'  AND DATE_FORMAT(date, '%Y-%m-%d') <='${end_date}'  AND t2.check_In>'${workHome}' AND user_id='${user.user_id}')`);

      let userleaveDetail = await ConnectionUtil(`SELECT *
      FROM  leave_details where  DATE_FORMAT(leave_From, '%Y-%m-%d') >='${start_date}' AND DATE_FORMAT(leave_From, '%Y-%m-%d') <='${end_date}' AND is_leave ='1' AND user_id='${user.user_id}'`);

      let objHour = await ConnectionUtil(`select HOUR(TIMEDIFF( concat(date, ' ', check_Out),concat(date, ' ', check_In))) as hour FROM Attendance where user_Id='${user.user_id}'`);
      let totalHour = 0
      objHour.forEach(element => {
        if (element.hour) {
          
          totalHour += element.hour
        }
      });
        
      let totalHourUser = await ConnectionUtil(`select HOUR(TIMEDIFF( concat('2021-07-01', ' ', working_HoursFrom),concat('2021-07-01', ' ', working_HoursTo))) as hour from user where user_Id='${user.user_id}'`);
     

    var start = moment(start_date),
    end   = moment(end_date), 
    days   = 0;                
    var result = [];
    var current = start.clone();
    while (current.day(7 + days).isBefore(end)) {
    result.push(current.clone());
    }
    result.map(m => m.format('llll'))

    dayS   = 6;             
    var resultS = [];
    var currentS = start.clone();
    while (currentS.day(7 + dayS).isBefore(end)) {
    resultS.push(currentS.clone());
    }
    resultS.map(m => m.format('llll'))

    let fs = !companyWorkingDay_arr[6].OnOff ? 0 : resultS.length/2;
    let ss = !companyWorkingDay_arr[7].OnOff ? 0 : resultS.length/2;

    // https://stackoverflow.com/questions/29745873/hour-difference-between-two-timeshhmmss-ain-momentjs
    let time = 0
    userAttendanceDetail.forEach(item => {
      let hours = moment(item.check_In, "HH:mm:ss").diff(moment(user.working_HoursFrom+':00', "HH:mm:ss"),'hours');
     time +=  hours;
    //  return time
    //  +':'+moment.utc(moment(item.check_In, "HH:mm:ss").diff(moment(user.working_HoursFrom+':00', "HH:mm:ss"))).format("mm"))
    })
    lateHours += time
    lateDays += userAttendanceDetail.length;

    let workHourTot = totalHourUser[0].hour?(totalHourUser[0].hour * (end.diff(start, 'days'))) - ((resultS.length - (fs + ss)) + result.length):0;
    workHour+=workHourTot;
    let diffHour = workHourTot-totalHour;
    TotalHourWork +=totalHour; 
    let obj = {
        lateCount: userAttendanceDetail.length,
        department: user.department,
        report_manager: user.reporting_Manager,
        name: user.first_name + '' + user.last_name,
        leaveCount: userleaveDetail.length != 0 ? userleaveDetail.length : 0,
        userID: user.user_id,
        total_hour: totalHour,
        total_work_hour:workHourTot,
        diff_hour:diffHour
      }
      userArr.push(obj);

    }

    let obj = {
      attendance_detail: userArr,
      man_day: workingDayTota,
      late_hour: lateHours,
      work_hour: workHour,
      leave_day: totalDay_weekend,
      late_occurrence: lateDays,
      total_hour_work: TotalHourWork
    };
    res.status(200).json({
      success: true,
      message: "Attendance by employee",
      data: obj
    });
  } catch (err) {
    console.log(err)
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

