const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let message = require("../../lib/helpers/message");
let moment = require("moment");
let nodemailer = require("nodemailer");
const { sign } = require("jsonwebtoken");

//-------------------------Add_Salary-------------------------
module.exports.add_PaySlip = async (req, res) => {
  try {
    let {
      userId,
      userDetail,
      userEarning,
      userDeduction,
      paySlipId,
      netSalary,
      salaryDate,
      department,
      ip_Address,
      companyId,
      departmentID,
      paySlipImage,
    } = req.body;
    let { id, company_id } = req.user;
    let { branch_Id, access } = req.query;
    let dates = new Date();
    var currentMonth = await ConnectionUtil(`SELECT salary_id  as current  
    FROM salary_Detail WHERE user_Id='${userId}' AND  Year(DATE(salaryDate)) = Year(DATE(CURRENT_DATE))  AND  Month(DATE(salaryDate))=Month(DATE(CURRENT_DATE)) `);
    if (currentMonth == "") {
      let paySlipObj = {
        user_Id: userId,
        userDetail: JSON.stringify(userDetail),
        userEarning: JSON.stringify(userEarning),
        userDeduction: JSON.stringify(userDeduction),
        paySlipId: paySlipId,
        netSalary: netSalary,
        salaryDate: moment(dates).format("YYYY-MM-DD 00:00:00"), // salaryDate,
        department: department,
        ip_Address: ip_Address,
        company_Id: companyId,
        created_By: id,
        updated_By: id,
        departmentID: departmentID,
        paySlip_Image: paySlipImage,
        branch_Id: branch_Id
      };
      let salaryDetailInsertQueryFind = await ConnectionUtil(
        `INSERT INTO salary_Detail SET?`,
        paySlipObj
      );
      res.status(200).json({
        success: true,
        message: "PaySlip added successfully",
        data: salaryDetailInsertQueryFind,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "PaySlip already exist",
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

//-------------------------------------Show_Salary--------------------------------------
module.exports.show_LastPaySlipId = async (req, res) => {
  try {
    let { company_id } = req.user;
    let { branch_Id, access } = req.query;
    var salaryDetail = await ConnectionUtil(
      `select paySlipId from salary_Detail where isActive='1' AND company_Id ='${company_id}'  ORDER BY salary_id DESC `
    );
    let paySlipID = salaryDetail != "" ? salaryDetail[0].paySlipId : 0;
    res.status(200).json({
      success: true,
      message: "Show payslip detail",
      data: paySlipID,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Something went wrong ",
    });
  }
};

//-------------------------------------Show_Salary--------------------------------------
module.exports.sendPaySlipByEmail = async (req, res) => {
  try {
    let { isType, userID, currentMonth } = req.body;
    let { company_id } = req.user;
    var salaryDetail = await ConnectionUtil(
      `select paySlip_Image from salary_Detail where isActive='1' AND user_Id='${userID}' AND MONTH(salaryDate) = '${currentMonth}' AND company_Id ='${company_id}'  ORDER BY salary_id DESC `
    );
    if (salaryDetail != "") {
      if (isType == 1) {
        if (salaryDetail[0].paySlip_Image != "") {
          var userEmail = await ConnectionUtil(`select email from user where isActive='1' AND user_id='${userID}'`);
          let transporter = await nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
              user: process.env.EMAIL,
              pass: process.env.PASSWORD,
            },
          });
          let info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: userEmail[0].email,//"khadkodkar@gmail.com",
            subject: "PaySlip Generate ✔",
            //   text: "Hello world ✔",
            html: `<b>PaySlip </b>`,
            attachments: [
              {
                filename: "payslip.png",
                contentType: "image/png",
                content: new Buffer.from(
                  salaryDetail[0].paySlip_Image.split("base64,")[1],
                  "base64"
                ),
              },
            ],
          });
          var mailSend = await transporter.sendMail(info);
          res.status(200).json({
            success: true,
            message: "Salary slip has been sent to employee",//"PaySlip send on email successfully",
            data: mailSend,
          });
        } else {
          res.status(404).json({
            success: false,
            message: "something went wrong",
          });
        }
      } else {
        res.status(200).json({
          success: true,
          message: "Payslip user detail",
          data: salaryDetail,
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "Payslip not found",
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
//------------------------------------- showDeparmentSalary ---------------------------

module.exports.show_DepartmentSalary = async (req, res) => {
  try {
    let { company_id } = req.user;
    let { branch_Id, access } = req.query;
    let current;
    let old;
    if (access == 0) {
      current = await ConnectionUtil(`SELECT 
      salary_id,
      company_Id,
      user_Id,
      paySlipId,
      SUM(netSalary) as  netSalary ,
      salaryDate,
      department,
      Month(DATE(CURRENT_DATE))  as current  
      FROM salary_Detail WHERE branch_Id = '${branch_Id}' AND Month(DATE(salaryDate))=Month(DATE(CURRENT_DATE)) AND company_Id='${company_id}' GROUP BY department`);

      old = await ConnectionUtil(`SELECT 
       salary_id,
      company_Id,
      user_Id,
      paySlipId,
      SUM(netSalary) as  netSalary,
      salaryDate,
      department,
      Month(date_sub(current_date, INTERVAL 1 MONTH)) as old
      FROM salary_Detail where branch_Id = '${branch_Id}' AND Month ( DATE(salaryDate))= Month(date_sub(current_date, INTERVAL 1 MONTH)) AND company_Id='${company_id}'
      GROUP BY department`);
    } else {
      current = await ConnectionUtil(`SELECT 
      salary_id,
      company_Id,
      user_Id,
      paySlipId,
      SUM(netSalary) as  netSalary ,
      salaryDate,
      department,
      Month(DATE(CURRENT_DATE))  as current  
      FROM salary_Detail WHERE Month(DATE(salaryDate))=Month(DATE(CURRENT_DATE)) AND company_Id='${company_id}' GROUP BY department`);

      old = await ConnectionUtil(`SELECT 
      salary_id,
      company_Id,
      user_Id,
      paySlipId,
      SUM(netSalary) as  netSalary,
      salaryDate,
      department,
      Month(date_sub(current_date, INTERVAL 1 MONTH)) as old
      FROM salary_Detail where Month ( DATE(salaryDate))= Month(date_sub(current_date, INTERVAL 1 MONTH)) AND company_Id='${company_id}' GROUP BY department`);
    }

    if (current != "" && old != "") {
      let GraphArrnew = [];
      await current.filter((Currentdata) => {
        old.filter((Olddata) => {
          if (Currentdata.department == Olddata.department) {
            let p = Olddata.netSalary;
            let c = Currentdata.netSalary;
            let differ;
            differ = c - p;
            let prefixSing = differ.toString();
            let totalCountpercent = (Math.abs(differ) / p) * 100;
            GraphArrnew.push({
              percent: totalCountpercent.toFixed(2),
              current: Currentdata.netSalary,
              department: Currentdata.department,
              sign: prefixSing[0] == "-" ? "-" : "+",
            });
          }
        });
      });
      res.status(200).json({
        success: true,
        message: "Department salary avaerage percent",
        total: [
          {
            percent: "0.00",
            total: "0",
            department: "All",
            sign: "+",
          },
        ],
        data: GraphArrnew,
      });
    } else {
      let GraphArrnew = [];
      let value = 0;
      await current.filter((Currentdata) => {
        let c = Currentdata.netSalary;
        value = c + value;
        GraphArrnew.push({
          percent: "0.00",
          current: Currentdata.netSalary,
          department: Currentdata.department,
          sign: "+",
        });
      });
      res.status(200).json({
        success: true,
        message: "Department salary avaerage percent",
        total: [
          {
            percent: "0.00",
            total: value,
            department: "All",
            sign: "+",
          },
        ],
        data: GraphArrnew,
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

//------------------------------------- showPaySliptemplate -----------------------------
module.exports.show_PaySliptemplate = async (req, res) => {
  try {
    let { isType, companyId, salary_TemplateID } = req.body;
    if (isType == 1) {
      var companyDetail = await ConnectionUtil(
        `SELECT salary_TemplateID FROM company WHERE company_id='${companyId}'`
      );
      res.status(200).json({
        success: true,
        message: "show template",
        data: companyDetail[0].salary_TemplateID,
      });
    } else {
      var companyUpdateByfind = await ConnectionUtil(
        `update company set salary_TemplateID='${salary_TemplateID}' where company_id='${companyId}'`
      );
      res.status(200).json({
        success: true,
        message: "Update template successfully",
        data: companyUpdateByfind,
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

//------------------------------------- showPaySlipReport -----------------------------
module.exports.show_PaySlipReport = async (req, res) => {
  try {
    //current YEAR
    //isType->month,halfYear,year
    let { companyId, isType } = req.body;
    let { branch_Id, access } = req.query;
    if (isType == "month") {
      let salaryDetail_month;
      if (access == 0) {
        salaryDetail_month = await ConnectionUtil(`select salary_id , company_Id , user_Id , userDetail , userEarning , userDeduction , paySlipId , netSalary , salaryDate , department from salary_Detail where date(salaryDate) >= date_sub(now(), interval 1 MONTH) AND company_Id = '${companyId}' AND branch_Id='${branch_Id}'`);
      } else {
        salaryDetail_month = await ConnectionUtil(`select salary_id , company_Id , user_Id , userDetail , userEarning , userDeduction , paySlipId , netSalary , salaryDate , department from salary_Detail where date(salaryDate) >= date_sub(now(), interval 1 MONTH) AND company_Id = '${companyId}'`);
      }
      return res.status(200).json({
        success: true,
        message: "Salary payslip month report",
        data: salaryDetail_month,
      });
    }
    if (isType == "halfYear") {
      let salaryDetail_halfYear;
      if (access == 0) {
        salaryDetail_halfYear = await ConnectionUtil(`select salary_id , company_Id , user_Id , userDetail , userEarning , userDeduction , paySlipId , netSalary , salaryDate , department from salary_Detail where date(salaryDate) >= date_sub(now(), interval 6 month) AND company_Id='${companyId}' AND branch_Id='${branch_Id}'`);
      } else {
        salaryDetail_halfYear = await ConnectionUtil(`select salary_id , company_Id , user_Id , userDetail , userEarning , userDeduction , paySlipId , netSalary , salaryDate , department from salary_Detail where date(salaryDate) >= date_sub(now(), interval 6 month) AND company_Id='${companyId}'`);
      }
      return res.status(200).json({
        success: true,
        message: "Salary payslip halfyear report",
        data: salaryDetail_halfYear,
      });
    }
    if (isType == "year") {
      let salaryDetail_year;
      if (access == 0) {
        salaryDetail_year = await ConnectionUtil(`SELECT salary_id , company_Id , user_Id , userDetail , userEarning , userDeduction , paySlipId , netSalary , salaryDate , department FROM salary_Detail WHERE YEAR(Date(salaryDate)) = YEAR(CURDATE()) AND company_Id='${companyId}' AND branch_Id='${branch_Id}' `);
      } else {
        salaryDetail_year = await ConnectionUtil(`SELECT salary_id , company_Id , user_Id , userDetail , userEarning , userDeduction , paySlipId , netSalary , salaryDate , department FROM salary_Detail WHERE YEAR(Date(salaryDate)) = YEAR(CURDATE()) AND company_Id='${companyId}'`);
      }
      return res.status(200).json({
        success: true,
        message: "Salary payslip year report",
        data: salaryDetail_year,
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message//"something went wrong"
    });
  }
};
