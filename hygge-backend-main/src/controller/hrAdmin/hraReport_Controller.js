const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);

// ------------------------- hra_reportEmployee -----------------------------------
module.exports.hra_reportEmployee = async (req, res) => {
  try {
    let { company_Id } = req.body;
    let { branch_Id, access } = req.query;
    let hraRecode_pointAverage = await ConnectionUtil(`select (HRQD.category) as category , SUM(UHSUBMISSION.question_Point) as avg ,UHSUBMISSION.user_Id from 
    user_hrasubmit as UHSUBMIT JOIN user_hrasubmission as UHSUBMISSION ON 
    UHSUBMIT.user_Id =UHSUBMISSION.user_Id JOIN health_Risk_Questions_Details as HRQD ON  HRQD.healthQuestions_id=UHSUBMISSION.healthQuestions_Id
    where UHSUBMIT.co group by HRQD.category ,UHSUBMISSION.user_Id`);

    let total_userWellness = await ConnectionUtil(`select * from  user_hrasubmit`);

    let employeeReadiness_Count = await ConnectionUtil(`select count(*),options from user_hrasubmission  where  healthQuestions_Id=60  group by options`);

    let tot_gender = await ConnectionUtil(`select gender, COUNT(UH.user_id) as count from user_hrasubmit as UH JOIN user as U ON  U.user_id = UH.user_Id where
    U.isActive=1 AND gender!='' AND gender IS NOT NULL  group by gender`);

    let tot_employeesParticipating = await ConnectionUtil(`select COUNT(*) as count from userassign_programgoals group by user_Id`);

    let total_Score = await ConnectionUtil(`select * from user_hrasubmit`);

    let score_companies = await ConnectionUtil(`select  C.company_Name,SUM(total_Score) as count  from user_hrasubmit as UH  JOIN company as C ON UH.company_Id = C.company_id group by UH.company_Id ORDER BY total_Score DESC`);

    let score_segment = await ConnectionUtil(`select segments ,COUNT(*) as count from user_hrasubmission as UH JOIN 
    health_Risk_Questions_Details as HRD ON  HRD.healthQuestions_id =UH.healthQuestions_Id group by segments`);

    let tot_low = 0;
    let tot_medium = 0;
    let tot_high = 0;
    let val = await hraRecode(hraRecode_pointAverage);
    for (let userPoint of total_userWellness) {

      if (userPoint.total_Score >= 18 && userPoint.total_Score <= 35) {
        tot_low = tot_low + 1;
      }
      if (userPoint.total_Score >= 36 && userPoint.total_Score <= 50) {
        tot_medium = tot_medium + 1;
      }
      if (userPoint.total_Score >= 50) {
        tot_high = tot_high + 1;
      }
    }
    let willness_point = {
      medium: tot_medium,
      low: tot_low,
      high: tot_high
    }

    let size = 5
    let top_companyScore = score_companies.slice(0, size);
    let bottom_companyScore = score_companies.reverse();
    bottom_companyScore.slice(0, size);

    let top_segmentScore = score_segment.slice(0, size);
    let bottom_segmentScore = score_segment.reverse();
    bottom_segmentScore.slice(0, size);

    let obj = {
      wellness_distribution: willness_point,
      Avg_hraScore: val.total,
      lifestyle_score: val.lifestyle,
      body_Score: val.body,
      mind_Score: val.mind,
      Avg_hraScoreImprovement: 0,
      top_companiesByHRAScore: top_companyScore,
      bottom_CompaniesByHRAScore: bottom_companyScore,
      top_categoriesByScore: top_segmentScore,
      bottom_CategoriesByScore: bottom_segmentScore,
      count_gender: tot_gender,
      age_GroupGender: 0,
      bmi_hrabasedGender: 0,
      employees_participating: tot_employeesParticipating,
      employee_readiness: employeeReadiness_Count.length > 0 ? employeeReadiness_Count : []
    }
    res.status(200).json({
      success: true,
      message: "HRA report detail",
      data: obj
    });
  } catch (err) {
    console.log(err)
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
}

// User Wellness Distribution (Low, Medium, High)
// 	Average HRA score - All	Speed meter
// 	Lifestyle score - All	Can be clubbed into 1 Radar Chart
// 	Body Score - All	
// 	Mind Score - All	
// 	Average HRA Score Improvement	#
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
  let tot_body = userSum_body != 0 ? (userSum_body) / (userCount_body) : 0;
  let tot_mind = userSum_mind != 0 ? (userSum_mind) / (userCount_mind) : 0;
  let tot_lifestyle = userSum_lifestyle != 0 ? (userSum_lifestyle) / (userCount_lifestyle) : 0;
  let totalval = (tot_body != 0) && (tot_mind != 0) && (tot_lifestyle != 0) ? (tot_body + tot_mind + tot_lifestyle) / 3 : 0;
  let obj = {
    body: Number(tot_body.toFixed(2)),
    mind: Number(tot_mind.toFixed(2)),
    lifestyle: Number(tot_lifestyle.toFixed(2)),
    total: Number(totalval.toFixed(2))
  }
  return obj;
}


