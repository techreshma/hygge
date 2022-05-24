const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);

//------------------------- hrauser_list -------------------------
module.exports.hrauser_list = async (req, res) => {
    try {
        let { page, pagination } = req.body;
        let offset = page * pagination;
        let limit = pagination
        let hraSubmitList = await ConnectionUtil(`select * from user_hrasubmit LIMIT ${limit} OFFSET ${offset}`);
        let newArr = [];
        for (let list of hraSubmitList) {
            let user = await ConnectionUtil(`select user_id,profile_picture, CONCAT(COALESCE(first_name,' '),' ',COALESCE(last_name,' ')) as name from user where user_id='${list.user_Id}'`);
            let company = await ConnectionUtil(`select * from company where company_id='${list.company_Id}'`);
            let obj = {
                name: user.length > 0 && user[0].name != "" ? user[0].name : "",
                profile_picture: user.length > 0 && user[0].profile_picture ? user[0].profile_picture : "download.png",
                company: company[0].company_Name,
                endDate: list.date,
                totalScore: list.total_Score,
                totalPoint: 100,
                user_Id: user[0].user_id
            };
            newArr.push(obj);
        }
        let lenTable = await ConnectionUtil(`select * from user_hrasubmit`);
        res.status(200).json({
            success: true,
            message: "HRA user list",
            data: newArr,
            length: lenTable.length
        });
    } catch (err) {
        console.log(err);
        res.status(404).json({
            success: false,
            message: err.message
        });
    }
}

//------------------------- hrauser_list -------------------------
module.exports.hraScoreBy_user = async (req, res) => {
    try {
        let { user_Id } = req.body;
        let bodyCount = 0;
        let mindCount = 0;
        let lifestyleCount = 0;
        let hraQuestion = await ConnectionUtil(`select * from health_Risk_Questions_Details`);
        let userDetail = await ConnectionUtil(`select COALESCE(gender,'male') as gender,COALESCE(Round((DATEDIFF(Date(CURRENT_DATE),DOB) / 365.25),0),'0') as age,user_id,profile_picture, CONCAT(COALESCE(first_name,' '),' ',COALESCE(last_name,' ')) as name from user where user_id='${user_Id}'`);
        if(userDetail.length>0){
        for (let ques of hraQuestion) {
            if (ques.category == "body") {
                let hraUser = await ConnectionUtil(`select * from user_hrasubmission where healthQuestions_Id='${ques.healthQuestions_id}' AND user_Id='${user_Id}'`);
                hraUser.length > 0 ? bodyCount += parseFloat(hraUser[0].question_Point) : 0;
            }
            if (ques.category == "lifestyle") {
                let hraUser = await ConnectionUtil(`select * from user_hrasubmission where   healthQuestions_Id='${ques.healthQuestions_id}' AND user_Id='${user_Id}'`);
                hraUser.length > 0 ? lifestyleCount += parseFloat(hraUser[0].question_Point) : 0;
            }
            if (ques.category == "mind") {
                let hraUser = await ConnectionUtil(`select * from user_hrasubmission where  healthQuestions_Id='${ques.healthQuestions_id}' AND user_Id='${user_Id}'`);
                hraUser.length > 0 ? mindCount += parseFloat(hraUser[0].question_Point) : 0;
            }
        }
        let obj = {
            body: bodyCount,
            mind: mindCount,
            lifestyle: lifestyleCount,
            user:userDetail[0]
        }
        let arr = [];
        arr.push(obj);
        res.status(200).json({
            success: true,
            message: "HRA user list",
            data: arr
        });
    }else{
        res.status(422).json({
            success: false,
            message: "user not found",
            data: []
        });
    }
    } catch (err) {
        console.log(err);
        res.status(404).json({
            success: false,
            message: err.message
        });
    }
}

module.exports.hraCompany_list = async(req,res) =>{
    try{
        var companyData = await ConnectionUtil(`SELECT company_id,company_Logo,company_Name,plan_StartDate FROM company Where (isActive='1' AND status='1')`);
        res.status(200).json({
            success: true,
            message: "HRA company list",
            data: companyData
        });
    }catch (err) {
        console.log(err);
        res.status(404).json({
            success: false,
            message: err.message
        });
    }
}