// -------------------------------------
// | Name           -> Arpit khadkodkar |
// | Created by     -> 27-10-2020       |
// | Last updated by-> 27-10-2020       |
// -------------------------------------

var express = require("express");
const cors = require("cors");
var app = express();
var bodyparser = require("body-parser");
require("dotenv").config();
var apiRouter = require("./src/router/index");
var FCM = require("fcm-node");
var fetch = require('node-fetch');
var cron = require('node-cron');
var moment = require('moment-timezone');
moment().tz("America/Los_Angeles").format();
const util = require("util");
let status = require("statuses");
let connection = require("./src/config/database");
let ConnectionUtil = util.promisify(connection.query).bind(connection);

app.use(function (req, res, next) {
  console.log(`'${new Date()}' - '${req.method}' request for '${req.url}'`);
  next();
});

//use cors
app.use(cors());
//Body-Parser
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

//Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use("/api/v1/", apiRouter);

app.get("/test", (req, res) => {
  let moment = require("moment");
  let test = moment(new Date()).add(5, "hour").add(30, "m").toDate();
  res.json({ message: "Api runing start", Y: test, Value: "Api" });
});

// function pushNotification(token) {
//   var serverKey =
//     AAA"AlYXydjI:APA91bE2pV3pHNvBkgtImOd7iQDr5EIFjl_1sX-QWlpvhTCws2jSoOWXLustHReG2ZqVLAHJ8ac8b82uoRTdBXEYtX6Je5s1t02J8jejLRHgWE0dQsPL4a04FjRlFQ7I2Yi8F6sILEMN"; //put your server key here
//   var fcm = new FCM(serverKey);
//   var message = {
//     to: token, //devicetoken,
//     collapse_key: "your_collapse_key",
//     notification: {
//       title: "hello ", //testMessage.title,
//       body: "testting", //testMessage.body,
//     },
//   };

//   //-------------------------for multiple device -------------------------------

//   //   fcm.subscribeToTopic(token , 'some_topic_name', (err, res) => {
//   //     assert.ifError(err);
//   //     assert.ok(res);
//   //     done();
//   // });

//   //-----------------------working for single device --------------------------------

//   fcm.send(message, function (err, response) {
//     if (err) {
//       console.log(err, "Something has gone wrong!");
//     } else {
//       console.log("Successfully sent with response: ", response);
//     }
//   });
// }

// //Router Way

// let x = JSON.stringify([
//   "cxxlFK5sRQyQURa33A1UOu:APA91bGkmREpAPFQAq8Ei86ZQC_PTkloIc8rWLKGbOSSvfj2LD4KgpMnsC1k6Q0xxECfcXDMaRYEGsHQ_Sg1O5SioVMiN71WzURROEZEGWqPeQhXf8-rDja35qobyy6oBNb7fxskgFHX",
//   "d8QyFhQqRAy6Y6UyYaOXwm:APA91bEJqszHm-HQBrkpiinDrjVY_FLLSgljSIIhWw4u5kgyVq2rgzujK0arnIL_drErnh_8JbvGbMErh0OgT8Sqx6LlONGsdQzgBn-HuNfZ4aRtPhwu6SC8Dsqq9XxS-9xdCMuRSWtX",
// ]);

// app.get("/notificationStatic", (req, res) => {
//   pushNotification(x);
//   res.json({
//     message: "Api runing start",
//   });
// });


// notification object with title and text



// fetch('http://20.74.180.163:4000/api/v1/employee/deviceToken')
//     .then(function(data) {
//         console.log(data)
//     })
cron.schedule('49 10 * * *', () => {
  fetch('http://20.74.180.163:4000/api/v1/employee/deviceToken')
    .then(function(data) {
        console.log(data)
    })
}
, 
{
  scheduled: true,
  timezone: "America/Los_Angeles"
}
);

     
//public file
app.use(express.static("upload"));
app.use(express.static("upload/profile"));
app.use(express.static("upload/companyTheme/favicon"));
app.use(express.static("upload/companyTheme/logo"));
app.use(express.static("upload/company/contract"));
app.use(express.static("upload/company/insuranceDoc"));
app.use(express.static("upload/Badges_locked_Grey"));
app.use(express.static("upload/Badges_unlocked"));
app.use(express.static("upload/document"));
app.use(express.static("upload/chat"));
app.use(express.static("upload/programs_icons"));
app.use(express.static("upload/reward"));
app.use(express.static("upload/challenge"));
app.use(express.static("upload/challenge/foodlog"));
app.use(express.static("upload/activity_Card"));
app.use(express.static("upload/infographics"));
app.use(express.static("upload/email_image"));
app.use(express.static("public"));
app.use(express.static("HraReportIcons/icons"));
app.use(express.static("HraReportIcons/__MACOSX/icons"));

// index page
// var {forgetPassword} = require('./src/lib/helpers/emailTemplate');
app.get("/W", function (req, res) {
  res.send("Api start testing");
});

// ------------------------- Socket ---------------------------------
let http = require("http").createServer(app);
let socketFunction = require("./src/controller/socket/socketFunction");
const { count } = require("console");
const { start } = require("repl");
const { resolve } = require("path");
const { rejects } = require("assert");
let io = require("socket.io")(http, {
  cors: {
    origin: [
      "http://20.74.180.163:4000",
      "http://localhost:4000",
      "http://localhost:5000",
      "http://localhost:4200",
      "http://127.0.0.1:5501",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: [
      "Access-Control-Allow-Origin",
      "*",
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    ],
    credentials: true,
  },
});

app.use(express.static("public"));
app.get("/socket", (req, res) => {
  res.redirect("index.html");
});

io.on("connection", (socket) => {
  /* Log whenever a user connects*/
  console.log("user connected", socket.id);
  /* Log whenever a client disconnects from our websocket server*/
  socket.on("disconnect", function () {
    console.log("user disconnected", socket.id);
  });
  // using `io.emit()`
  socket.on("message", async (message) => {
    /* socket.join(message.groupDetailChat_Id);io.sockets.in(message.groupDetailChat_Id).emit("message", { "message" : message })*/
    io.emit("message", { message: message });
    await socketFunction.socketMessage(message);
  });

  socket.on("activeStatus", async (message) => {
    console.log(message);
    io.emit("activeStatus", { message: message });
  });

  socket.on("AppUsage", async (data) => {
    let dataTask = await socketFunction.appUsage(data);
    io.emit("AppUsage", { message: dataTask });
  });
});
http.listen(process.env.PORT || 4000, () =>
  console.log("server running on port:" + process.env.PORT)
);
// ------------------------- Socket ---------------------------------
// template.PayslipTemplate.salarySlipTemp
// template.OTPTemplate.otpTemp
// template.ChatHistoryTemplate.ChatHistoryTemp
// template.ForgotTemplate.ForgetTemp
// template.DocExpiryTemplate.DocExpiryTemp
// template.EmpInvitationTemplate.EmpInvitationTemp
// template.HRAdminInvitationTemplate.HRAAdminInvitationTemp
// template.AdminInvitationTemplate.AdminInvitationTemp

// let t = ( 0.0175 * 3) * 12.44 * 45
// console.log(t);
//---------------------------------push Notification cronJob -------------------------------


