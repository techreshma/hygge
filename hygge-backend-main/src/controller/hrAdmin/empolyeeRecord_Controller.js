const util = require("util");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);

// ------------------------- employee_Detail -----------------------------------
module.exports.employeeRecord_Detail = async (req, res) => {
    try {
        let { user_Id, company_Id } = req.body;
        let insurance;
        let challenges = [];
        let newArr = [];
        let user = await ConnectionUtil(`select * from user where user_id='${user_Id}'`);
        let attendance = await ConnectionUtil(`select * from Attendance where user_Id='${user_Id}' AND MONTH(date) = MONTH(CURRENT_DATE()) AND YEAR(date) = YEAR(CURRENT_DATE())`);
        let document = await ConnectionUtil(`select * from document_Detail where user_Id='${user_Id}'`);
        let salary = await ConnectionUtil(`select * from salary_Detail where user_Id='${user_Id}'`);
        let userAssignChallenges = await ConnectionUtil(`select * from userassign_challenges where user_id='${user_Id}'`);
        if (userAssignChallenges.length > 0) {
            let countComplete = 0;
            for (let userChallengesObj of userAssignChallenges) {
                if (userChallengesObj.isCompleted == 1) {
                    countComplete = countComplete + 1;
                }
            }
            obj = {
                totalChallenge: userAssignChallenges.length,
                completeChallenge: countComplete
            }
            challenges.push(obj);
        } else {
            obj = {
                totalChallenge: 0,
                completeChallenge: 0
            }
            challenges.push(obj);
        }

        if (document.length > 0) {
            for (let empDoc of document) {
                const currentDate = new Date().toISOString().slice(0, 10);
                const expiryDate =
                    empDoc.expiry_Date != null ? empDoc.expiry_Date : new Date();
                const diffInMs = new Date(expiryDate) - new Date(currentDate);
                const diffInDay = diffInMs / (1000 * 60 * 60 * 24);
                empDoc.Action_Required = empDoc.expiry_Date != null ? diffInDay : "-";
                newArr.push(empDoc);
            }
        }
        let leave = await ConnectionUtil(`select * from leave_details where user_id='${user_Id}' AND YEAR(created_At) = YEAR(CURRENT_DATE())`);
        if (user[0].insurance_plan_name != null) {
            insurance = await ConnectionUtil(`select * from insurance_detail where insuranceDetail_id='${user[0].insurance_plan_name}'`);
        } else {
            insurance = [];
        }
        let TotalbadgesByUser = await ConnectionUtil(`SELECT BA.badges_Id,B.badges_Name,B.badges_doc_Path,B.badges_Description,BA.badges_earned,BA.user_Id,name FROM badge_assigned AS BA JOIN badges AS B ON BA.badges_Id = B.badges_id WHERE BA.user_Id='${user_Id}'`);
        let data = {
            user: user,
            attendance: attendance,
            document: newArr,
            leave: leave,
            insurance: insurance,
            salary: salary,
            challenges: challenges,
            badgesDetail: TotalbadgesByUser
        }
        res.status(200).json({
            success: true,
            message: "Employee detail",
            data: data
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            success: false,
            message: err.message
        })
    }
}
