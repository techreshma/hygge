const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);

// ------------------------- employeeReportBy_Document -----------------------------------
module.exports.employeeReportBy_Document = async (req, res) => {
  try {
    let { company_Id, start_date, end_date, page, pagination } = req.body || 1;
    let { branch_Id, access } = req.query;
    let totalUploadCountArr = await ConnectionUtil(
      `SELECT COUNT(*) AS totalCount FROM document_Detail  WHERE isActive = 1 and company_Id = ${company_Id} `
    );
    let totalUserCountArr = await ConnectionUtil(
      `SELECT COUNT(*) AS totalCount FROM user WHERE isActive = 1 and company_id = ${company_Id}`
    );
    let totalDocTypeCountArr = await ConnectionUtil(
      `SELECT COUNT(*) AS totalCount FROM document_Type WHERE isActive = 1 and company_Id = ${company_Id} `
    );  
    let userDetailArr = await ConnectionUtil(
      `select CONCAT(first_name,' ',last_name) as name,department,reporting_Manager, user_Id , marital_Status
      from user where isActive='1' AND company_id=${company_Id} ORDER BY first_name ASC`
    );

    let expiredDocumentArray = await ConnectionUtil(
      `select COUNT(*) AS totalCount from document_Detail where DATE_FORMAT(expiry_Date, '%Y-%m-%d') <=DATE_FORMAT(CURDATE() - interval 30 day,'%Y-%m-%d') and isActive = 1 and company_Id = ${company_Id}`
    )

    let totalDocumentCount;
    let totalUserCount;
    let totalDocTypeCount;
    let expiredDocumentCount;
    let EmployeesMissingDocumentCount = 0;
    let EmployeesExpiringDocument = 0;

    for (let data of totalUploadCountArr) {
      totalDocumentCount = data.totalCount;
    }
    for (let data of totalUserCountArr) {
      totalUserCount = data.totalCount;
    }
    for (let data of totalDocTypeCountArr) {
      totalDocTypeCount = data.totalCount;
    }
    for (let data of expiredDocumentArray) {
      expiredDocumentCount = data.totalCount;
    }
 
    let i = 0;
    if(userDetailArr.length > 0) {
      for(let user of userDetailArr){
        let document_uploaded = await ConnectionUtil(
          `SELECT COUNT(*) as document_uploaded from document_Detail WHERE isActive = 1 AND company_Id = ${company_Id} AND user_id = ${user.user_Id}`
        );
        let missing_documentCount = await ConnectionUtil(
          `SELECT
          (SELECT COUNT(*) FROM document_Type WHERE company_Id = ${company_Id} and isActive = 1) - ( SELECT COUNT(*) FROM document_Detail WHERE isActive = 1 AND company_Id = ${company_Id} and user_Id = ${user.user_Id})
          AS missingDocument`
        )
        let expiryDocumentCount = await ConnectionUtil(
          `select COUNT(*) as expiredDocument from document_Detail where DATE_FORMAT(expiry_Date, '%Y-%m-%d') <=DATE_FORMAT(CURDATE() - interval 30 day,'%Y-%m-%d') and isActive = 1 and company_Id = ${company_Id} AND user_Id = ${user.user_Id} `
        )
        userDetailArr[i].documentExpiring_soon = expiryDocumentCount[0].expiredDocument  
        userDetailArr[i].document_missing = missing_documentCount[0].missingDocument
        userDetailArr[i].document_uploaded = document_uploaded[0].document_uploaded;

        if(user.document_missing!=0){
          EmployeesMissingDocumentCount++
          }
          if(user.documentExpiring_soon!=0){
          EmployeesExpiringDocument++
          }
          totalDocumentCountDetails = {
            uploaded_documents: totalDocumentCount,
            missing_documents: totalUserCount * totalDocTypeCount - totalDocumentCount,
            expiring_documents: expiredDocumentCount,
            employeesWithMissing_documents: EmployeesMissingDocumentCount,
            employeesWithExpiring_documents: EmployeesExpiringDocument,
          };
        if(i == (userDetailArr.length- 1)) {
          res.status(200).json({
            success: true,
            message: "Document report list",
            data: totalDocumentCountDetails , userDetailArr 
          });
        }      
        i++;
      }
    } else {
      res.status(404).json({
        success: false,
        message: "user is not available  or user is inActive for this company_Id: " + company_Id 
      });
    }
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};
