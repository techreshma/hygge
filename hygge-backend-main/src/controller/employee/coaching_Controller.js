const util = require('util');
let status = require('statuses');
let connection = require('../../config/database');
let ConnectionUtil = util.promisify(connection.query).bind(connection);

//------------------------- coaching_Category -------------------------
module.exports.coaching_Category = async (req, res) => {
    try {
        let coachingCategoryDetails = await ConnectionUtil(
            `select * from coaching_Category where coachingSubcat_id='0'`
        );
        res.status(200).json({
            success: true,
            message: "Show coaching category",
            data: coachingCategoryDetails
        });
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: "somthing went wrong"
        })
    }
}

//------------------------- coaching_SubCategory -------------------------
module.exports.coaching_subCategory = async (req, res) => {
    try {
        let { coachingcat_Id } = req.body;
        let coachingsubCategoryDetails = await ConnectionUtil(`select * from coaching_Category where coachingSubcat_id='${coachingcat_Id}'`);
        res.status(200).json({
            success: true,
            message: "Show coaching subcategory",
            data: coachingsubCategoryDetails
        });
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: "somthing went wrong"
        })
    }
}