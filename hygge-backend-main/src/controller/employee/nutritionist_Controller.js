const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
const { resolve } = require("path");
const { replace } = require("node-emoji");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let { helperNotification } = require("../../lib/helpers/fcm");

//------------------------- coaching_SubCategory -------------------------
module.exports.show_Nutritionist = async (req, res) => {
  try {
    let { coachingcat_Id, isType } = req.body;
    let { company_id, id } = req.user;
    if (isType == 1) {
      let Arr = [];
      let nutritionalInformationDetails = await ConnectionUtil(
        `select * from coachingAddPost where  coachingcat_Id='${coachingcat_Id}' AND isActive='1' ORDER BY coachaddpost_id DESC;`
      );
      for (let data of nutritionalInformationDetails) {
        let userdata = await ConnectionUtil(
          `SELECT * FROM coachingpost_likedislike WHERE coachaddpost_id='${data.coachaddpost_id}' AND user_Id='${id}'`
        );
        data.user_Id = userdata != "" ? userdata[0].user_Id : id;
        data.isLike = userdata != "" ? userdata[0].isLike : 0;
        data.isDislike = userdata != "" ? userdata[0].isDislike : 0;
        data.isView = userdata != "" ? userdata[0].isView : 0;
        Arr.push(data);
      }
      res.status(200).json({
        success: true,
        message: "Nutritional Information list",
        data: Arr,
      });
    }
    if (isType == 2) {
      let guidelinesDetails = await ConnectionUtil(
        `select * from coachingAddPost where  coachingcat_Id='${coachingcat_Id}' AND isActive='1' ORDER BY coachaddpost_id DESC;`
      );
      res.status(200).json({
        success: true,
        message: "Guidelines Details list",
        data: guidelinesDetails,
      });
    }
    if (isType == 3) {
      let methodEatingDetails = await ConnectionUtil(
        `select * from coachingAddPost where  coachingcat_Id='${coachingcat_Id}' AND isActive='1' ORDER BY coachaddpost_id DESC;`
      );
      res.status(200).json({
        success: true,
        message: "Method Eating list",
        data: methodEatingDetails,
      });
    }
    if (isType == 4) {
      let mealplanlist = await ConnectionUtil(
        `select * from coaching_mealPlans where isActive='1'`
      );
      let newArr = [];
      for (let info of mealplanlist) {
        let mealday = await ConnectionUtil(
          `select * from coaching_MealDay where mealPlan_id='${info.mealPlan_id}'  AND isActive='1'`
        );
        info.days = mealday != "" ? mealday : [];
        newArr.push(info);
      }
      res.status(200).json({
        success: true,
        message: "meal plan list",
        data: newArr,
      });
    }
    if (isType == 5) {
      let GlossaryDetail = await ConnectionUtil(
        `select glossary_id,glossary_name,glossary_meaning,coachingcat_Id,status from coaching_Glossary where isActive='1'`
      );

      res.status(200).json({
        success: true,
        message: "Show glossary list",
        data: GlossaryDetail,
      });
    }
    if (isType == 6) {
      let recipesDetail = await ConnectionUtil(
        `select * from coaching_Recipes where isActive='1' ORDER BY recipes_id DESC`
      );
      let newArr = [];
      res.status(200).json({
        success: true,
        message: "Show recipes list",
        data: recipesDetail,
      });
    }
    if (isType == 7) {
      let arrD = [];
      let date = new Date();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      let daysInMonth = new Date(year, month, 0).getDate();
      date.setDate(1);
      let all_days = [];
      for (let i = 1; i <= daysInMonth; i++) {
        let d =
          year +
          "-" +
          month.toString().padStart(2, "0") +
          "-" +
          i.toString().padStart(2, "0");
        all_days.push(d);
      }
      for (let Date of all_days) {
        let meal = await ConnectionUtil(
          `select * from coaching_MealDay where mealPlan_id='${coachingcat_Id}'  AND DATE_FORMAT(created_at,'%Y-%m-%d')='${Date}' AND isActive='1'`
        );
        let obj = {};
        if (meal.length > 0) {
          obj = {
            mealPlan_id: coachingcat_Id,
            date: Date,
          };
        } else {
          obj = {
            mealPlan_id: "",
            date: Date,
          };
        }
        arrD.push(obj);
      }
      res.status(200).json({
        success: true,
        message: "meal plan list",
        data: arrD,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

//------------------------- meal_Day -------------------------
module.exports.meal_Day = async (req, res) => {
  try {
    let { mealPlan_Id, date } = req.body;
    let mealArr = [];
    let mealDay = await ConnectionUtil(
      `select * from coaching_MealDay where mealPlan_id='${mealPlan_Id}' AND DATE_FORMAT(created_At,'%Y-%m-%d')='${date}' AND isActive='1'`
    );
    for (let mealDayObj of mealDay) {
      let dayRecipes = JSON.parse(mealDayObj.mealday);
      mealDayObj.mealday = await recipesData(dayRecipes);
      mealArr.push(mealDayObj);
    }
    res.status(200).json({
      success: true,
      message: "meal plan list",
      data: mealArr,
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

//-------------------- function RecipesData fetch mealDay --------------------
async function recipesData(dayRecipesdata) {
  let newArr = [];
  for (let recipe of dayRecipesdata) {
    let inClause = recipe.recipes.map((id) => "'" + id + "'").join();
    let recipesClause = `recipes_id IN(${inClause})`;
    let DataRecipe = await ConnectionUtil(
      `select * from coaching_Recipes where  ${recipesClause}`
    );
    if (DataRecipe.length > 0) {
      newArr.push(DataRecipe);
    }
  }
  return newArr;
}

module.exports.meal_planWise = async (req, res) => {
  try {
    let { coachingcat_Id, mealPlan_id , mealday_id} = req.body;

    let arrD = [];
    let date = new Date();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let daysInMonth = new Date(year, month, 0).getDate();
    date.setDate(1);
    let all_days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      let d =
        year +
        "-" +
        month.toString().padStart(2, "0") +
        "-" +
        i.toString().padStart(2, "0");
      all_days.push(d);
    }

    // console.log(all_days)

    // console.log(Date , "date")
    let meal = await ConnectionUtil(
      `select * from coaching_MealDay where coachingcat_Id='${coachingcat_Id}' AND isActive='1'  AND mealPlan_id = ${mealPlan_id} and mealday_id = ${mealday_id}`
    );

    let obj = {};
    let object = {};
    // console.log(meal)

    if (meal.length > 0) {
      let i;
      let x;
      // let y = [];
      // let tempArr = []
      let z;
      for (i = 0; i <= meal.length - 1; i++) {
        x = JSON.parse(meal[i].mealday);

        for (let k = 0; k <= x.length - 1; k++) {
          recipeDetailArr1 = [];
          for (let a = 0; a <= x[k].recipes.length - 1; a++) {
            z = x[k].recipes[a];
            let recipeDetailArr = await ConnectionUtil(
              `select recipe_title ,  calories , protein , fat , carbs , instructions , ingredients , servingsize , preparation_time , recipe_image , is_type from coaching_Recipes where recipes_id = '${z}'`
            );
            recipeDetailArr1.push(recipeDetailArr[0]);
            // tempArr.push(recipeDetailArr[0])
          }
          x[k].recipeDetail = recipeDetailArr1;
        }

        // let recobj =

        console.log(meal);

        object = {
          date: meal[i].created_At,
          mealday_id: meal[i].mealday_id,
          coachingcat_id: meal[i].coachingcat_id,
          created_At: meal[i].created_At,
          updated_at: meal[i].updated_at,
          mealPlan_id: meal[i].mealPlan_id,
          // calorieRange : meal[i].from_calories + "-" + meal[i].to_calories,
          mealday: x,
          // recipeDetail : recipeDetailArr1
        };

        arrD.push(object);

        //  console.log(x[0].recipes , "x[0].recipes")
      }
      // obj = {
      //     date: Date,
      //     mealPlan :meal,
      //     recipesData : y
      // };
    }

    res.status(200).json({
      success: true,
      message: "meal plan list",
      data: arrD,
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

//==================================== For viewing The Posts ==================================

//------------------------------------ showViewNutritionList -----------------------------------
module.exports.showViewNutritionList = async (req, res) => {
  try {
    let { coachaddpost_id } = req.body;
    let { company_id, id } = req.user;
    let user_detail = await ConnectionUtil(
      `Select user_id,branch_Id,company_id from user where user_id='${id}' and company_id='${company_id}' and isActive=1`
    );
    let CoachaddpostArr = await ConnectionUtil(
      `SELECT coachaddpost_id,coachingcat_Id FROM coachingAddPost WHERE coachaddpost_id='${coachaddpost_id}' AND isActive='1'`
    );
    let entryDetail = await ConnectionUtil(
      `SELECT * FROM coachingpost_likedislike WHERE coachaddpost_id='${coachaddpost_id}' AND user_Id='${id}' AND isView='1'`
    );
    if (CoachaddpostArr.length > 0) {
      if (entryDetail == "") {
        let obj = {
          coachaddpost_id: CoachaddpostArr[0].coachaddpost_id,
          coachingcat_Id: CoachaddpostArr[0].coachingcat_Id,
          user_Id: user_detail[0].user_id,
          company_Id: user_detail[0].company_id,
          branch_Id: user_detail[0].branch_Id,
          isView: "1",
          created_By: user_detail[0].user_id,
          updated_By: user_detail[0].user_id,
        };
        let insertQuery = await ConnectionUtil(
          `INSERT INTO coachingpost_likedislike SET ?`,
          obj
        );
        if (insertQuery.insertId > 0) {
          let userdata = await ConnectionUtil(
            `SELECT * FROM coachingpost_likedislike WHERE coachaddpost_id='${coachaddpost_id}' AND user_Id='${id}' AND isView='1'`
          );
          let newObj = {
            isLike: userdata[0].isLike,
            isDislike: userdata[0].isDislike,
          };
          res.status(200).json({
            success: true,
            message: "data inserted successfully",
            data: newObj,
          });
        }
      } else {
        res.status(400).json({
          success: true,
          message: "Entry already exist",
        });
      }
    } else {
      res.status(400).json({
        success: true,
        message: "coachingPost is not Active",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports.glossaryPostViews = async (req,res) => {
  try {
      let {glossary_id} = req.body;
      let { company_id, id } = req.user;
      let user_detail = await ConnectionUtil(`Select user_id,branch_Id,company_id from user where user_id='${id}' and company_id='${company_id}' and isActive=1`);
      let GlossarypostArr = await ConnectionUtil(`SELECT glossary_id,coachingcat_Id FROM coaching_Glossary WHERE glossary_id='${glossary_id}' AND isActive='1'`);
      let entryDetail = await ConnectionUtil(`SELECT * FROM coaching_glossarypostviews WHERE glossary_id='${glossary_id}' AND user_Id='${id}' AND isView='1'`);
      if(GlossarypostArr.length>0){
      if(entryDetail==""){
      let obj = {
         glossary_id : GlossarypostArr[0].glossary_id, 
         coachingcat_Id : GlossarypostArr[0].coachingcat_Id,
         user_Id : user_detail[0].user_id,
         company_Id : user_detail[0].company_id,
         branch_Id : user_detail[0].branch_Id,
         isView : '1',
         created_By : user_detail[0].user_id,
         updated_By : user_detail[0].user_id,
      }
      let insertQuery = await ConnectionUtil(`INSERT INTO coaching_glossarypostviews SET ?`,obj);
         res.status(200).json({
             success: true,
             message: "data inserted successfully",
             data: insertQuery
         })
     }else{
         res.status(400).json({
             success: true,
             message: "Entry already exist"
         })
     }
 }else{
     res.status(400).json({
         success: true,
         message: "glossaryPost is not Active"
     })
   }
 } catch(err) {
        res.status(400).json({
           success: false,
           message: err.message
        })
    }
}

module.exports.mealPlanPostViews = async (req,res) => {
  try {
      let {mealPlan_id} = req.body;
      let { company_id, id } = req.user;
      let user_detail = await ConnectionUtil(`Select user_id,branch_Id,company_id from user where user_id='${id}' and company_id='${company_id}' and isActive=1`);
      let MealPlanpostArr = await ConnectionUtil(`SELECT mealPlan_id,coachingcat_id FROM coaching_mealPlans WHERE mealPlan_id='${mealPlan_id}' AND isActive='1'`);
      let entryDetail = await ConnectionUtil(`SELECT * FROM coaching_mealpostviews WHERE mealPlan_id='${mealPlan_id}' AND user_Id='${id}' AND isView='1'`);
      if(MealPlanpostArr.length>0){
      if(entryDetail==""){
      let obj = {
         mealPlan_id : MealPlanpostArr[0].mealPlan_id, 
         coachingcat_id : MealPlanpostArr[0].coachingcat_id,
         user_Id : user_detail[0].user_id,
         company_Id : user_detail[0].company_id,
         branch_Id : user_detail[0].branch_Id,
         isView : '1',
         created_By : user_detail[0].user_id,
         updated_By : user_detail[0].user_id,
      }
      let insertQuery = await ConnectionUtil(`INSERT INTO coaching_mealpostviews SET ?`,obj);
         res.status(200).json({
             success: true,
             message: "data inserted successfully",
             data: insertQuery
         })
     }else{
         res.status(400).json({
             success: true,
             message: "Entry already exist"
         })
     }
 }else{
     res.status(400).json({
         success: true,
         message: "mealPlanPost is not Active"
     })
   }
 } catch(err) {
        res.status(400).json({
           success: false,
           message: err.message
        })
    }
}

module.exports.recipesPostViews = async (req,res) => {
  try {
      let {recipes_id} = req.body;
      let { company_id, id } = req.user;
      let user_detail = await ConnectionUtil(`Select user_id,branch_Id,company_id from user where user_id='${id}' and company_id='${company_id}' and isActive=1`);
      let RecipespostArr = await ConnectionUtil(`SELECT recipes_id,coachingcat_Id FROM coaching_Recipes WHERE recipes_id='${recipes_id}' AND isActive='1'`);
      let entryDetail = await ConnectionUtil(`SELECT * FROM coaching_recipespostviews WHERE recipes_id='${recipes_id}' AND user_Id='${id}' AND isView='1'`);
      if(RecipespostArr.length>0){
      if(entryDetail==""){
      let obj = {
         recipes_id : RecipespostArr[0].recipes_id, 
         coachingcat_Id : RecipespostArr[0].coachingcat_Id,
         user_Id : user_detail[0].user_id,
         company_Id : user_detail[0].company_id,
         branch_Id : user_detail[0].branch_Id,
         isView : '1',
         created_By : user_detail[0].user_id,
         updated_By : user_detail[0].user_id,
      }
      let insertQuery = await ConnectionUtil(`INSERT INTO coaching_recipespostviews SET ?`,obj);
         res.status(200).json({
             success: true,
             message: "data inserted successfully",
             data: insertQuery
         })
     }else{
         res.status(400).json({
             success: true,
             message: "Entry already exist"
         })
     }
 }else{
     res.status(400).json({
         success: true,
         message: "recipePost is not Active"
     })
   }
 } catch(err) {
        res.status(400).json({
           success: false,
           message: err.message
        })
    }
}

//=================================== For Like Dislike Functionality ===================================
//------------------------------------ LikeDislikeNutritionList ----------------------------------
module.exports.LikeDislikeNutritionList = async (req, res) => {
  try {
    let { coachaddpost_id, isLike, isDislike } = req.body;
    let { company_id, id } = req.user;
    // console.log(company_id , "companyid")
    let entryDetail = await ConnectionUtil(
      `SELECT * FROM coachingpost_likedislike WHERE coachaddpost_id='${coachaddpost_id}' AND user_Id='${id}' AND isView='1' AND isLike='0' AND isDislike='0'`
    );
    if (entryDetail.length > 0) {
      let updateQuery =
        await ConnectionUtil(`UPDATE coachingpost_likedislike set
            isLike   = '${isLike}',
            isDislike     = '${isDislike}' 
            where coachaddpost_id='${coachaddpost_id}' AND user_Id='${id}' AND isView='1' AND isLike='0' AND isDislike='0'`);

      await feedbackChallenge(id, company_id);

      res.status(200).json({
        success: true,
        message: "Challenge list",
        data: updateQuery,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "This record is already updated",
      });
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

async function feedbackChallenge(user_Id, company_Id) {
  let challengeDetail = await ConnectionUtil(
    `select age , age_From , age_To , Gender , genderType , Department , department_Name , company_Id , Reward , action_Required ,challenge_Configuration , DATE_FORMAT(expiry_Date , '%Y-%m-%d') expiry_Date, challengePredefined_Id , DATE_FORMAT(created_At , '%Y-%m-%d') created_At , challenges_id from challenges where  challengePredefined_Id = '13' AND  DATE_FORMAT(expiry_Date, '%Y-%m-%d') >=DATE_FORMAT(CURDATE(),'%Y-%m-%d') AND action_Required = '1'`
  );
  for (let Challenge of challengeDetail) {
    let challengeUserAssignDetail = await ConnectionUtil(
      `select * from userassign_challenges  where isCompleted='0' AND isAccept='1' AND company_Id = '${Challenge.company_Id}' AND challenge_Id = '${Challenge.challenges_id}' AND user_id ='${user_Id}' `
    );

    console.log(Challenge, "Challenge");

    if (Challenge.company_Id == 0) {
      if (Challenge.age == 0 && Challenge.Gender == 0) {
        if (challengeUserAssignDetail.length > 0) {
          await challengeTask(
            Challenge,
            user_Id,
            company_Id,
            challengeUserAssignDetail
          );
        }
      } else {
        let ageFrom = Challenge.age_From;
        let ageTo = Challenge.age_To;
        let genderType = Challenge.genderType;
        if (Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTask(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTask(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTask(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
      }
    } else {
      if (
        Challenge.age == 0 &&
        Challenge.Gender == 0 &&
        Challenge.Department == 0
      ) {
        if (challengeUserAssignDetail.length > 0) {
          await challengeTask(
            Challenge,
            user_Id,
            company_Id,
            challengeUserAssignDetail
          );
        }
      } else {
        let ageFrom = Challenge.age_From;
        let ageTo = Challenge.age_To;
        let genderType = Challenge.genderType;
        let department = Challenge.department_Name;
        if (Challenge.Gender == 0 && Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTask(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0 && Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTask(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.age == 0 && Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else if");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTask(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.Department == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTask(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else if (Challenge.Gender == 0) {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTask(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        } else {
          let userDetailArr = await ConnectionUtil(
            `SELECT * FROM view_userage WHERE age BETWEEN ${ageFrom} AND ${ageTo} AND gender = '${genderType}' AND department = '${department}' AND company_id = ${company_Id} AND isActive = 1 AND user_id = '${user_Id}'`
          );
          // console.log(userDetailArr, "userDetailArr - else");
          if (userDetailArr.length > 0) {
            if (challengeUserAssignDetail.length > 0) {
              await challengeTask(
                Challenge,
                user_Id,
                company_Id,
                challengeUserAssignDetail
              );
            }
          } else {
            console.log("user not allowed to participate");
          }
        }
      }
    }
  }
}

async function challengeTask(
  Challenge,
  user_Id,
  company_Id,
  challengeUserAssignDetail
) {
  //   console.log(challengeUserAssignDetail, "challenfjghfd");

  let y = JSON.parse(Challenge.challenge_Configuration);
  // console.log(y, "y");
  let valueCondition =
    y[0].value == "Less Than"
      ? "<"
      : y[0].value == "More Than"
      ? ">"
      : y[0].value == "Equal"
      ? "=="
      : ">=";
  //   console.log(valueCondition, "valueCondition");

  let valueTimes = y[1].value;

  let feedbackChallengeArr = await ConnectionUtil(
    `SELECT * FROM  coachingpost_likedislike WHERE isView = '1'  AND user_Id = ${user_Id} AND company_Id = ${company_Id} AND DATE_FORMAT(updated_At , '%Y-%m-%d') BETWEEN '${Challenge.created_At}' AND '${Challenge.expiry_Date}'`
  );

  let countFeedback = 0;
  for (let resp of feedbackChallengeArr) {
    countFeedback =
      (resp.isLike == "1" && resp.isDislike == "0") ||
      (resp.isLike == "0" && resp.isDislike == "1")
        ? countFeedback + 1
        : countFeedback;
    // console.log(countFeedback, "countFeedback");
  }

  console.log(countFeedback, "countFeedback");

  if (eval(countFeedback + " " + valueCondition + " " + valueTimes)) {
    console.log("condition satisfied of challenge");
    challengeUserAssignDetail.map(async (data) => {
      let challengeUserAssignDetail = await ConnectionUtil(
        `update userassign_challenges set  isCompleted='1' where assignChallenge_id='${data.assignChallenge_id}'`
      );
      let DATE = new Date().getDate();
      let MONTH = new Date().getMonth() + 1;
      let YEAR = new Date().getFullYear();
      let date = YEAR + "-" + MONTH + "-" + DATE;
      let obj = {
        user_Id: user_Id,
        reward_Id: Challenge.challenges_id, //reward_Id,
        reward_point: Challenge.Reward,
        isDeposit: 1,
        redeem_Date: date,
      };
      let addRewardRedeemInsertQuery = await ConnectionUtil(
        `INSERT INTO reward_redeem SET?`,
        obj
      );
      let userDeviceToken = await ConnectionUtil(
        `select device_Token from fcm_Notification where user_Id='${user_Id}'`
      );
      let Arr = [];
      await userDeviceToken.map(async (data) => {
        return Arr.push(data.device_Token);
      });
      let testMessage = {
        title: "Challenge",
        body: "Congratulation your challenge completed successfully",
      };
      console.log(testMessage);
      await helperNotification(Arr, testMessage);
    });
  }
}

//--------------------------------getMealDayId----------------------------------

module.exports.getMealId = async (req, res) => {
  try {
    let arr = [];
    let {mealPlan_id} = req.query
    let obj = {};
    let y;
    let x;
    let getPlanIdArr = await ConnectionUtil(
      `select distinct(mealPlan_id) from coaching_MealDay`
    );
    
      
        let getDayIdArr = await ConnectionUtil(
          `select mealday_id ,mealPlan_id  from coaching_MealDay where mealPlan_id = ${mealPlan_id}`
        );
        x = getDayIdArr.map((data) => {
          y = getDayIdArr.map((resp) => {
            return resp.mealday_id;
          });
          return (obj = {
            mealPlanId: data.mealPlan_id,
            mealDayId: y,
            dayNos: y.length,
          });
        });
        arr.push(x[0]);
      
    

    res.status(200).json({
      success: true,
      message: "show mealday_id successfully",
      data: arr,
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

