const util = require('util');
let status = require('statuses');
let connection = require('../../config/database');
const { create } = require('domain');
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let message = require("../../lib/helpers/message");
let {
       helperNotification
} = require("../../lib/helpers/fcm");


//----------------- ActionRequired_Challenge -----------------
module.exports.BadgesList= async (req, res) => {
    try {
        let newArr=[
            {
                badges_id:1,
                badges_Name:"Mile Chaser",
                badges_ImagePath:"mile_chaser.png",
                GetBadges_User:1
            },
            {
                badges_id:2,
                badges_Name:"Communicator",
                badges_ImagePath:"communicator.png",
                GetBadges_User:1
            },
            {
                badges_id:3,
                badges_Name:"Contributor",
                badges_ImagePath:"contributor.png",
                GetBadges_User:1
            },
            {
                badges_id:4,
                badges_Name:"Completing HRA",
                badges_ImagePath:"completing_HRA.png",
                GetBadges_User:1
            },  
            {
                badges_id:5,
                badges_Name:"Update HRA answwer",
                badges_ImagePath:"update_HRA.png",
                GetBadges_User:1
            },
            {
                badges_id:6,
                badges_Name:"Attendance",
                badges_ImagePath:"attandance.png",
                GetBadges_User:1
            },
            {
                badges_id:7,
                badges_Name:"Health Data Entry",
                badges_ImagePath:"health_data_entery.png",
                GetBadges_User:1
            },
            {
                badges_id:8,
                badges_Name:"Integrator",
                badges_ImagePath:"integrator.png",
                GetBadges_User:1
            },
            {
                badges_id:9,
                badges_Name:"Super User",
                badges_ImagePath:"super_user.png",
                GetBadges_User:1
            },
            {
                badges_id:10,
                badges_Name:"Learner/Reader",
                badges_ImagePath:"learner.png",
                GetBadges_User:1
            },
            {
                badges_id:11,
                badges_Name:"Adding Goals",
                badges_ImagePath:"adding_goals.png",
                GetBadges_User:1
            },
            {
                badges_id:12,
                badges_Name:"Achieving Goals",
                badges_ImagePath:"achieving_goals.png",
                GetBadges_User:1
            },
            {
                badges_id:13,
                badges_Name:"Challenger",
                badges_ImagePath:"challenger.png",
                GetBadges_User:1
            },
            {
                badges_id:14,
                badges_Name:"Champion",
                badges_ImagePath:"champion.png",
                GetBadges_User:1
            }
        ]        
        res.status(200).json({
            success: true,
            message: "Badges List",
            data: newArr
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({ 
            success: false,
            message: "something went wrong"
        })
    }
}
