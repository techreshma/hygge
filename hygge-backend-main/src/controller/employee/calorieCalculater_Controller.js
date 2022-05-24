const util = require('util');
let status = require('statuses');
let connection=require('../../config/database');
let ConnectionUtil = util.promisify(connection.query).bind(connection);
		
// ------------------------- Activity -----------------------------------
module.exports.calorie_Calculater =async (req,res)=>{	
	try{		
        let {weight,height}=req.body;
      var BMI= await  calculateBmi(weight,height);
        res.status(200).json({
            "success" : true,
            "message" : "show calorie_Calculater",
            "data"    : BMI 			
        });	
	}catch(err){
		res.status(400).json({
			"success":false,
			"message":err,			
		})	
	}
} 
function calculateBmi(weight,height) {
    if(weight > 0 && height > 0){	
    var finalBmi = weight/(height/100*height/100)
    if(finalBmi < 18.5){
    return {bmi:finalBmi,message:"That you are too thin."} 
    }
    if(finalBmi > 18.5 && finalBmi < 25){
        return {bmi:finalBmi,message: "That you are healthy."}
    }
    if(finalBmi > 25){
        return {bmi:finalBmi,message:"That you have overweight."}
    }
    }
    else{
       return {bmi:[],message:"Please Fill in everything correctly"}
    }
    }  