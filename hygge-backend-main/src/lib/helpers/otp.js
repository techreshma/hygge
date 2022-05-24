var fs = require("fs");
var OTP_Config = {
  Otp_function: async function( ) { 
    var digits = '0123456789'; 
    let OTP = ''; 
    for (let i = 0; i < 6; i++ ) { 
        OTP += digits[Math.floor(Math.random() * 10)]; 
    } 
    return OTP;
  }
};
module.exports = OTP_Config