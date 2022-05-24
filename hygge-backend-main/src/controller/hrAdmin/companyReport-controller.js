const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let { commonNotification } = require("../../lib/helpers/fcm");
const { company_WorkingDayUpdate } = require("./companyFaq_Controller");
let calcBmi = require("bmi-calc");

module.exports.companyReport_calculations = async (req, res) => {
  try {
    let { company_id } = req.user;

    let arr = [];
    let totalHraArr = await ConnectionUtil(
      `SELECT ut.total_Score , ut.user_Id , ut.company_Id , va.age , u.gender FROM user_hrasubmit ut  INNER JOIN view_userage va
      ON (ut.user_Id = va.user_id) INNER JOIN user u
      ON (ut.user_Id = u.user_id)
      WHERE ut.company_Id = ${company_id} AND ut.status = '1' `
    );
    //----------------------------------------segmentWise Calculations ---------------------------------------------
    //     for (let resp of totalHraArr) {

    //       let personalHraArr = await ConnectionUtil(
    //         `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
    // ON
    // (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (1,2,3,4,5,6,7) AND st.company_Id = ${company_id} `
    //       );
    //       let BiometricsHraArr = await ConnectionUtil(
    //         `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
    // ON
    // (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (8,9,10,11) AND st.company_Id = ${company_id}`
    //       );
    //       let clinicalHistoryHraArr = await ConnectionUtil(
    //         `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
    // ON
    // (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (12,13,14,15,16,17) AND st.company_Id =  ${company_id}`
    //       );
    //       let screeningHraArr = await ConnectionUtil(
    //         `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
    // ON
    // (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (18,19) AND st.company_Id = ${company_id}`
    //       );
    //       let familyHistoryHraArr = await ConnectionUtil(
    //         `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
    // ON
    // (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (21,22) AND st.company_Id = ${company_id}`
    //       );
    //       let occupationalHistoryHraArr = await ConnectionUtil(
    //         `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
    // ON
    // (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (23,24,25,26,27,28) AND st.company_Id = ${company_id}`
    //       );
    //       let dietHraArr = await ConnectionUtil(
    //         `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
    // ON
    // (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (29,30,31,32,33,34,35) AND st.company_Id = ${company_id}`
    //       );
    //       let physicalActivityHraArr = await ConnectionUtil(
    //         `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
    // ON
    // (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (36,37) AND st.company_Id = ${company_id}`
    //       );
    //       let preventiveHealth = await ConnectionUtil(
    //         `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
    // ON
    // (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (38,39) AND st.company_Id = ${company_id}`
    //       );
    //       let sleepHraArr = await ConnectionUtil(
    //         `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
    // ON
    // (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (40,41,42,43) AND st.company_Id = ${company_id}`
    //       );
    //       let bevergesHraArr = await ConnectionUtil(
    //         `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
    // ON
    // (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (44,45,46) AND st.company_Id = ${company_id}`
    //       );
    //       let stressAndMentalWellbeingHraArr = await ConnectionUtil(
    //         `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
    // ON
    // (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (47,48,49,50,51,52,53,54,55,56,57,58) AND st.company_Id = ${company_id}`
    //       );
    //       let readinessAssessmentHraArr = await ConnectionUtil(
    //         `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
    // ON
    // (sn.user_Id = st.user_Id) WHERE healthQuestions_Id IN (59,60,61) AND st.company_Id = ${company_id}`
    //       );

    //       let personal = 0;
    //       let Biometrics = 0;
    //       let clinicalHistory = 0;
    //       let screening = 0;
    //       let familyHistory = 0;
    //       let occupationalHistory = 0;
    //       let diet = 0;
    //       let physicalActivity = 0;
    //       let sleep = 0;
    //       let tobacco = 0;
    //       let beverges = 0;
    //       let stressAndMentalWellbeing = 0;
    //       let readinessAssessment = 0;

    //       let personalTotal = 5;
    //       let BiometricsTotal = 7;
    //       let clinicalHistoryTotal = 26;
    //       let screeningTotal = 2;
    //       let familyHistoryTotal = 5;
    //       let occupationalHistoryTotal = 12;
    //       let dietTotal = 12;
    //       let physicalActivityTotal = 3;
    //       let tobaccoTotal = 4;
    //       let sleepTotal = 6;
    //       let bevergesTotal = 5;
    //       let stressAndMentalWellbeingTotal = 16.5;
    //       let readinessAssessmentTotal;

    //       for (let resp of personalHraArr) {
    //         personal += resp.question_Point;
    //       }
    //       for (let resp of BiometricsHraArr) {
    //         Biometrics += resp.question_Point;
    //       }
    //       for (let resp of clinicalHistoryHraArr) {
    //         clinicalHistory += resp.question_Point;
    //       }
    //       for (let resp of screeningHraArr) {
    //         screening += resp.question_Point;
    //       }
    //       for (let resp of familyHistoryHraArr) {
    //         familyHistory += resp.question_Point;
    //       }
    //       for (let resp of occupationalHistoryHraArr) {
    //         occupationalHistory += resp.question_Point;
    //       }
    //       for (let resp of dietHraArr) {
    //         diet += resp.question_Point;
    //       }
    //       for (let resp of physicalActivityHraArr) {
    //         physicalActivity += resp.question_Point;
    //       }
    //       for (let resp of tobaccoHraArr) {
    //         tobacco += resp.question_Point;
    //       }
    //       for (let resp of sleepHraArr) {
    //         sleep += resp.question_Point;
    //       }
    //       for (let resp of bevergesHraArr) {
    //         beverges += resp.question_Point;
    //       }
    //       for (let resp of stressAndMentalWellbeingHraArr) {
    //         stressAndMentalWellbeing += resp.question_Point;
    //       }
    //       for (let resp of readinessAssessmentHraArr) {
    //         readinessAssessment += resp.question_Point;
    //       }

    //       personal += ratioPoint;
    //       Biometrics += bmiPoint;

    //       let personalPercentage = Math.round(
    //         (personal / (personalTotal * totalHraArr.length)) * 100
    //       );
    //       let BiometricsPercentage = Math.round(
    //         (Biometrics / (BiometricsTotal * totalHraArr.length)) * 100
    //       );
    //       let clinicalHistoryPercentage = Math.round(
    //         (clinicalHistory / (clinicalHistoryTotal * totalHraArr.length)) * 100
    //       );
    //       let screeningPercentage = Math.round(
    //         (screening / (screeningTotal * totalHraArr.length)) * 100
    //       );
    //       let familyHistoryPercentage = Math.round(
    //         (familyHistory / (familyHistoryTotal * totalHraArr.length)) * 100
    //       );
    //       let occupationalHistoryPercentage = Math.round(
    //         (occupationalHistory /
    //           (occupationalHistoryTotal * totalHraArr.length)) *
    //           100
    //       );
    //       let dietPercentage = Math.round(
    //         (diet / (dietTotal * totalHraArr.length)) * 100
    //       );
    //       let physicalActivityPercentage = Math.round(
    //         (physicalActivity / (physicalActivityTotal * totalHraArr.length)) * 100
    //       );
    //       let tobaccoPercentage = Math.round(
    //         (tobacco / (tobaccoTotal * totalHraArr.length)) * 100
    //       );
    //       let sleepPercentage = Math.round(
    //         (sleep / (sleepTotal * totalHraArr.length)) * 100
    //       );
    //       let bevergesPercentage = Math.round(
    //         (beverges / (bevergesTotal * totalHraArr.length)) * 100
    //       );
    //       let stressAndMentalWellbeingPercentage = Math.round(
    //         (stressAndMentalWellbeing /
    //           (stressAndMentalWellbeingTotal * totalHraArr.length)) *
    //           100
    //       );
    //     }

    //-------------------------------------------segment wise calculation over -------------------------------------

    //-------------------------------------------------hra Engagement -----------------------------------------------------------------
    let totalUserCompany = await ConnectionUtil(
      `SELECT * FROM user where company_id = ${company_id} and isActive = '1'`
    );

    let notStartedArr = await ConnectionUtil(
      `SELECT user_id FROM user WHERE user_id NOT IN ( SELECT DISTINCT(u.user_id) FROM user u JOIN user_hrasubmission us ON (u.user_id = us.user_Id) WHERE u.company_id = ${company_id} AND us.status = '1' ) AND company_id = ${company_id} AND isActive = 1;`
    );

    let completedArr = await ConnectionUtil(
      `SELECT DISTINCT user_Id FROM user_hrasubmit WHERE company_Id = ${company_id} AND status = '1'`
    );

    let userAttemptedHraArr = await ConnectionUtil(
      `SELECT DISTINCT user_Id FROM user_hrasubmission WHERE company_Id = ${company_id} AND status = '1'`
    );

    let notStarted = Math.round(
      (notStartedArr.length / totalUserCompany.length) * 100
    );
    let incomplete = Math.round(
      ((userAttemptedHraArr.length - completedArr.length) /
        totalUserCompany.length) *
        100
    );
    let completed = Math.round(
      (completedArr.length / totalUserCompany.length) * 100
    );

    hraEngagement = {
      notStarted,
      incomplete,
      completed,
    };

    //-------------------------------------------hra retake calculations ------------------------------------------------
    let totalUserOldArr = await ConnectionUtil(
      `SELECT DISTINCT(user_Id) FROM user_hrasubmit WHERE status = '0' AND company_Id = ${company_id}  ORDER BY created_At DESC `
    );

    // var totalHraOldArr;
    // var totalHraNewArr;

    let totalHraOld = 0;
    let totalHraNew = 0;
    let lifestyleScoreNew = 0;
    let mindScoreNew = 0;
    let bodyScoreNew = 0;
    let averageHrascore_improvment;
    let ratioPoint = 0;
    let bmiPoint = 0;
    let bmiAge0 = 0;
    let bmiAge1 = 0;
    let bmiAge2 = 0;
    let bmiAge3 = 0;
    let bmiAge4 = 0;
    let bmiGenderM = 0;
    let bmiGenderF = 0;

    if (totalUserOldArr.length > 0) {
      for (let data of totalUserOldArr) {
        let lifestyleNewArr = await ConnectionUtil(
          `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
        ON 
        (sn.user_Id = st.user_Id)
        WHERE sn.healthQuestions_Id IN (29,30,31,32,33,34,35,36,37,38,39,40,40,41,42,43,44,45, 46) AND sn.company_Id = ${company_id} AND st.status = 1 and st.user_Id = ${data.user_Id} AND sn.status='1' ORDER BY st.created_At DESC `
        );

        lifestyleNewArr.map(
          (resp) => (lifestyleScoreNew += resp.question_Point)
        );

        let mindNewArr = await ConnectionUtil(
          `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
        ON 
        (sn.user_Id = st.user_Id)
        WHERE sn.healthQuestions_Id IN (47,48,49,50,51,52,53,54,55,56,57,58,59,60,61) AND sn.company_Id = ${company_id} AND st.status = 1 and st.user_Id = ${data.user_Id} AND sn.status='1' ORDER BY st.created_At DESC `
        );

        mindNewArr.map((resp) => (mindScoreNew += resp.question_Point));

        let bodyNewArr = await ConnectionUtil(
          `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options FROM user_hrasubmission sn JOIN user_hrasubmit st
        ON 
        (sn.user_Id = st.user_Id)
        WHERE sn.healthQuestions_Id IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,21,22,23,24,25,26,27,28) AND sn.company_Id = ${company_id} AND st.status = 1 and st.user_Id = ${data.user_Id} AND sn.status='1' ORDER BY st.created_At DESC `
        );

        bodyNewArr.map((resp) => (bodyScoreNew += resp.question_Point));

        //-------------------------------------bmi calculations --------------------------------------------

        let questionCheck = await ConnectionUtil(
          `select * from user_hrasubmission where company_Id='${company_id}' AND status='1'`
        );
        let UserSubmitSelectQuery = await ConnectionUtil(
          `select * from user_hrasubmit where company_Id='${company_id}' AND status='1'`
        );

        let userGender = await ConnectionUtil(
          `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age , u.gender FROM user_hrasubmission sn JOIN user_hrasubmit st
          ON (sn.user_Id = st.user_Id) JOIN view_userage va   
          ON (st.user_Id = va.user_id) JOIN user u 
          ON (st.user_Id = u.user_id)
          where st.company_Id='${company_id}' AND healthQuestions_Id='1' AND st.status = '1' and st.user_Id = ${data.user_Id} AND sn.status='1' ORDER BY st.created_At DESC`
        );
        let waistRatioSore = await ConnectionUtil(
          `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age , u.gender FROM user_hrasubmission sn JOIN user_hrasubmit st
          ON (sn.user_Id = st.user_Id) JOIN view_userage va   
          ON (st.user_Id = va.user_id) JOIN user u 
          ON (st.user_Id = u.user_id)
          where st.company_Id='${company_id}' AND healthQuestions_Id='10' AND st.status = '1' and st.user_Id = ${data.user_Id} AND sn.status='1' ORDER BY st.created_At DESC`
        );
        let hipRatioSore = await ConnectionUtil(
          `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age , u.gender FROM user_hrasubmission sn JOIN user_hrasubmit st
          ON (sn.user_Id = st.user_Id) JOIN view_userage va   
          ON (st.user_Id = va.user_id) JOIN user u 
          ON (st.user_Id = u.user_id)
          where st.company_Id='${company_id}' AND healthQuestions_Id='11' AND st.status = '1' and st.user_Id = ${data.user_Id} AND sn.status='1' ORDER BY st.created_At DESC`
        );
        let heightSore = await ConnectionUtil(
          `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age , u.gender FROM user_hrasubmission sn JOIN user_hrasubmit st
          ON (sn.user_Id = st.user_Id) JOIN view_userage va   
          ON (st.user_Id = va.user_id) JOIN user u 
          ON (st.user_Id = u.user_id)
          where st.company_Id='${company_id}' AND healthQuestions_Id='8' AND st.status = '1' and st.user_Id = ${data.user_Id} AND sn.status='1' ORDER BY st.created_At DESC`
        );
        let weightSore = await ConnectionUtil(
          `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age , u.gender FROM user_hrasubmission sn JOIN user_hrasubmit st
          ON (sn.user_Id = st.user_Id) JOIN view_userage va   
          ON (st.user_Id = va.user_id) JOIN user u 
          ON (st.user_Id = u.user_id)
          where st.company_Id='${company_id}' AND healthQuestions_Id='9' AND st.status = '1' and st.user_Id = ${data.user_Id} AND sn.status='1' ORDER BY st.created_At DESC`
        );

        for (let i = 0; i <= weightSore.length - 1; i++) {
          if (
            waistRatioSore.length > 0 &&
            hipRatioSore.length > 0 &&
            userGender.length > 0
          ) {
            let w = waistRatioSore[i].options;
            let h = hipRatioSore[i].options;
            let Ratio = w / h;
            let fixedNum = Ratio.toFixed(2);
            // male
            if (userGender[i].options == "Male") {
              if (fixedNum <= "0.95") {
                ratioPoint += 0;
              }
              if (fixedNum >= "0.96" && fixedNum <= "1.0") {
                ratioPoint += 3;
              }
              if (fixedNum >= "1.0") {
                ratioPoint += 4;
              }
            }
            // female
            if (userGender[i].options == "Female") {
              if (fixedNum <= "0.80") {
                ratioPoint += 0;
              }
              if (fixedNum >= "0.81" && fixedNum <= "0.85") {
                ratioPoint += 3;
              }
              if (fixedNum >= "0.86") {
                ratioPoint += 4;
              }
            }
          }
          if (heightSore.length > 0 && weightSore.length > 0) {
            let height = heightSore[i].options / 100;
            let weight = weightSore[i].options;
            let valBMI = calcBmi(weight, height);

            let totBMI = valBMI.value.toFixed(1);

            if (weightSore[i].gender == "Male") {
              if (totBMI <= "18.5") {
                bmiGenderM += 1;
              }
              if (totBMI >= "18.5" && totBMI <= "24.9") {
                bmiGenderM += 0;
              }
              if (totBMI >= "25" && totBMI <= "29.9") {
                bmiGenderM += 1;
              }
              if (totBMI >= "30" && totBMI <= "39.9") {
                bmiGenderM += 3;
              }
            }

            if (weightSore[i].gender == "Female") {
              if (totBMI <= "18.5") {
                bmiGenderF += 1;
              }
              if (totBMI >= "18.5" && totBMI <= "24.9") {
                bmiGenderF += 0;
              }
              if (totBMI >= "25" && totBMI <= "29.9") {
                bmiGenderF += 1;
              }
              if (totBMI >= "30" && totBMI <= "39.9") {
                bmiGenderF += 3;
              }
            }

            if (weightSore[i].age <= 20) {
              if (totBMI <= "18.5") {
                bmiAge0 += 1;
              }
              if (totBMI >= "18.5" && totBMI <= "24.9") {
                bmiAge0 += 0;
              }
              if (totBMI >= "25" && totBMI <= "29.9") {
                bmiAge0 += 1;
              }
              if (totBMI >= "30" && totBMI <= "39.9") {
                bmiAge0 += 3;
              }
            }

            if (weightSore[i].age > 20 && weightSore[i].age < 35) {
              if (totBMI <= "18.5") {
                bmiAge1 += 1;
              }
              if (totBMI >= "18.5" && totBMI <= "24.9") {
                bmiAge1 += 0;
              }
              if (totBMI >= "25" && totBMI <= "29.9") {
                bmiAge1 += 1;
              }
              if (totBMI >= "30" && totBMI <= "39.9") {
                bmiAge1 += 3;
              }
            }

            if (weightSore[i].age >= 36 && weightSore[i].age < 51) {
              if (totBMI <= "18.5") {
                bmiAge2 += 1;
              }
              if (totBMI >= "18.5" && totBMI <= "24.9") {
                bmiAge2 += 0;
              }
              if (totBMI >= "25" && totBMI <= "29.9") {
                bmiAge2 += 1;
              }
              if (totBMI >= "30" && totBMI <= "39.9") {
                bmiAge2 += 3;
              }
            }

            if (weightSore[i].age >= 51 && weightSore[i].age < 65) {
              if (totBMI <= "18.5") {
                bmiAge3 += 1;
              }
              if (totBMI >= "18.5" && totBMI <= "24.9") {
                bmiAge3 += 0;
              }
              if (totBMI >= "25" && totBMI <= "29.9") {
                bmiAge3 += 1;
              }
              if (totBMI >= "30" && totBMI <= "39.9") {
                bmiAge3 += 3;
              }
            }

            if (weightSore[i].age > 65) {
              if (totBMI <= "18.5") {
                bmiAge4 += 1;
              }
              if (totBMI >= "18.5" && totBMI <= "24.9") {
                bmiAge4 += 0;
              }
              if (totBMI >= "25" && totBMI <= "29.9") {
                bmiAge4 += 1;
              }
              if (totBMI >= "30" && totBMI <= "39.9") {
                bmiAge4 += 3;
              }
            }
          }
        }

        bmiPoint = bmiAge0 + bmiAge1 + bmiAge2 + bmiAge3 + bmiAge4;

        var sum = 0;
        sum = sum + ratioPoint + bmiPoint;

        //Your BMI is 00.00 · Underweight (Below 18.5) · Normal (18.5 - 24.9) · Overweight (25.0 - 29.9) · Obese (30.0 and Above). BMI of 40+ suggests extra obesity.

        //-----------------------------------------------bmi calculations over -----------------------------------------------
      }

      let myLifestyle = Math.round(
        (lifestyleScoreNew / (totalUserOldArr.length * 30)) * 100
      );
      let myMind = Math.round(
        (mindScoreNew / (totalUserOldArr.length * 19)) * 100
      );
      let myBody = Math.round(
        ((bodyScoreNew + sum) / (totalUserOldArr.length * 51)) * 100
      );

      //
      //
      //

      var hraRetake = {
        myBody,
        myLifestyle,
        myMind,
      };
    } else {
      averageHrascore_improvment = "--";
    }

    //-------------------------------------------hra retake calculations over------------------------------------------------

    //-----------------------------------------male Female calculation --------------------------------------------------------

    let count1m = 0;
    let count2m = 0;
    let count3m = 0;
    let count4m = 0;
    let count1f = 0;
    let count2f = 0;
    let count3f = 0;
    let count4f = 0;
    let hra1m = 0;
    let hra2m = 0;
    let hra3m = 0;
    let hra4m = 0;
    let hra1f = 0;
    let hra2f = 0;
    let hra3f = 0;
    let hra4f = 0;

    for (let resp of totalHraArr) {
      if ((resp.gender = "Male" && resp.age > 25 && resp.age <= 35)) {
        count1m++;
        hra1m += resp.total_Score;
      }
      if ((resp.gender = "Male" && resp.age > 35 && resp.age <= 50)) {
        count2m++;
        hra2m += resp.total_Score;
      }
      if ((resp.gender = "Male" && resp.age > 50 && resp.age <= 65)) {
        count3m++;
        hra3m += resp.total_Score;
      }
      if ((resp.gender = "Male" && resp.age > 65)) {
        count4m++;
        hra4m += resp.total_Score;
      }
      if ((resp.gender = "Female" && resp.age > 25 && resp.age <= 35)) {
        count1f++;
        hra1f += resp.total_Score;
      }
      if ((resp.gender = "Female" && resp.age > 35 && resp.age <= 50)) {
        count2f++;
        hra2f += resp.total_Score;
      }
      if ((resp.gender = "Female" && resp.age > 50 && resp.age <= 65)) {
        count3f++;
        hra3f += resp.total_Score;
      }
      if ((resp.gender = "Female" && resp.age > 65)) {
        count4f++;
        hra4f += resp.total_Score;
      }
    }

    male = [
      { ageBracket: "25-35", value: count1m ? Math.round(hra1m / count1m) : 0 },

      {
        ageBracket: "36-50",
        value: count2m > 0 ? Math.round(hra2m / count2m) : 0,
      },

      {
        ageBracket: "51-65",
        value: count3m > 0 ? Math.round(hra3m / count3m) : 0,
      },

      {
        ageBracket: "65+",
        value: count4m > 0 ? Math.round(hra4m / count4m) : 0,
      },
    ];

    female = [
      {
        ageBracket: "25-35",
        value: count1f > 0 ? Math.round(hra1f / count1f) : 0,
      },

      {
        ageBracket: "36-50",
        value: count2f > 0 ? Math.round(hra2f / count2f) : 0,
      },

      {
        ageBracket: "51-65",
        value: count3f > 0 ? Math.round(hra3f / count3f) : 0,
      },

      {
        ageBracket: "65+",
        value: count4f > 0 ? Math.round(hra4f / count4f) : 0,
      },
    ];

    //--------------------------------------------------male female calculations over------------------------------------

    //--------------------------------------------------bmi -------------------------------------------------------------
    let bmiArr = await ConnectionUtil(
      `SELECT us.healthQuestions_Id , us.options , ut.user_Id  FROM user_hrasubmission us  JOIN user_hrasubmit ut
    ON (ut.user_Id = us.user_Id)
    WHERE us.healthQuestions_Id in (33,34,35,36,37,44) AND ut.company_Id = ${company_id} AND us.status='1'`
    );

    let underweightCount = 0;
    let normalCount = 0;
    let overweightCount = 0;
    let obseseCount = 0;
    let extraObese = 0;

    let UserSubmitSelectQuery = await ConnectionUtil(
      `select * from user_hrasubmit where company_Id='${company_id}' AND status='1'`
    );

    if (UserSubmitSelectQuery.length > 0) {
      for (let resp of UserSubmitSelectQuery) {
        let heightSore = await ConnectionUtil(
          `select * from user_hrasubmission where user_Id='${resp.user_Id}' AND healthQuestions_Id='8' AND status='1'`
        );
        let weightSore = await ConnectionUtil(
          `select * from user_hrasubmission where user_Id='${resp.user_Id}' AND healthQuestions_Id='9' AND status='1'`
        );

        if (heightSore.length > 0 && weightSore.length > 0) {
          let height = heightSore[0].options / 100;
          let weight = weightSore[0].options;
          let valBMI = calcBmi(weight, height);
          let totBMI = valBMI.value.toFixed(1);

          switch (valBMI.name) {
            case "Very Severely Underweight":
              underweightCount++;
              break;
            case "Severely Underweight":
              underweightCount++;
              break;
            case "Underweight":
              underweightCount++;
              break;
            case "Normal":
              normalCount++;
              break;
            case "Overweight":
              overweightCount++;
              break;
            case "Moderately Obese":
              obseseCount++;
              break;
            case "Severely Obese":
              extraObese++;
              break;
            case "Very Severely Obese":
              extraObese++;
              break;
            default:
              break;
          }
        }
      }
    }
    let bmiAlcohol = 0;
    let bmiEating = 0;
    let bmiActivity = 0;
    if (bmiArr.length > 0) {
      for (let resp of bmiArr) {
        switch (resp.options) {
          case "1 to 2 units a day":
            bmiAlcohol++;
            break;
          case "3 or more units a day":
            bmiAlcohol++;
            break;
          case "Mostly":
            bmiEating++;
            break;
          case "Always":
            bmiEating++;
            break;
          case "Snacking & binge eating":
            bmiEating++;
            break;
          case "Need to omit processed, ready-to-eat or jun":
            bmiEating++;
            break;
          case "Need to eat more consciously as per my health":
            bmiEating++;
            break;
          case "Sedentary (less than 3,500 steps)":
            bmiActivity++;
            break;
          case "0-15 Minutes":
            bmiActivity++;
            break;
          default:
            bmiAlcohol, bmiEating, bmiActivity;
            break;
        }
      }
    }

    let tableDataBmi = [];

    let arrAnorexia_bmi = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON
      (sn.user_Id = st.user_Id) JOIN  view_userage va
      ON 
      (st.user_Id = va.user_Id)  JOIN user u
      ON
      (st.user_Id = u.user_id)
      WHERE st.company_Id = 1 AND st.status = 1 AND sn.healthQuestions_Id IN (8,9) AND sn.status='1'`
    );
    let annorexia_agelessThan18 = 0;
    let annorexia_age18To30F = 0;
    let annorexia_age30To45F = 0;
    let annorexia_age45To60F = 0;
    let annorexia_age60AboveF = 0;
    let annorexia_age18To30M = 0;
    let annorexia_age30To45M = 0;
    let annorexia_age45To60M = 0;
    let annorexia_age60AboveM = 0;

    let underweight_ageLessThan18 = 0;
    let underweight_age18To30F = 0;
    let underweight_age30To45F = 0;
    let underweight_age45To60F = 0;
    let underweight_age60AboveF = 0;
    let underweight_age18To30M = 0;
    let underweight_age30To45M = 0;
    let underweight_age45To60M = 0;
    let underweight_age60AboveM = 0;

    let overweight_ageLessThan18 = 0;
    let overweight_age18To30F = 0;
    let overweight_age30To45F = 0;
    let overweight_age45To60F = 0;
    let overweight_age60AboveF = 0;
    let overweight_age18To30M = 0;
    let overweight_age30To45M = 0;
    let overweight_age45To60M = 0;
    let overweight_age60AboveM = 0;

    let Normal_ageLessThan18 = 0;
    let Normal_age18To30F = 0;
    let Normal_age30To45F = 0;
    let Normal_age45To60F = 0;
    let Normal_age60AboveF = 0;
    let Normal_age18To30M = 0;
    let Normal_age30To45M = 0;
    let Normal_age45To60M = 0;
    let Normal_age60AboveM = 0;

    let obese_ageLessThan18 = 0;
    let obese_age18To30F = 0;
    let obese_age30To45F = 0;
    let obese_age45To60F = 0;
    let obese_age60AboveF = 0;
    let obese_age18To30M = 0;
    let obese_age30To45M = 0;
    let obese_age45To60M = 0;
    let obese_age60AboveM = 0;

    let morbidObese_ageLessThan18 = 0;
    let morbidObese_age18To30F = 0;
    let morbidObese_age30To45F = 0;
    let morbidObese_age45To60F = 0;
    let morbidObese_age60AboveF = 0;
    let morbidObese_age18To30M = 0;
    let morbidObese_age30To45M = 0;
    let morbidObese_age45To60M = 0;
    let morbidObese_age60AboveM = 0;

    let heightArr = [];
    let weightArr = [];

    arrAnorexia_bmi.map((data) => {
      if (data.healthQuestions_Id == 8) {
        heightArr.push(data);
      } else {
        weightArr.push(data);
      }
    });

    heightArr.sort((a, b) =>
      a.user_Id > b.user_Id ? 1 : b.user_Id > a.user_Id ? -1 : 0
    );

    weightArr.sort((a, b) =>
      a.user_Id > b.user_Id ? 1 : b.user_Id > a.user_Id ? -1 : 0
    );

    for (let i = 0; i < heightArr.length; i++) {
      //
      if (heightArr[i].age < 18) {
        let h =
          heightArr[i].healthQuestions_Id.toString() == "8"
            ? Number(heightArr[i].options) / 100
            : "1.71";
        let w =
          weightArr[i].healthQuestions_Id.toString() == "9"
            ? Number(weightArr[i].options)
            : "70";
        const checkBmi = calcBmi(w, h);
        if (
          checkBmi.name == "Very Severely Underweight" ||
          checkBmi.name == "Severely Underweight"
        ) {
          annorexia_agelessThan18++;
        }
        if (checkBmi.name == "Underweight") {
          underweight_ageLessThan18++;
        }
        if (checkBmi.name == "Normal") {
          Normal_ageLessThan18++;
        }
        if (checkBmi.name == "Overweight") {
          overweight_ageLessThan18++;
        }
        if (checkBmi.name == "Moderately Obese") {
          obese_ageLessThan18++;
        }
        if (
          checkBmi.name == "Severely Obese" ||
          checkBmi.name == "Very Severely Obese"
        ) {
          morbidObese_ageLessThan18++;
        }
      } else if (
        heightArr[i].age >= 18 &&
        heightArr[i].age <= 30 &&
        heightArr[i].gender == "Female"
      ) {
        let h =
          heightArr[i].healthQuestions_Id == 8
            ? Number(heightArr[i].options) / 100
            : "1.72";
        let w =
          weightArr[i].healthQuestions_Id == 9
            ? Number(weightArr[i].options)
            : "70";
        const checkBmi = calcBmi(w, h);

        if (
          checkBmi.name == "Very Severely Underweight" ||
          checkBmi.name == "Severely Underweight"
        ) {
          annorexia_age18To30F++;
        }
        if (checkBmi.name == "Underweight") {
          underweight_age18To30F++;
        }
        if (checkBmi.name == "Normal") {
          Normal_age18To30F++;
        }
        if (checkBmi.name == "Overweight") {
          overweight_age18To30F++;
        }
        if (checkBmi.name == "Moderately Obese") {
          obese_age18To30F++;
        }
        if (
          checkBmi.name == "Severely Obese" ||
          checkBmi.name == "Very Severely Obese"
        ) {
          morbidObese_age18To30F++;
        }
      } else if (
        heightArr[i].age >= 18 &&
        heightArr[i].age <= 30 &&
        heightArr[i].gender == "Male"
      ) {
        let h =
          heightArr[i].healthQuestions_Id == 8
            ? Number(heightArr[i].options) / 100
            : "1.73";
        let w =
          weightArr[i].healthQuestions_Id == 9
            ? Number(weightArr[i].options)
            : "70";

        const checkBmi = calcBmi(w, h);
        if (
          checkBmi.name == "Very Severely Underweight" ||
          checkBmi.name == "Severely Underweight"
        ) {
          annorexia_age18To30M++;
        }
        if (checkBmi.name == "Underweight") {
          underweight_age18To30M++;
        }
        if (checkBmi.name == "Normal") {
          Normal_age18To30M++;
        }
        if (checkBmi.name == "Overweight") {
          overweight_age18To30M++;
        }
        if (checkBmi.name == "Moderately Obese") {
          obese_age18To30M++;
        }
        if (
          checkBmi.name == "Severely Obese" ||
          checkBmi.name == "Very Severely Obese"
        ) {
          morbidObese_age18To30M++;
        }
      } else if (
        heightArr[i].age >= 30 &&
        heightArr[i].age <= 45 &&
        heightArr[i].gender == "Female"
      ) {
        let h =
          heightArr[i].healthQuestions_Id == 8
            ? Number(heightArr[i].options) / 100
            : "1.74";
        let w =
          weightArr[i].healthQuestions_Id == 9
            ? Number(weightArr[i].options)
            : "70";
        // annorexia_age30To45F = calcBmi(w, h);
        const checkBmi = calcBmi(w, h);
        if (
          checkBmi.name == "Very Severely Underweight" ||
          checkBmi.name == "Severely Underweight"
        ) {
          annorexia_age30To45F++;
        }
        if (checkBmi.name == "Underweight") {
          annorexia_age30To45F++;
        }
        if (checkBmi.name == "Underweight") {
          underweight_age30To45F++;
        }
        if (checkBmi.name == "Normal") {
          Normal_age30To45F++;
        }
        if (checkBmi.name == "Overweight") {
          overweight_age30To45F++;
        }
        if (checkBmi.name == "Moderately Obese") {
          obese_age30To45F++;
        }
        if (
          checkBmi.name == "Severely Obese" ||
          checkBmi.name == "Very Severely Obese"
        ) {
          morbidObese_age30To45F++;
        }
      } else if (
        heightArr[i].age >= 30 &&
        heightArr[i].age <= 45 &&
        heightArr[i].gender == "Male"
      ) {
        let h =
          heightArr[i].healthQuestions_Id == 8
            ? Number(heightArr[i].options) / 100
            : "1.75";
        let w =
          weightArr[i].healthQuestions_Id == 9
            ? Number(weightArr[i].options)
            : "70";
        // annorexia_age30To45M = calcBmi(w, h);
        const checkBmi = calcBmi(w, h);
        if (
          checkBmi.name == "Very Severely Underweight" ||
          checkBmi.name == "Severely Underweight"
        ) {
          annorexia_age30To45M++;
        }
        if (checkBmi.name == "Underweight") {
          underweight_age30To45M++;
        }
        if (checkBmi.name == "Normal") {
          Normal_age30To45M++;
        }
        if (checkBmi.name == "Overweight") {
          overweight_age30To45M++;
        }
        if (checkBmi.name == "Moderately Obese") {
          obese_age30To45M++;
        }
        if (
          checkBmi.name == "Severely Obese" ||
          checkBmi.name == "Very Severely Obese"
        ) {
          morbidObese_age30To45M++;
        }
      } else if (
        heightArr[i].age >= 45 &&
        heightArr[i].age <= 60 &&
        heightArr[i].gender == "Female"
      ) {
        let h =
          heightArr[i].healthQuestions_Id == 8
            ? Number(heightArr[i].options) / 100
            : "1.76";
        let w =
          weightArr[i].healthQuestions_Id == 9
            ? Number(weightArr[i].options)
            : "70";
        // annorexia_age30To45F = calcBmi(w, h);
        const checkBmi = calcBmi(w, h);

        if (
          checkBmi.name == "Very Severely Underweight" ||
          checkBmi.name == "Severely Underweight"
        ) {
          annorexia_age45To60F++;
        }
        if (checkBmi.name == "Underweight") {
          underweight_age45To60F++;
        }
        if (checkBmi.name == "Normal") {
          Normal_age45To60F++;
        }
        if (checkBmi.name == "Overweight") {
          overweight_age45To60F++;
        }
        if (
          checkBmi.name == "Severely Obese" ||
          checkBmi.name == "Very Severely Obese"
        ) {
          morbidObese_age45To60F++;
        }
      } else if (
        heightArr[i].age >= 45 &&
        heightArr[i].age <= 60 &&
        heightArr[i].gender == "Male"
      ) {
        let h =
          heightArr[i].healthQuestions_Id == 8
            ? Number(heightArr[i].options) / 100
            : "1.77";
        let w =
          weightArr[i].healthQuestions_Id == 9
            ? Number(weightArr[i].options)
            : "70";
        // annorexia_age30To45M = calcBmi(w, h);
        const checkBmi = calcBmi(w, h);
        if (
          checkBmi.name == "Very Severely Underweight" ||
          checkBmi.name == "Severely Underweight"
        ) {
          annorexia_age45To60M++;
        }
        if (checkBmi.name == "Underweight") {
          underweight_age45To60M++;
        }
        if (checkBmi.name == "Normal") {
          Normal_age45To60M++;
        }
        if (checkBmi.name == "Overweight") {
          overweight_age45To60M++;
        }
        if (checkBmi.name == "Moderately Obese") {
          obese_age45To60M++;
        }
        if (
          checkBmi.name == "Severely Obese" ||
          checkBmi.name == "Very Severely Obese"
        ) {
          morbidObese_age45To60M++;
        }
      } else if (heightArr[i].age > 60 && heightArr[i].gender == "Female") {
        let h =
          heightArr[i].healthQuestions_Id == 8
            ? Number(heightArr[i].options) / 100
            : "1.78";
        let w =
          weightArr[i].healthQuestions_Id == 9
            ? Number(weightArr[i].options)
            : "70";
        // annorexia_age60AboveF = calcBmi(w, h);
        const checkBmi = calcBmi(w, h);
        if (
          checkBmi.name == "Very Severely Underweight" ||
          checkBmi.name == "Severely Underweight"
        ) {
          annorexia_age60AboveF++;
        }
        if (checkBmi.name == "Underweight") {
          underweight_age60AboveF++;
        }
        if (checkBmi.name == "Normal") {
          Normal_age60AboveF++;
        }
        if (checkBmi.name == "Overweight") {
          overweight_age60AboveF++;
        }
        if (checkBmi.name == "Moderately Obese") {
          obese_age60AboveF++;
        }
        if (
          checkBmi.name == "Severely Obese" ||
          checkBmi.name == "Very Severely Obese"
        ) {
          morbidObese_age60AboveF++;
        }
      } else if (heightArr[i].age > 60 && heightArr[i].gender == "Male") {
        let h =
          heightArr[i].healthQuestions_Id == 8
            ? Number(heightArr[i].options) / 100
            : "1.79";
        let w =
          weightArr[i].healthQuestions_Id == 9
            ? Number(weightArr[i].options)
            : "70";
        // annorexia_age60AboveM = calcBmi(w, h);
        const checkBmi = calcBmi(w, h);
        if (
          checkBmi.name == "Very Severely Underweight" ||
          checkBmi.name == "Severely Underweight"
        ) {
          annorexia_age60AboveM++;
        }
        if (checkBmi.name == "Underweight") {
          underweight_age60AboveM++;
        }
        if (checkBmi.name == "Normal") {
          Normal_age60AboveM++;
        }
        if (checkBmi.name == "Overweight") {
          overweight_age60AboveM++;
        }
        if (checkBmi.name == "Moderately Obese") {
          obese_age60AboveM++;
        }
        if (
          checkBmi.name == "Severely Obese" ||
          checkBmi.name == "Very Severely Obese"
        ) {
          morbidObese_age60AboveM++;
        }
      }
    }

    let anorexia = {
      age18To30F: Math.round((annorexia_age18To30F / totalHraArr.length) * 100),
      age30To45F: Math.round((annorexia_age30To45F / totalHraArr.length) * 100),
      age45To60F: Math.round((annorexia_age45To60F / totalHraArr.length) * 100),
      age60AboveF: Math.round(
        (annorexia_age60AboveF / totalHraArr.length) * 100
      ),
      age18To30M: Math.round((annorexia_age18To30M / totalHraArr.length) * 100),
      age30To45M: Math.round((annorexia_age30To45M / totalHraArr.length) * 100),
      age45To60M: Math.round((annorexia_age45To60M / totalHraArr.length) * 100),
      ageAbove60M: Math.round(
        (annorexia_age60AboveM / totalHraArr.length) * 100
      ),
      total: 0,
    };

    anorexia.total = Math.round(
      annorexia_age18To30F +
        annorexia_age30To45F +
        annorexia_age45To60F +
        annorexia_age60AboveF +
        annorexia_age18To30M +
        annorexia_age30To45M +
        annorexia_age45To60M +
        annorexia_age60AboveM +
        annorexia_agelessThan18
    );

    let underweight = {
      age18To30F: Math.round(
        (underweight_age18To30F / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (underweight_age30To45F / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (underweight_age45To60F / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (underweight_age60AboveF / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (underweight_age18To30M / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (underweight_age30To45M / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (underweight_age45To60M / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (underweight_age60AboveM / totalHraArr.length) * 100
      ),
      total: 0,
    };

    underweight.total =
      underweight_age18To30F +
      underweight_age30To45F +
      underweight_age45To60F +
      underweight_age60AboveF +
      underweight_age18To30M +
      underweight_age30To45M +
      underweight_age45To60M +
      underweight_age60AboveM +
      underweight_ageLessThan18;

    let healthy = {
      age18To30F: Math.round((Normal_age18To30F / totalHraArr.length) * 100),
      age30To45F: Math.round((Normal_age30To45F / totalHraArr.length) * 100),
      age45To60F: Math.round((Normal_age45To60F / totalHraArr.length) * 100),
      age60AboveF: Math.round((Normal_age60AboveF / totalHraArr.length) * 100),
      age18To30M: Math.round((Normal_age18To30M / totalHraArr.length) * 100),
      age30To45M: Math.round((Normal_age30To45M / totalHraArr.length) * 100),
      age45To60M: Math.round((Normal_age45To60M / totalHraArr.length) * 100),
      ageAbove60M: Math.round((Normal_age60AboveM / totalHraArr.length) * 100),
      total: 0,
    };

    healthy.total =
      Normal_age18To30F +
      Normal_age30To45F +
      Normal_age45To60F +
      Normal_age60AboveF +
      Normal_age18To30M +
      Normal_age30To45M +
      Normal_age45To60M +
      Normal_age60AboveM +
      Normal_ageLessThan18;

    let overweight = {
      age18To30F: Math.round(
        (overweight_age18To30F / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (overweight_age30To45F / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (overweight_age45To60F / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (overweight_age60AboveF / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (overweight_age18To30M / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (overweight_age30To45M / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (overweight_age45To60M / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (overweight_age60AboveM / totalHraArr.length) * 100
      ),
      total: 0,
    };

    overweight.total =
      overweight_age18To30F +
      overweight_age30To45F +
      overweight_age45To60F +
      overweight_age60AboveF +
      overweight_age18To30M +
      overweight_age30To45M +
      overweight_age45To60M +
      overweight_age60AboveM +
      overweight_ageLessThan18;

    let obese = {
      age18To30F: Math.round((obese_age18To30F / totalHraArr.length) * 100),
      age30To45F: Math.round((obese_age30To45F / totalHraArr.length) * 100),
      age45To60F: Math.round((obese_age45To60F / totalHraArr.length) * 100),
      age60AboveF: Math.round((obese_age60AboveF / totalHraArr.length) * 100),
      age18To30M: Math.round((obese_age18To30M / totalHraArr.length) * 100),
      age30To45M: Math.round((obese_age30To45M / totalHraArr.length) * 100),
      age45To60M: Math.round((obese_age45To60M / totalHraArr.length) * 100),
      ageAbove60M: Math.round((obese_age60AboveM / totalHraArr.length) * 100),
      total: 0,
    };

    obese.total =
      obese_age18To30F +
      obese_age30To45F +
      obese_age45To60F +
      obese_age60AboveF +
      obese_age18To30M +
      obese_age30To45M +
      obese_age45To60M +
      obese_age60AboveM +
      obese_ageLessThan18;

    let morbidObese = {
      age18To30F: Math.round(
        (morbidObese_age18To30F / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (morbidObese_age30To45F / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (morbidObese_age45To60F / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (morbidObese_age60AboveF / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (morbidObese_age18To30M / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (morbidObese_age30To45M / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (morbidObese_age45To60M / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (morbidObese_age60AboveM / totalHraArr.length) * 100
      ),
      total: 0,
    };

    morbidObese.total =
      morbidObese_age18To30F +
      morbidObese_age30To45F +
      morbidObese_age45To60F +
      morbidObese_age60AboveF +
      morbidObese_age18To30M +
      morbidObese_age30To45M +
      morbidObese_age45To60M +
      morbidObese_age60AboveM +
      morbidObese_ageLessThan18;

    tableDataBmi.push(
      { anorexia },
      { underweight },
      { healthy },
      { overweight },
      { obese },
      { morbidObese }
    );

    let bmi = {
      eatingBehaviour: Math.round((bmiEating / (totalHraArr.length * 2)) * 100), //dividing by two because we are getting double entry cause of join
      activity: Math.round((bmiActivity / (totalHraArr.length * 2)) * 100),
      alcohol: Math.round((bmiAlcohol / (totalHraArr.length * 2)) * 100),
      underweight: Math.round((underweightCount / totalHraArr.length) * 100),
      healthy: Math.round((normalCount / totalHraArr.length) * 100),
      overweight: Math.round((overweightCount / totalHraArr.length) * 100),
      obese: Math.round((obseseCount / totalHraArr.length) * 100),
      extraObese: Math.round((extraObese / totalHraArr.length) * 100),
      tableDataBmi: tableDataBmi,
    };

    //--------------------------------------------------bmi over -------------------------------------------------------

    //--------------------------------------------------tobacco -----------------------------------------------------

    let tobaccoArr = await ConnectionUtil(
      `SELECT us.healthQuestions_Id , us.options , ut.user_Id  FROM user_hrasubmission us  JOIN user_hrasubmit ut
    ON (ut.user_Id = us.user_Id)
    WHERE us.healthQuestions_Id in (38 , 61) AND ut.company_Id = ${company_id} AND us.status='1'`
    );

    let tobaccoHraArr_lowRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON
      (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
      ON 
      (st.user_Id = va.user_Id)  INNER JOIN user u
      ON
      (st.user_Id = u.user_id)
      WHERE st.company_Id = 1 AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (38,39) 
      GROUP BY st.user_Id
      HAVING SUM(sn.question_Point)  > 1.2`
    );
    tempArr1f_lowT = [];
    tempArr2f_lowT = [];
    tempArr3f_lowT = [];
    tempArr4f_lowT = [];
    tempArr1m_lowT = [];
    tempArr2m_lowT = [];
    tempArr3m_lowT = [];
    tempArr4m_lowT = [];

    let lowRiskTotalT = tobaccoHraArr_lowRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_lowT.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_lowT.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_lowT.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_lowT.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_lowT.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_lowT.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_lowT.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_lowT.push(data);
      }
      return data;
    });

    //
    //

    let tobaccoHraArr_moderateRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON
      (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
      ON 
      (st.user_Id = va.user_Id)  INNER JOIN user u
      ON
      (st.user_Id = u.user_id)
      WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (38,39) 
      GROUP BY st.user_Id
      HAVING SUM(sn.question_Point)  BETWEEN 0.7 AND 1.2`
    );

    tempArr1f_moderateT = [];
    tempArr2f_moderateT = [];
    tempArr3f_moderateT = [];
    tempArr4f_moderateT = [];
    tempArr1m_moderateT = [];
    tempArr2m_moderateT = [];
    tempArr3m_moderateT = [];
    tempArr4m_moderateT = [];

    let moderateRiskTotalT = tobaccoHraArr_moderateRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_moderateT.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_moderateT.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_moderateT.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_moderateT.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_moderateT.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_moderateT.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_moderateT.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_moderateT.push(data);
      }
      return data;
    });

    //
    //

    let tobaccoHraArr_highRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
          ON
          (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
          ON 
          (st.user_Id = va.user_Id)  INNER JOIN user u
          ON
          (st.user_Id = u.user_id)
          WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (38,39) 
          GROUP BY st.user_Id
          HAVING SUM(sn.question_Point) < 0.7`
    );

    tempArr1f_highT = [];
    tempArr2f_highT = [];
    tempArr3f_highT = [];
    tempArr4f_highT = [];
    tempArr1m_highT = [];
    tempArr2m_highT = [];
    tempArr3m_highT = [];
    tempArr4m_highT = [];

    let highRiskTotalT = tobaccoHraArr_highRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_highT.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_highT.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_highT.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_highT.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_highT.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_highT.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_highT.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_highT.push(data);
      }
      return data;
    });

    //
    //

    let smokers = 0;
    let smokingCessation = 0;
    tableDataTobacco = [];
    // let bmiActivity = 0;

    if (tobaccoArr.length > 0) {
      for (let resp of tobaccoArr) {
        switch (resp.options) {
          case "I use tobacco occasionally but not regularly ":
            smokers++;
            break;
          case "Yes I have and still do":
            smokers++;
            break;
          case "Stop smoking":
            smokingCessation++;
            break;
          default:
            smokers, smokingCessation;
            break;
        }
      }
    }

    let lowRiskTableT = {
      age18To30F: Math.round(
        (tempArr1f_lowT.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_lowT.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_lowT.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_lowT.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_lowT.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_lowT.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_lowT.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_lowT.length / totalHraArr.length) * 100
      ),
      total: Math.round((lowRiskTotalT.length / totalHraArr.length) * 100),
    };

    let moderateRiskTableT = {
      age18To30F: Math.round(
        (tempArr1f_moderateT.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_moderateT.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_moderateT.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_moderateT.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_moderateT.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_moderateT.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_moderateT.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_moderateT.length / totalHraArr.length) * 100
      ),
      total: Math.round((moderateRiskTotalT.length / totalHraArr.length) * 100),
    };

    let highRiskTableT = {
      age18To30F: Math.round(
        (tempArr1f_highT.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_highT.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_highT.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_highT.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_highT.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_highT.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_highT.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_highT.length / totalHraArr.length) * 100
      ),
      total: Math.round((highRiskTotalT.length / totalHraArr.length) * 100),
    };

    tableDataTobacco.push(
      { lowRiskTableT },
      { moderateRiskTableT },
      { highRiskTableT }
    );

    let tobaccoObj = {
      smokers: Math.round((smokers / (totalHraArr.length * 2)) * 100),
      nonSmokers: 100 - Math.round((smokers / (totalHraArr.length * 2)) * 100),
      smokingAndCessation: Math.round(
        (smokingCessation / (totalHraArr.length * 2)) * 100
      ),
      tableDataTobacco: tableDataTobacco,
    };

    //---------------------------------------------tobacco over -------------------------------------------

    //---------------------------------------------preventive health --------------------------------------

    let preventiveHealthArr = await ConnectionUtil(
      `SELECT us.healthQuestions_Id , us.options , ut.user_Id  FROM user_hrasubmission us  JOIN user_hrasubmit ut
    ON (ut.user_Id = us.user_Id)
    WHERE us.healthQuestions_Id in (2,12,18,19) AND ut.company_Id = ${company_id} AND us.status='1'`
    );

    let preventiveHealth_lowRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON
      (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
      ON 
      (st.user_Id = va.user_Id)  INNER JOIN user u
      ON
      (st.user_Id = u.user_id)
      WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (2,12,18,19) 
      GROUP BY st.user_Id
      HAVING SUM(sn.question_Point)  > 3.6`
    );

    tempArr1f_lowPH = [];
    tempArr2f_lowPH = [];
    tempArr3f_lowPH = [];
    tempArr4f_lowPH = [];
    tempArr1m_lowPH = [];
    tempArr2m_lowPH = [];
    tempArr3m_lowPH = [];
    tempArr4m_lowPH = [];

    let lowRiskTotalPH = preventiveHealth_lowRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_lowPH.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_lowPH.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_lowPH.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_lowPH.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_lowPH.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_lowPH.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_lowPH.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_lowPH.push(data);
      }
      return data;
    });

    //

    let preventiveHealth_moderateRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON
      (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
      ON 
      (st.user_Id = va.user_Id)  INNER JOIN user u
      ON
      (st.user_Id = u.user_id)
      WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (2,12,18,19) 
      GROUP BY st.user_Id
      HAVING SUM(sn.question_Point)  BETWEEN 2.1 AND 3.6`
    );

    tempArr1f_moderatePH = [];
    tempArr2f_moderatePH = [];
    tempArr3f_moderatePH = [];
    tempArr4f_moderatePH = [];
    tempArr1m_moderatePH = [];
    tempArr2m_moderatePH = [];
    tempArr3m_moderatePH = [];
    tempArr4m_moderatePH = [];

    let moderateRiskTotalPH = preventiveHealth_moderateRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_moderatePH.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_moderatePH.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_moderatePH.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_moderatePH.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_moderatePH.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_moderatePH.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_moderatePH.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_moderatePH.push(data);
      }
      return data;
    });

    //

    let preventiveHealth_highRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
          ON
          (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
          ON 
          (st.user_Id = va.user_Id)  INNER JOIN user u
          ON
          (st.user_Id = u.user_id)
          WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (2,12,18,19) 
          GROUP BY st.user_Id
          HAVING SUM(sn.question_Point) < 2.1`
    );

    tempArr1f_highPH = [];
    tempArr2f_highPH = [];
    tempArr3f_highPH = [];
    tempArr4f_highPH = [];
    tempArr1m_highPH = [];
    tempArr2m_highPH = [];
    tempArr3m_highPH = [];
    tempArr4m_highPH = [];

    let highRiskTotalPH = preventiveHealth_highRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_highPH.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_highPH.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_highPH.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_highPH.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_highPH.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_highPH.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_highPH.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_highPH.push(data);
      }
      return data;
    });

    //

    let healthScreening_1x = 0;
    let healthScreening_2x = 0;
    let healthScreening_3x = 0;
    let vaccine = 0;
    let riskOfChronicCondition = 0;
    let lowRisk = 0;
    let moderateRisk = 0;
    let highRisk = 0;
    let tableDataPreventiveHealth = [];

    if (preventiveHealthArr.length > 0) {
      for (let resp of preventiveHealthArr) {
        switch (resp.options) {
          case "36-50":
            healthScreening_1x++;
            break;
          case "51-65":
            healthScreening_1x++;
            break;
          case "I don’t need to do these tests":
            healthScreening_2x++;
            break;
          case "Never had any check up or tests ":
            healthScreening_3x++;
            break;
          case "No immunizations done":
            vaccine++;
            break;
          case "Yes, blood sugar altered":
            riskOfChronicCondition++;
            break;
          case "Yes, blood pressure altered":
            riskOfChronicCondition++;
            break;
          case "Yes, cholesterol altered":
            riskOfChronicCondition++;
            break;
          case "Other conditions, if any":
            riskOfChronicCondition++;
            break;
          default:
            healthScreening_1x,
              healthScreening_2x,
              healthScreening_3x,
              vaccine,
              riskOfChronicCondition;
            break;
        }
      }
    }

    for (let resp of totalHraArr) {
      if (resp.total_Score > 80 && resp.total_Score <= 100) {
        lowRisk++;
      }
      if (resp.total_Score > 49 && resp.total_Score <= 80) {
        moderateRisk++;
      }
      if (resp.total_Score > 0 && resp.total_Score <= 49) {
        highRisk++;
      }
    }

    let lowRiskTablePH = {
      age18To30F: Math.round(
        (tempArr1f_lowPH.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_lowPH.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_lowPH.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_lowPH.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_lowPH.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_lowPH.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_lowPH.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_lowPH.length / totalHraArr.length) * 100
      ),
      total: Math.round((lowRiskTotalPH.length / totalHraArr.length) * 100),
    };

    let moderateRiskTablePH = {
      age18To30F: Math.round(
        (tempArr1f_moderatePH.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_moderatePH.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_moderatePH.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_moderatePH.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_moderatePH.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_moderatePH.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_moderatePH.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_moderatePH.length / totalHraArr.length) * 100
      ),
      total: Math.round(
        (moderateRiskTotalPH.length / totalHraArr.length) * 100
      ),
    };

    let highRiskTablePH = {
      age18To30F: Math.round(
        (tempArr1f_highPH.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_highPH.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_highPH.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_highPH.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_highPH.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_highPH.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_highPH.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_highPH.length / totalHraArr.length) * 100
      ),
      total: Math.round((highRiskTotalPH.length / totalHraArr.length) * 100),
    };

    tableDataPreventiveHealth.push(
      { lowRiskTablePH },
      { moderateRiskTablePH },
      { highRiskTablePH }
    );

    let preventiveHealthObj = {
      healthScreening_1x: Math.round(
        (healthScreening_1x / (totalHraArr.length * 2)) * 100
      ),
      healthScreening_2x: Math.round(
        (healthScreening_2x / (totalHraArr.length * 2)) * 100
      ),
      healthScreening_3x: Math.round(
        (healthScreening_3x / (totalHraArr.length * 2)) * 100
      ),
      vaccine: Math.round((vaccine / (totalHraArr.length * 2)) * 100),
      riskOfChronicCondition: Math.round(
        (riskOfChronicCondition / (totalHraArr.length * 2)) * 100
      ),
      lowRisk: Math.round((lowRisk / totalHraArr.length) * 100),
      moderateRisk: Math.round((moderateRisk / totalHraArr.length) * 100),
      highRisk: Math.round((highRisk / totalHraArr.length) * 100),
      tableDataPreventiveHealth: tableDataPreventiveHealth,
    };

    //--------------------------------------------preventive health over -----------------------------------

    //-------------------------------------------alcohol ---------------------------------------------------

    let alcoholArr = await ConnectionUtil(
      `SELECT us.healthQuestions_Id , us.options , ut.user_Id  FROM user_hrasubmission us  JOIN user_hrasubmit ut
    ON (ut.user_Id = us.user_Id)
    WHERE us.healthQuestions_Id in (12,44,48) AND ut.company_Id = ${company_id} AND us.status='1'`
    );

    let alcoholUnit_1Or2 = 0;
    let alcoholUnit_3OrMore = 0;
    let nonDrinkers = 0;
    let consumption = 0;
    let stress = 0;
    let health = 0;
    let tableDataAlcohol = [];

    if (alcoholArr.length > 0) {
      for (let resp of alcoholArr) {
        switch (resp.options) {
          case "1 to 2 units a day":
            alcoholUnit_1Or2++, stress++, consumption++, health++;
            break;
          case "3 or more units a day":
            alcoholUnit_3OrMore++, stress++, consumption++, health++;
            break;
          case "I do not drink":
            nonDrinkers++;
            break;
          case "Drinking smoking to reduce pressure":
            stress++;
            break;
          case "Yes, blood sugar altered":
            health++;
            break;
          case "Yes, blood pressure altered":
            health++;
            break;
          case "Yes, cholesterol altered":
            health++;
            break;
          default:
            alcoholUnit_1Or2,
              alcoholUnit_3OrMore,
              nonDrinkers,
              consumption,
              stress,
              health;
            break;
        }
      }
    }

    let lowRiskTableA = {
      age18To30F: 0,
      age30To45F: 0,
      age45To60F: 0,
      age60AboveF: 0,
      age18To30M: 0,
      age30To45M: 0,
      age45To60M: 0,
      ageAbove60M: 0,
      total: 0,
    };

    let moderateRiskTableA = {
      age18To30F: 0,
      age30To45F: 0,
      age45To60F: 0,
      age60AboveF: 0,
      age18To30M: 0,
      age30To45M: 0,
      age45To60M: 0,
      ageAbove60M: 0,
      total: 0,
    };

    let highRiskTableA = {
      age18To30F: 0,
      age30To45F: 0,
      age45To60F: 0,
      age60AboveF: 0,
      age18To30M: 0,
      age30To45M: 0,
      age45To60M: 0,
      ageAbove60M: 0,
      total: 0,
    };

    tableDataAlcohol.push(
      { lowRiskTableA },
      { moderateRiskTableA },
      { highRiskTableA }
    );

    let alcoholObj = {
      alcoholUnit_1Or2: Math.round(
        (alcoholUnit_1Or2 / (totalHraArr.length * 2)) * 100
      ),
      alcoholUnit_3OrMore: Math.round(
        (alcoholUnit_3OrMore / (totalHraArr.length * 2)) * 100
      ),
      nonDrinkers: Math.round((nonDrinkers / (totalHraArr.length * 2)) * 100),
      consumption: Math.round((consumption / (totalHraArr.length * 2)) * 100),
      stress: Math.round((stress / (totalHraArr.length * 2)) * 100),
      health: Math.round((health / totalHraArr.length) * 100),
      tableDataAlcohol: tableDataAlcohol,
    };

    //-------------------------------------------alcohol over ----------------------------------------------

    //-----------------------------------------------diet and nutrition ----------------------------------------------
    let dietArr = await ConnectionUtil(
      `SELECT us.healthQuestions_Id , us.options , ut.user_Id  FROM user_hrasubmission us  JOIN user_hrasubmit ut
    ON (ut.user_Id = us.user_Id)
    WHERE us.healthQuestions_Id in (29,30,32,33) AND ut.company_Id = ${company_id} AND us.status='1'`
    );

    let wellBalanced = 0;
    let unhealthy = 0;
    let balanceAct = 0;
    let portions = 0;
    let readiness = 0;
    let emotionalEating = 0;

    if (dietArr.length > 0) {
      for (let resp of dietArr) {
        switch (resp.options) {
          case "Never":
            balanceAct++, unhealthy++;
            break;
          case "Sometimes":
            balanceAct++, unhealthy++;
            break;
          case "No, not yet, but would like to":
            readiness++;
            break;
          case "I do not eat fruits & veggies":
            portions++;
            break;
          case "1-2 portions":
            portions++;
            break;
          case "Mostly":
            emotionalEating++;
            break;
          case "Always":
            emotionalEating++;
            break;
          default:
            wellBalanced,
              unhealthy,
              balanceAct,
              portions,
              readiness,
              emotionalEating;
            break;
        }
      }
    }

    let dietObj = {
      wellBalanced: Math.round((wellBalanced / (totalHraArr.length * 2)) * 100),
      unhealthy: Math.round((unhealthy / (totalHraArr.length * 2)) * 100),
      balanceAct: Math.round((balanceAct / (totalHraArr.length * 2)) * 100),
      portions: Math.round((portions / (totalHraArr.length * 2)) * 100),
      readiness: Math.round((readiness / (totalHraArr.length * 2)) * 100),
      emotionalEating: Math.round(
        (emotionalEating / (totalHraArr.length * 2)) * 100
      ),
    };

    //---------------------------------------------diet and nutrition over ----------------------------------------

    //---------------------------------------------physicalActivity ----------------------------------------------

    let physicalActivityArr = await ConnectionUtil(
      `SELECT us.healthQuestions_Id , us.options , ut.user_Id  FROM user_hrasubmission us  JOIN user_hrasubmit ut
    ON (ut.user_Id = us.user_Id)
    WHERE us.healthQuestions_Id in (36,37) AND ut.company_Id = ${company_id} AND us.status='1'`
    );

    let physicalActivity_lowRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON
      (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
      ON 
      (st.user_Id = va.user_Id)  INNER JOIN user u
      ON
      (st.user_Id = u.user_id)
      WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (36,37) 
      GROUP BY st.user_Id
      HAVING SUM(sn.question_Point)  > 1.8`
    );

    tempArr1f_lowPA = [];
    tempArr2f_lowPA = [];
    tempArr3f_lowPA = [];
    tempArr4f_lowPA = [];
    tempArr1m_lowPA = [];
    tempArr2m_lowPA = [];
    tempArr3m_lowPA = [];
    tempArr4m_lowPA = [];

    let lowRiskTotalPA = physicalActivity_lowRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_lowPA.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_lowPA.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_lowPA.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_lowPA.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_lowPA.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_lowPA.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_lowPA.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_lowPA.push(data);
      }
      return data;
    });

    //

    let physicalActivity_moderateRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON
      (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
      ON 
      (st.user_Id = va.user_Id)  INNER JOIN user u
      ON
      (st.user_Id = u.user_id)
      WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (36,37) 
      GROUP BY st.user_Id
      HAVING SUM(sn.question_Point)  BETWEEN 1.05 AND 1.8`
    );

    tempArr1f_moderatePA = [];
    tempArr2f_moderatePA = [];
    tempArr3f_moderatePA = [];
    tempArr4f_moderatePA = [];
    tempArr1m_moderatePA = [];
    tempArr2m_moderatePA = [];
    tempArr3m_moderatePA = [];
    tempArr4m_moderatePA = [];

    let moderateRiskTotalPA = physicalActivity_moderateRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_moderatePA.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_moderatePA.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_moderatePA.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_moderatePA.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_moderatePA.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_moderatePA.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_moderatePA.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_moderatePA.push(data);
      }
      return data;
    });

    //

    let physicalActivity_highRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
          ON
          (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
          ON 
          (st.user_Id = va.user_Id)  INNER JOIN user u
          ON
          (st.user_Id = u.user_id)
          WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (36,37) 
          GROUP BY st.user_Id
          HAVING SUM(sn.question_Point) < 1.05`
    );

    tempArr1f_highPA = [];
    tempArr2f_highPA = [];
    tempArr3f_highPA = [];
    tempArr4f_highPA = [];
    tempArr1m_highPA = [];
    tempArr2m_highPA = [];
    tempArr3m_highPA = [];
    tempArr4m_highPA = [];

    let highRiskTotalPA = physicalActivity_highRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_highPA.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_highPA.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_highPA.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_highPA.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_highPA.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_highPA.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_highPA.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_highPA.push(data);
      }
      return data;
    });

    //

    let levelOfActivity = 0;
    let notSure = 0;
    let sedentary = 0;
    let moderatelyActive = 0;

    if (physicalActivityArr.length > 0) {
      for (let resp of physicalActivityArr) {
        switch (resp.options) {
          case "Sedentary (less than 3,500 steps)":
            levelOfActivity++, sedentary++;
            break;
          case "Moderately active (3,500-5,000 steps)":
            levelOfActivity++, moderatelyActive++;
            break;
          case "I am not sure":
            levelOfActivity++, notSure;
            break;
          case "0-15 Minutes":
            portions++;
            break;
          default:
            levelOfActivity, notSure, sedentary, moderatelyActive;
            break;
        }
      }
    }

    let tableDataPhysicalActivity = [];

    let lowRiskTablePA = {
      age18To30F: Math.round(
        (tempArr1f_lowPA.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_lowPA.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_lowPA.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_lowPA.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_lowPA.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_lowPA.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_lowPA.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_lowPA.length / totalHraArr.length) * 100
      ),
      total: Math.round((lowRiskTotalPA.length / totalHraArr.length) * 100),
    };

    let moderateRiskTablePA = {
      age18To30F: Math.round(
        (tempArr1f_moderatePA.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_moderatePA.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_moderatePA.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_moderatePA.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_moderatePA.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_moderatePA.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_moderatePA.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_moderatePA.length / totalHraArr.length) * 100
      ),
      total: Math.round(
        (moderateRiskTotalPA.length / totalHraArr.length) * 100
      ),
    };
    let highRiskTablePA = {
      age18To30F: Math.round(
        (tempArr1f_highPA.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_highPA.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_highPA.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_highPA.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_highPA.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_highPA.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_highPA.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_highPA.length / totalHraArr.length) * 100
      ),
      total: Math.round((highRiskTotalPA.length / totalHraArr.length) * 100),
    };

    tableDataPhysicalActivity.push(
      { lowRiskTablePA },
      { moderateRiskTablePA },
      { highRiskTablePA }
    );

    let physicalActivityObj = {
      notSure: Math.round((notSure / (totalHraArr.length * 2)) * 100),
      sedentary: Math.round((sedentary / (totalHraArr.length * 2)) * 100),
      moderatelyActive: Math.round(
        (moderatelyActive / (totalHraArr.length * 2)) * 100
      ),
      levelOfActivity: Math.round(
        (levelOfActivity / (totalHraArr.length * 2)) * 100
      ),
      tableDataPhysicalActivity: tableDataPhysicalActivity,
    };

    //---------------------------------------------physicalActivity over -----------------------------------------

    //----------------------------------------------sleep ----------------------------------------------------------

    let sleepArr = await ConnectionUtil(
      `SELECT us.healthQuestions_Id , us.options , ut.user_Id  FROM user_hrasubmission us  JOIN user_hrasubmit ut
    ON (ut.user_Id = us.user_Id)
    WHERE us.healthQuestions_Id in (40,41) AND ut.company_Id = ${company_id} AND us.status='1'`
    );

    let sleep_lowRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON
      (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
      ON 
      (st.user_Id = va.user_Id)  INNER JOIN user u
      ON
      (st.user_Id = u.user_id)
      WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (40,41,42,43) 
      GROUP BY st.user_Id
      HAVING SUM(sn.question_Point)  > 3.6`
    );

    tempArr1f_lowS = [];
    tempArr2f_lowS = [];
    tempArr3f_lowS = [];
    tempArr4f_lowS = [];
    tempArr1m_lowS = [];
    tempArr2m_lowS = [];
    tempArr3m_lowS = [];
    tempArr4m_lowS = [];

    let lowRiskTotalS = sleep_lowRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_lowS.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_lowS.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_lowS.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_lowS.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_lowS.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_lowS.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_lowS.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_lowS.push(data);
      }
      return data;
    });

    //

    let sleep_moderateRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON
      (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
      ON 
      (st.user_Id = va.user_Id)  INNER JOIN user u
      ON
      (st.user_Id = u.user_id)
      WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (40,41,42,43) 
      GROUP BY st.user_Id
      HAVING SUM(sn.question_Point)  BETWEEN 2.1 AND 3.6`
    );

    tempArr1f_moderateS = [];
    tempArr2f_moderateS = [];
    tempArr3f_moderateS = [];
    tempArr4f_moderateS = [];
    tempArr1m_moderateS = [];
    tempArr2m_moderateS = [];
    tempArr3m_moderateS = [];
    tempArr4m_moderateS = [];

    let moderateRiskTotalS = sleep_moderateRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_moderateS.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_moderateS.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_moderateS.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_moderateS.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_moderateS.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_moderateS.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_moderateS.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_moderateS.push(data);
      }
      return data;
    });

    //

    let sleep_highRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
          ON
          (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
          ON 
          (st.user_Id = va.user_Id)  INNER JOIN user u
          ON
          (st.user_Id = u.user_id)
          WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (40,41,42,43) 
          GROUP BY st.user_Id
          HAVING SUM(sn.question_Point) < 2.1`
    );

    tempArr1f_highS = [];
    tempArr2f_highS = [];
    tempArr3f_highS = [];
    tempArr4f_highS = [];
    tempArr1m_highS = [];
    tempArr2m_highS = [];
    tempArr3m_highS = [];
    tempArr4m_highS = [];

    let highRiskTotalS = sleep_highRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_highS.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_highS.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_highS.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_highS.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_highS.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_highS.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_highS.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_highS.push(data);
      }
      return data;
    });

    //

    let qualityOfSleep = 0;
    let sleepAndStress = 0;
    let sleepAndHealthCondition = 0;
    let sleepRoutine = 0;

    if (sleepArr.length > 0) {
      for (let resp of sleepArr) {
        switch (resp.options) {
          case "No":
            qualityOfSleep++;
            break;
          case "I cannot sleep due to stress":
            sleepAndStress++;
            break;
          case "I cannot sleep well due to medical reasons":
            sleepAndHealthCondition++;
            break;
          case "It's a mix of things, stress and habit":
            sleepRoutine++;
            break;
          default:
            qualityOfSleep,
              sleepAndStress,
              sleepAndHealthCondition,
              sleepRoutine;
            break;
        }
      }
    }

    let tableDataSleep = [];

    let lowRiskTableS = {
      age18To30F: Math.round(
        (tempArr1f_lowS.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_lowS.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_lowS.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_lowS.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_lowS.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_lowS.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_lowS.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_lowS.length / totalHraArr.length) * 100
      ),
      total: Math.round((lowRiskTotalS.length / totalHraArr.length) * 100),
    };

    let moderateRiskTableS = {
      age18To30F: Math.round(
        (tempArr1f_moderateS.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_moderateS.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_moderateS.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_moderateS.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_moderateS.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_moderateS.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_moderateS.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_moderateS.length / totalHraArr.length) * 100
      ),
      total: Math.round((moderateRiskTotalS.length / totalHraArr.length) * 100),
    };

    let highRiskTableS = {
      age18To30F: Math.round(
        (tempArr1f_highS.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_highS.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_highS.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_highS.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_highS.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_highS.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_highS.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_highS.length / totalHraArr.length) * 100
      ),
      total: Math.round((highRiskTotalS.length / totalHraArr.length) * 100),
    };

    tableDataSleep.push(
      { lowRiskTableS },
      { moderateRiskTableS },
      { highRiskTableS }
    );

    let sleepObj = {
      highRisk: 10,
      moderateRisk: 20,
      lowRisk: 70,
      qualityOfSleep: Math.round(
        (qualityOfSleep / (totalHraArr.length * 2)) * 100
      ),
      sleepAndStress: Math.round(
        (sleepAndStress / (totalHraArr.length * 2)) * 100
      ),
      sleepAndHealthCondition: Math.round(
        (sleepAndHealthCondition / (totalHraArr.length * 2)) * 100
      ),
      sleepRoutine: Math.round((sleepRoutine / (totalHraArr.length * 2)) * 100),
      tableDataSleep: tableDataSleep,
    };

    //----------------------------------------------sleep over ----------------------------------------------------------

    //-------------------------------------------------occupational health ---------------------------------------------

    let occupationalHealthArr = await ConnectionUtil(
      `SELECT us.healthQuestions_Id , us.options , ut.user_Id  FROM user_hrasubmission us  JOIN user_hrasubmit ut
    ON (ut.user_Id = us.user_Id)
    WHERE us.healthQuestions_Id in (24,25,26,27) AND ut.company_Id = ${company_id} AND us.status='1'`
    );

    let occupationalHealth_lowRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON
      (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
      ON 
      (st.user_Id = va.user_Id)  INNER JOIN user u
      ON
      (st.user_Id = u.user_id)
      WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (24,25,26,27) 
      GROUP BY st.user_Id
      HAVING SUM(sn.question_Point)  > 1.8`
    );

    tempArr1f_lowOH = [];
    tempArr2f_lowOH = [];
    tempArr3f_lowOH = [];
    tempArr4f_lowOH = [];
    tempArr1m_lowOH = [];
    tempArr2m_lowOH = [];
    tempArr3m_lowOH = [];
    tempArr4m_lowOH = [];

    let lowRiskTotalOH = occupationalHealth_lowRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_lowOH.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_lowOH.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_lowOH.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_lowOH.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_lowOH.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_lowOH.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_lowOH.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_lowOH.push(data);
      }
      return data;
    });

    //

    let occupationalHealth_moderateRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON
      (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
      ON 
      (st.user_Id = va.user_Id)  INNER JOIN user u
      ON
      (st.user_Id = u.user_id)
      WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (24,25,26,27) 
      GROUP BY st.user_Id
      HAVING SUM(sn.question_Point)  BETWEEN 1.05 AND 1.8`
    );

    tempArr1f_moderateOH = [];
    tempArr2f_moderateOH = [];
    tempArr3f_moderateOH = [];
    tempArr4f_moderateOH = [];
    tempArr1m_moderateOH = [];
    tempArr2m_moderateOH = [];
    tempArr3m_moderateOH = [];
    tempArr4m_moderateOH = [];

    let moderateRiskTotalOH = occupationalHealth_moderateRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_moderateOH.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_moderateOH.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_moderateOH.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_moderateOH.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_moderateOH.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_moderateOH.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_moderateOH.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_moderateOH.push(data);
      }
      return data;
    });

    //

    let occupationalHealth_highRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
          ON
          (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
          ON 
          (st.user_Id = va.user_Id)  INNER JOIN user u
          ON
          (st.user_Id = u.user_id)
          WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (24,25,26,27) 
          GROUP BY st.user_Id
          HAVING SUM(sn.question_Point) < 1.05`
    );

    tempArr1f_highOH = [];
    tempArr2f_highOH = [];
    tempArr3f_highOH = [];
    tempArr4f_highOH = [];
    tempArr1m_highOH = [];
    tempArr2m_highOH = [];
    tempArr3m_highOH = [];
    tempArr4m_highOH = [];

    let highRiskTotalOH = occupationalHealth_highRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_highOH.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_highOH.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_highOH.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_highOH.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_highOH.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_highOH.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_highOH.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_highOH.push(data);
      }
      return data;
    });

    //

    let imapactOnWork = 0;
    let copingAndManagement = 0;
    let changes = 0;

    if (occupationalHealthArr.length > 0) {
      for (let resp of occupationalHealthArr) {
        switch (resp.options) {
          case "Yes":
            imapactOnWork++;
            break;
          case "Yes but not well-controlled with treatment":
            imapactOnWork++;
            break;
          case "Haven’t done much to manage my pain":
            copingAndManagement++;
            break;
          case "Adjustments to my chair":
            changes++;
            break;
          case "Adequate lighting":
            changes++;
            break;
          case "Screen adjustments/free from glare & reflection":
            changes++;
            break;
          case "When I don't have to over-reach for things on my d":
            changes++;
            break;
          case "If my workstation allows free movement":
            changes++;
            break;
          case "None of the above":
            changes++;
            break;
          default:
            imapactOnWork, copingAndManagement, changes;
            break;
        }
      }
    }

    let tableDataOccupationalHealth = [];

    let lowRiskTableOH = {
      age18To30F: Math.round(
        (tempArr1f_lowOH.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_lowOH.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_lowOH.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_lowOH.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_lowOH.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_lowOH.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_lowOH.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_lowOH.length / totalHraArr.length) * 100
      ),
      total: Math.round((lowRiskTotalOH.length / totalHraArr.length) * 100),
    };

    let moderateRiskTableOH = {
      age18To30F: Math.round(
        (tempArr1f_moderateOH.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_moderateOH.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_moderateOH.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_moderateOH.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_moderateOH.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_moderateOH.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_moderateOH.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_moderateOH.length / totalHraArr.length) * 100
      ),
      total: Math.round(
        (moderateRiskTotalOH.length / totalHraArr.length) * 100
      ),
    };

    let highRiskTableOH = {
      age18To30F: Math.round(
        (tempArr1f_highOH.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_highOH.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_highOH.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_highOH.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_highOH.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_highOH.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_highOH.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_highOH.length / totalHraArr.length) * 100
      ),
      total: Math.round((highRiskTotalOH.length / totalHraArr.length) * 100),
    };

    tableDataOccupationalHealth.push(
      { lowRiskTableOH },
      { moderateRiskTableOH },
      { highRiskTableOH }
    );

    let occupationalHealthObj = {
      highRisk: 10,
      moderateRisk: 20,
      lowRisk: 70,
      impactOnWork: Math.round(
        (imapactOnWork / (totalHraArr.length * 2)) * 100
      ),
      copingAndManagement: Math.round(
        (copingAndManagement / (totalHraArr.length * 2)) * 100
      ),
      changes: Math.round((changes / (totalHraArr.length * 2)) * 100),
      tableDataOccupationalHealth: tableDataOccupationalHealth,
    };
    //-------------------------------------------------occupational health  over---------------------------------------------

    //-------------------------------------------------heartRisk-------------------------------------------------------------

    let heartRiskArr = await ConnectionUtil(
      `SELECT us.healthQuestions_Id , us.options , ut.user_Id  FROM user_hrasubmission us  JOIN user_hrasubmit ut
    ON (ut.user_Id = us.user_Id)
    WHERE us.healthQuestions_Id in (12,14) AND ut.company_Id = ${company_id} AND us.status='1'`
    );

    let heartRisk_lowRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON
      (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
      ON 
      (st.user_Id = va.user_Id)  INNER JOIN user u
      ON
      (st.user_Id = u.user_id)
      WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (12,14) 
      GROUP BY st.user_Id
      HAVING SUM(sn.question_Point)  > 5.4`
    );

    tempArr1f_lowH = [];
    tempArr2f_lowH = [];
    tempArr3f_lowH = [];
    tempArr4f_lowH = [];
    tempArr1m_lowH = [];
    tempArr2m_lowH = [];
    tempArr3m_lowH = [];
    tempArr4m_lowH = [];

    let lowRiskTotalH = heartRisk_lowRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_lowH.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_lowH.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_lowH.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_lowH.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_lowH.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_lowH.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_lowH.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_lowH.push(data);
      }
      return data;
    });

    //

    let heartRisk_moderateRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON
      (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
      ON 
      (st.user_Id = va.user_Id)  INNER JOIN user u
      ON
      (st.user_Id = u.user_id)
      WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (12,14) 
      GROUP BY st.user_Id
      HAVING SUM(sn.question_Point)  BETWEEN 3.15 AND 5.4`
    );

    tempArr1f_moderateH = [];
    tempArr2f_moderateH = [];
    tempArr3f_moderateH = [];
    tempArr4f_moderateH = [];
    tempArr1m_moderateH = [];
    tempArr2m_moderateH = [];
    tempArr3m_moderateH = [];
    tempArr4m_moderateH = [];

    let moderateRiskTotalH = heartRisk_moderateRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_moderateH.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_moderateH.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_moderateH.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_moderateH.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_moderateH.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_moderateH.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_moderateH.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_moderateH.push(data);
      }
      return data;
    });

    //

    let heartRisk_highRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
          ON
          (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
          ON 
          (st.user_Id = va.user_Id)  INNER JOIN user u
          ON
          (st.user_Id = u.user_id)
          WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (12,14) 
          GROUP BY st.user_Id
          HAVING SUM(sn.question_Point) < 3.15`
    );

    tempArr1f_highH = [];
    tempArr2f_highH = [];
    tempArr3f_highH = [];
    tempArr4f_highH = [];
    tempArr1m_highH = [];
    tempArr2m_highH = [];
    tempArr3m_highH = [];
    tempArr4m_highH = [];

    let highRiskTotalH = heartRisk_highRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_highH.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_highH.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_highH.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_highH.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_highH.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_highH.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_highH.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_highH.push(data);
      }
      return data;
    });

    //

    let riskFactor = 0;
    let heartRiskAndDiabetes = 0;

    if (heartRiskArr.length > 0) {
      for (let resp of heartRiskArr) {
        switch (resp.options) {
          case "Yes, cholesterol altered":
            riskFactor++;
            break;
          case "Yes, blood pressure altered":
            riskFactor++, heartRiskAndDiabetes;
            break;
          case "Yes, but not well controlled ‘with treatment’":
            riskFactor++;
            break;
          case "Yes, blood sugar altered":
            riskFactor++, heartRiskAndDiabetes;
            break;
          default:
            riskFactor, heartRiskAndDiabetes;
            break;
        }
      }
    }

    let tableDataHeartRisk = [];

    let lowRiskTableHR = {
      age18To30F: Math.round(
        (tempArr1f_lowH.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_lowH.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_lowH.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_lowH.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_lowH.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_lowH.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_lowH.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_lowH.length / totalHraArr.length) * 100
      ),
      total: Math.round((lowRiskTotalH.length / totalHraArr.length) * 100),
    };

    let moderateRiskTableHR = {
      age18To30F: Math.round(
        (tempArr1f_moderateH.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_moderateH.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_moderateH.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_moderateH.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_moderateH.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_moderateH.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_moderateH.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_moderateH.length / totalHraArr.length) * 100
      ),
      total: Math.round((moderateRiskTotalH.length / totalHraArr.length) * 100),
    };

    let highRiskTableHR = {
      age18To30F: Math.round(
        (tempArr1f_highH.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_highH.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_highH.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_highH.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_highH.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_highH.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_highH.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_highH.length / totalHraArr.length) * 100
      ),
      total: Math.round((highRiskTotalH.length / totalHraArr.length) * 100),
    };

    tableDataHeartRisk.push(
      { lowRiskTableHR },
      { moderateRiskTableHR },
      { highRiskTableHR }
    );
    let heartRiskObj = {
      highRisk: 10,
      moderateRisk: 20,
      lowRisk: 70,
      riskFactor: Math.round((riskFactor / (totalHraArr.length * 2)) * 100),
      activity: Math.round((sedentary / (totalHraArr.length * 2)) * 100),
      heartRiskAndDiabetes: Math.round(
        (heartRiskAndDiabetes / (totalHraArr.length * 2)) * 100
      ),
      diet: Math.round((wellBalanced / (totalHraArr.length * 2)) * 100),
      tableDataHeartRisk: tableDataHeartRisk,
    };

    //-------------------------------------------------heartRisk over ------------------------------------------------------------

    //-------------------------------------------------diabetesRisk --------------------------------------------------------------

    let tableDataDiabetesRisk = [];

    let diabetesRisk_lowRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON
      (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
      ON 
      (st.user_Id = va.user_Id)  INNER JOIN user u
      ON
      (st.user_Id = u.user_id)
      WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (13) 
      GROUP BY st.user_Id
      HAVING SUM(sn.question_Point)  > 5.4`
    );

    tempArr1f_lowD = [];
    tempArr2f_lowD = [];
    tempArr3f_lowD = [];
    tempArr4f_lowD = [];
    tempArr1m_lowD = [];
    tempArr2m_lowD = [];
    tempArr3m_lowD = [];
    tempArr4m_lowD = [];

    let lowRiskTotalD = diabetesRisk_lowRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_lowD.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_lowD.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_lowD.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_lowD.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_lowD.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_lowD.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_lowD.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_lowD.push(data);
      }
      return data;
    });

    //

    let diabetesRisk_moderateRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON
      (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
      ON 
      (st.user_Id = va.user_Id)  INNER JOIN user u
      ON
      (st.user_Id = u.user_id)
      WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (13) 
      GROUP BY st.user_Id
      HAVING SUM(sn.question_Point)  BETWEEN 3.15 AND 5.4`
    );

    tempArr1f_moderateD = [];
    tempArr2f_moderateD = [];
    tempArr3f_moderateD = [];
    tempArr4f_moderateD = [];
    tempArr1m_moderateD = [];
    tempArr2m_moderateD = [];
    tempArr3m_moderateD = [];
    tempArr4m_moderateD = [];

    let moderateRiskTotalD = diabetesRisk_moderateRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_moderateD.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_moderateD.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_moderateD.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_moderateD.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_moderateD.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_moderateD.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_moderateD.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_moderateD.push(data);
      }
      return data;
    });

    //

    let diabetesRisk_highRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
          ON
          (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
          ON 
          (st.user_Id = va.user_Id)  INNER JOIN user u
          ON
          (st.user_Id = u.user_id)
          WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (13) 
          GROUP BY st.user_Id
          HAVING SUM(sn.question_Point) < 3.15`
    );

    tempArr1f_highD = [];
    tempArr2f_highD = [];
    tempArr3f_highD = [];
    tempArr4f_highD = [];
    tempArr1m_highD = [];
    tempArr2m_highD = [];
    tempArr3m_highD = [];
    tempArr4m_highD = [];

    let highRiskTotalD = diabetesRisk_highRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_highD.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_highD.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_highD.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_highD.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_highD.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_highD.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_highD.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_highD.push(data);
      }
      return data;
    });

    //

    let lowRiskTableDR = {
      age18To30F: Math.round(
        (tempArr1f_lowH.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_lowH.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_lowH.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_lowH.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_lowH.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_lowH.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_lowH.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_lowH.length / totalHraArr.length) * 100
      ),
      total: Math.round((lowRiskTotalH.length / totalHraArr.length) * 100),
    };

    let moderateRiskTableDR = {
      age18To30F: Math.round(
        (tempArr1f_moderateH.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_moderateH.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_moderateH.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_moderateH.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_moderateH.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_moderateH.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_moderateH.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_moderateH.length / totalHraArr.length) * 100
      ),
      total: Math.round((moderateRiskTotalH.length / totalHraArr.length) * 100),
    };

    let highRiskTableDR = {
      age18To30F: Math.round(
        (tempArr1f_highH.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_highH.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_highH.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_highH.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_highH.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_highH.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_highH.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_highH.length / totalHraArr.length) * 100
      ),
      total: Math.round((highRiskTotalH.length / totalHraArr.length) * 100),
    };

    tableDataDiabetesRisk.push(
      { lowRiskTableDR },
      { moderateRiskTableDR },
      { highRiskTableDR }
    );

    let diabetesRiskObj = {
      highRisk: 10,
      moderateRisk: 20,
      lowRisk: 70,
      risk: 50,
      bmi:
        Math.round((overweightCount / totalHraArr.length) * 100) +
        Math.round((obseseCount / totalHraArr.length) * 100) +
        Math.round((extraObese / totalHraArr.length) * 100),
      activity:
        Math.round((sedentary / (totalHraArr.length * 2)) * 100) +
        Math.round((moderatelyActive / (totalHraArr.length * 2)) * 100) +
        Math.round((notSure / (totalHraArr.length * 2)) * 100),
      diet: Math.round((unhealthy / (totalHraArr.length * 2)) * 100),
      tableDataDiabetesRisk: tableDataDiabetesRisk,
    };

    //------------------------------------------------diabetesRisk over ---------------------------------------------------------

    //-------------------------------------------------obesityRisk -------------------------------------------------------------
    let obesityRiskArr = await ConnectionUtil(
      `SELECT us.healthQuestions_Id , us.options , ut.user_Id  FROM user_hrasubmission us  JOIN user_hrasubmit ut
    ON (ut.user_Id = us.user_Id)
    WHERE us.healthQuestions_Id in (12 , 32 ) AND ut.company_Id = ${company_id} AND us.status='1'`
    );

    let obesityRiskAndCholesterol = 0;
    let obesityAndDiet = 0;
    let obesityAndGeneralHealth = 0;

    if (obesityRiskArr.length > 0) {
      for (let resp of obesityRiskArr) {
        switch (resp.options) {
          case "Yes, cholesterol altered":
            obesityRiskAndCholesterol++;
            break;
          case "I do not eat fruits & veggies":
            obesityAndDiet++;
            break;
          case "Never had any check up or tests ":
            obesityAndGeneralHealth++;
            break;
        }
      }
    }

    let tableDataObesityRisk = [];

    let anorexiaOR = {
      age18To30F: 0,
      age30To45F: 0,
      age45To60F: 0,
      age60AboveF: 0,
      age18To30M: 0,
      age30To45M: 0,
      age45To60M: 0,
      ageAbove60M: 0,
      total: 0,
    };

    let underweightOR = {
      age18To30F: 0,
      age30To45F: 0,
      age45To60F: 0,
      age60AboveF: 0,
      age18To30M: 0,
      age30To45M: 0,
      age45To60M: 0,
      ageAbove60M: 0,
      total: 0,
    };

    let healthyOR = {
      age18To30F: 0,
      age30To45F: 0,
      age45To60F: 0,
      age60AboveF: 0,
      age18To30M: 0,
      age30To45M: 0,
      age45To60M: 0,
      ageAbove60M: 0,
      total: 0,
    };
    let overweightOR = {
      age18To30F: 0,
      age30To45F: 0,
      age45To60F: 0,
      age60AboveF: 0,
      age18To30M: 0,
      age30To45M: 0,
      age45To60M: 0,
      ageAbove60M: 0,
      total: 0,
    };
    let obeseOR = {
      age18To30F: 0,
      age30To45F: 0,
      age45To60F: 0,
      age60AboveF: 0,
      age18To30M: 0,
      age30To45M: 0,
      age45To60M: 0,
      ageAbove60M: 0,
      total: 0,
    };
    let morbidObeseOR = {
      age18To30F: 0,
      age30To45F: 0,
      age45To60F: 0,
      age60AboveF: 0,
      age18To30M: 0,
      age30To45M: 0,
      age45To60M: 0,
      ageAbove60M: 0,
      total: 0,
    };

    tableDataObesityRisk.push(
      { anorexiaOR },
      { underweightOR },
      { healthyOR },
      { overweightOR },
      { obeseOR },
      { morbidObeseOR }
    );

    let obesityRiskObj = {
      underweight: Math.round((underweightCount / totalHraArr.length) * 100),
      healthy: Math.round((normalCount / totalHraArr.length) * 100),
      overweight: Math.round((overweightCount / totalHraArr.length) * 100),
      obese: Math.round((obseseCount / totalHraArr.length) * 100),
      extraObese: Math.round((extraObese / totalHraArr.length) * 100),
      risk: Math.round(
        (Math.round((obseseCount / totalHraArr.length) * 100) +
          Math.round((extraObese / totalHraArr.length) * 100) +
          Math.round((overweightCount / totalHraArr.length) * 100)) /
          3
      ),
      obesityRiskAndCholesterol: Math.round(
        (obesityRiskAndCholesterol / (totalHraArr.length * 2)) * 100
      ),
      obesityAndDiet: Math.round(
        (obesityAndDiet / (totalHraArr.length * 2)) * 100
      ),
      obesityAndMentalWellbeing: 20,
      obesityAndGeneralHealth: Math.round(
        (obesityAndGeneralHealth / (totalHraArr.length * 2)) * 100
      ),
      tableDataObesityRisk: tableDataObesityRisk,
    };
    obesityRiskObj.obesityRiskAndCholesterol = Math.round(
      (obesityRiskObj.obesityRiskAndCholesterol + obesityRiskObj.risk) / 2
    );
    obesityRiskObj.obesityAndDiet = Math.round(
      (obesityRiskObj.obesityAndDiet + obesityRiskObj.risk) / 2
    );
    //--------------------------------------------------obesity risk over ----------------------------------------------------

    //---------------------------------------------------mentalWellbeing----------------------------------------------------------

    let mentalAndWellbeingRiskArr = await ConnectionUtil(
      `SELECT us.healthQuestions_Id , us.options , ut.user_Id  FROM user_hrasubmission us  JOIN user_hrasubmit ut
    ON (ut.user_Id = us.user_Id)
    WHERE us.healthQuestions_Id in (47,48,50,55,58,51,54,52,57) AND ut.company_Id = ${company_id} AND us.status='1'`
    );

    let mentalAndWellbeing_lowRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON
      (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
      ON 
      (st.user_Id = va.user_Id)  INNER JOIN user u
      ON
      (st.user_Id = u.user_id)
      WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (47,48,50,55,58,51,54,52,57) 
      GROUP BY st.user_Id
      HAVING SUM(sn.question_Point)  > 5.4`
    );

    tempArr1f_lowMW = [];
    tempArr2f_lowMW = [];
    tempArr3f_lowMW = [];
    tempArr4f_lowMW = [];
    tempArr1m_lowMW = [];
    tempArr2m_lowMW = [];
    tempArr3m_lowMW = [];
    tempArr4m_lowMW = [];

    let lowRiskTotalMW = mentalAndWellbeing_lowRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_lowMW.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_lowMW.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_lowMW.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_lowMW.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_lowMW.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_lowMW.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_lowMW.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_lowMW.push(data);
      }
      return data;
    });

    //

    let mentalAndWellbeing_moderateRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
      ON
      (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
      ON 
      (st.user_Id = va.user_Id)  INNER JOIN user u
      ON
      (st.user_Id = u.user_id)
      WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (47,48,50,55,58,51,54,52,57) 
      GROUP BY st.user_Id
      HAVING SUM(sn.question_Point)  BETWEEN 3.15 AND 5.4`
    );

    tempArr1f_moderateMW = [];
    tempArr2f_moderateMW = [];
    tempArr3f_moderateMW = [];
    tempArr4f_moderateMW = [];
    tempArr1m_moderateMW = [];
    tempArr2m_moderateMW = [];
    tempArr3m_moderateMW = [];
    tempArr4m_moderateMW = [];

    let moderateRiskTotalMW = mentalAndWellbeing_moderateRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_moderateMW.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_moderateMW.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_moderateMW.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_moderateMW.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_moderateMW.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_moderateMW.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_moderateMW.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_moderateMW.push(data);
      }
      return data;
    });

    //

    let mentalAndWellbeing_highRisk = await ConnectionUtil(
      `SELECT sn.healthQuestions_Id, sn.user_Id , sn.company_Id , sn.score , sn.question_Point , sn.options , va.age ,  u.gender ,SUM(sn.question_Point) AS total_data FROM user_hrasubmission sn JOIN user_hrasubmit st
          ON
          (sn.user_Id = st.user_Id) INNER JOIN  view_userage va
          ON 
          (st.user_Id = va.user_Id)  INNER JOIN user u
          ON
          (st.user_Id = u.user_id)
          WHERE st.company_Id = ${company_id} AND st.status = 1 AND sn.status='1' AND sn.healthQuestions_Id IN (47,48,50,55,58,51,54,52,57) 
          GROUP BY st.user_Id
          HAVING SUM(sn.question_Point) < 3.15`
    );

    tempArr1f_highMW = [];
    tempArr2f_highMW = [];
    tempArr3f_highMW = [];
    tempArr4f_highMW = [];
    tempArr1m_highMW = [];
    tempArr2m_highMW = [];
    tempArr3m_highMW = [];
    tempArr4m_highMW = [];

    let highRiskTotalMW = mentalAndWellbeing_highRisk.map((data) => {
      if (data.age >= 18 && data.age <= 30 && data.gender == "Female") {
        tempArr1f_highMW.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Female") {
        tempArr2f_highMW.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Female") {
        tempArr3f_highMW.push(data);
      } else if (data.age > 65 && data.gender == "Female") {
        tempArr4f_highMW.push(data);
      } else if (data.age > 18 && data.age <= 30 && data.gender == "Male") {
        tempArr1m_highMW.push(data);
      } else if (data.age > 30 && data.age <= 45 && data.gender == "Male") {
        tempArr2m_highMW.push(data);
      } else if (data.age > 45 && data.age <= 60 && data.gender == "Male") {
        tempArr3m_highMW.push(data);
      } else if (data.age > 60 && data.gender == "Male") {
        tempArr4m_highMW.push(data);
      }
      return data;
    });

    //

    let frequencyAndManagement = 0;
    let stressManagement = 0;
    let workSatisfaction = 0;
    let senseOfWellbeing = 0;
    let productivityAndWorkLifeBalance = 0;
    let strssAndChronicDisease = 0;
    let readinessForChange = 0;

    if (mentalAndWellbeingRiskArr.length > 0) {
      for (let resp of mentalAndWellbeingRiskArr) {
        switch (resp.options) {
          case "Drinking smoking to reduce pressure":
            stressManagement++, strssAndChronicDisease;
            break;
          case "I don't do anything":
            stressManagement++, strssAndChronicDisease;
            break;
          case "Do not need stress management":
            stressManagement++, strssAndChronicDisease;
            break;
          case "Sometimes":
            frequencyAndManagement++;
            break;
          case "Mostly":
            frequencyAndManagement++;
            break;
          case "Always":
            frequencyAndManagement++;
            break;
          case "I often feel frustrated by inefficient people ":
            productivityAndWorkLifeBalance++;
            break;
          case "I am always in haste to do things":
            productivityAndWorkLifeBalance++;
            break;
          case "I often eat lunch or other meals while I work":
            productivityAndWorkLifeBalance++;
            break;
          case "Yes, but sometimes":
            productivityAndWorkLifeBalance++;
            break;
          case "Always":
            productivityAndWorkLifeBalance++;
            break;
          case "Often":
            productivityAndWorkLifeBalance++;
            break;
          case "Monotonous, meaningless tasks":
            workSatisfaction++;
            break;
          case "Lack of control- over Quality of work, methods, wo":
            workSatisfaction++;
            break;
          case "Too much or too little to do":
            workSatisfaction++;
            break;
          case "Unclear role in the organization":
            workSatisfaction++;
            break;
          case "Concerned and worried but I will cope well":
            senseOfWellbeing++;
            break;
          case "Concerned and worried and I am not sure how I will":
            senseOfWellbeing++;
            break;
          case "I am not that secured and I am worried":
            senseOfWellbeing++;
            break;
          case "I am not sure":
            senseOfWellbeing++;
            break;
          case "Dissatisfied":
            senseOfWellbeing++;
            break;
          case "Very Dissatisfied":
            senseOfWellbeing++;
            break;
          default:
            wellBalanced,
              unhealthy,
              balanceAct,
              portions,
              readiness,
              emotionalEating;
            break;
        }
      }
    }
    let tableDataMentalWellbeing = [];

    let lowRiskTableMW = {
      age18To30F: Math.round(
        (tempArr1f_lowMW.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_lowMW.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_lowMW.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_lowMW.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_lowMW.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_lowMW.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_lowMW.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_lowMW.length / totalHraArr.length) * 100
      ),
      total: Math.round((lowRiskTotalMW.length / totalHraArr.length) * 100),
    };

    let moderateRiskTableMW = {
      age18To30F: Math.round(
        (tempArr1f_moderateMW.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_moderateMW.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_moderateMW.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_moderateMW.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_moderateMW.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_moderateMW.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_moderateMW.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_moderateMW.length / totalHraArr.length) * 100
      ),
      total: Math.round(
        (moderateRiskTotalMW.length / totalHraArr.length) * 100
      ),
    };

    let highRiskTableMW = {
      age18To30F: Math.round(
        (tempArr1f_highMW.length / totalHraArr.length) * 100
      ),
      age30To45F: Math.round(
        (tempArr2f_highMW.length / totalHraArr.length) * 100
      ),
      age45To60F: Math.round(
        (tempArr3f_highMW.length / totalHraArr.length) * 100
      ),
      age60AboveF: Math.round(
        (tempArr4f_highMW.length / totalHraArr.length) * 100
      ),
      age18To30M: Math.round(
        (tempArr1m_highMW.length / totalHraArr.length) * 100
      ),
      age30To45M: Math.round(
        (tempArr2m_highMW.length / totalHraArr.length) * 100
      ),
      age45To60M: Math.round(
        (tempArr3m_highMW.length / totalHraArr.length) * 100
      ),
      ageAbove60M: Math.round(
        (tempArr4m_highMW.length / totalHraArr.length) * 100
      ),
      total: Math.round((highRiskTotalMW.length / totalHraArr.length) * 100),
    };

    tableDataMentalWellbeing.push(
      { lowRiskTableMW },
      { moderateRiskTableMW },
      { highRiskTableMW }
    );

    let mentalWellbeingObj = {
      underweight: Math.round((underweightCount / totalHraArr.length) * 100),
      healthy: Math.round((normalCount / totalHraArr.length) * 100),
      overweight: Math.round((overweightCount / totalHraArr.length) * 100),
      frequencyAndManagement: Math.round(
        (frequencyAndManagement / (totalHraArr.length * 2)) * 100
      ),
      stressManagement: Math.round(
        (stressManagement / (totalHraArr.length * 2)) * 100
      ),
      workSatisfaction: Math.round(
        (workSatisfaction / (totalHraArr.length * 2)) * 100
      ),
      senseOfWellbeing: Math.round(
        (senseOfWellbeing / (totalHraArr.length * 2)) * 100
      ),
      productivityAndWorkLifeBalance: Math.round(
        (productivityAndWorkLifeBalance / (totalHraArr.length * 2)) * 100
      ),
      strssAndChronicDisease: Math.round(
        (riskOfChronicCondition / (totalHraArr.length * 2)) * 100
      ),
      readinessForChange: Math.round(
        (readiness / (totalHraArr.length * 2)) * 100
      ),
      tableDataMentalWellbeing: tableDataMentalWellbeing,
    };

    //---------------------------------------------------mentalWellbeing over ----------------------------------------------------

    res.status(200).json({
      success: true,
      message: "Company Report data",
      data: {
        male: male,
        female: female,
        hraEngagement: hraEngagement,
        hraRetake: hraRetake,
        bmi: bmi,
        tobacco: tobaccoObj,
        preventiveHealth: preventiveHealthObj,
        alcohol: alcoholObj,
        diet: dietObj,
        physicalActivity: physicalActivityObj,
        sleep: sleepObj,
        occupationalHealth: occupationalHealthObj,
        heartRisk: heartRiskObj,
        diabetesRisk: diabetesRiskObj,
        obesityRisk: obesityRiskObj,
        mentalWellbeing: mentalWellbeingObj,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
