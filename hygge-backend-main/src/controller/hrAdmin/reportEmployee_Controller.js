const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);


// ------------------------- employeeBy_Count -----------------------------------
module.exports.employeeBy_Count = async (req, res) => {
  try {
    let { company_Id } = req.body;
    let { branch_Id, access } = req.query;
    // department
    let userDetailByDeparment = await ConnectionUtil(`select department,COUNT(*) as employee from user where company_id='${company_Id}' Group By department`);
    let userDetailByGender = await ConnectionUtil(`select gender,COUNT(*) as employee from user where company_id='${company_Id}' AND gender IS NOT NULL Group By gender`);
    // nationality count
    let userDetailByNationalty = await ConnectionUtil(`select nationality,COUNT(*) as employee from user where company_id='${company_Id}' Group By nationality`);
    //marital_Status count
    let userDetailByMarital = await ConnectionUtil(`select marital_Status,COUNT(*) as employee from user where company_id='${company_Id}' Group By marital_Status`);
    //salary
    let userDetailBySalary = await ConnectionUtil(`select salaryBalance from user where company_id='${company_Id}'`);
    //Age
    let userDetailByAge = await ConnectionUtil(`select  Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0) as age from user where  company_id='${company_Id}' AND DOB IS NOT NULL`);

    let arr = [];
    for (let userSalaryDetail of userDetailBySalary) {
      if (userSalaryDetail.salaryBalance != null) {
        let userSalary = JSON.parse(userSalaryDetail.salaryBalance);
        let objUserSalary;
        if (userSalary != null) {
          objUserSalary = await userSalary.map((data) => {
            let value = Object.values(data)[0];
            return value != "" ? parseInt(value) : 0;
          });
          objUserSalary.length != 0 ? arr.push(objUserSalary.reduce((a, b) => parseInt(a) + parseInt(b), 0)) : "";
        }
      }
    }
    let newArrSalary =[];
    await arr.filter((data)=>{ if(isNaN(data)){}else{newArrSalary.push(data) } });
    let totalSalary = newArrSalary.reduce((a, b) => parseInt(a) + parseInt(b), 0);
    let salaryTotalUser = newArrSalary.length;
    let average = (totalSalary / salaryTotalUser).toFixed(2);
    let salaryOne = 0;
    let salaryTwo = 0;
    let salaryThree = 0;
    let salaryFour = 0;
    let salaryFive = 0;
    let salarySix = 0;
    let salaryAvgArr = [];
    await arr.filter((data) => {
      if (data >= 10000 && data <= 20000) {
        salaryOne = salaryOne + 1;
      }
      if (data >= 21000 && data <= 30000) {
        salaryTwo = salaryTwo + 1;
      }
      if (data >= 31000 && data <= 40000) {
        salaryThree = salaryThree + 1
      }
      if (data >= 41000 && data <= 50000) {
        salaryFour = salaryFour + 1;
      }
      if (data >= 51000 && data <= 60000) {
        salaryFive = salaryFive + 1;
      }
      if (data >= 60000) {
        salarySix = salarySix + 1;
      }
    });
    salaryAvgArr.push(
      { salary: "10k-20k", salaryEmp: salaryOne },
      { salary: "21k-30k", salaryEmp: salaryTwo },
      { salary: "31k-40k", salaryEmp: salaryThree },
      { salary: "41k-50k", salaryEmp: salaryFour },
      { salary: "50k-60k", salaryEmp: salaryFive },
      { salary: "+60k",    salaryEmp: salarySix }
    );
    let countAge = 0;
    let ageOne=0;
    let ageTwo=0;
    let ageThree=0;
    let ageFour=0;
    let ageFive=0;
    let ageSix=0;
    let ageAverageArr=[];
    let totalUserAge = userDetailByAge.length;
    await userDetailByAge.map((data)=>{ 
    countAge=countAge+data.age
      
      if(data.age>=20 && data.age<=30){
        ageOne=ageOne+1;
      }
      if(data.age>=31&& data.age<=40){
        ageTwo=ageTwo+1;
      }
      if(data.age>=41&& data.age<=50){
        ageThree=ageThree+1;
      }
      if(data.age>=51&& data.age<=60){
        ageFour=ageFour+1;
      }
      if(data.age>=61&& data.age<=70){
        ageFive=ageFive+1;
      }
      if(data.age>=70 ){
        ageSix=ageSix+1;
      }
    })
    let ageAverage = Math.trunc(countAge/totalUserAge);  
    ageAverageArr.push(
      { ageKey: "20-30", ageEmp:  ageOne },
      { ageKey: "31-40", ageEmp:  ageTwo },
      { ageKey: "41-50", ageEmp:ageThree },
      { ageKey: "51-60", ageEmp: ageFour },
      { ageKey: "61-70", ageEmp: ageFive },
      { ageKey: "+70"  , ageEmp:  ageSix })

    let obj = {
      average_ageCriteria:ageAverageArr,
      age_average:ageAverage,
      average_salaryCriteria: salaryAvgArr,
      average_salary: average,
      deparment: userDetailByDeparment,
      gender: userDetailByGender,
      nationalty: userDetailByNationalty,
      marital: userDetailByMarital
    };
    res.status(200).json({
      success: true,
      message: "Employee report",
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
