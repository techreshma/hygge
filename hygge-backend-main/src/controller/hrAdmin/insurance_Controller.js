const fs = require("fs");
const util = require("util");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let message = require("../../lib/helpers/message");
let moment = require("moment");
//--------------------------------Add_Insurance------------------------------------------
module.exports.add_Insurance = async (req, res) => {
  try {
    let {
      Insurance_Name,
      Insurance_Plan,
      // Member,
      Insurance_Benefit,
      Network,
      expiryDate,
      ip_Address,
      description,
      networkType,
      benefitType
    } = req.body;
    let { id, company_id } = req.user;
    let { branch_Id, access } = req.query;
    let InsuranceName = await ConnectionUtil(`select * from insurance_detail where isActive='1' AND insurance_Name='${Insurance_Name}' AND company_id='${company_id}' AND branch_Id='${branch_Id}'`);
    if (InsuranceName != '') {
      let InsuranceDetail = await ConnectionUtil(`SELECT * FROM insurance_detail WHERE isActive ='1' AND insurance_Name='${Insurance_Name}' AND insurance_Plan IN ('${Insurance_Plan}')`);
      if (InsuranceDetail == "") {
        let post = {
          insurance_Name: Insurance_Name,
          insurance_Plan: Insurance_Plan,
          member: 0,
          insurance_Benefit: Insurance_Benefit,
          network: Network,
          expiry_Date: expiryDate,
          user_id: id,
          company_id: company_id,
          created_By: id,
          updated_By: id,
          ip_Address: ip_Address,
          description: description,
          networkType: networkType,
          benefitType: benefitType,
          branch_Id: branch_Id
        };
        let insuranceDetail = await ConnectionUtil(
          `INSERT INTO  insurance_detail SET?`,
          post
        );
        res.status(200).json({
          success: true,
          message: "Insurance added successfully",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Insurance plan already exist",
        });
      }
    } else {
      let post = {
        insurance_Name: Insurance_Name,
        insurance_Plan: Insurance_Plan,
        member: 0,
        insurance_Benefit: Insurance_Benefit,
        network: Network,
        expiry_Date: expiryDate,
        user_id: id,
        company_id: company_id,
        created_By: id,
        updated_By: id,
        ip_Address: ip_Address,
        description: description,
        networkType: networkType,
        benefitType: benefitType,
        branch_Id: branch_Id
      };
      let insuranceDetail = await ConnectionUtil(
        `INSERT INTO  insurance_detail SET?`,
        post
      );
      res.status(200).json({
        success: true,
        message: "Insurance added successfully",
      });
    }
  } catch (err) {
    res.status(400).json(message.err);
  }
};

//------------------------------Show_Insurance-------------------------------------------
module.exports.show_Insurance = async (req, res) => {
  try {
    let { company_id } = req.user;
    let { branch_Id, access } = req.query;
    let insuranceData;
    if (access == 0) {
      insuranceData = await ConnectionUtil(
        `select * from insurance_detail where isActive = '1' AND company_id='${company_id}' AND branch_Id='${branch_Id}' ORDER BY insuranceDetail_id DESC`
      );
    } else {
      insuranceData = await ConnectionUtil(
        `select * from insurance_detail where isActive = '1' AND company_id='${company_id}' ORDER BY insuranceDetail_id DESC`
      );
    }
    if (insuranceData) {
      var newArr = [];
      for (let data of insuranceData) {
        data.expiry_Date = moment(data.expiry_Date).format("DD/MM/YYYY")
        newArr.push(data)
      }
      res.status(200).json({
        success: true,
        message: "Show Insurance data",
        data: newArr
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Insurance not found",
        data: [],
      });
    }
  } catch (err) {
    res.status(400).json(message.err);
  }
};

//-------------------------Delete_Insurance----------------------------------------------
module.exports.delete_Insurance = async (req, res) => {
  try {
    let { insuranceDetailId, ip_Address } = req.body;
    let { id, company_id } = req.user;
    let InsuranceDetail = await ConnectionUtil(
      `select * from insurance_detail where isActive='${1}' AND user_id='${id}' AND company_id = '${company_id}' AND insuranceDetail_id='${insuranceDetailId}'`
    );
    if (InsuranceDetail != "") {
      var insuranceDeleteQuery = await ConnectionUtil(
        `update insurance_detail set isActive='${0}',updated_By='${id}',ip_Address='${ip_Address}' where insuranceDetail_id='${insuranceDetailId}' AND company_id = '${company_id}'`
      );
      if (insuranceDeleteQuery != 0) {
        res.status(200).json({
          success: true,
          message: "Insurance deleted successfully",
        });
      } else {
        res.status(403).json({
          success: false,
          message: "Insurance not deleted ",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "Insurance not found",
        data: [],
      });
    }
  } catch (err) {
    res.status(400).json(message.err);
  }
};

//------------------------------------Update_Insurance------------------------------------
module.exports.update_Insurance = async (req, res) => {
  try {
    let {
      insuranceDetail_id,
      insurance_Name,
      insurance_Plan,
      expiryDate,
      // member,
      insurance_Benefit,
      network,
      ip_Address,
      // user_id,
      // company_id,
      description,
      networkType,
      benefitType
    } = req.body;
    let { id, company_id } = req.user;
    // let InsuranceDetail = await ConnectionUtil(`SELECT * FROM insurance_detail WHERE isActive ='1' AND insurance_Name='${Insurance_Name}' AND insurance_Plan IN ('${Insurance_Plan}')`);
    let userDetail = await ConnectionUtil(
      `select * from insurance_detail where isActive='1' AND insuranceDetail_id='${insuranceDetail_id}'`
    );
    if (userDetail != "") {
      let InsuranceName = await ConnectionUtil(`select * from insurance_detail where insuranceDetail_id!='${insuranceDetail_id}' AND  isActive='1' AND insurance_Name='${insurance_Name}'`);
      let plan = await InsuranceName.filter((data) => {
        return data.insurance_Plan == insurance_Plan
      })
      if (plan == '') {
        var insuranceUpdateQueryFind = await ConnectionUtil(
          `update insurance_detail set insurance_Name='${insurance_Name}',insurance_Plan='${insurance_Plan}',insurance_Benefit='${insurance_Benefit}',network='${network}',updated_By='${id}',
        ip_Address='${ip_Address}',
        expiry_Date='${expiryDate}',
        description='${description}',
        networkType='${networkType}',
        benefitType='${benefitType}'
        where insuranceDetail_id ='${insuranceDetail_id}'`
        );
        if (insuranceUpdateQueryFind.affectedRows != 0) {
          // var insuranceUpdateQueryFind = await ConnectionUtil(
          //   `update insurance_detail set expiry_Date='${expiryDate}' where insuranceDetail_id !='${insuranceDetail_id}' AND insurance_Name = '${insurance_Name}'`
          // );      
          res.status(200).json({
            success: true,
            message: "Insurance update successfull",
          });
        } else {
          res.status(404).json({
            success: false,
            message: "Insurance Data Not Update Successfull",
          });
        }
      } else {
        res.status(404).json({
          success: false,
          message: "Insurance plan na already exist"
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Insurance detail not found",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};
