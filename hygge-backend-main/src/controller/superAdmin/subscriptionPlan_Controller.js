const util = require('util');
let status = require('statuses');
let connection = require('../../config/database');
let ConnectionUtil = util.promisify(connection.query).bind(connection);

// -------------------------Show -----------------------------------
module.exports.show_SubscriptionPlan = async (req, res) => {	
	try {
		let subscriptionPlan= await ConnectionUtil(`select * from  subscription_Plan`);
		res.status(200).json({
				"success" : true,
				"message" : "Show subscription plan...",
				"data"    :subscriptionPlan
			})
	} catch (err) {
		res.status(400).json({
			"success": false,
			"message": err,
		})
	}
}
