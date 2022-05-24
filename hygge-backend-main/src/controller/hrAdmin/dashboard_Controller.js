const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let { commonNotification } = require("../../lib/helpers/fcm");
const { company_WorkingDayUpdate } = require("./companyFaq_Controller");
let calcBmi = require("bmi-calc");

//------------------------ Notification_list  ------------------------
module.exports.dashboard_detail = async (req, res) => {
  try {
    let { company_Id } = req.body;
    let { branch_Id, access } = req.query;
    let newArr = [];
    let Arr = [];
    let userGenderDetail;
    let userleaveDetail;
    let userBirthdayDetail;
    let userAttendanceDetail;
    let hraRecode_pointAverage;
    let userArrivalOnTime;
    let leave_employeeToday;
    let documentUploadedToday;
    let totalRewardCountByMonth;
    let user_details = await ConnectionUtil(
      `SELECT TIME_FORMAT(working_HoursFrom, "%T") as EntryTime, user_id,company_id,isActive,status,working_HoursTo,branch_Id FROM user WHERE company_id='${company_Id}'`
    );
    if (access == 0) {
      userGenderDetail =
        await ConnectionUtil(`select COUNT(*) as count,gender from user where (gender='male' or gender='female') AND isActive='1' AND company_id='${company_Id} ' AND branch_Id ='${branch_Id}'   GROUP BY gender 
            `);
      userleaveDetail = await ConnectionUtil(
        `select CONCAT(COALESCE(U.first_name,' '),' ',COALESCE(U.last_name,' ')) as name,U.profile_picture,U.department,U.designation from  user as U JOIN  leave_details as L  ON   U.user_id= L.user_Id where  U.isActive='1' AND L.company_Id='${company_Id}' AND L.branch_Id ='${branch_Id}' AND DATE_FORMAT(CURDATE(),'%Y-%m-%d')>=DATE_FORMAT(L.leave_From, '%Y-%m-%d') AND DATE_FORMAT(CURDATE(),'%Y-%m-%d')<=DATE_FORMAT(L.leave_To, '%Y-%m-%d')`
      );

      userBirthdayDetail = await ConnectionUtil(
        `select DATE_FORMAT(DOB, '%Y-%m-%d')as birthday,CONCAT(COALESCE(first_name,' '),' ',COALESCE(last_name,' ')) as name,profile_picture,department,designation from user where isActive='1' AND company_id='${company_Id}' AND branch_Id ='${branch_Id}' AND DATE_FORMAT(CURDATE(), '%m-%d')=DATE_FORMAT(DOB,'%m-%d')`
      );

      userJoiningDetail =
        await ConnectionUtil(`select  DATE_FORMAT(employee_joiningDate, '%Y-%m-%d') as anniversary ,CONCAT(COALESCE(first_name,' '),' ',COALESCE(last_name,' ')) as name,profile_picture,department,designation from user where isActive='1' AND company_id='${company_Id}' AND  branch_Id ='${branch_Id}' AND DATE_FORMAT(employee_joiningDate, '%m-%d') =DATE_FORMAT(CURDATE(), '%m-%d') AND
            employee_joiningDate IS NOT NULL`);

      userAttendanceDetail = await ConnectionUtil(
        `select (COALESCE(SUM(total_time),0)/COALESCE(COUNT(*),0)) as totalcount from Attendance where company_id = '${company_Id}' AND branch_Id ='${branch_Id}' AND date='${new Date()
          .toISOString()
          .slice(0, 10)}' AND date IS NOT NULL`
      );

      for (let details of user_details) {
        userArrivalOnTime = await ConnectionUtil(
          `SELECT * FROM Attendance WHERE check_In<='${details.EntryTime}' AND date=CURRENT_DATE() AND company_id='${company_Id}' AND branch_Id ='${branch_Id}' GROUP BY user_Id`
        );

        if (userArrivalOnTime.length > 0) {
          Arr.push(userArrivalOnTime);
        }
      }
      //leave_employeeToday
      leave_employeeToday = await ConnectionUtil(
        `SELECT * FROM leave_details WHERE CURRENT_DATE() BETWEEN leave_From AND leave_To AND company_Id='${company_Id}' AND branch_Id='${branch_Id}' AND is_leave=1`
      );

      documentUploadedToday = await ConnectionUtil(
        `SELECT * from document_Detail WHERE DATE(created_At)=CURRENT_DATE() AND company_Id='${company_Id}' AND isActive=1 AND branch_Id = '${branch_Id}'`
      );

      totalRewardCountByMonth = await ConnectionUtil(
        `SELECT COUNT(user_Id) as totalUser, SUM(totalRewardByUser) as TotalReward,month,year FROM(select COUNT(rr.reward_Id) as totalRewardByUser,rr.user_Id, MONTHNAME(rr.redeem_Date) as month, YEAR(rr.redeem_Date) as year from reward_redeem rr JOIN user u ON rr.user_Id = u.user_id WHERE u.company_id='${company_Id}' AND u.branch_Id='${branch_Id}' GROUP BY rr.user_Id,month,year ORDER BY month,year) as C GROUP BY month,year ORDER BY month,year`
      );
      for (let data of totalRewardCountByMonth) {
        newArr.push({
          month: data.month,
          redeemCount: data.TotalReward,
        });
      }
    } else {
      userGenderDetail =
        await ConnectionUtil(`select COUNT(*) as count,gender from user where (gender='male' or gender='female') AND isActive='1' AND company_id='${company_Id}'  GROUP BY gender 
            `);
      userleaveDetail = await ConnectionUtil(
        `select CONCAT(COALESCE(U.first_name,' '),' ',COALESCE(U.last_name,' ')) as name,U.profile_picture,U.department,U.designation from  user as U JOIN  leave_details as L  ON   U.user_id= L.user_Id where U.isActive='1' AND L.company_Id='${company_Id}' AND DATE_FORMAT(CURDATE(),'%Y-%m-%d')>=DATE_FORMAT(L.leave_From, '%Y-%m-%d') AND DATE_FORMAT(CURDATE(),'%Y-%m-%d')<=DATE_FORMAT(L.leave_To, '%Y-%m-%d')`
      );

      userBirthdayDetail = await ConnectionUtil(
        ` select DATE_FORMAT(DOB, '%Y-%m-%d')as birthday,CONCAT(COALESCE(first_name,' '),' ',COALESCE(last_name,' ')) as name,profile_picture,department,designation from user where isActive='1' AND company_id='${company_Id}' AND  DATE_FORMAT(CURDATE(), '%m-%d')=DATE_FORMAT(DOB,'%m-%d')`
      );

      userJoiningDetail =
        await ConnectionUtil(`select DATE_FORMAT(employee_joiningDate, '%Y-%m-%d') as anniversary, CONCAT(COALESCE(first_name,' '),' ',COALESCE(last_name,' ')) as name,profile_picture,department,designation from user where isActive='1' AND company_id='${company_Id}' AND
            DATE_FORMAT(employee_joiningDate, '%m-%d') =DATE_FORMAT(CURDATE(), '%m-%d') AND
            employee_joiningDate IS NOT NULL`);

      //leave_employeeToday
      leave_employeeToday = await ConnectionUtil(
        `SELECT * FROM leave_details WHERE CURRENT_DATE() BETWEEN leave_From AND leave_To AND company_Id='${company_Id}' AND is_leave=1`
      );

      userAttendanceDetail = await ConnectionUtil(
        `select (COALESCE(SUM(total_time),0)/COALESCE(COUNT(*),0)) as totalcount from Attendance where company_id = '${company_Id}' AND date='${new Date()
          .toISOString()
          .slice(0, 10)}' AND date IS NOT NULL`
      );

      for (let details of user_details) {
        userArrivalOnTime = await ConnectionUtil(
          `SELECT * FROM Attendance WHERE check_In<='${details.EntryTime}' AND date=CURRENT_DATE() AND user_Id='${details.user_id}' AND company_id='${company_Id}' GROUP BY user_Id`
        );

        if (userArrivalOnTime.length > 0) {
          Arr.push(userArrivalOnTime);
        }
      }

      hraRecode_pointAverage =
        await ConnectionUtil(`select (HRQD.category) as category , SUM(UHSUBMISSION.question_Point) as avg ,UHSUBMISSION.user_Id from 
            user_hrasubmit as UHSUBMIT JOIN user_hrasubmission as UHSUBMISSION ON 
            UHSUBMIT.user_Id =UHSUBMISSION.user_Id JOIN health_Risk_Questions_Details as HRQD ON  HRQD.healthQuestions_id=UHSUBMISSION.healthQuestions_Id
            where UHSUBMIT.company_Id ='${company_Id}' group by HRQD.category ,UHSUBMISSION.user_Id`);

      documentUploadedToday = await ConnectionUtil(
        `SELECT * from document_Detail WHERE DATE(created_At)=CURRENT_DATE() AND company_Id='${company_Id}' AND isActive=1`
      );

      totalRewardCountByMonth = await ConnectionUtil(
        `SELECT COUNT(user_Id) as totalUser, SUM(totalRewardByUser) as TotalReward,month,year FROM(select COUNT(rr.reward_Id) as totalRewardByUser,rr.user_Id, MONTHNAME(rr.redeem_Date) as month, YEAR(rr.redeem_Date) as year from reward_redeem rr JOIN user u ON rr.user_Id = u.user_id WHERE u.company_id='${company_Id}' GROUP BY rr.user_Id,month,year ORDER BY month,year) as C GROUP BY month,year ORDER BY month,year`
      );
      for (let data of totalRewardCountByMonth) {
        newArr.push({
          month: data.month,
          redeemCount: data.TotalReward,
        });
      }
    }
    let on_time_arrivalCount = Arr.length > 0 ? Arr.length : 0;
    let leaveEmployeeLen =
      leave_employeeToday.length > 0 ? leave_employeeToday.length : 0;
    let documentUploadedLen =
      documentUploadedToday.length > 0 ? documentUploadedToday.length : 0;
    let val = await hraRecode(hraRecode_pointAverage);

    let activeUserArr = await ConnectionUtil (
      `SELECT * FROM user where company_id = '${company_Id}' AND isActive = 1`
    )
    let licenseArr = await ConnectionUtil (
      `SELECT * FROM company WHERE company_id = '${company_Id}'`
    )
    let obj = {
      gender: userGenderDetail,
      leave: userleaveDetail,
      birthday: userBirthdayDetail,
      anniversaries: userJoiningDetail,
      attendance: parseMillisecondsIntoReadableTime(
        userAttendanceDetail[0].totalcount
      ),
      on_time_arrival: on_time_arrivalCount,
      open_action: { leave: leaveEmployeeLen, document: documentUploadedLen },
      hra_point: {
        total: val.total,
        lifestyle: val.lifestyle,
        body: val.body,
        mind: val.mind,
      },
      redeem_reward: newArr,
      numberOfEmployee : activeUserArr.length,
      licenseRemaining : licenseArr[0].license
    };
    res.status(200).json({
      success: true,
      message: "Dashboard detail data",
      data: obj,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
// ------------ parseMillisecondsIntoReadableTime ------------
function parseMillisecondsIntoReadableTime(milliseconds) {
  //Get hours from milliseconds
  var hours = milliseconds / (1000 * 60 * 60);
  var absoluteHours = Math.floor(hours);
  var h = absoluteHours > 9 ? absoluteHours : "0" + absoluteHours;

  //Get remainder from hours and convert to minutes
  var minutes = (hours - absoluteHours) * 60;
  var absoluteMinutes = Math.floor(minutes);
  var m = absoluteMinutes > 9 ? absoluteMinutes : "0" + absoluteMinutes;

  //Get remainder from minutes and convert to seconds
  var seconds = (minutes - absoluteMinutes) * 60;
  var absoluteSeconds = Math.floor(seconds);
  var s = absoluteSeconds > 9 ? absoluteSeconds : "0" + absoluteSeconds;
  return h + "." + m;
}
// -------------- hraRecode --------------
async function hraRecode(data) {
  let userCount_body = 0;
  let userCount_mind = 0;
  let userCount_lifestyle = 0;
  let userSum_body = 0;
  let userSum_mind = 0;
  let userSum_lifestyle = 0;
  let val = await data.filter((recodeObj) => {
    if (recodeObj.category == "body") {
      userSum_body += recodeObj.avg;
      userCount_body += 1;
    }
    if (recodeObj.category == "mind") {
      userSum_mind += recodeObj.avg;
      userCount_mind += 1;
    }
    if (recodeObj.category == "lifestyle") {
      userSum_lifestyle += recodeObj.avg;
      userCount_lifestyle += 1;
    }
  });
  let tot_body = userSum_body != 0 ? userSum_body / userCount_body : 0;
  let tot_mind = userSum_mind != 0 ? userSum_mind / userCount_mind : 0;
  let tot_lifestyle =
    userSum_lifestyle != 0 ? userSum_lifestyle / userCount_lifestyle : 0;
  let totalval =
    tot_body != 0 && tot_mind != 0 && tot_lifestyle != 0
      ? (tot_body + tot_mind + tot_lifestyle) / 3
      : 0;
  let obj = {
    body: Number(tot_body.toFixed(2)),
    mind: Number(tot_mind.toFixed(2)),
    lifestyle: Number(tot_lifestyle.toFixed(2)),
    total: Number(totalval.toFixed(2)),
  };
  return obj;
}

//-------------------------------------salaryDashboard-----------------------------

module.exports.salaryManagement_DashBoard = async (req, res) => {
  try {
      let { company_Id, start_date, end_date, page, pagination } = req.body;
      let offset = page * pagination;
      let limit = pagination;
      let { branch_Id, access } = req.query;
      let newArr = [];
      let tempArr = [];
      let user_DetailByDepartment;
      let userDataLength = 0;
      let userDetail;
      
      let departmentDetail = await ConnectionUtil(`SELECT DISTINCT department FROM user WHERE company_id='${company_Id}'`);
      let salaryTypeDetail = await ConnectionUtil(`SELECT DISTINCT salary_Type from salary_type WHERE company_Id='${company_Id}' AND isActive=1`);
      for (let data of departmentDetail) {
          if (access == 0) {
              userDetail = await ConnectionUtil(
                  `select salaryBalance,COALESCE(reporting_Manager,'no name') as reporting_Manager , COALESCE(department,'department') as department,user_id,CONCAT(COALESCE(first_name,' '),' ',COALESCE(last_name,' ')) as name,user_id,company_id from user where company_id='${company_Id}' and branch_Id='${branch_Id}' and isActive = 1`
              );
              user_DetailByDepartment = await ConnectionUtil(
                  `select CONCAT(first_name,' ',last_name) as name,department,reporting_Manager from user where department='${data.department}' AND isActive='1' AND branch_Id=${branch_Id} AND company_id=${company_Id}`
              ); //LIMIT ${limit} OFFSET ${offset}`);

              let userlength = await ConnectionUtil(
                  `select * from user where  branch_id='${branch_Id}'AND company_id='${company_Id}'`
              );
              userDataLength = userlength.length;
          } else {
              userDetail = await ConnectionUtil(
                  `select salaryBalance,COALESCE(reporting_Manager,'no name') as reporting_Manager , COALESCE(department,'department') as department,user_id,CONCAT(COALESCE(first_name,' '),' ',COALESCE(last_name,' ')) as name,user_id,company_id from user where company_id='${company_Id}' and isActive = 1`
              );
              user_DetailByDepartment = await ConnectionUtil(
                  `select salaryBalance,COALESCE(reporting_Manager,'no name') as reporting_Manager , COALESCE(department,'department') as department,user_id,CONCAT(COALESCE(first_name,' '),' ',COALESCE(last_name,' ')) as name,user_id,company_id from user where department='${data.department}' AND  company_id='${company_Id}' and isActive = 1`
              ); // LIMIT ${limit} OFFSET ${offset}`);
              tempArr.push(user_DetailByDepartment);
              let userlength = await ConnectionUtil(
                  `select * from user where  company_id='${company_Id}'`
              );
              userDataLength = userlength.length;
          }
      }
      var salarySum =[];
      for(let i=0;i<salaryTypeDetail.length;i++){
          let sum =0;
          for (let userdata of userDetail){
              let usersalaryDetail = JSON.parse(userdata.salaryBalance);
              if(usersalaryDetail != null && usersalaryDetail.length>0){
                  let filteredSalaryType = usersalaryDetail.map((item) => {
                      if(Object.values(item) != '' && Object.values(item) != 'Basic Pay' && Object.values(item) != 'Accommodation ' && Object.values(item) != 'Communication'){
                          if(Object.keys(item) == salaryTypeDetail[i].salary_Type){
                              sum += Number(Object.values(item));
                          }
                      }
                  });
              }
          }

          salarySum.push({type : salaryTypeDetail[i].salary_Type,value :sum}); 
    }

      let Total_Salary = 0;
      let TotalSalaryByDepartment = [];
      for (let user of tempArr) {
          if(user.length>0){
          let salaryArray = user.map(item => JSON.parse(item.salaryBalance));
          TotalSalaryByDepartment = await salaryBalance(salaryArray);
          if(TotalSalaryByDepartment){
            user.totalSalaryByDepartment = TotalSalaryByDepartment;
          }else{
            user.totalSalaryByDepartment = 0
          } 
          if(user.length>0){
           user.department = user[0].department;
          }
          Total_Salary += TotalSalaryByDepartment ? TotalSalaryByDepartment :0;
          newArr.push(user);
         }
      }

      let percentage = 0;
      let salaryDepartmentPercentage=[];
      let salaryByDepartmentArr = [];
      for (let resp of newArr) {
        percentage = (resp.totalSalaryByDepartment/Total_Salary * 100);  
        salaryDepartmentPercentage.push({department:resp.department,percentage:percentage});
        salaryByDepartmentArr.push({department:resp.department,changeValue:resp.totalSalaryByDepartment})  
      }
      
      let obj = {  
        salaryByDepartment: salaryDepartmentPercentage,
        salaryByType: salarySum,
        changeSalaryByDepartment: salaryByDepartmentArr,
        employeesTotalSalary: Total_Salary,
        employeeSalaryDetail : []
        }

      res.status(200).json({
          success: true,
          message: "salary report by employee",
          data: obj,
      });
  } catch (err) {
      console.log(err);
      res.status(400).json({
          success: false,
          message: err.message,
      });
  }
};

async function salaryBalance(salaryArray) {
  let count_salary_remain = 0;
  for (let salaryObject of salaryArray) {
      if (salaryObject != [] && salaryObject != null) {
          for (let salaryCount of salaryObject) {
              if(Object.values(salaryCount) != '' && Object.values(salaryCount) != 'Basic Pay' && Object.values(salaryCount) != 'Accommodation ' && Object.values(salaryCount) != 'Communication'){
               count_salary_remain += Number(Object.values(salaryCount));
              }
          }
      }
  }
   return count_salary_remain;
}

//---------------------------------------HealthAndWellness_Dashboard---------------------------

module.exports.HealthAndWellness_Dashboard = async (req, res) => {
  try {
    let { company_Id } = req.body;
    let { branch_Id, access } = req.query;
    let HraScoreByUser;
    let HraScoreByCategory;
    //-------------------------------------bmi calculations --------------------------------------------
    let questionCheck = await ConnectionUtil(
      `select * from user_hrasubmission where company_Id='${company_Id}' AND status='1'`
    );
    let UserSubmitSelectQuery = await ConnectionUtil(
      `select * from user_hrasubmit where company_Id='${company_Id}' AND status='1'`
    );

    let ratioPoint = 0;
    let bmiPoint = 0;
    let bmiAge0 = 0;
    let bmiAge1 = 0;
    let bmiAge2 = 0;
    let bmiAge3 = 0;
    let bmiAge4 = 0;
    let bmiGenderM = 0;
    let bmiGenderF = 0;
    let userGender = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age , u.gender FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON (sn.user_Id = st.user_Id) JOIN view_userage va   
      ON (st.user_Id = va.user_id) JOIN user u 
      ON (st.user_Id = u.user_id)
      where st.company_Id='${company_Id}' AND healthQuestions_Id='1' AND st.status = '1' AND sn.status='1'`
    );
    let waistRatioSore = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age , u.gender FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON (sn.user_Id = st.user_Id) JOIN view_userage va   
      ON (st.user_Id = va.user_id) JOIN user u 
      ON (st.user_Id = u.user_id)
      where st.company_Id='${company_Id}' AND healthQuestions_Id='10' AND st.status = '1' AND sn.status='1'`
    );
    let hipRatioSore = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age , u.gender FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON (sn.user_Id = st.user_Id) JOIN view_userage va   
      ON (st.user_Id = va.user_id) JOIN user u 
      ON (st.user_Id = u.user_id)
      where st.company_Id='${company_Id}' AND healthQuestions_Id='11' AND st.status = '1' AND sn.status='1'`
    );
    let heightSore = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age , u.gender FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON (sn.user_Id = st.user_Id) JOIN view_userage va   
      ON (st.user_Id = va.user_id) JOIN user u 
      ON (st.user_Id = u.user_id)
      where st.company_Id='${company_Id}' AND healthQuestions_Id='8' AND st.status = '1' AND sn.status='1'`
    );
    let weightSore = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age , u.gender FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON (sn.user_Id = st.user_Id) JOIN view_userage va   
      ON (st.user_Id = va.user_id) JOIN user u 
      ON (st.user_Id = u.user_id)
      where st.company_Id='${company_Id}' AND healthQuestions_Id='9' AND st.status = '1' AND sn.status='1'`
    );

    for (let i = 0; i <= weightSore.length - 1; i++) {
      if (
        waistRatioSore.length > 0 &&
        hipRatioSore.length > 0 &&
        userGender.length > 0
      ) {
        let w = waistRatioSore[i].options;
        let h = hipRatioSore[i].options;
        let Ratio = w / h;
        let fixedNum = Ratio.toFixed(2);
        // male
        if (userGender[i].options == "Male") {
          if (fixedNum <= "0.95") {
            ratioPoint += 0;
          }
          if (fixedNum >= "0.96" && fixedNum <= "1.0") {
            ratioPoint += 3;
          }
          if (fixedNum >= "1.0") {
            ratioPoint += 4;
          }
        }
        // female
        if (userGender[i].options == "Female") {
          if (fixedNum <= "0.80") {
            ratioPoint += 0;
          }
          if (fixedNum >= "0.81" && fixedNum <= "0.85") {
            ratioPoint += 3;
          }
          if (fixedNum >= "0.86") {
            ratioPoint += 4;
          }
        }
      }
      if (heightSore.length > 0 && weightSore.length > 0) {
        let height = heightSore[i].options / 100;
        let weight = weightSore[i].options;
        let valBMI = calcBmi(weight, height);
        let totBMI = valBMI.value.toFixed(1);
        // Math.fround(totBMI) < Math.fround(18.5)
        // if( Math.fround(totBMI) <= Math.fround(18.5) ){ console.log('One'); bmiPoint=1}
        // if( Math.fround(totBMI) >=  && Math.fround(totBMI) <= ){console.log('Two'); bmiPoint=0}
        // if( Math.fround(totBMI) >=  && Math.fround(totBMI) <= ){console.log('Three'); bmiPoint=1}
        // if( Math.fround(totBMI)>=  &&  Math.fround(totBMI) <= ){console.log('Four'); bmiPoint=3}

        if (weightSore[i].gender == 'Male') {
          if (totBMI <= "18.5") {
            bmiGenderM += 1;
            
          }
          if (totBMI >= "18.5" && totBMI <= "24.9") {
            bmiGenderM += 0;
            
          }
          if (totBMI >= "25" && totBMI <= "29.9") {
            bmiGenderM += 1;
            
          }
          if (totBMI >= "30" && totBMI <= "39.9") {
            bmiGenderM += 3;            
          }
        }


        if (weightSore[i].gender == 'Female') {
          if (totBMI <= "18.5") {
            bmiGenderF += 1;
            
          }
          if (totBMI >= "18.5" && totBMI <= "24.9") {
            bmiGenderF += 0;
            
          }
          if (totBMI >= "25" && totBMI <= "29.9") {
            bmiGenderF += 1;
            
          }
          if (totBMI >= "30" && totBMI <= "39.9") {
            bmiGenderF += 3;            
          }
        }

        if (weightSore[i].age <= 20) {
          if (totBMI <= "18.5") {
            bmiAge0 += 1;
            
          }
          if (totBMI >= "18.5" && totBMI <= "24.9") {
            bmiAge0 += 0;
            
          }
          if (totBMI >= "25" && totBMI <= "29.9") {
            bmiAge0 += 1;
            
          }
          if (totBMI >= "30" && totBMI <= "39.9") {
            bmiAge0 += 3;            
          }
        }

        if (weightSore[i].age > 20 && weightSore[i].age < 35) {
          if (totBMI <= "18.5") {
            bmiAge1 += 1;
          }
          if (totBMI >= "18.5" && totBMI <= "24.9") {
            bmiAge1 += 0;
          }
          if (totBMI >= "25" && totBMI <= "29.9") {
            bmiAge1 += 1;
          }
          if (totBMI >= "30" && totBMI <= "39.9") {
            bmiAge1 += 3;
          }
        }

        if (weightSore[i].age >= 36 && weightSore[i].age < 51) {
          if (totBMI <= "18.5") {
            bmiAge2 += 1;
          }
          if (totBMI >= "18.5" && totBMI <= "24.9") {
            bmiAge2 += 0;
          }
          if (totBMI >= "25" && totBMI <= "29.9") {
            bmiAge2 += 1;
          }
          if (totBMI >= "30" && totBMI <= "39.9") {
            bmiAge2 += 3;
          }
        }

        if (weightSore[i].age >= 51 && weightSore[i].age < 65) {
          if (totBMI <= "18.5") {
            bmiAge3 += 1;
          }
          if (totBMI >= "18.5" && totBMI <= "24.9") {
            bmiAge3 += 0;
          }
          if (totBMI >= "25" && totBMI <= "29.9") {
            bmiAge3 += 1;
          }
          if (totBMI >= "30" && totBMI <= "39.9") {
            bmiAge3 += 3;
          }
        }

        if (weightSore[i].age > 65) {
          if (totBMI <= "18.5") {
            bmiAge4 += 1;
          }
          if (totBMI >= "18.5" && totBMI <= "24.9") {
            bmiAge4 += 0;
          }
          if (totBMI >= "25" && totBMI <= "29.9") {
            bmiAge4 += 1;
          }
          if (totBMI >= "30" && totBMI <= "39.9") {
            bmiAge4 += 3;
          }
        }
      }
      
    }

    bmiPoint = (bmiAge0 + bmiAge1 + bmiAge2 + bmiAge3 + bmiAge4);
      console.log(bmiPoint);
      var sum = 0;
      sum = sum + ratioPoint + bmiPoint;

    //-----------------------------------------------bmi calculations over -----------------------------------------------

    HraScoreByUser =
      await ConnectionUtil(`select UHSUBMIT.total_Score ,USER.gender,USER.DOB,TIMESTAMPDIFF(YEAR, USER.DOB, CURDATE()) AS age,UHSUBMISSION.user_Id from 
        user_hrasubmit as UHSUBMIT JOIN user_hrasubmission as UHSUBMISSION ON 
        UHSUBMIT.user_Id =UHSUBMISSION.user_Id JOIN health_Risk_Questions_Details as HRQD ON  HRQD.healthQuestions_id=UHSUBMISSION.healthQuestions_Id JOIN user as USER ON USER.user_id=UHSUBMISSION.user_Id
        where UHSUBMIT.company_Id ='${company_Id}' and UHSUBMIT.status='1' AND UHSUBMISSION.status='1' group by UHSUBMISSION.user_Id`);

    HraScoreByCategory =
      await ConnectionUtil(`select (HRQD.category) as category , SUM(UHSUBMISSION.question_Point) as avg ,UHSUBMISSION.user_Id from 
        user_hrasubmit as UHSUBMIT JOIN user_hrasubmission as UHSUBMISSION ON 
        UHSUBMIT.user_Id =UHSUBMISSION.user_Id JOIN health_Risk_Questions_Details as HRQD ON  HRQD.healthQuestions_id=UHSUBMISSION.healthQuestions_Id
        where UHSUBMIT.company_Id ='${company_Id}' and UHSUBMIT.status='1' AND UHSUBMISSION.status='1' group by HRQD.category ,UHSUBMISSION.user_Id`);

    let userByGender = await HraByGender(HraScoreByUser);

    let totalHraArr = await ConnectionUtil(
      `SELECT * FROM user_hrasubmit WHERE company_Id = ${company_Id} AND status = '1'`
    );

    //--------------------health risk analysis------------------------------
    let obesityRiskArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON 
      (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (1,2,8,9,10,11,36,29) AND st.company_Id = ${company_Id} AND sn.status='1'`
    );

    let diabetesRiskArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON 
      (sn.user_Id = st.user_Id)
       WHERE healthQuestions_Id IN (1,2,8,9,10,11,16,13,22,36,32) AND st.company_Id = ${company_Id} AND sn.status='1'`
    );

    let cardiovascularRiskArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON 
      (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (1,2,8,9,13,14,15,16,21,38,36,32,35) AND st.company_Id = ${company_Id} AND sn.status='1'`
    );

    let mentalWellbeingOverallRiskArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON 
      (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (47,48,50,54,55,56,57,58) AND st.company_Id = ${company_Id} AND sn.status='1'`
    );

    let motivationAndProductivityRiskArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON 
      (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (25,26,28,40,50,51,55) AND st.company_Id = ${company_Id} AND sn.status='1'`
    );

    let occupationalHealthRiskArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON 
      (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (25,26,27,28,36) AND st.company_Id = ${company_Id} AND sn.status='1'`
    );

    let obesityRisk = 0;
    let diabetesRisk = 0;
    let cardiovascularRisk = 0;
    let mentalWellbeingOverallRisk = 0;
    let motivarionAndProductivityRisk = 0;
    let occupationalHealthRisk = 0;

    for (let resp of obesityRiskArr) {
      obesityRisk += resp.question_Point;
    }
    for (let resp of diabetesRiskArr) {
      diabetesRisk += resp.question_Point;
    }
    for (let resp of cardiovascularRiskArr) {
      cardiovascularRisk += resp.question_Point;
    }
    for (let resp of mentalWellbeingOverallRiskArr) {
      mentalWellbeingOverallRisk += resp.question_Point;
    }
    for (let resp of motivationAndProductivityRiskArr) {
      motivarionAndProductivityRisk += resp.question_Point;
    }
    for (let resp of occupationalHealthRiskArr) {
      occupationalHealthRisk += resp.question_Point;
    }

    let obesityRiskPercentage = Math.round(
      (obesityRisk / (14 * totalHraArr.length)) * 100
    );
    let diabetesRiskPercentage = Math.round(
      (diabetesRisk / (32 * totalHraArr.length)) * 100
    );
    let cardiovascularRiskPercentage = Math.round(
      (cardiovascularRisk / (44 * totalHraArr.length)) * 100
    );
    let mentalWellbeingOverallRiskPercentage = Math.round(
      (mentalWellbeingOverallRisk / (16.5 * totalHraArr.length)) * 100
    );
    let motivarionAndProductivityRiskPercentage = Math.round(
      (motivarionAndProductivityRisk / (9.5 * totalHraArr.length)) * 100
    );
    let occupationalHealthRiskPercentage = Math.round(
      (occupationalHealthRisk / (12 * totalHraArr.length)) * 100
    );
    //----------------------------------------risk Analysis over ---------------------------------------------------

    //----------------------------------------segmentWise Calculations ---------------------------------------------

    let personalArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
  ON 
  (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (1,2,3,4,5,6,7) AND st.company_Id = ${company_Id} AND sn.status='1'`
    );
    let BiometricsArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
  ON 
  (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (8,9,10,11) AND st.company_Id = ${company_Id} AND sn.status='1'`
    );
    let clinicalHistoryArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
  ON 
  (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (12,13,14,15,16,17) AND st.company_Id =  ${company_Id} AND sn.status='1'`
    );
    let screeningArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
  ON 
  (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (18,19) AND st.company_Id = ${company_Id} AND sn.status='1'`
    );
    let familyHistoryArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
  ON 
  (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (21,22) AND st.company_Id = ${company_Id} AND sn.status='1'`
    );
    let occupationalHistoryArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
  ON 
  (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (23,24,25,26,27,28) AND st.company_Id = ${company_Id} AND sn.status='1'`
    );
    let dietArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
  ON 
  (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (29,30,31,32,33,34,35) AND st.company_Id = ${company_Id} AND sn.status='1'`
    );
    let physicalActivityArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
  ON 
  (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (36,37) AND st.company_Id = ${company_Id} AND sn.status='1'`
    );
    let tobaccoArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
  ON 
  (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (38,39) AND st.company_Id = ${company_Id} AND sn.status='1'`
    );
    let sleepArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
  ON 
  (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (40,41,42,43) AND st.company_Id = ${company_Id} AND sn.status='1'`
    );
    let bevergesArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
  ON 
  (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (44,45,46) AND st.company_Id = ${company_Id} AND sn.status='1'`
    );
    let stressAndMentalWellbeingArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
  ON 
  (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (47,48,49,50,51,52,53,54,55,56,57,58) AND st.company_Id = ${company_Id} AND sn.status='1'`
    );
    let readinessAssessmentArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
  ON 
  (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (59,60,61) AND st.company_Id = ${company_Id} AND sn.status='1'`
    );

    let personal = 0;
    let Biometrics = 0;
    let clinicalHistory = 0;
    let screening = 0;
    let familyHistory = 0;
    let occupationalHistory = 0;
    let diet = 0;
    let physicalActivity = 0;
    let sleep = 0;
    let tobacco = 0;
    let beverges = 0;
    let stressAndMentalWellbeing = 0;
    let readinessAssessment = 0;

    let personalTotal = 5;
    let BiometricsTotal = 7;
    let clinicalHistoryTotal = 26;
    let screeningTotal = 2;
    let familyHistoryTotal = 5;
    let occupationalHistoryTotal = 12;
    let dietTotal = 12;
    let physicalActivityTotal = 3;
    let tobaccoTotal = 4;
    let sleepTotal = 6;
    let bevergesTotal = 5;
    let stressAndMentalWellbeingTotal = 16.5;
    let readinessAssessmentTotal;

    for (let resp of personalArr) {
      personal += resp.question_Point;
    }
    for (let resp of BiometricsArr) {
      Biometrics += resp.question_Point;
    }
    for (let resp of clinicalHistoryArr) {
      clinicalHistory += resp.question_Point;
    }
    for (let resp of screeningArr) {
      screening += resp.question_Point;
    }
    for (let resp of familyHistoryArr) {
      familyHistory += resp.question_Point;
    }
    for (let resp of occupationalHistoryArr) {
      occupationalHistory += resp.question_Point;
    }
    for (let resp of dietArr) {
      diet += resp.question_Point;
    }
    for (let resp of physicalActivityArr) {
      physicalActivity += resp.question_Point;
    }
    for (let resp of tobaccoArr) {
      tobacco += resp.question_Point;
    }
    for (let resp of sleepArr) {
      sleep += resp.question_Point;
    }
    for (let resp of bevergesArr) {
      beverges += resp.question_Point;
    }
    for (let resp of stressAndMentalWellbeingArr) {
      stressAndMentalWellbeing += resp.question_Point;
    }
    for (let resp of readinessAssessmentArr) {
      readinessAssessment += resp.question_Point;
    }

    personal += ratioPoint;
    Biometrics += bmiPoint;

    let personalPercentage = Math.round(
      (personal / (personalTotal * totalHraArr.length)) * 100
    );
    let BiometricsPercentage = Math.round(
      (Biometrics / (BiometricsTotal * totalHraArr.length)) * 100
    );
    let clinicalHistoryPercentage = Math.round(
      (clinicalHistory / (clinicalHistoryTotal * totalHraArr.length)) * 100
    );
    let screeningPercentage = Math.round(
      (screening / (screeningTotal * totalHraArr.length)) * 100
    );
    let familyHistoryPercentage = Math.round(
      (familyHistory / (familyHistoryTotal * totalHraArr.length)) * 100
    );
    let occupationalHistoryPercentage = Math.round(
      (occupationalHistory / (occupationalHistoryTotal * totalHraArr.length)) *
        100
    );
    let dietPercentage = Math.round(
      (diet / (dietTotal * totalHraArr.length)) * 100
    );
    let physicalActivityPercentage = Math.round(
      (physicalActivity / (physicalActivityTotal * totalHraArr.length)) * 100
    );
    let tobaccoPercentage = Math.round(
      (tobacco / (tobaccoTotal * totalHraArr.length)) * 100
    );
    let sleepPercentage = Math.round(
      (sleep / (sleepTotal * totalHraArr.length)) * 100
    );
    let bevergesPercentage = Math.round(
      (beverges / (bevergesTotal * totalHraArr.length)) * 100
    );
    let stressAndMentalWellbeingPercentage = Math.round(
      (stressAndMentalWellbeing /
        (stressAndMentalWellbeingTotal * totalHraArr.length)) *
        100
    );

    //-------------------------------------------segment wise calculation over -------------------------------------


    //-------------------------------------------user wellness count ----------------------------------------------
    let tempArrHigh = [];
    let tempArrMid = [];
    let tempArrLow = [];

    totalHraArr.map((data) => {
      if (data.total_Score <= 49) {
        tempArrHigh.push(data.user_Id);
      } else if (data.total_Score >= 50 && data.total_Score <= 79) {
        tempArrMid.push(data.user_Id);
      } else {
        tempArrLow.push(data.user_Id);
      }
    });

    let userWellnessHighCount = Math.round(
      (tempArrHigh.length / totalHraArr.length) * 100
    );
    let userWellnessMidCount = Math.round(
      (tempArrMid.length / totalHraArr.length) * 100
    );
    let userWellnessLowCount = Math.round(
      (tempArrLow.length / totalHraArr.length) * 100
    );

    // console.log(userWellnessHighCount)
    // console.log(userWellnessMidCount);
    // console.log(userWellnessLowCount);

    //---------------------------------------------user wellness count over ---------------------------------------------

    
//------------------------------------------------hra improvement calculations -----------------------------------------
    let totalUserOldArr = await ConnectionUtil(
      `SELECT DISTINCT(user_Id) FROM user_hrasubmit WHERE status = '0' AND company_Id = ${company_Id}  ORDER BY created_At DESC `
    );

    var totalHraOldArr;
    var totalHraNewArr;

    let totalHraOld = 0;
    let totalHraNew = 0;
    let averageHrascore_improvment;
    if (totalUserOldArr.length > 0) {
      for (let data of totalUserOldArr) {
        totalHraOldArr = await ConnectionUtil(
          `SELECT * FROM user_hrasubmit WHERE status = '0' AND company_Id = ${company_Id} AND user_Id = ${data.user_Id}  ORDER BY created_At DESC LIMIT 1`
        );
        // console.log(totalHraOldArr , "totalhraOldArr")
        totalHraOld += totalHraOldArr[0].total_Score;
        totalHraNewArr = await ConnectionUtil(
          `SELECT * FROM user_hrasubmit WHERE status = '1' AND company_Id = ${company_Id} AND user_Id = ${data.user_Id}  ORDER BY created_At DESC LIMIT 1`
        );
        totalHraNew += totalHraNewArr[0].total_Score;
      }

      totalOld = Math.round(
        (totalHraOld / (totalUserOldArr.length * 100)) * 100
      );
      totalNew = Math.round(
        (totalHraNew / (totalUserOldArr.length * 100)) * 100
      );

      averageHrascore_improvment = Math.round(
        ((totalNew - totalOld) / totalOld) * 100
      );
    } else {
      averageHrascore_improvment = "--";
    }

    //-----------------------------hra improvement calculation over -------------------------------------------------
    
    // console.log(totalHraOldArr , "totalHraOldArr")

    let totalHra = 0;
    totalHraArr.map((data) => {
      totalHra += Number(data.total_Score);
    });

    // let totalHraOld = 0;
    // totalHraOldArr.map((data) => {
    //   totalHraOld += Number(data.total_Score);
    // });

    let lifestyleArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
  ON 
  (sn.user_Id = st.user_Id)
  WHERE sn.healthQuestions_Id IN (29,30,31,32,33,34,35,36,37,38,39,40,40,41,42,43,44,45, 46) AND sn.company_Id = ${company_Id} AND st.status = 1 AND sn.status='1'`
    );

    let lifestyle = 0;
    lifestyleArr.map((data) => {
      lifestyle += Number(data.question_Point);
    });

    let mindArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
  ON 
  (sn.user_Id = st.user_Id)
  WHERE sn.healthQuestions_Id IN (47,48,49,50,51,52,53,54,55,56,57,58,59,60,61) AND sn.company_Id = ${company_Id} AND st.status = 1 AND sn.status='1'`
    );

    let mind = 0;
    mindArr.map((data) => {
      mind += Number(data.question_Point);
    });

    let bodyArr = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
  ON 
  (sn.user_Id = st.user_Id)
  WHERE sn.healthQuestions_Id IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,21,22,23,24,25,26,27,28) AND sn.company_Id = ${company_Id} AND st.status = 1 AND sn.status='1'`
    );

    let body = 0;
    bodyArr.map((data) => {
      body += Number(data.question_Point);
    });
    body += sum;

    let total = Math.round((totalHra / totalHraArr.length / 100) * 100);
    let lifestyleData = Math.ceil((lifestyle / totalHraArr.length / 30) * 100);
    let bodyData = Math.ceil((body / totalHraArr.length / 51) * 100);
    let mindData = Math.ceil((mind / totalHraArr.length / 19) * 100);
    let empParticipanting_program = totalHraArr.length;

    let obj = {
      userwellness_distribution: [
        { count: userWellnessHighCount, name: "High" },
        { count: userWellnessMidCount, name: "Medium" },
        { count: userWellnessLowCount, name: "Low" },
      ],
      responded_gender: [
        { count: userByGender.male_User, name: "Male" },
        { count: userByGender.female_User, name: "Female" },
      ],

      hra_point: {
        total, //avgHraScore,
        lifestyle: lifestyleData, //hraByCategory.lifestyle,
        body: bodyData, //hraByCategory.body,
        mind: mindData, //hraByCategory.mind,
      },
      averageHrascore_improvment,
      empParticipanting_program,
      agreegatedRisk: [
        { score: diabetesRiskPercentage, name: "Diabetic" },
        { score: cardiovascularRiskPercentage, name: "Heart" },
        { score: obesityRiskPercentage, name: "Obesity" },
        { score: occupationalHealthRiskPercentage, name: "Occupational" },
        {
          score: mentalWellbeingOverallRiskPercentage,
          name: "Mental Wellbeing",
        },
      ],
      agreegatedCategories: [
        { score: personalPercentage, name: "personal" },
        { score: BiometricsPercentage, name: "Biometrics" },
        { score: clinicalHistoryPercentage, name: "Clinical History" },
        { score: screeningPercentage, name: "Screening" },
        { score: familyHistoryPercentage, name: "Family History" },
        { score: occupationalHistoryPercentage, name: "Occupational History" },
        { score: dietPercentage, name: "Lifestyle Diet" },
        { score: physicalActivityPercentage, name: "Physical Activity" },
        { score: tobaccoPercentage, name: "Tobacco" },
        { score: sleepPercentage, name: "Sleep" },
        { score: bevergesPercentage, name: "Alcohol" },
        { score: stressAndMentalWellbeingPercentage, name: "Mental WellBeing" },
      ],
      bmiAge: [
        { name: "20 - 35", value: bmiAge1 },
        { name: "36 - 50", value: bmiAge2 },
        { name: "51 - 65", value: bmiAge3 },
        { name: "65+", value: bmiAge4 },
      ],
      bmiGender: [
        { gender: "Male", value: bmiGenderM },
        { gender: "Female", value: bmiGenderF },
      ],
      employeeReadiness: [
        {
          type: "underweight",
          number: 20,
        },
        {
          type: "normal",
          number: 50,
        },
        {
          type: "overweight",
          number: 72,
        },
        {
          type: "obese",
          number: 88,
        },
        {
          type: "mobidyobese",
          number: 84,
        },
      ],
    };
    res.status(200).json({
      success: true,
      message: "Health & Wellness detail data",
      data: obj,
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

async function HraScore(data) {
  let Total_userSum = 0;
  let Total_userCount = 0;
  let val = await data.filter((scoreObj) => {
    if (scoreObj.total_Score != null && scoreObj.total_Score != "") {
      Total_userSum += scoreObj.total_Score;
      Total_userCount += 1;
    }
  });
  let avg_score = Total_userSum != 0 ? Total_userSum / Total_userCount : 0;
  let avgHraScore = Number(avg_score.toFixed(2));
  return avgHraScore;
}
async function HraByGender(data) {
  let totalUserCount = 0;
  let maleUserCount = 0;
  let femaleUserCount = 0;
  let val = await data.filter((userObj) => {
    if (userObj.gender != null && userObj.gender != "") {
      totalUserCount += 1;
      if (userObj.gender == "Male") {
        maleUserCount += 1;
      }
      if (userObj.gender == "Female") {
        femaleUserCount += 1;
      }
    }
  });
  let maleUserPercentage = (maleUserCount / totalUserCount) * 100;
  let femaleUserPercentage = (femaleUserCount / totalUserCount) * 100;

  let obj = {
    total_User: Number(totalUserCount),
    male_User: Number(maleUserPercentage.toFixed(2)),
    female_User: Number(femaleUserPercentage.toFixed(2)),
  };
  return obj;
}
async function HraRecord(data) {
  let userCount_body = 0;
  let userCount_mind = 0;
  let userCount_lifestyle = 0;
  let userSum_body = 0;
  let userSum_mind = 0;
  let userSum_lifestyle = 0;
  let val = await data.filter((recodeObj) => {
    if (recodeObj.category == "body") {
      userSum_body += recodeObj.avg;
      userCount_body += 1;
    }
    if (recodeObj.category == "mind") {
      userSum_mind += recodeObj.avg;
      userCount_mind += 1;
    }
    if (recodeObj.category == "lifestyle") {
      userSum_lifestyle += recodeObj.avg;
      userCount_lifestyle += 1;
    }
  });
  let tot_body = userSum_body != 0 ? userSum_body / userCount_body : 0;
  let tot_mind = userSum_mind != 0 ? userSum_mind / userCount_mind : 0;
  let tot_lifestyle =
    userSum_lifestyle != 0 ? userSum_lifestyle / userCount_lifestyle : 0;
  let obj = {
    body: Number(tot_body.toFixed(2)),
    mind: Number(tot_mind.toFixed(2)),
    lifestyle: Number(tot_lifestyle.toFixed(2)),
  };
  return obj;
}
