const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let message = require("../../lib/helpers/message");
let internalIp = require("internal-ip");

var multer = require("multer");
// var upload = multer().single('avatar')

var upload = multer({ dest: "upload/companyTheme/favicon" });
var upload = multer({ dest: "upload/companyTheme/logo" });
var upload = multer({ dest: "upload/company/contract" });
var upload = multer({ dest: "upload/company/insuranceDoc" });
var upload = multer({ dest: "upload/badges"});
var upload = multer({ dest: "upload/reward"});
var upload = multer({ dest: "upload/chat"});

var storage = multer.diskStorage({
  destination: function (req, file, cd) {
    if (req.query.theme_Folder == "contract") {
      cd(null, "upload/company/" + req.query.theme_Folder);
    } else if (req.query.theme_Folder == "insuranceDoc") {
      cd(null, "upload/company/" + req.query.theme_Folder);
    } else if (req.query.theme_Folder == "badges") {
      cd(null, "upload/" + req.query.theme_Folder);
    } else if(req.query.theme_Folder == "chat"){
      cd(null, "upload/" + req.query.theme_Folder);  
    } else if(req.query.theme_Folder == "reward"){
      cd(null, "upload/" + req.query.theme_Folder);  
    }
    else {
      cd(null, "upload/companyTheme/" + req.query.theme_Folder);
    }
  },

  filename: function (req, file, cd) {
    var str = file.originalname;
    var dotIndex = str.lastIndexOf(".");
    var ext = str.substring(dotIndex);
    var val = ext.split(".")[1];
    cd(null, Date.now() + "-image." + val);
  },
});

var upload = multer({
  storage: storage,
}).any("");

// -------------------------Company Add Theme-----------------------------------
module.exports.companyAddTheme = async (req, res) => {
  try {
    var { id, company_id } = req.user;
    var { compamy_Brand, ligth_logo, favicon, company_websiteName } = req.body;

    let companyTheme = await ConnectionUtil(
      `select * from company where isActive=1 AND company_id='${company_id}'`
    );
    if (companyTheme) {
      let companyThemeDetail = await ConnectionUtil(
        `select * from company_Theme where isActive=1 AND company_id='${company_id}'`
      );

      if (companyThemeDetail == "") {
        var companyThemeRequest = {
          company_id: company_id,
          company_websiteName: company_websiteName,
          compamy_Brand: compamy_Brand,
          ligth_logo: ligth_logo,
          favicon: favicon,
          created_By: id,
          updated_By: id,
          ip_Address: await internalIp.v4(),
        };
        var companyThemeAdd = await ConnectionUtil(
          `INSERT INTO company_Theme SET ?`,
          companyThemeRequest
        );
        if (companyThemeAdd.affectedRows == 1) {
          res.status(200).json({
            success: true,
            message: "Company theme add successfully",
          });
        } else {
          res.status(200).json({
            success: false,
            message: "Something went wrong",
          });
        }
      } else {
        res.status(403).json({
          success: false,
          message: "Company theme already exist",
        });
      }
    } else {
      res.status(403).json({
        success: false,
        message: "Company not exist",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// -------------------------Company Add Theme-----------------------------------
module.exports.companyUpdateTheme = async (req, res) => {
  try {
    var { id, company_id } = req.user;
    var {
      comapnyId,
      company_Logo,
      company_favicon,
      ip_Address,
      company_Website,
      created_By,
      updated_By,
    } = req.body;

    let companyDetail = await ConnectionUtil(
      `select * from company where isActive=1 AND company_id='${company_id}'`
    );
    if (companyDetail) {
        var companyUpdate = await ConnectionUtil(
          `update company set  company_Website = '${company_Website}' , company_Logo = '${company_Logo}' , company_favicon='${company_favicon}' , updated_By = '${id}',ip_Address='${ip_Address}'  where company_id = '${company_id}'`
        );
    if(companyUpdate.affectedRows!=0){ 
        var roleAccessDetail = await ConnectionUtil(
          `select modules from roleAccess_Assign where isActive='1' AND company_Id='${company_id}' AND role='1'`
        ); 
        companyDetail[0].moduleAccess = JSON.parse(roleAccessDetail[0].modules);
        
        let smtpSettingDetail = await ConnectionUtil(
          `select mail_Server , smtp_Port , userName , password , server_Security , default_Sender , default_SenderName from smtp_Setting where isActive = '1' AND company_Id='${company_id}'`
        );
        companyDetail[0].mail_Server =
          smtpSettingDetail[0].mail_Server != ""
            ? smtpSettingDetail[0].mail_Server
            : "";
        companyDetail[0].smtp_Port =
          smtpSettingDetail[0].smtp_Port != ""
            ? smtpSettingDetail[0].smtp_Port
            : "";
        companyDetail[0].userName =
          smtpSettingDetail[0].userName != ""
            ? smtpSettingDetail[0].userName
            : "";
        companyDetail[0].password =
          smtpSettingDetail[0].password != ""
            ? smtpSettingDetail[0].password
            : "";
        companyDetail[0].server_Security =
          smtpSettingDetail[0].server_Security != ""
            ? smtpSettingDetail[0].server_Security
            : "";
        companyDetail[0].default_Sender =
          smtpSettingDetail[0].default_Sender != ""
            ? smtpSettingDetail[0].default_Sender
            : "";
        companyDetail[0].default_SenderName =
          smtpSettingDetail[0].default_SenderName != ""
            ? smtpSettingDetail[0].default_SenderName
            : "";
        
        
        
        res.status(200).json({
          success: true,
          message: "Company theme updated successfully",
          data: companyDetail,
        });
      }else{
        res.status(404).json({
          success: false,
          message: "something went wrong"
        }); 
      }
      } else {
        res.status(403).json({
          success: false,
          message: "Company theme not exist",
        });
      }
  } catch (err) {
    console.log(err)
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// -------------------------Company Show Theme-----------------------------------
module.exports.companyShowTheme = async (req, res) => {
  try {
    var { id, company_id } = req.user;
    let companyDetail = await ConnectionUtil(
      `select company_id,company_Logo,company_Website,company_favicon from company where isActive=1 AND company_id='${company_id}'`
    );
    res.status(200).json({
      success: true,
      message: "Show company theme",
      data: companyDetail[0]||[],
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

//------------------------ UploadFile ------------------------
module.exports.companyThemeUpload = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      var imagename = req.files;     
      path = await imagename.map((data) => {
        return data.filename;
      });
    let url = process.env.BASE_URL+path[0];
      res.status(200).json({
        success: true,
        message: "Image upload successfully",
        data: url,
      });
    });
  } catch (err) {
    res.status(400).json(message.err);
  }
};

// {"latitude": "23.2963547", "longitude": "77.3388519", "latitudeDelta": "0.005", "longitudeDelta": "0.005"}