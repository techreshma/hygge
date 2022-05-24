const util = require('util');
let status = require('statuses');
let connection = require('../../config/database');
const {
    stringify
} = require('querystring');
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
            message: err.message
        })
    }
}

//------------------------- coaching_subCategory -------------------------
module.exports.coaching_subCategory = async (req, res) => {
    try {
        let {
            coachingcat_id
        } = req.body;
        let coachingsubCategoryDetails = await ConnectionUtil(
            `select * from coaching_Category where coachingSubcat_id='${coachingcat_id}'`
        );
        let newArr = [];
        for (let coachingcat of coachingsubCategoryDetails) {
            coachingcat.views = 1,
                coachingcat.likes = 2,
                coachingcat.dislikes = 5
            newArr.push(coachingcat)
        }
        res.status(200).json({
            success: true,
            message: "Show coaching subcategory",
            data: newArr
        });
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

// =================== Post Coaching ===================Nutrition===

//------------------------- coachingAddPost -------------------------
module.exports.coachingAdd_Post = async (req, res) => {
    try {
        let {
            coachingcat_Id,
            title,
            description,
            image,
            keywords,
            type
        } = req.body;
        let coachPostObj = {
            coachingcat_Id: coachingcat_Id,
            fact_title: title,
            fact_description: description,
            image: JSON.stringify(image),
            keywords: JSON.stringify(keywords),
            type: type
        }
        let addcoachPostObj = await ConnectionUtil(`insert into coachingAddPost set?`, coachPostObj)
        if (addcoachPostObj.insertId != "") {
            res.status(200).json({
                success: true,
                message: "Coaching add post successfull"
            })
        } else {
            res.status(400).json({
                success: true,
                message: "something went wrong",
            });
        }
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

//------------------------- PostList -------------------------
module.exports.PostList = async (req, res) => {
    try {
        let {
            coachingcat_Id
        } = req.body;
        let PostListDetails = await ConnectionUtil(
            `select fact_title,fact_description,status,coachaddpost_id from coachingAddPost where  coachingcat_Id='${coachingcat_Id}' AND isActive='1' ORDER BY coachaddpost_id DESC;`
        );
        
        let newArr = [];
        let likeDislikeViewArr=[];
        let viewCountByYearArr = [];
        let likeCountByYearArr = [];
        let DislikeCountByYearArr = [];
        
        for (let info of PostListDetails) { 
            let TotalDislikesByYear = await ConnectionUtil(`SELECT COUNT(*) AS totalDislikeCount, DATE_FORMAT(updated_At,"%Y") AS YEAR FROM coachingpost_likedislike WHERE coachaddpost_id='${info.coachaddpost_id}' AND isLike='0' AND isDislike='1' GROUP BY YEAR ORDER BY YEAR ASC`);
            for (let item of TotalDislikesByYear){
                DislikeCountByYearArr.push(item);
            }
            let TotalViewCountByYear = await ConnectionUtil(`SELECT COUNT(*) AS TotalViewCount, DATE_FORMAT(updated_At,"%Y") AS YEAR FROM coachingpost_likedislike WHERE coachaddpost_id='${info.coachaddpost_id}' AND isView='1' GROUP BY YEAR ORDER BY YEAR ASC`);
            for (let item of TotalViewCountByYear){
                viewCountByYearArr.push(item);
            }
            let TotalLikeCountByYear = await ConnectionUtil(`SELECT COUNT(*) AS totalLikeCount, DATE_FORMAT(updated_At,"%Y") AS YEAR FROM coachingpost_likedislike WHERE coachaddpost_id='${info.coachaddpost_id}' AND isLike='1' AND isDislike='0' GROUP BY YEAR ORDER BY YEAR ASC`);
            for (let item of TotalLikeCountByYear){
                likeCountByYearArr.push(item);
            }

            let totalLikeCount = await ConnectionUtil(`SELECT COUNT(*) AS totalcount FROM coachingpost_likedislike WHERE coachaddpost_id='${info.coachaddpost_id}' AND isLike='1' AND isDislike='0'`);
            let totalDislikeCount = await ConnectionUtil(`SELECT COUNT(*) AS totalcount FROM coachingpost_likedislike WHERE coachaddpost_id='${info.coachaddpost_id}' AND isLike='0' AND isDislike='1'`);
            let totalViewsCount = await ConnectionUtil(`SELECT COUNT(*) AS totalcount FROM coachingpost_likedislike WHERE coachaddpost_id='${info.coachaddpost_id}' AND isView='1'`);
                info.views = totalViewsCount[0].totalcount,
                info.likes = totalLikeCount[0].totalcount,
                info.dislikes = totalDislikeCount[0].totalcount
            newArr.push(info)
        }
        
        let likeCount = 0;
        let dislikeCount = 0;
        let viewCount = 0;
        newArr.map((data) => {
          if(data.views){
              viewCount += data.views;
          }
          if(data.likes){
              likeCount += data.likes;
          }
          if(data.dislikes){
              dislikeCount += data.dislikes;
          }
        })
        likeDislikeViewArr.push({TotalLikes:likeCount,TotalDislikes:dislikeCount,TotalViews:viewCount});

        let yearMapOfLikes = new Object();
        let yearMapOfDislikes = new Object();
        let yearMapOfViews = new Object();

        //----------------------- YearWise calculation of viewsCount ------------------------------

        for(let i=0;i<viewCountByYearArr.length;i++){
           if(yearMapOfViews[viewCountByYearArr[i]['YEAR']] == null){
            yearMapOfViews[viewCountByYearArr[i]['YEAR']] = viewCountByYearArr[i];
           }else{
            yearMapOfViews[viewCountByYearArr[i]['YEAR']]['TotalViewCount'] += viewCountByYearArr[i]['TotalViewCount'];
           }
        }
    
        let resultOfViewsCount = [];
        for (let key in yearMapOfViews){
        if(yearMapOfViews.hasOwnProperty(key)){
            resultOfViewsCount.push(yearMapOfViews[key]);
          }
        }

        //----------------------- YearWise calculation of LikesCount ------------------------------

        for(let i=0;i<likeCountByYearArr.length;i++){
            if(yearMapOfLikes[likeCountByYearArr[i]['YEAR']] == null){
                yearMapOfLikes[likeCountByYearArr[i]['YEAR']] = likeCountByYearArr[i];
            }else{
                yearMapOfLikes[likeCountByYearArr[i]['YEAR']]['totalLikeCount'] += likeCountByYearArr[i]['totalLikeCount'];
            }
         }
     
        let resultOfLikesCount = [];
        for (let key in yearMapOfLikes){
         if(yearMapOfLikes.hasOwnProperty(key)){
            resultOfLikesCount.push(yearMapOfLikes[key]);
           }
         }

        //----------------------- YearWise calculation of DislikesCount ------------------------------

        for(let i=0;i<DislikeCountByYearArr.length;i++){
            if(yearMapOfDislikes[DislikeCountByYearArr[i]['YEAR']] == null){
                yearMapOfDislikes[DislikeCountByYearArr[i]['YEAR']] = DislikeCountByYearArr[i];
            }else{
                yearMapOfDislikes[DislikeCountByYearArr[i]['YEAR']]['totalDislikeCount'] += DislikeCountByYearArr[i]['totalDislikeCount'];
            }
         }
     
         let resultOfDislikesCount = [];
         for (let key in yearMapOfDislikes){
         if(yearMapOfDislikes.hasOwnProperty(key)){
            resultOfDislikesCount.push(yearMapOfDislikes[key]);
           }
         }

        let obj = {
            TotalViewCountByYear : resultOfViewsCount,
            TotalLikeCountByYear : resultOfLikesCount,
            TotalDislikesByYear : resultOfDislikesCount,
            likeDislikeViewArr : likeDislikeViewArr,
            newArr :newArr
        }
        res.status(200).json({
            success: true,
            message: "post list",
            data:obj
        });
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

//-------------------------updatePostLists -------------------------
module.exports.updatePostList = async (req, res) => {
    try {
        let {
            coachaddpost_id,
            title,
            description,
            image,
            keywords,
            ip_Address,
            type
        } = req.body;
        let updatePostListdetails = await ConnectionUtil(
            `update coachingAddPost set fact_title='${title}',fact_description='${description}',image='${JSON.stringify(image)}',keywords='${JSON.stringify(keywords)}', ip_Address='${ip_Address}', type='${type}' where coachaddpost_id='${coachaddpost_id}' AND isActive='1' AND status='1'`
        );
        if (updatePostListdetails.affectedRows != 0) {
            res.status(200).json({
                success: true,
                message: "update postlist successfull",
            });
        } else {
            res.status(400).json({
                success: false,
                message: "something went wrong"
            })
        }
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

//-------------------------deletePostList -------------------------
module.exports.deletePostList = async (req, res) => {
    try {
        let {
            coachaddpost_id
        } = req.body;
        let deletePostListdetails = await ConnectionUtil(
            `update coachingAddPost set isActive='0' where coachaddpost_id='${coachaddpost_id}'`
        );
        if (deletePostListdetails.affectedRows != 0) {
            res.status(200).json({
                success: true,
                message: "delete postlist successfull",
            });
        } else {
            res.status(400).json({
                success: false,
                message: "something went wrong"
            })
        }
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

//-------------------------updatestatusPostList -------------------------
module.exports.updatestatusPostList = async (req, res) => {
    try {
        let {
            coachaddpost_id,
            status
        } = req.body;
        let updatestatusPostListdetails = await ConnectionUtil(
            `update coachingAddPost set status='${status}' where coachaddpost_id='${coachaddpost_id}'`
        );
        if (updatestatusPostListdetails.affectedRows != 0) {
            res.status(200).json({
                success: true,
                message: "status update successfull",
            });
        } else {
            res.status(400).json({
                success: false,
                message: "something went wrong"
            })
        }
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

//------------------------- Postdetails -------------------------
module.exports.Postdetails = async (req, res) => {
    try {
        let {
            coachaddpost_id
        } = req.body;
        let newArr = [];
        let Postdetails = await ConnectionUtil(
            `select * from coachingAddPost where isActive='1' AND coachaddpost_id='${coachaddpost_id}' `
        );
       let totalLikeCount = await ConnectionUtil(`SELECT COUNT(*) AS totalcount FROM coachingpost_likedislike WHERE coachaddpost_id='${coachaddpost_id}' AND isLike='1' AND isDislike='0'`); 
       let totalDislikeCount = await ConnectionUtil(`SELECT COUNT(*) AS totalcount FROM coachingpost_likedislike WHERE coachaddpost_id='${coachaddpost_id}' AND isLike='0' AND isDislike='1'`);
       let totalViewsCount = await ConnectionUtil(`SELECT COUNT(*) AS totalcount FROM coachingpost_likedislike WHERE coachaddpost_id='${coachaddpost_id}' AND isView='1'`);  
       for (let postObj of Postdetails) {
            postObj.views = totalViewsCount[0].totalcount,
            postObj.likes = totalLikeCount[0].totalcount,
            postObj.dislikes = totalDislikeCount[0].totalcount
            newArr.push(postObj)
        }
        res.status(200).json({
            success: true,
            message: " postlist description",
            data: newArr
        });

    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

// =================== Glossary Coaching ===================

//------------------------- AddGlossary -------------------------
module.exports.Add_Glossary = async (req, res) => {
    try {
        let {
            glossary_Name,
            glossary_Meaning,
            ip_Address,
            userId,
            coachingcat_Id
        } = req.body;
        let glossaryAddObj = {
            glossary_name: glossary_Name,
            glossary_meaning: glossary_Meaning,
            ip_Address: ip_Address,
            created_By: userId,
            updated_By: userId,
            coachingcat_Id: coachingcat_Id
        }
        let glossaryInsertQuery = await ConnectionUtil('INSERT INTO coaching_Glossary  SET ?', glossaryAddObj);
        res.status(200).json({
            success: true,
            message: "Add glossary successfully",
            data: glossaryInsertQuery
        });
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

//------------------------- ListGlossary -------------------------
module.exports.List_Glossary = async (req, res) => {
    try {
        let GlossaryDetail = await ConnectionUtil(`select glossary_id,glossary_name,glossary_meaning,coachingcat_Id,status from coaching_Glossary where isActive='1'`);
        let newArr = [];
        let viewArr = [];
        let viewCountByYearArr = [];
        for (let glossaryObj of GlossaryDetail) {
            let TotalViewCountByYear = await ConnectionUtil(`SELECT COUNT(*) AS TotalViewCount, DATE_FORMAT(updated_At,"%Y") AS YEAR FROM coaching_glossarypostviews WHERE glossary_id='${glossaryObj.glossary_id}' AND isView='1' GROUP BY YEAR ORDER BY YEAR ASC`);
            for (let item of TotalViewCountByYear){
                viewCountByYearArr.push(item);
            }
            let totalViewsCount = await ConnectionUtil(`SELECT COUNT(*) AS totalcount FROM coaching_glossarypostviews WHERE glossary_id='${glossaryObj.glossary_id}' AND isView='1'`);
            glossaryObj.views = totalViewsCount[0].totalcount;
            newArr.push(glossaryObj)
        }

        let viewCount = 0;
        newArr.map((data) => {
          if(data.views){
              viewCount += data.views;
          }
        })
        viewArr.push({TotalViews:viewCount});

        //----------------------- YearWise calculation of viewsCount ------------------------------

        let yearMapOfViews = new Object();
        for(let i=0;i<viewCountByYearArr.length;i++){
           if(yearMapOfViews[viewCountByYearArr[i]['YEAR']] == null){
            yearMapOfViews[viewCountByYearArr[i]['YEAR']] = viewCountByYearArr[i];
           }else{
            yearMapOfViews[viewCountByYearArr[i]['YEAR']]['TotalViewCount'] += viewCountByYearArr[i]['TotalViewCount'];
           }
        }
    
        let resultOfViewsCount = [];
        for (let key in yearMapOfViews){
        if(yearMapOfViews.hasOwnProperty(key)){
            resultOfViewsCount.push(yearMapOfViews[key]);
          }
        }

        let obj = {
            TotalViewCountByYear : resultOfViewsCount,
            ViewArr : viewArr,
            newArr :newArr
        }
        res.status(200).json({
            success: true,
            message: "Show glossary list",
            data: obj
        });
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

// //------------------------- DeleteGlossary -------------------------
module.exports.Delete_Glossary = async (req, res) => {
    try {
        let {
            glossary_id,
            ip_Address,
            userId
        } = req.body;
        let glossaryDeleteQuery = await ConnectionUtil(`update coaching_Glossary set updated_By='${userId}' , isActive='0' , ip_Address = '${ip_Address}' where glossary_id = '${glossary_id}' `);
        res.status(200).json({
            success: true,
            message: "Deleted glossary successfully",
            data: glossaryDeleteQuery
        });
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

//------------------------- EditGlossary -------------------------
module.exports.Edit_Glossary = async (req, res) => {
    try {
        let {
            glossary_name,
            glossary_meaning,
            userId,
            ip_Address,
            glossary_id,
            coachingcat_Id
        } = req.body;
        let glossaryUpdateQuery = await ConnectionUtil(`update coaching_Glossary set 
            glossary_name     = '${glossary_name}',
            glossary_meaning  = '${glossary_meaning}',
            updated_By        = '${userId}',
            ip_Address        = '${ip_Address}',
            coachingcat_Id    ='${coachingcat_Id}'
            where glossary_id ='${glossary_id}'`);
        res.status(200).json({
            success: true,
            message: "Updated glossary successfully",
            data: glossaryUpdateQuery
        });
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

//------------------------- Detail_Glossary -------------------------
module.exports.Detail_Glossary = async (req, res) => {
    try {
        let {
            glossary_id
        } = req.body;
        let GlossaryDetail = await ConnectionUtil(`select * from coaching_Glossary where isActive='1' AND glossary_id='${glossary_id}' `);
        res.status(200).json({
            success: true,
            message: "Glossary detail",
            data: GlossaryDetail
        });
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

//------------------------- Status_Glossary -------------------------
module.exports.updatestatusGlossaryList = async (req, res) => {
    try {
        let {
            glossary_id,
            status
        } = req.body;
        let updatestatusGlossaryListdetails = await ConnectionUtil(
            `update coaching_Glossary set status='${status}' where glossary_id='${glossary_id}'`
        );
        if (updatestatusGlossaryListdetails.affectedRows != 0) {
            res.status(200).json({
                success: true,
                message: "status update successfull",
            });
        } else {
            res.status(400).json({
                success: false,
                message: "something went wrong"
            })
        }
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

// =================== Recipes Coaching ===================

//------------------------- AddRecipes -------------------------
module.exports.Add_Recipes = async (req, res) => {
    try {
        let {
            coachingcat_Id,
            recipe_title,
            recipe_image,
            calories,
            protein,
            fat,
            carbs,
            preparation_time,
            serving_size,
            ingredients,
            instructions,
            keywords,
            userId,
            ip_Address,
            is_type
        } = req.body;
        let checkcoachdetails = await ConnectionUtil(`select * from coaching_Category where coachingcat_Id='${coachingcat_Id}'`)
        if (checkcoachdetails != "") {
            let recipeAddObj = {
                coachingcat_Id: coachingcat_Id,
                recipe_title: recipe_title,
                recipe_image: JSON.stringify(recipe_image),
                calories: calories,
                protein: protein,
                fat: fat,
                carbs: carbs,
                preparation_time: preparation_time,
                servingsize: serving_size,
                ingredients: JSON.stringify(ingredients),
                instructions: instructions,
                keywords: JSON.stringify(keywords),
                created_by: userId,
                updated_By: userId,
                ip_Address: ip_Address,
                is_type: is_type 
            };
            let recipesInsertQuery = await ConnectionUtil('INSERT INTO coaching_Recipes SET ?', recipeAddObj);
            if (recipesInsertQuery.insertId != 0) {
                res.status(200).json({
                    success: true,
                    message: "recpie add successfully"
                })
            } else {
                res.status(400).json({
                    success: false,
                    message: "something went wrong"
                })
            }
        } else {
            res.status(400).json({
                success: true,
                message: "invalid category"
            })
        }
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

//------------------------- ListRecipes -------------------------
module.exports.List_Recipes = async (req, res) => {
    try {
        let recipesDetail = await ConnectionUtil(`select * from coaching_Recipes where isActive='1' ORDER BY recipes_id DESC;`);
        let newArr = [];
        let viewArr = [];
        let viewCountByYearArr = [];
        for (let recipesObj of recipesDetail) {
            let TotalViewCountByYear = await ConnectionUtil(`SELECT COUNT(*) AS TotalViewCount, DATE_FORMAT(updated_At,"%Y") AS YEAR FROM coaching_recipespostviews WHERE recipes_id='${recipesObj.recipes_id}' AND isView='1' GROUP BY YEAR ORDER BY YEAR ASC`);
            for (let item of TotalViewCountByYear){
                viewCountByYearArr.push(item);
            }
            let totalViewsCount = await ConnectionUtil(`SELECT COUNT(*) AS totalcount FROM coaching_recipespostviews WHERE recipes_id='${recipesObj.recipes_id}' AND isView='1'`);
            recipesObj.views = totalViewsCount[0].totalcount;
            newArr.push(recipesObj)
        }

        let viewCount = 0;
        newArr.map((data) => {
          if(data.views){
              viewCount += data.views;
          }
        })
        viewArr.push({TotalViews:viewCount});

        //----------------------- YearWise calculation of viewsCount ------------------------------

        let yearMapOfViews = new Object();
        for(let i=0;i<viewCountByYearArr.length;i++){
           if(yearMapOfViews[viewCountByYearArr[i]['YEAR']] == null){
            yearMapOfViews[viewCountByYearArr[i]['YEAR']] = viewCountByYearArr[i];
           }else{
            yearMapOfViews[viewCountByYearArr[i]['YEAR']]['TotalViewCount'] += viewCountByYearArr[i]['TotalViewCount'];
           }
        }
    
        let resultOfViewsCount = [];
        for (let key in yearMapOfViews){
        if(yearMapOfViews.hasOwnProperty(key)){
            resultOfViewsCount.push(yearMapOfViews[key]);
          }
        }

        let obj = {
            TotalViewCountByYear : resultOfViewsCount,
            ViewArr : viewArr,
            newArr :newArr
        }
        res.status(200).json({
            success: true,
            message: "Show recipes list",
            data: obj
        });
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

//------------------------- DeleteRecipes -------------------------
module.exports.Delete_Recipes = async (req, res) => {
    try {
        let {
            recipes_id,
            ip_Address,
            userId
        } = req.body;
        let recipesDeleteQuery = await ConnectionUtil(`update coaching_Recipes set updated_By='${userId}' , isActive='0' , ip_Address = '${ip_Address}' where recipes_id = '${recipes_id}'`);
        res.status(200).json({
            success: true,
            message: "Deleted recipes successfully",
            data: recipesDeleteQuery
        });
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

//------------------------- EditRecipes -------------------------
module.exports.Edit_Recipes = async (req, res) => {
    try {
        let {
            coachingcat_Id,
            recipes_id,
            recipe_title,
            recipe_image,
            calories,
            protein,
            fat,
            carbs,
            preparation_time,
            serving_size,
            ingredients,
            instructions,
            keywords,
            userId,
            ip_Address,
            is_type
        } = req.body;
        let recipesUpdateQuery = await ConnectionUtil(`update coaching_Recipes set
    recipe_title ='${recipe_title}',
    recipe_image ='${JSON.stringify(recipe_image)}',
    calories ='${calories}',
    protein ='${protein}',
    coachingcat_Id ='${coachingcat_Id}',
    fat ='${fat}',
    carbs ='${carbs}',
    preparation_time ='${preparation_time}',
    servingsize ='${serving_size}',
    ingredients ='${JSON.stringify(ingredients)}',
    instructions ='${instructions}',
    keywords ='${JSON.stringify(keywords)}',
    created_by ='${userId}',
    updated_by ='${userId}',
    ip_Address ='${ip_Address}',
    is_type ='${is_type}'
    where recipes_id ='${recipes_id}' AND isActive='1' AND status='1'`);
        if (recipesUpdateQuery.affectedRows != 0) {
            res.status(200).json({
                success: true,
                message: "Updated recipes successfully",
                data: recipesUpdateQuery
            });
        } else {
            res.status(400).json({
                success: false,
                message: "something went wrong"

            })
        }
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

//------------------------- DetailRecipes -------------------------
module.exports.Detail_Recipes = async (req, res) => {
    try {
        let {
            recipes_id
        } = req.body;
        let newArr = [];
        let recipesDetail = await ConnectionUtil(`select * from coaching_Recipes where isActive='1' AND recipes_id='${recipes_id}' `);
        if (recipesDetail != "") {
            for (let recipesObj of recipesDetail) {
                recipesObj.views = 1,
                    recipesObj.likes = 2,
                    recipesObj.dislikes = 5
                newArr.push(recipesObj)
            }
            res.status(200).json({
                success: true,
                message: "recipes Description",
                data: newArr
            })
        } else {
            res.status(200).json({
                success: true,
                message: "recipes Description",
                data: newArr
            })
        }
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

//------------------------- StatusRecipes -------------------------
module.exports.updatestatusRecipesList = async (req, res) => {
    try {
        let {
            recipes_id,
            status
        } = req.body;
        let updatestatusRecipeListdetails = await ConnectionUtil(
            `update coaching_Recipes set status='${status}' where recipes_id='${recipes_id}'`
        );
        if (updatestatusRecipeListdetails.affectedRows != 0) {
            res.status(200).json({
                success: true,
                message: "status update successfull",
            });
        } else {
            res.status(400).json({
                success: false,
                message: "something went wrong"
            })
        }
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}


// =================== MealPlans Coaching ===================

//------------------------addMealPlan-----------------------------------
module.exports.add_mealPlans = async (req, res) => {
    try {
        let {
            meal_title,
            meal_description,
            meal_image,
            days,
            coachingcat_id,
            ip_Address,
            from_calories,
            to_calories,
            is_type
        } = req.body;
        
    let mealDuplicacy = await ConnectionUtil(
      `SELECT * FROM coaching_mealPlans WHERE meal_title = '${meal_title}' AND from_calories = ${from_calories} AND to_calories = ${to_calories}`
    );

    if (mealDuplicacy.length == 0) {
      let post = {
        meal_title: meal_title,
        meal_description: meal_description,
        meal_image: JSON.stringify(meal_image),
        coachingcat_id: coachingcat_id,
        ip_Address: ip_Address,
        from_calories: from_calories,
        to_calories: to_calories,
        is_type:is_type
      };
      let Addmealplan = await ConnectionUtil(
        `insert into coaching_mealPlans set?`,
        post
      );
      if (Addmealplan.insertId != 0) {
        let val = [];
        for (let dayObj of days) {
          let y = {
            coachingcat_id: coachingcat_id,
            mealday: JSON.stringify(dayObj.day),
            mealPlan_id: Addmealplan.insertId,
          };
          let insertD = await ConnectionUtil(
            `insert into coaching_MealDay set?`,
            y
          );
          val.push(insertD);
        }
        res.status(200).json({
          success: true,
          message: "Meal Plan add successfully",
          data: val,
        });
      }
    } else {
        res.status(400).json({
            success: false,
            message: "this meal already added ",
          });
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({
      success: true,
      message: err.message,
    });
  }
};

//-----------------------mealplanlist------------------------------------
module.exports.mealPlanlist = async (req, res) => {
    try {
        let mealplanlist = await ConnectionUtil(`select * from coaching_mealPlans where isActive='1'`);
        let newArr = [];
        let viewArr = [];
        let viewCountByYearArr = [];
        for (let info of mealplanlist) {
            let TotalViewCountByYear = await ConnectionUtil(`SELECT COUNT(*) AS TotalViewCount, DATE_FORMAT(updated_At,"%Y") AS YEAR FROM coaching_mealpostviews WHERE mealPlan_id='${info.mealPlan_id}' AND isView='1' GROUP BY YEAR ORDER BY YEAR ASC`);
            for (let item of TotalViewCountByYear){
                viewCountByYearArr.push(item);
            }
            let mealday = await ConnectionUtil(`select * from coaching_MealDay where mealPlan_id='${info.mealPlan_id}'  AND isActive='1'`)
            info.days = mealday != '' ? mealday : [];
            let totalViewsCount = await ConnectionUtil(`SELECT COUNT(*) AS totalcount FROM coaching_mealpostviews WHERE mealPlan_id='${info.mealPlan_id}' AND isView='1'`);
            info.views = totalViewsCount[0].totalcount;
            newArr.push(info)
        }

        let viewCount = 0;
        newArr.map((data) => {
          if(data.views){
              viewCount += data.views;
          }
        })
        viewArr.push({TotalViews:viewCount});

        //----------------------- YearWise calculation of viewsCount ------------------------------

        let yearMapOfViews = new Object();
        for(let i=0;i<viewCountByYearArr.length;i++){
           if(yearMapOfViews[viewCountByYearArr[i]['YEAR']] == null){
            yearMapOfViews[viewCountByYearArr[i]['YEAR']] = viewCountByYearArr[i];
           }else{
            yearMapOfViews[viewCountByYearArr[i]['YEAR']]['TotalViewCount'] += viewCountByYearArr[i]['TotalViewCount'];
           }
        }
    
        let resultOfViewsCount = [];
        for (let key in yearMapOfViews){
        if(yearMapOfViews.hasOwnProperty(key)){
            resultOfViewsCount.push(yearMapOfViews[key]);
          }
        }

        let obj = {
            TotalViewCountByYear : resultOfViewsCount,
            ViewArr : viewArr,
            newArr :newArr
        }

        res.status(200).json({
            success: true,
            message: "meal plan list",
            data: obj
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            message:  err.message//"something went wrong"
        })
    }
}

//------------------------deleteMealPlan---------------------------------
module.exports.delete_mealPlans = async (req, res) => {
    try {
        let {
            mealPlan_id,
            ip_Address
        } = req.body;

        let checkmeal = await ConnectionUtil(`select mealPlan_id from coaching_mealPlans where mealPlan_id='${mealPlan_id}'`)
        if (checkmeal != "") {
            let deleteMealPlan = await ConnectionUtil(`update coaching_mealPlans set ip_Address='${ip_Address}',isActive='0' where mealPlan_id='${mealPlan_id}'`)
            if (deleteMealPlan.affectedRows != 0)
                res.status(200).json({
                    success: true,
                    message: "meal plan delete successfull"
                })
        } else {
            res.status(400).json({
                success: false,
                message: "bad credintials"
            })
        }
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: true,
            message: err.message
        })
    }
}

//------------------------editMealPlan-----------------------------------
module.exports.edit_mealPlans = async (req, res) => {
    try {
        let {
            mealPlan_id,
            meal_title,
            meal_description,
            meal_image,
            ip_Address,
            coachingcat_id,
            days,
            to_calories,
            from_calories,
            is_type
        } = req.body;
        let checkmeal = await ConnectionUtil(`select mealPlan_id from coaching_mealPlans where mealPlan_id='${mealPlan_id}'`);
        if (checkmeal != "") {
            let val = JSON.stringify(meal_image);
            let editMealPlan = await ConnectionUtil(`update coaching_mealPlans set to_calories='${to_calories}',from_calories='${from_calories}', ip_Address='${ip_Address}',meal_title='${meal_title}',meal_description='${meal_description}',meal_image='${val}',is_type='${is_type}' where mealPlan_id='${mealPlan_id}'  AND status='1' AND isActive='1'`);
            if (editMealPlan.affectedRows != 0)
                for (let dayObj of days) {
                    if (dayObj.mealday_id == 0) {
                        let y = {
                            coachingcat_id: coachingcat_id,
                            mealday: JSON.stringify(dayObj.day),
                            mealPlan_id: mealPlan_id
                        }
                        let insertCoachMealPlan = await ConnectionUtil(`insert into coaching_MealDay set?`, y)
                    } else {
                        let daymeal = JSON.stringify(dayObj.mealday);
                        let editCoachMealPlan = await ConnectionUtil(`update coaching_MealDay set 
                        ip_Address='${ip_Address}',mealday='${daymeal}' where mealday_id = '${dayObj.mealday_id}'`)
                    }
                }
            res.status(200).json({
                success: true,
                message: "meal plan edit successfull"
            })
        } else {
            res.status(400).json({
                success: false,
                message: "meal not found in our database"
            })
        }
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: true,
            message: err.message
        })
    }
}

//------------------------mealplanstatusupdate--------------------
module.exports.updatestatusMealPlan = async (req, res) => {
    try {
        let {
            mealPlan_id,
            status,
            ip_Address
        } = req.body;
        let checkmeal = await ConnectionUtil(`select mealPlan_id from coaching_mealPlans where mealPlan_id='${mealPlan_id}'`)
        if (checkmeal != "") {
            let updatestatus = await ConnectionUtil(`update coaching_mealPlans set ip_Address='${ip_Address}',status='${status}' where isActive='1' AND mealPlan_id='${mealPlan_id}'`)
            if (updatestatus.affectedRows != 0) {
                res.status(200).json({
                    success: true,
                    message: "mealPlan status updated"
                })
            }
        } else {
            res.status(400).json({
                success: false,
                message: "meal_id is invalid"
            })
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({
            success: true,
            message: err.message
        })
    }
}

//------------------------- Detail_MealPlan -------------------------
module.exports.Detail_MealPlan = async (req, res) => {
    try {
        let {
            mealPlan_id
        } = req.body;
        let mealPlanDetail = await ConnectionUtil(`select * from coaching_mealPlans where isActive='1' AND mealPlan_id='${mealPlan_id}' `);
        let newArr = [];
        for (let info of mealPlanDetail) {
            let mealday = await ConnectionUtil(`select * from coaching_MealDay where mealPlan_id='${info.mealPlan_id}'  AND isActive='1'`)
            info.days = mealday != '' ? mealday : [];
            info.views = 122;
            info.likes = 251;
            info.dislikes = 54;
            newArr.push(info)
        }

        res.status(200).json({
            success: true,
            message: " mealPlans Description",
            data: mealPlanDetail
        })
    } catch (err) {
        console.log(err)
        res.status(404).json({
            success: false,
            message: err.message
        })
    }
}

//================== Health Programs ========================
module.exports.getprogramGoals = async (req, res) => {
    try {
        let { coachingcat_Id } = req.body;
        let getprogramgoals = await ConnectionUtil(`select * from coachingprogram_goals where coachingcat_Id='${coachingcat_Id}' AND isActive='1'`)
        if (getprogramgoals != "") {
            res.status(200).json({
                success: true,
                message: "program goals list",
                data: getprogramgoals
            })
        }
        else {
            res.status(400).json({
                success: true,
                message: "invalid program goal"
            })
        }
    }
    catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            message: err.message
        })
    }
}

//--------------------------editgoals-------------------------
module.exports.editGoal = async (req, res) => {
    try {
        let { programGoal_id, goal_image } = req.body;
        let checkgoal = await ConnectionUtil(`select * from  coachingprogram_goals where programGoal_id='${programGoal_id}' AND isActive='1'`)
        if (checkgoal != "") {
            let editgoalimage = await ConnectionUtil(`update coachingprogram_goals set goal_image='${JSON.stringify(goal_image)}' where programGoal_id='${programGoal_id}' AND isActive='1'`)
            if (editgoalimage.affectedRows != 0) {
                res.status(200).json({
                    success: true,
                    message: "goal image edit successfull"
                })
            }
            else {
                res.status(400).json({
                    success: false,
                    message: "[]"
                })
            }
        }
        else {
            res.status({
                success: false,
                message: "goal is not valid"
            })
        }
    }
    catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            message: err.message
        })
    }
}

