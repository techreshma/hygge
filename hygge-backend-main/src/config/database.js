var mysql = require('mysql');  
var connection = mysql.createConnection({  
    host: process.env.DB_HOST||"127.0.0.1",  
    user: process.env.DB_USERNAME||"root",  
    password:process.env.DB_PASSWORD|| "",
    // "Root@123#",  
    database: process.env.DB_DATABASE||"hrm",
    charset : 'utf8mb4'
});  
connection.connect(function(err) {  
if (err) throw err;  
console.log("Connected successfully!");  
})   
module.exports = connection;
