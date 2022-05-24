const util = require("util");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);
let calcBmi = require("bmi-calc");
// ------------------------- ActivityCardList -------------------------
module.exports.ActivityCardList = async (req, res) => {
  try {
    let { user_Id, company_Id, activityCard_catId } = req.body;
    let newArr = [];
    // console.log(activityCard_catId);
    if (activityCard_catId == 1) {
      let ActivityCardSelectQuery = await ConnectionUtil(
        `Select * from activity_card where  activityCard_id IN (4,10,12,13,14,46,47,48,49,50,51,52,53,54,55,58,59) AND isActive='1' AND activityCard_catId='1' ORDER BY activityCard_id DESC`
      );
      let newArr = [];
      for (let catId of ActivityCardSelectQuery) {
        let UserCardSelectQuery = await ConnectionUtil(
          `Select * from userassign_activitycard where isAccept='1' AND activityCard_Id='${catId.activityCard_id}' AND user_Id='${user_Id}' AND company_Id='${company_Id}'`
        );
        if (UserCardSelectQuery.length > 0) {
          obj = {
            activityCard_id: catId.activityCard_id,
            activityCard_Name: catId.activityCard_Name,
            activityCard_catId: catId.activityCard_catId,
            isAccept: UserCardSelectQuery[0].isAccept,
            user_Id: user_Id,
            company_Id: company_Id,
            image: catId.icon,
            degree: catId.degree,
          };
        } else {
          obj = {
            activityCard_id: catId.activityCard_id,
            activityCard_Name: catId.activityCard_Name,
            activityCard_catId: catId.activityCard_catId,
            isAccept: 0,
            user_Id: user_Id,
            company_Id: company_Id,
            image: catId.icon,
            degree: catId.degree,
          };
        }
        newArr.push(obj);
      }
      return res.status(200).json({
        success: true,
        message: "Activity card list",
        data: newArr,
      });
    } else if (activityCard_catId == 2) {
      let ActivityCardSelectQuery = await ConnectionUtil(
        `Select * from activity_card where  activityCard_id IN (1,2,3,33,36,67) AND isActive='1' AND activityCard_catId='2' ORDER BY activityCard_id DESC`
      );
      let newArr = [];
      for (let catId of ActivityCardSelectQuery) {
        let UserCardSelectQuery = await ConnectionUtil(
          `Select * from userassign_activitycard where isAccept='1' AND activityCard_Id='${catId.activityCard_id}' AND user_Id='${user_Id}' AND company_Id='${company_Id}'`
        );
        if (UserCardSelectQuery.length > 0) {
          obj = {
            activityCard_id: catId.activityCard_id,
            activityCard_Name: catId.activityCard_Name,
            activityCard_catId: catId.activityCard_catId,
            isAccept: UserCardSelectQuery[0].isAccept,
            user_Id: user_Id,
            company_Id: company_Id,
            image: catId.icon,
            degree: catId.degree,
          };
        } else {
          obj = {
            activityCard_id: catId.activityCard_id,
            activityCard_Name: catId.activityCard_Name,
            activityCard_catId: catId.activityCard_catId,
            isAccept: 0,
            user_Id: user_Id,
            company_Id: company_Id,
            image: catId.icon,
            degree: catId.degree,
          };
        }
        newArr.push(obj);
      }
      return res.status(200).json({
        success: true,
        message: "Activity card list",
        data: newArr,
      });
    } else if (activityCard_catId == 3) {
      let ActivityCardSelectQuery = await ConnectionUtil(
        `Select * from activity_card where  activityCard_id IN (5,6,7,8,9,37,38,41,43) AND isActive='1' AND activityCard_catId='3' ORDER BY activityCard_id DESC`
      );
      let newArr = [];
      for (let catId of ActivityCardSelectQuery) {
        let UserCardSelectQuery = await ConnectionUtil(
          `Select * from userassign_activitycard where isAccept='1' AND activityCard_Id='${catId.activityCard_id}' AND user_Id='${user_Id}' AND company_Id='${company_Id}'`
        );
        if (UserCardSelectQuery.length > 0) {
          obj = {
            activityCard_id: catId.activityCard_id,
            activityCard_Name: catId.activityCard_Name,
            activityCard_catId: catId.activityCard_catId,
            isAccept: UserCardSelectQuery[0].isAccept,
            user_Id: user_Id,
            company_Id: company_Id,
            image: catId.icon,
            degree: catId.degree,
          };
        } else {
          obj = {
            activityCard_id: catId.activityCard_id,
            activityCard_Name: catId.activityCard_Name,
            activityCard_catId: catId.activityCard_catId,
            isAccept: 0,
            user_Id: user_Id,
            company_Id: company_Id,
            image: catId.icon,
            degree: catId.degree,
          };
        }
        newArr.push(obj);
      }
      return res.status(200).json({
        success: true,
        message: "Activity card list",
        data: newArr,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "invalid activityCard_catId try 1,2,3",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// module.exports.ActivityCardList = async (req, res) => {
//   try {
//     let { user_Id, company_Id, activityCard_catId } = req.body;
//     console.log(activityCard_catId, "activityCard_catId");
// if (activityCard_catId == 1) {

//   res.status(200).json({
//     success: true,
//     message: "Activity card list",
//     data: newArr,
//   });
// }
// if (activityCard_catId == 2) {
//     res.status(200).json({
//         success: true,
//         message: "Activity card list",
//         data: newArr,
//       });
// }
// if (activityCard_catId == 3) {
//     res.status(200).json({
//         success: true,
//         message: "Activity card list",
//         data: newArr,
//       });
// } else {
//   res.status(400).json({
//     success: false,
//     message: "invalid activityCard_catId try 1,2,3",
//   });
// }
//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

// ------------------------- user_Lifestylehabit -------------------------
// isType->0 noramal card
// isType->1 sport card
// category_Id-> 1 lifestyle habit
module.exports.user_Lifestylehabit = async (req, res) => {
  try {
    let { user_Id, company_Id, activityCard_catId , date } = req.body;
    let activityCardSelectQuery = await ConnectionUtil(
      `Select AC.activityCard_Name,AC.activityCard_catId,AC.activityCard_id,AC.icon,AC.isType,UA.userActivityCard_id from userassign_activitycard as UA JOIN activity_card as AC ON AC.activityCard_id=UA.activityCard_Id where UA.isAccept='1' AND UA.activityCard_catId='${activityCard_catId}' AND UA.user_Id='${user_Id}' AND UA.company_Id='${company_Id}' `
    );
    let newArr = [];
    if (activityCardSelectQuery.length > 0) {
      for (let cardData of activityCardSelectQuery) {
        let activityCardSelectQuery = await ConnectionUtil(
          `Select * from variable_recorde where date='${date}' AND activityCard_Id='${
            cardData.activityCard_id
          }' AND activityCard_catId='${activityCard_catId}' AND user_Id='${user_Id}' ORDER BY variableRecorde_id DESC`
        );
        if (activityCardSelectQuery.length > 0) {
          cardData.measure =
            activityCardSelectQuery[0].measure != null
              ? activityCardSelectQuery[0].measure
              : 0;
          cardData.degree =
            activityCardSelectQuery[0].degree != null
              ? activityCardSelectQuery[0].degree
              : "";
        } else {
          cardData.measure = 0;
          cardData.degree = "";
        }
        newArr.push(cardData);
      }
    }
    res.status(200).json({
      success: true,
      message: "Life style habit card",
      data: activityCardSelectQuery,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ------------------------- user_MyHealthTracker -------------------------
//category_Id-> 2 Myhealth_tracker
module.exports.user_MyHealthTracker = async (req, res) => {
  try {
    let { user_Id, company_Id, activityCard_catId } = req.body;
    let activityCardSelectQuery = await ConnectionUtil(
      `Select AC.activityCard_Name,AC.activityCard_catId,AC.activityCard_id,AC.icon,AC.isType,UA.userActivityCard_id from userassign_activitycard as UA JOIN activity_card as AC ON AC.activityCard_id=UA.activityCard_Id where UA.isAccept='1' AND UA.activityCard_catId='${activityCard_catId}' AND UA.user_Id='${user_Id}' AND UA.company_Id='${company_Id}'`
    );
    let newArr = [];
    if (activityCardSelectQuery.length > 0) {
      for (let cardData of activityCardSelectQuery) {
        if (cardData.activityCard_id == 67) {
          let activityCardSelectQuery = await ConnectionUtil(
            `Select * from variable_recorde where date='${date}' AND activityCard_Id='${
              cardData.activityCard_id
            }' AND activityCard_catId='${activityCard_catId}' AND user_Id='${user_Id}' ORDER BY variableRecorde_id DESC`
          );
          if (activityCardSelectQuery.length > 0) {
            cardData.measure =
              activityCardSelectQuery[0].measure != null
                ? activityCardSelectQuery[0].measure
                : 0;
            cardData.degree =
              activityCardSelectQuery[0].degree != null
                ? activityCardSelectQuery[0].degree
                : "";
          } else {
            cardData.measure = 0;
            cardData.degree = "";
          }
        }
        if (cardData.activityCard_id == 36) {
          let activityCardSelectQuery = await ConnectionUtil(
            `Select * from variable_recorde where date='${date}' AND activityCard_Id='${
              cardData.activityCard_id
            }' AND activityCard_catId='${activityCard_catId}' AND user_Id='${user_Id}' ORDER BY variableRecorde_id DESC`
          );
          if (activityCardSelectQuery.length > 0) {
            cardData.measure =
              activityCardSelectQuery[0].measure != null
                ? activityCardSelectQuery[0].measure
                : 0;
            cardData.degree =
              activityCardSelectQuery[0].degree != null
                ? activityCardSelectQuery[0].degree
                : "";
          } else {
            cardData.measure = 0;
            cardData.degree = "";
          }
        }
        if (cardData.activityCard_id == 33) {
          let activityCardSelectQuery = await ConnectionUtil(
            `Select * from variable_recorde where date='${date}' AND activityCard_Id='${
              cardData.activityCard_id
            }' AND activityCard_catId='${activityCard_catId}' AND user_Id='${user_Id}' ORDER BY variableRecorde_id DESC`
          );
          if (activityCardSelectQuery.length > 0) {
            cardData.measure =
              activityCardSelectQuery[0].measure != null
                ? activityCardSelectQuery[0].measure
                : 0;
            cardData.degree =
              activityCardSelectQuery[0].degree != null
                ? activityCardSelectQuery[0].degree
                : "";
          } else {
            cardData.measure = 0;
            cardData.degree = "";
          }
        }
        if (cardData.activityCard_id == 3) {
          let activityCardSelectQuery = await ConnectionUtil(
            `Select * from variable_recorde where date='${date}' AND activityCard_Id='${
              cardData.activityCard_id
            }' AND activityCard_catId='${activityCard_catId}' AND user_Id='${user_Id}' ORDER BY variableRecorde_id DESC`
          );
          if (activityCardSelectQuery.length > 0) {
            cardData.measure =
              activityCardSelectQuery[0].measure != null
                ? activityCardSelectQuery[0].measure
                : 0;
            cardData.degree =
              activityCardSelectQuery[0].degree != null
                ? activityCardSelectQuery[0].degree
                : "";
          } else {
            cardData.measure = 0;
            cardData.degree = "";
          }
        }
        if (cardData.activityCard_id == 2) {
          let activityCardSelectQuery = await ConnectionUtil(
            `Select * from variable_recorde where date='${date}' AND activityCard_Id='${
              cardData.activityCard_id
            }' AND activityCard_catId='${activityCard_catId}' AND user_Id='${user_Id}' ORDER BY variableRecorde_id DESC`
          );
          if (activityCardSelectQuery.length > 0) {
            cardData.measure =
              activityCardSelectQuery[0].measure != null
                ? activityCardSelectQuery[0].measure
                : 0;
            cardData.degree =
              activityCardSelectQuery[0].degree != null
                ? activityCardSelectQuery[0].degree
                : "";
          } else {
            cardData.measure = 0;
            cardData.degree = "";
          }
        }
        if (cardData.activityCard_id == 1) {
          let activityCardSelectQuery = await ConnectionUtil(
            `Select * from variable_recorde where date='${date}' AND activityCard_Id='${
              cardData.activityCard_id
            }' AND activityCard_catId='${activityCard_catId}' AND user_Id='${user_Id}' ORDER BY variableRecorde_id DESC`
          );
          if (activityCardSelectQuery.length > 0) {
            cardData.measure =
              activityCardSelectQuery[0].measure != null
                ? activityCardSelectQuery[0].measure
                : 0;
            cardData.degree =
              activityCardSelectQuery[0].degree != null
                ? activityCardSelectQuery[0].degree
                : "";
          } else {
            cardData.measure = 0;
            cardData.degree = "";
          }
        }
        newArr.push(cardData);
      }
    }
    res.status(200).json({
      success: true,
      message: "My health tracker card",
      data: newArr,
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ------------------------- user_MyHealthRecord -------------------------
// category_Id-> 3 My health record
module.exports.user_MyHealthRecord = async (req, res) => {
  try {
    let { user_Id, company_Id, activityCard_catId ,date } = req.body;
    let newArr = [];
    let activityCardSelectQuery = await ConnectionUtil(
      `Select AC.activityCard_Name,AC.activityCard_catId,AC.activityCard_id,AC.icon,AC.isType,UA.userActivityCard_id from userassign_activitycard as UA JOIN activity_card as AC ON AC.activityCard_id=UA.activityCard_Id where UA.isAccept='1' AND UA.activityCard_catId='${activityCard_catId}' AND UA.user_Id='${user_Id}' AND UA.company_Id='${company_Id}'`
    );
    for (let userCard of activityCardSelectQuery) {
      if (userCard.activityCard_id == 7) {
        let heightSore = await ConnectionUtil(
          `select * from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='8'`
        );
        let weightSore = await ConnectionUtil(
          `select * from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='9'`
        );
        if (weightSore.length > 0 && heightSore.length > 0) {
          let height = heightSore[0].options / 100;
          let weight = weightSore[0].options;
          let valBMI = calcBmi(weight, height);
          let totBMI = valBMI.value.toFixed(1);
          userCard.measure = totBMI;
        } else {
          userCard.measure = "";
        }
      }
      if (userCard.activityCard_id == 8) {
        let weightSore = await ConnectionUtil(
          `select * from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='9'`
        );
        if (weightSore.length > 0) {
          userCard.measure = weightSore[0].options;
        } else {
          userCard.measure = "";
        }
      }
      if (userCard.activityCard_id == 9) {
        let userGender = await ConnectionUtil(
          `select * from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='1' `
        );
        let waistRatioSore = await ConnectionUtil(
          `select * from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='10'`
        );
        let hipRatioSore = await ConnectionUtil(
          `select * from user_hrasubmission where user_Id='${user_Id}' AND healthQuestions_Id='11'`
        );
        if (
          waistRatioSore.length > 0 &&
          hipRatioSore.length > 0 &&
          userGender.length > 0
        ) {
          let w = waistRatioSore[0].options;
          let h = hipRatioSore[0].options;
          let Ratio = w / h;
          let fixedNum = Ratio.toFixed(2);
          userCard.measure = fixedNum;
        } else {
          userCard.measure = "";
        }
      }
      if (userCard.activityCard_id == 5) {
        let activityCardSelectQuery = await ConnectionUtil(
          `Select * from variable_recorde where date='${date}' AND activityCard_Id='${
            userCard.activityCard_id
          }' AND activityCard_catId='${activityCard_catId}' AND user_Id='${user_Id}' ORDER BY variableRecorde_id DESC`
        );
        if (activityCardSelectQuery.length > 0) {
          userCard.measure =
            activityCardSelectQuery[0].measure != null
              ? activityCardSelectQuery[0].measure
              : 0;
          userCard.degree =
            activityCardSelectQuery[0].degree != null
              ? activityCardSelectQuery[0].degree
              : "";
        } else {
          userCard.measure = 0;
          userCard.degree = "";
        }
      }
      if (userCard.activityCard_id == 6) {
        let activityCardSelectQuery = await ConnectionUtil(
          `Select * from variable_recorde where date='${date}' AND activityCard_Id='${
            userCard.activityCard_id
          }' AND activityCard_catId='${activityCard_catId}' AND user_Id='${user_Id}' ORDER BY variableRecorde_id DESC`
        );
        if (activityCardSelectQuery.length > 0) {
          userCard.measure =
            activityCardSelectQuery[0].measure != null
              ? activityCardSelectQuery[0].measure
              : 0;
          userCard.degree =
            activityCardSelectQuery[0].degree != null
              ? activityCardSelectQuery[0].degree
              : "";
        } else {
          userCard.measure = 0;
          userCard.degree = "";
        }
      }
      if (userCard.activityCard_id == 37) {
        let activityCardSelectQuery = await ConnectionUtil(
          `Select * from variable_recorde where date='${date}' AND activityCard_Id='${
            userCard.activityCard_id
          }' AND activityCard_catId='${activityCard_catId}' AND user_Id='${user_Id}' ORDER BY created_At DESC`
        );
        if (activityCardSelectQuery.length > 0) {
          userCard.measure =
            activityCardSelectQuery[0].measure != null
              ? activityCardSelectQuery[0].measure
              : 0;
          userCard.degree =
            activityCardSelectQuery[0].degree != null
              ? activityCardSelectQuery[0].degree
              : "";
        } else {
          userCard.measure = 0;
          userCard.degree = "";
        }
      }
      if (userCard.activityCard_id == 38) {
        let activityCardSelectQuery = await ConnectionUtil(
          `Select * from variable_recorde where date='${date}' AND activityCard_Id='${
            userCard.activityCard_id
          }' AND activityCard_catId='${activityCard_catId}' AND user_Id='${user_Id}' ORDER BY variableRecorde_id DESC`
        );
        if (activityCardSelectQuery.length > 0) {
          userCard.measure =
            activityCardSelectQuery[0].measure != null
              ? activityCardSelectQuery[0].measure
              : 0;
          userCard.degree =
            activityCardSelectQuery[0].degree != null
              ? activityCardSelectQuery[0].degree
              : "";
        } else {
          userCard.measure = 0;
          userCard.degree = "";
        }
      }
      if (userCard.activityCard_id == 41) {
        let activityCardSelectQuery = await ConnectionUtil(
          `Select * from variable_recorde where date='${date}' AND activityCard_Id='${
            userCard.activityCard_id
          }' AND activityCard_catId='${activityCard_catId}' AND user_Id='${user_Id}' ORDER BY variableRecorde_id DESC`
        );
        if (activityCardSelectQuery.length > 0) {
          userCard.measure =
            activityCardSelectQuery[0].measure != null
              ? activityCardSelectQuery[0].measure
              : 0;
          userCard.degree =
            activityCardSelectQuery[0].degree != null
              ? activityCardSelectQuery[0].degree
              : "";
        } else {
          userCard.measure = 0;
          userCard.degree = "";
        }
      }
      if (userCard.activityCard_id == 43) {
        let activityCardSelectQuery = await ConnectionUtil(
          `Select * from variable_recorde where date='${date}' AND activityCard_Id='${
            userCard.activityCard_id
          }' AND activityCard_catId='${activityCard_catId}' AND user_Id='${user_Id}' ORDER BY variableRecorde_id DESC`
        );
        if (activityCardSelectQuery.length > 0) {
          userCard.measure =
            activityCardSelectQuery[0].measure != null
              ? activityCardSelectQuery[0].measure
              : 0;
          userCard.degree =
            activityCardSelectQuery[0].degree != null
              ? activityCardSelectQuery[0].degree
              : "";
        } else {
          userCard.measure = 0;
          userCard.degree = "";
        }
      }
      newArr.push(userCard);
    }
    res.status(200).json({
      success: true,
      message: "My health record card",
      data: newArr,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ------------------------- addActivity_Card -------------------------
module.exports.addActivity_Card = async (req, res) => {
  try {
    let {
      isAccept,
      user_Id,
      company_Id,
      activityCard_catId,
      activityCard_Id,
      ip_Address,
    } = req.body;
    let activityData = await ConnectionUtil(
      `Select * from activity_card where activityCard_id='${activityCard_Id}' AND activityCard_catId='${activityCard_catId}'`
    );
    if (activityData.length > 0) {
      let UserAssignSelectQuery = await ConnectionUtil(
        `Select * from  userassign_activitycard where user_Id='${user_Id}' AND company_Id='${company_Id}' AND activityCard_catId='${activityCard_catId}' AND activityCard_Id='${activityCard_Id}' AND isAccept = 1`
      );
      if (UserAssignSelectQuery.length == 0) {
        let post = {
          isAccept: 1, //card active by user
          user_Id: user_Id,
          company_Id: company_Id,
          activityCard_catId: activityCard_catId,
          activityCard_Id: activityCard_Id,
          ip_Address: ip_Address,
          created_By: user_Id,
          updated_By: user_Id,
          swap: 1, //status suffle the card that manage status
        };
        let user = await ConnectionUtil(
          `INSERT INTO userassign_activitycard  SET ?`,
          post
        );
        res.status(200).json({
          success: true,
          message: "Activity card  active successfully",
          data: 1,
        });
      } else {
        if (isAccept == 1) {
          let userActivityCard = await ConnectionUtil(
            `update userassign_activitycard SET ip_Address='${ip_Address}',updated_By='${user_Id}', isAccept='${0}' where userActivityCard_id='${
              UserAssignSelectQuery[0].userActivityCard_id
            }'`
          );
          res.status(200).json({
            success: true,
            message: "Activity card  deactive successfully",
            data: 1,
          });
        } else if (isAccept == 0) {
          let userActivityCard = await ConnectionUtil(
            `update userassign_activitycard SET ip_Address='${ip_Address}',updated_By='${user_Id}', isAccept='${1}' where userActivityCard_id='${
              UserAssignSelectQuery[0].userActivityCard_id
            }'`
          );
          res.status(200).json({
            success: true,
            message: "Activity card active successfully",
            data: 0,
          });
        }
      }
    } else {
      res.status(404).json({
        success: false,
        message: "Activity not match to activity category",
        data: 0,
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err,
    });
  }
};

// ------------------------- card_Shuffle -------------------------
module.exports.cardShuffle = async (req, res) => {
  try {
    let { userId_One, userId_two, user_Id } = req.body;
    let UserUpdateQuery = await ConnectionUtil(
      `Select * from userassign_activitycard where  userActivityCard_id='${userId_One}' AND user_Id='${user_Id}' `
    );
    if (UserUpdateQuery.length > 0) {
      let UserUpdateQueryOne = await ConnectionUtil(
        `update userassign_activitycard  set userActivityCard_id='${0}' , swap='${userId_two}'  where swap='1' AND userActivityCard_id='${userId_One}' AND user_Id='${user_Id}' `
      );
      let UserUpdateQueryTWO = await ConnectionUtil(
        `update userassign_activitycard  set userActivityCard_id='${userId_One}' where swap='${1}' AND userActivityCard_id='${userId_two}' AND user_Id='${user_Id}' `
      );
      let UserUpdateQueryThree = await ConnectionUtil(
        `update userassign_activitycard  set userActivityCard_id='${userId_two}',swap='1' where swap='${userId_two}' AND userActivityCard_id='${0}' AND user_Id='${user_Id}' `
      );
      res.status(200).json({
        success: true,
        message: "Card shuffle successfully",
        data: UserUpdateQueryOne,
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ----------------- Country -----------------
module.exports.country = async (req, res) => {
  let country = [
    { country: "Afghanistan" },
    { country: "Albania" },
    { country: "Algeria" },
    { country: "Andorra" },
    { country: "Angola" },
    { country: "Antigua and Barbuda" },
    { country: "Argentina" },
    { country: "Armenia" },
    { country: "Australia" },
    { country: "Austria" },
    { country: "Azerbaijan" },
    { country: "The Bahamas" },
    { country: "Bahrain" },
    { country: "Bangladesh" },
    { country: "Barbados" },
    { country: "Belarus" },
    { country: "Belgium" },
    { country: "Belize" },
    { country: "Benin" },
    { country: "Bhutan" },
    { country: "Bolivia" },
    { country: "Bosnia and Herzegovina" },
    { country: "Botswana" },
    { country: "Brazil" },
    { country: "Brunei" },
    { country: "Bulgaria" },
    { country: "Burkina Faso" },
    { country: "Burundi" },
    { country: "Cabo Verde" },
    { country: "Cambodia" },
    { country: "Cameroon" },
    { country: "Canada" },
    { country: "Central African Republic" },
    { country: "Chad" },
    { country: "Chile" },
    { country: "China" },
    { country: "Colombia" },
    { country: "Comoros" },
    { country: "Congo, Democratic Republic of the" },
    { country: "Congo, Republic of the" },
    { country: "Costa Rica" },
    { country: "Côte d’Ivoire" },
    { country: "Croatia" },
    { country: "Cuba" },
    { country: "Cyprus" },
    { country: "Czech Republic" },
    { country: "Denmark" },
    { country: "Djibouti" },
    { country: "Dominica" },
    { country: "Dominican Republic" },
    { country: "East Timor (Timor-Leste)" },
    { country: "Ecuador" },
    { country: "Egypt" },
    { country: "El Salvador" },
    { country: "Equatorial Guinea" },
    { country: "Eritrea" },
    { country: "Estonia" },
    { country: "Eswatini" },
    { country: "Ethiopia" },
    { country: "Fiji" },
    { country: "Finland" },
    { country: "France" },
    { country: "Gabon" },
    { country: "The Gambia" },
    { country: "Georgia" },
    { country: "Germany" },
    { country: "Ghana" },
    { country: "Greece" },
    { country: "Grenada" },
    { country: "Guatemala" },
    { country: "Guinea" },
    { country: "Guinea-Bissau" },
    { country: "Guyana" },
    { country: "Haiti" },
    { country: "Honduras" },
    { country: "Hungary" },
    { country: "Iceland" },
    { country: "India" },
    { country: "Indonesia" },
    { country: "Iran" },
    { country: "Iraq" },
    { country: "Ireland" },
    { country: "Israel" },
    { country: "Italy" },
    { country: "Jamaica" },
    { country: "Japan" },
    { country: "Jordan" },
    { country: "Kazakhstan" },
    { country: "Kenya" },
    { country: "Kiribati" },
    { country: "Korea, North" },
    { country: "Korea, South" },
    { country: "Kosovo" },
    { country: "Kuwait" },
    { country: "Kyrgyzstan" },
    { country: "Libya" },
    { country: "Liechtenstein" },
    { country: "Lithuania" },
    { country: "Luxembourg" },
    { country: "Laos" },
    { country: "Latvia" },
    { country: "Lebanon" },
    { country: "Lesotho" },
    { country: "Liberia" },
    { country: "Malawi" },
    { country: "Malaysia" },
    { country: "Maldives" },
    { country: "Mali" },
    { country: "Malta" },
    { country: "Marshall Islands" },
    { country: "Mauritania" },
    { country: "Mauritius" },
    { country: "Mexico" },
    { country: "Micronesia, Federated States of" },
    { country: "Moldova" },
    { country: "Monaco" },
    { country: "Mongolia" },
    { country: "Montenegro" },
    { country: "Morocco" },
    { country: "Mozambique" },
    { country: "Myanmar (Burma)" },
    { country: "Namibia" },
    { country: "Nauru" },
    { country: "Nepal" },
    { country: "Netherlands" },
    { country: "New Zealand" },
    { country: "Nicaragua" },
    { country: "Niger" },
    { country: "Nigeria" },
    { country: "North Macedonia" },
    { country: "Norway" },
    { country: "Oman" },
    { country: "Pakistan" },
    { country: "Palau" },
    { country: "Panama" },
    { country: "Papua New Guinea" },
    { country: "Paraguay" },
    { country: "Peru" },
    { country: "Philippines" },
    { country: "Poland" },
    { country: "Portugal" },
    { country: "Qatar" },
    { country: "Romania" },
    { country: "Russia" },
    { country: "Rwanda" },
    { country: "Saint Kitts and Nevis" },
    { country: "Saint Lucia" },
    { country: "Saint Vincent and the Grenadines" },
    { country: "Samoa" },
    { country: "San Marino" },
    { country: "Sao Tome and Principe" },
    { country: "Saudi Arabia" },
    { country: "Senegal" },
    { country: "Serbia" },
    { country: "Seychelles" },
    { country: "Sierra Leone" },
    { country: "Singapore" },
    { country: "Slovakia" },
    { country: "Slovenia" },
    { country: "Solomon Islands" },
    { country: "Somalia" },
    { country: "South Africa" },
    { country: "Spain" },
    { country: "Sri Lanka" },
    { country: "Sudan" },
    { country: "Sudan, South" },
    { country: "Suriname" },
    { country: "Sweden" },
    { country: "Switzerland" },
    { country: "Syria" },
    { country: "Taiwan" },
    { country: "Tajikistan" },
    { country: "Tanzania" },
    { country: "Thailand" },
    { country: "Togo" },
    { country: "Tonga" },
    { country: "Trinidad and Tobago" },
    { country: "Tunisia" },
    { country: "Turkey" },
    { country: "Turkmenistan" },
    { country: "Tuvalu" },
    { country: "Uganda" },
    { country: "Ukraine" },
    { country: "United Arab Emirates" },
    { country: "United Kingdom" },
    { country: "United States" },
    { country: "Uruguay" },
    { country: "Uzbekistan" },
    { country: "Vanuatu" },
    { country: "Vatican City" },
    { country: "Venezuela" },
    { country: "Vietnam" },
    { country: "Yemen" },
    { country: "Zambia" },
    { country: "Zimbabwe" },
  ];
  res.status(200).json({
    success: true,
    message: "country list",
    data: country,
  });
};
