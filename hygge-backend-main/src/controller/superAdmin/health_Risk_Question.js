const util = require("util");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let message = require("../../lib/helpers/message");

// -------------------------------- Add_Health_Risk_Questions -------------------------------------
module.exports.add_HealthRiskQuestions = async (req, res) => {
  try {
    let {
      data,
      // type,title,category,description,option,subQuestion,sliderOption,answer,column,rows,score,isRequired,
    } = req.body;
    let { id, company_id } = req.user;
    let msg = "";
    for (let hraQues of data) {
      let post = {
        type: hraQues.type,
        title: hraQues.title,
        category: hraQues.category,
        segments:hraQues.segments!=''?hraQues.segments:'',
        description: hraQues.description,
        optionArray: JSON.stringify(hraQues.optionArray),
        subQuestion: JSON.stringify(hraQues.subQuestion),
        sliderOption: JSON.stringify(hraQues.sliderOption),
        answer: hraQues.answer,
        columnArray: JSON.stringify(hraQues.columnArray),
        rowArray: JSON.stringify(hraQues.rowArray),
        score: hraQues.score,
        isRequired: hraQues.isRequired,
        created_By: id,
        updated_By: id,
        ip_Address: hraQues.ip_Address,
        special:JSON.stringify(hraQues.special),
        dependentQuestionId:hraQues.dependentQuestionId,   //prent ID
        questionId:hraQues.questionId,    //question
        dependentOption:JSON.stringify(hraQues.dependentOption) //optionNumber
      }; 
      let hraDetail = await ConnectionUtil(
        `INSERT INTO  health_Risk_Questions_Details SET?`,
        post
      );
    }
    res.status(200).json({
      success: true,
      message: "hra risk Questions Added",
    });
  } catch (err) {
    console.log(err)
    res.status(400).json(message.err);
  }
};
// -------------------------------- Show_Health_Risk_Questions -------------------------------------
module.exports.show_HealthRiskQuestions = async (req, res) => {
  try { 
    let hraDetail = await ConnectionUtil(`select * from health_Risk_Questions_Details `);  //ORDER BY healthQuestions_id DESC
    let newArr=[];
      for(let hradata of hraDetail){
        hradata.attempted =2;
        hradata.assigned=10;
        hradata.userDetail = [{profile_picture:"download.png",userId:"1"},{profile_picture:"download.png",userId:"1"},{profile_picture:"download.png",userId:"1"}];
        newArr.push(hradata)
      }
    res.status(200).json({
      success: true,
      message: "show hra risk Questions",
      data: newArr,
    });
  } catch (err) {
    res.status(400).json(message.err);
  }
};

// -------------------------------- Edit_Health_Risk_Questions -------------------------------------
module.exports.edit_HealthRiskQuestions = async (req, res) => {
  try {
    let {
      healthQuestions_id,
      type,
      title,
      category,
      description,
      optionArray,
      subQuestion	,
      sliderOption,
      answer,
      columnArray,
      ip_Address,
      rowArray,
      score,
      isRequired,
      segments	,
      // dependentQuestionId,  //prent ID
      // questionId,    //question
      // dependentOption
      // ----
      // healthQuestionsId,
      // type,
      // title,
      // category,
      // description,
      // optionArray,
      // subQuestion,
      // sliderOption,
      // answer,
      // columnArray,
      // rowArray,
      // score,
      // isRequired,
      // ip_Address,
      // segments
    } = req.body;
    let { id } = req.user;
    let hraDetail = await ConnectionUtil(
      `select * from health_Risk_Questions_Details  where isActive='1' AND healthQuestions_id ='${healthQuestions_id}' `
    );
    if (hraDetail != "") {
      let optionArrays = JSON.stringify(optionArray);
      let subQuestions = JSON.stringify(subQuestion);
      let columnArrays = JSON.stringify(columnArray);
      let rowArrayS         = JSON.stringify(rowArray);
      let sliderOptions = JSON.stringify(sliderOption);
      var hraUpdateQueryFind = await ConnectionUtil(`update health_Risk_Questions_Details set     
        type               = '${type}'        ,
        title              = '${title}'       ,
        category           = '${category}'    ,
        description        = '${description}' ,
        optionArray        = '${optionArrays}' ,
        subQuestion        = '${subQuestions}',
        sliderOption       = '${sliderOptions}',
        answer             = '${answer}',
        columnArray        = '${columnArrays}',
        rowArray           = '${rowArrayS}',
        score              = '${score}',
        isRequired         = '${isRequired}', 
        ip_Address         = '${ip_Address}',
        updated_By         = '${id}',
        segments           = '${segments}'
        where healthQuestions_id ='${healthQuestions_id}'`);

        // ,
        // dependentQuestionId= '${dependentQuestionId}',
        // questionId         = '${questionId}',
        // dependentOption    = '${dependentOption}'

        res.status(200).json({
        success: true,
        message: "show hra risk Questions",
        data: hraUpdateQueryFind,
      });
    }else{
      res.status(404).json({
        success: false,
        message: "hra question id not found"
      });
    }
  } catch (err) {
    console.log(err)
    res.status(400).json(message.err);
  }
};

// -------------------------------- Edit_Health_Risk_QuestionsById -------------------------------------
module.exports.show_HealthRiskQuestionsById = async (req, res) => {
  try {
    let{healthQuestionsId}=req.body;
    let hraDetail = await ConnectionUtil(`select * from health_Risk_Questions_Details where healthQuestions_id='${healthQuestionsId}' ORDER BY healthQuestions_id DESC`);
    res.status(200).json({
      success: true,
      message: "show hra risk Questions by Id",
      data: hraDetail,
    });
  } catch (err) {
    res.status(400).json(message.err);
  }
};


// -------------------------------- Edit_Health_Risk_Questions -------------------------------------
module.exports.questionDelete = async (req, res) => {
  try {
    let {questionId} = req.body;
    let hraDetail = await ConnectionUtil(
      `DELETE FROM health_Risk_Questions_Details where healthQuestions_id= '${questionId}'`);
      res.status(200).json({
        success: true,
        message: "question deleted successfully",
        data: hraDetail
      });
  } catch (err) {
    console.log(err)
    res.status(400).json(message.err);
  }
};


// ------------------------- hra_report -----------------------------------
module.exports.hra_report = async (req, res) => {
  try {  
    let hraRecode_pointAverage = await ConnectionUtil(`select (HRQD.category) as category , SUM(UHSUBMISSION.question_Point) as avg ,UHSUBMISSION.user_Id from 
    user_hrasubmit as UHSUBMIT JOIN user_hrasubmission as UHSUBMISSION ON 
    UHSUBMIT.user_Id =UHSUBMISSION.user_Id JOIN health_Risk_Questions_Details as HRQD ON  HRQD.healthQuestions_id=UHSUBMISSION.healthQuestions_Id
    where UHSUBMIT.company_Id group by HRQD.category ,UHSUBMISSION.user_Id`);

    let total_userWellness = await ConnectionUtil(`select * from  user_hrasubmit`);
    
    let employeeReadiness_Count = await ConnectionUtil(`select count(*),options from user_hrasubmission  where  healthQuestions_Id=60  group by options`); 
    
    let tot_gender = await ConnectionUtil (`select gender, COUNT(UH.user_id) as count from user_hrasubmit as UH JOIN user as U ON  U.user_id = UH.user_Id where
    U.isActive=1 AND gender!='' AND gender IS NOT NULL  group by gender`);
    
    let tot_employeesParticipating  = await ConnectionUtil (`select COUNT(*) as count from userassign_programgoals group by user_Id`);
    
    let total_Score = await ConnectionUtil (`select * from user_hrasubmit`);
    
    let score_companies = await ConnectionUtil (`select  C.company_Name,SUM(total_Score) as count  from user_hrasubmit as UH  JOIN company as C ON UH.company_Id = C.company_id group by UH.company_Id ORDER BY total_Score DESC`);
   
    let score_segment = await ConnectionUtil(`select segments ,COUNT(*) as count from user_hrasubmission as UH JOIN 
    health_Risk_Questions_Details as HRD ON  HRD.healthQuestions_id =UH.healthQuestions_Id group by segments`);

    let tot_low=0;
    let tot_medium=0; 
    let tot_high=0;
    let val = await hraRecode(hraRecode_pointAverage);
    for(let userPoint of  total_userWellness){
      
      if(userPoint.total_Score>=18 && userPoint.total_Score<=35){
        tot_low = tot_low + 1 ;
      }
      if(userPoint.total_Score >=36 &&userPoint.total_Score <=50){
        tot_medium = tot_medium + 1;
      }
      if(userPoint.total_Score>=50){
        tot_high = tot_high + 1;
      }
    }
    let willness_point = {
      medium : tot_medium,
      low    : tot_low,
      high   : tot_high 
    } 
    
    let size = 5
    let top_companyScore    = score_companies.slice(0, size); 
    let bottom_companyScore = score_companies.reverse();
    bottom_companyScore.slice(0, size);
 
    let top_segmentScore    = score_segment.slice(0, size); 
    let bottom_segmentScore = score_segment.reverse();
    bottom_segmentScore.slice(0, size);

    let obj={
        wellness_distribution      : willness_point,
        Avg_hraScore               : val.total,
        lifestyle_score            : val.lifestyle,
        body_Score                 : val.body,
        mind_Score                 : val.mind,
        Avg_hraScoreImprovement    : 0 ,
        top_companiesByHRAScore	   : top_companyScore,    
        bottom_CompaniesByHRAScore : bottom_companyScore,
        top_categoriesByScore      : top_segmentScore,
        bottom_CategoriesByScore   : bottom_segmentScore,
        count_gender               : tot_gender,
        age_GroupGender            : 0 ,
        bmi_hrabasedGender         : 0 ,
        employees_participating    : tot_employeesParticipating ,
        employee_readiness         : employeeReadiness_Count.length>0?employeeReadiness_Count:[]
    }
    res.status(200).json({
      success: true,
      message: "HRA report detail",
      data: obj
    });
  }catch(err){
    console.log(err)
    res.status(404).json({
        success: false,
        message: err.message,
    });
  }
}
// select * from user_hrasubmission where  healthQuestions_Id=1 or healthQuestions_Id=2 or healthQuestions_Id=8 or healthQuestions_Id=9 

// "value" : "18-35",
// "value" : "36-50",
// "value" : "51-65"	 
// HRA - Super	User Wellness Distribution (Low, Medium, High)	Pie  Done
// 	Average HRA score - All	Speed meter       Done 
// 	Lifestyle score - All	Can be clubbed into 1 Radar Chart  Done 
// 	Body Score - All	  Done
// 	Mind Score - All	  Done 
// 	Average HRA Score Improvement	#    
// 	Top 5 Companies by HRA Score	Column    
// 	Bottom 5 Companies by HRA score	Column
// 	Top 3 Categories by score (out of 14 categories)	Column
// 	Bottom 3 Categories by score (out of 14 categories)	Column
// 	Respondend based on gender 	Pie
// 	BMI - Age group & Gender	Histogram
// 	# of employees participating in program	#
// 	Employee readiness	Traffic Light

async function hraRecode(data) {
    let userCount_body = 0;
    let userCount_mind = 0;
    let userCount_lifestyle = 0;
    let userSum_body = 0;
    let userSum_mind = 0;
    let userSum_lifestyle = 0;
    let val = await data.filter((recodeObj) => {
        if (recodeObj.category == "body") {
            userSum_body += recodeObj.avg;
            userCount_body += 1;
        }
        if (recodeObj.category == "mind") {
            userSum_mind += recodeObj.avg;
            userCount_mind += 1;
        }
        if (recodeObj.category == "lifestyle") {
            userSum_lifestyle += recodeObj.avg
            userCount_lifestyle += 1;
        }
    });
    let tot_body = userSum_body!=0  ?(userSum_body) / (userCount_body):0;
    let tot_mind = userSum_mind!=0  ?(userSum_mind) / (userCount_mind):0;
    let tot_lifestyle = userSum_lifestyle!=0 ?(userSum_lifestyle) /(userCount_lifestyle):0;
    let totalval =  (tot_body!=0) && (tot_mind!=0) && (tot_lifestyle!=0)? (tot_body + tot_mind + tot_lifestyle) /3:0;
    let obj = {
        body: Number(tot_body.toFixed(2)),
        mind: Number(tot_mind.toFixed(2)),
        lifestyle: Number(tot_lifestyle.toFixed(2)),
        total: Number(totalval.toFixed(2))
    }
    return obj;
}

module.exports.hra_genderData = async(req, res) =>{
  try{
    var maleCount = 0;
    var femaleCount = 0;
    var otherCount = 0;
    var nullCount = 0;
   
    var genderData = await ConnectionUtil(
      `SELECT user_id,gender from user WHERE isActive='1'AND status='1'`
    )
    console.log(genderData.length);
    for ( let i=0; i <= genderData.length - 1; i++){
      if(genderData[i].gender == null){
        nullCount++
      }
      if(genderData[i].gender != null){
      var gender = genderData[i].gender.toLowerCase()
      
      if(gender == "male"){
        maleCount++;
      }
      else if(gender == "female"){
        femaleCount++;
      } else{
        otherCount++;
      }
    }
 
  }
  console.log(nullCount,"nul values");

    var total_of_MaleCount = (maleCount / genderData.length * 100).toFixed(2) +'%';

      var total_of_FemaleCount = (femaleCount / genderData.length * 100).toFixed(2) +'%' ;

      var total_of_OtherCount = (otherCount / genderData.length * 100).toFixed(2) +'%'; 

      var total_of_null_count = (nullCount / genderData.length * 100).toFixed(2) +'%';
      var obj = {total_of_MaleCount, total_of_FemaleCount, total_of_OtherCount, total_of_null_count}
      res.status(200).json({
        success: true,
        message: "percentages of genders",
        data: obj
      })
  }catch(err){
    console.log(err)
    res.status(404).json({
        success: false,
        message: err.message,
    });
  }
} 