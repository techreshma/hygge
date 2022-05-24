const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let message = require("../../lib/helpers/message");

//------------------------- Add_DocumentType -------------------------
module.exports.add_DocumentType = async (req, res) => {
  try {
    let { documentType, isCheck, ip_Address, companyId , dependent , expires, docImage} = req.body;
    let { id } = req.user;
    let{branch_Id,access}=req.query;
    var documentDetail = await ConnectionUtil(
      `select * from document_Type where isActive ='1' AND document_Type='${documentType}' AND company_Id = '${companyId}' AND branch_Id = '${branch_Id}'`
    );
    if (documentDetail == "") {
      let post = {
        document_Type: documentType!=''?documentType.trim():documentType,
        isCheck: isCheck,
        ip_Address: ip_Address,
        company_Id: companyId,
        created_By: id,
        updated_By: id,
        dependent : dependent,
        expires   : expires, 
        doc_Image : docImage!=''?docImage:"passport.png",
        branch_Id : branch_Id
      };
      let documentAddQueryFind = await ConnectionUtil(
        `INSERT INTO document_Type SET?`,
        post
      );
      if (documentAddQueryFind.affectedRows != 0) {
        res.status(200).json({
          success: true,
          message: "Document add successfully",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Document data not added",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "Document already exist",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//----------------------------- show_DocumentType -----------------------------
module.exports.show_DocumentType = async (req, res) => {
  try {
    let { company_id } = req.user;
    let{branch_Id,access}=req.query;
    var documentDetail;
    if(access==0){
      documentDetail = await ConnectionUtil(
        `select * from document_Type where isActive='1' AND company_Id ='${company_id}' AND branch_Id='${branch_Id}'`
      );
    }else{
      documentDetail = await ConnectionUtil(
        `select * from document_Type where isActive='1' AND company_Id ='${company_id}'`
      );
    }
    res.status(200).json({
      success: true,
      message: "Show  document list",
      data: documentDetail,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//---------------------------- delete_DocumentType -------------------------------
module.exports.delete_DocumentType = async (req, res) => {
  try {
    let { leaveTypeId, ip_Address, companyId } = req.body;
    let { id } = req.user;
    let documentDetail = await ConnectionUtil(
      `select * from document_Type where isActive='1' AND documentType_id='${leaveTypeId}' AND company_Id = '${companyId}'`
    );
    if (documentDetail != "") {
      var departmentDeleteQuery = await ConnectionUtil(
        `update document_Type set isActive='${0}',Updated_By='${id}',ip_Address='${ip_Address}' where documentType_id ='${leaveTypeId}' AND company_Id = '${companyId}'`
      );
      if (departmentDeleteQuery != 0) {
        res.status(200).json({
          success: true,
          message: " Document deleted successfully",
        });
      } else {
        res.status(403).json({
          success: false,
          message: "Document not deleted",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "Document type not found",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};


//---------------------------- update_DocumentType -------------------------------
module.exports.update_DocumentType = async (req, res) => {
  try {
    let { documentTypeId, ip_Address, companyId , documentType, isCheck , dependent , expires, docImage } = req.body;    
    let { id } = req.user;
    let documentDetail = await ConnectionUtil(
      `select * from document_Type where isActive='1' AND documentType_id='${documentTypeId}' AND company_Id = '${companyId}'`
    );
    if (documentDetail != "") {
      var departmentDeleteQuery = await ConnectionUtil(
        `update document_Type set 
          document_Type = '${documentType}',
          isCheck       = '${isCheck}', 
          dependent     = '${dependent}',
          expires       = '${expires}', 
          doc_Image     = '${docImage}',
          Updated_By    = '${id}',
          ip_Address    = '${ip_Address}'
        where documentType_id ='${documentTypeId}' AND company_Id = '${companyId}'`
      );
      if (departmentDeleteQuery != 0) {
        res.status(200).json({
          success: true,
          message: " Document updated successfully",
        });
      } else {
        res.status(403).json({
          success: false,
          message: "Document not updated",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "Document type not found",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};