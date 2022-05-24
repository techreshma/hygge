// const express = require("express");
// const app = express();
// let http = require("http").createServer(app);
// let socketFunction=require('./src/controller/socket/socketFunction')
// let io = require("socket.io")(http,
//     {
//         cors: { 
//             origin: ["http://20.74.180.163:5000","http://localhost:4000","http://localhost:5000", "http://localhost:4200", "http://127.0.0.1:5501"],
//             methods: ["GET", "POST"],
//             allowedHeaders: ["Access-Control-Allow-Origin", "*", "Access-Control-Allow-Headers",
//                 "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//             ],
//             credentials: true
//         }
//     });
// const port = 5000;
// app.use(express.static('public'));
// app.get('/',(req,res)=>{
//    res.redirect('index.html')
// })
// app.get('/test',(req,res)=>{
//     res.json({data:`Current Time`}) //+new Date()
//  })

// io.on("connection", socket => {
//     /* Log whenever a user connects*/
//     console.log("user connected");
//     /* Log whenever a client disconnects from our websocket server*/
//     socket.on("disconnect", function() {
//         console.log("user disconnected");
//     });
//     // using `io.emit()`
//     socket.on("message",async message => {
//         /* socket.join(message.groupDetailChat_Id);io.sockets.in(message.groupDetailChat_Id).emit("message", { "message" : message })*/
//         io.emit("message", { "message" : message });
//         await socketFunction.socketMessage(message);
//     });

//     socket.on("activeStatus",async message => {
//         console.log(message)
//         io.emit("activeStatus", { "message" : message });
//     });

//     socket.on("AppUsage",async data => {
//         let dataTask=await socketFunction.appUsage(data);    
//         io.emit("AppUsage", { "message" : dataTask });
//     });
// });  

// http.listen(port, () => console.log("server running on port:" + port));