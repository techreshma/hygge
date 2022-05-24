const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);

// ------------------------- employeeReportBy_Salary -----------------------------------
module.exports.employeeReportBy_Salary = async (req, res) => {
  try {
    let { company_Id, start_date, end_date, page, pagination } = req.body;
    let offset = page * pagination;
    let limit = pagination;
    let { branch_Id, access } = req.query;
    let newArr = [];
    let user_Detail;
    let userDataLength = 0;

    if (access == 0) {
      user_Detail = await ConnectionUtil(
        `select CONCAT(first_name,' ',last_name) as name,department,reporting_Manager from user where isActive='1' AND company_id=${company_Id}`
      ); //LIMIT ${limit} OFFSET ${offset}`);

      user_salaryDetail = await ConnectionUtil(
        `select COALESCE(salaryBalance,'[]') as salaryBalance from user where  company_id='${company_Id}' AND branch_id='${branch_Id}'`
      );

      let userlength = await ConnectionUtil(
        `select * from user where  branch_id='${branch_Id}'AND company_id='${company_Id}'`
      );
      userDataLength = userlength.length;

      salarytype = await ConnectionUtil(
        `select salaryType_id , salary_Type from salary_type where isActive='1' AND company_Id ='${company_Id}' AND branch_Id='${branch_Id}'`
      );
    } else {
      salarytype = await ConnectionUtil(
        `select salaryType_id , salary_Type from salary_type where isActive='1' AND company_Id ='${company_Id}'`
      );
      user_Detail = await ConnectionUtil(
        `select salaryBalance,COALESCE(reporting_Manager,'no name') as reporting_Manager , COALESCE(department,'department') as department,user_id,CONCAT(COALESCE(first_name,' '),' ',COALESCE(last_name,' ')) as name,user_id,company_id from user where  company_id='${company_Id}' and isActive = 1`
      ); // LIMIT ${limit} OFFSET ${offset}`);

      user_salaryDetail = await ConnectionUtil(
        `select COALESCE(salaryBalance,'[]') as salaryBalance from user where  company_id='${company_Id}'`
      );

      let userlength = await ConnectionUtil(
        `select * from user where  company_id='${company_Id}'`
      );
      userDataLength = userlength.length;
    }

    let userSalaryRemain = [];
    for (let user of user_Detail) {
      let salaryArray = JSON.parse(user.salaryBalance);
      userSalaryRemain = await salaryBalance(salaryArray);
      user.totalSalary = userSalaryRemain;
      user.Salary = salaryArray
      if (salaryArray) {
        user.salary = salaryArray[0];          
      }else {
        user.salary = 0
      }
      newArr.push(user);
    }
    let Total_Salary = 0;
    let Avg_Salary = 0;
    for (let resp of newArr) {
      Total_Salary += resp.totalSalary;
    }

    Avg_Salary = Math.ceil(Total_Salary / userDataLength);

    let obj = {
      Total_Salary: Total_Salary,
      Avg_Salary: Avg_Salary,
      user_salary_details: newArr,
    };
    res.status(200).json({
      success: true,
      message: "salary report by employee",
      data: obj,
      length: userDataLength,
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
  if (salaryArray) {
    for (let salaryCount of salaryArray) {
      count_salary_remain += Number(Object.values(salaryCount));
      let x = Number(Object.values(salaryCount))
    }
  }
  return count_salary_remain;
}
