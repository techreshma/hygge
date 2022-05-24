var FCM = require("fcm-node");
const util = require("util");
let status = require("statuses");
let connection = require("../../config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);

var fcmConfig = {
  fcm: async (devicetoken, status) => {
    for (let token of devicetoken) {
      var serverKey =
        "AAAAlYXydjI:APA91bE2pV3pHNvBkgtImOd7iQDr5EIFjl_1sX-QWlpvhTCws2jSoOWXLustHReG2ZqVLAHJ8ac8b82uoRTdBXEYtX6Je5s1t02J8jejLRHgWE0dQsPL4a04FjRlFQ7I2Yi8F6sILEMN"; //put your server key here
      var fcm = new FCM(serverKey);
      var message = {
        to: token, //devicetoken,
        collapse_key: "your_collapse_key",
        notification: {
          title: "Attendance",
          body: "you have" + " " + status + " " + "successfully",
        },
        data: {
          my_key: status, //("checkIn/checkOut"),
          my_another_key: "attendance",
        },
      };
      await fcm.send(message, function (err, response) {
        if (err) {
          console.log("Something has gone wrong!");
        } else {
          console.log("Successfully sent with response: ", response);
        }
      });
    }
  },

  helperNotification: async (devicetoken, testMessage) => {
    for (let token of devicetoken) {
      var serverKey =
        "AAAAlYXydjI:APA91bE2pV3pHNvBkgtImOd7iQDr5EIFjl_1sX-QWlpvhTCws2jSoOWXLustHReG2ZqVLAHJ8ac8b82uoRTdBXEYtX6Je5s1t02J8jejLRHgWE0dQsPL4a04FjRlFQ7I2Yi8F6sILEMN"; //put your server key here
      var fcm = new FCM(serverKey);
      var message = {
        to: token, //devicetoken,
        collapse_key: "your_collapse_key",
        notification: {
          title: testMessage.title,
          body: testMessage.body,
        },
      };
      await fcm.send(message, function (err, response) {
        if (err) {
          console.log(err, "Something has gone wrong!");
        } else {
          // console.log("Successfully sent with response: ", response);
        }
      });
    }
  },

  commonNotification: async (devicetoken, testMessage) => {
    for (let token of devicetoken) {
      var serverKey =
        "AAAAlYXydjI:APA91bE2pV3pHNvBkgtImOd7iQDr5EIFjl_1sX-QWlpvhTCws2jSoOWXLustHReG2ZqVLAHJ8ac8b82uoRTdBXEYtX6Je5s1t02J8jejLRHgWE0dQsPL4a04FjRlFQ7I2Yi8F6sILEMN"; //put your server key here
      var fcm = new FCM(serverKey);
      var message = {
        to: token.device_Token, //devicetoken,
        collapse_key: "your_collapse_key",
        notification: {
          title: testMessage.title,
          body: testMessage.body,
        },
      };
      await fcm.send(message, function (err, response) {
        if (err) {
          console.log(err, "Something has gone wrong!");
        } else {
          console.log("Successfully sent with response: ", response);
        }
      });
    }
  },

  messageNotification: async (
    devicetoken,
    testMessage,
    userID,
    groupDetailChatId
  ) => {
    for (let token of devicetoken) {
      let inClause = userID.map((id) => "'" + id + "'").join();
      let valArr = [];
      let val = await ConnectionUtil(
        `select user_id, CONCAT(COALESCE(designation,' ')) as designation ,CONCAT(COALESCE(profile_picture,' ')) as profile_picture ,CONCAT(COALESCE(first_name,' ')," ",COALESCE(last_name,' ')) as name from user where user_id IN(${inClause})`
      );
      await val.map((data) => {
        valArr.push({
          groupDetailChat_Id: groupDetailChatId,
          profile_picture:
            data.profile_picture !== "" ? data.profile_picture : "download.png",
          username: data.name != "" ? data.name : "",
          designation: data.designation != "" ? data.designation : "",
          user_Id: data.user_id,
        });
      });
      var serverKey =
        "AAAAlYXydjI:APA91bE2pV3pHNvBkgtImOd7iQDr5EIFjl_1sX-QWlpvhTCws2jSoOWXLustHReG2ZqVLAHJ8ac8b82uoRTdBXEYtX6Je5s1t02J8jejLRHgWE0dQsPL4a04FjRlFQ7I2Yi8F6sILEMN"; //put your server key here
      var fcm = new FCM(serverKey);
      var message = {
        to: token, //devicetoken,
        collapse_key: "your_collapse_key",
        notification: {
          title: testMessage.title,
          body: testMessage.body,
        },
        data: {
          priority: "high", //("checkIn/checkOut"),
          my_another_key: valArr, //testMessage.data,
        },
      };
      await fcm.send(message, function (err, response) {
        if (err) {
          console.log(err, "Something has gone wrong!");
        } else {
          console.log("Successfully sent with response: ", response);
        }
      });
    }
  },
};
module.exports = fcmConfig;
// const util = require("util");
// let status = require("statuses");
// let connection = require("../../config/database");
// let ConnectionUtil = util.promisify(connection.query).bind(connection);
// test: async (devicetoken, status) => {
//
// },
// test()
// async function test(){
//   let t=[2,50];
//   let inClause = t.map(id=>"'"+id+"'").join();
//   let val=await ConnectionUtil(`select user_id, CONCAT(COALESCE(designation,' ')) as designation ,CONCAT(COALESCE(profile_picture,' ')) as profile_picture ,CONCAT(COALESCE(first_name,' ')," ",COALESCE(last_name,' ')) as name from user where user_id IN(${inClause})`);
// }
