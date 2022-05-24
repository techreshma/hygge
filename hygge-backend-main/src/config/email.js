let nodemailer = require("nodemailer");
var QRCode = require("qrcode");
var fs = require("fs");
var Config = {
  //==================== Register Email ====================
  email_function: async function (email, token) {
    console.log(process.env.EMAIL, email);
    let transporter = await nodemailer.createTransport({
      host: "smtpout.secureserver.net",//"smtp.gmail.com",
      port: 465,//587,
      secure: true,//false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    // send mail with defined transport object
    let info = {
      from: "hello@myhygge.io",//process.env.EMAIL,
      to: email,
      subject: "Register for sub-Admin ✔",
      text: "Reset new password",
      html:
        `<b>Email->` +
        email +
        `<br>Please Reset Password link :-<a href=`+process.env.IP_URL+`:8081/set-password/` +
        token +
        `>Password Reset link</a></b>`,
    }; //http://157.245.104.180:8081/set-password/
    var mailSend = await transporter.sendMail(info);
    console.log(mailSend);
  },

  //==================== ForgetPasswordByOTP ====================
  forgetPassword_function: async function (email, emnail_template) { //otp
    console.log(process.env.EMAIL, email);
    let transporter = await nodemailer.createTransport({
      host: "smtpout.secureserver.net",//"smtp.gmail.com",
      port: 465,//587,
      secure: true,//false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    // send mail with defined transport object
    let info = {
      from: "hello@myhygge.io",// process.env.EMAIL,
      to: email,
      subject: "Forgot Password ✔",
      text: "Please check password reset otp",
      html: emnail_template//`<b>Reset Password OTP =>` + otp + `<b>`, //`<b>Please Reset Password link :-<a href=http://localhost:4000/token=`+token+`>Password Reset link</a></b>`
    };
    var mailSend = await transporter.sendMail(info);
    console.log(mailSend);
  },

  //==================== QRCode Email ====================
  QRCode_Email_function: async function (email, email_template, qrcode) {
    let baseURL64 = await QRCode.toDataURL(qrcode);
    let transporter = await nodemailer.createTransport({
      host: "smtpout.secureserver.net",//"smtp.gmail.com",
      port: 465,//587,
      secure: true,//false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    // send mail with defined transport object
    let info = {
      from: "hello@myhygge.io",//process.env.email,
      to: email,
      subject: "Successfully Register ✔",
      text: "Hello world ✔",
      // html:
      //   `<p>Your successfully register your email and password ,qrcode and app link will be send</p>
      //       <p>email:` +
      //   email +
      //   `</p>
      //       <p>password:` +
      //   password +
      //   `</p>
      //   <b>Please Reset Password link :-<a href=`+process.env.IP_URL+`:8082/set-password/` +
      //   password +
      //   `>Password Reset link</a></b>`,
      html: email_template,
    
            
        // <b>Please Reset Password link :-<a href=http://localhost:4000>android App link</a></b>`,
      attachments: [
        {
          filename: "qrcodeImage.png",
          contentType: "image/png",
          content: new Buffer.from(baseURL64.split("base64,")[1], "base64"),
        },
      ], //Image Attach ref_link:https://medium.com/javascript-in-plain-english/how-to-send-an-email-with-image-attachment-in-node-js-react-657479d49587
    };
    var mailSend = await transporter.sendMail(info)
;
    console.log(mailSend,"");
  },

  //==================== Register Email ====================
  // NewCompanyEmail_function: async function (email, token) {
  //   console.log(process.env.EMAIL, email);
  //   let transporter = await nodemailer.createTransport({
  //     host: "smtpout.secureserver.net",//"smtp.gmail.com",
  //     port: 465,//587,
  //     secure: true,//false,
  //     auth: {
  //       user: process.env.EMAIL,
  //       pass: process.env.PASSWORD,
  //     },
  //   });
  //   // send mail with defined transport object
  //   let info = {
  //     from: "hello@myhygge.io",//process.env.EMAIL,
  //     to: email,
  //     subject: "Register for Company Successfully ✔",
  //     text: "Reset new password",
  //     html:
  //       `<b>Email->` +
  //       email +
  //       `<br>Please Reset Password link :-<a href=`+process.env.IP_URL+`:8082/set-password/` +
  //       token +
  //       `>Password Reset link</a></b>`,
  //   };//http://157.245.104.180:8082/set-password/
  //   var mailSend = await transporter.sendMail(info);
  //   console.log(mailSend);
  // },

  NewCompanyEmail_function: async function (email, email_template) {
    console.log(process.env.EMAIL, email);
    let transporter = await nodemailer.createTransport({
      host: "smtpout.secureserver.net",//"smtp.gmail.com",
      port: 465,//587,
      secure: true,//false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    // send mail with defined transport object
    let info = {
      from: "hello@myhygge.io",//process.env.email,
      to: email,
      subject: "Register for Company Successfully ✔",
      text: "Reset new password",
      html:email_template,
    };//http://157.245.104.180:8082/set-password/
    var mailSend = await transporter.sendMail(info)
;
    console.log(mailSend);
  },

  //==================== Invitation Employee Email ====================
  InvitationEmployee_function: async function (email) {
    console.log(process.env.EMAIL, email);
    let transporter = await nodemailer.createTransport({
      host: "smtpout.secureserver.net",//"smtp.gmail.com",
      port: 465,//587,
      secure: true,//false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    // send mail with defined transport object
    let info = {
      from: process.env.EMAIL,
      to: email,
      subject: "Invitation Link Employee App ✔",
      // text: "Reset new password",
      html: `<b>Please Click Invitation link :-<a href=`+process.env.IP_URL+`:8082>Invitation Link</a></b>`,
    }; //http://157.245.104.180:8082
    var mailSend = await transporter.sendMail(info);
    console.log(mailSend);
  },

  //==================== SMTP testmail ====================
  SmtpEmail_function: async function (email) {
    
    console.log(process.env.EMAIL, email);
    let transporter = await nodemailer.createTransport({
      host: "smtpout.secureserver.net",//"smtp.gmail.com",
      port: 465,//587,
      secure: true,//false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    // send mail with defined transport object
    let info = {
      from: "hello@myhygge.io",//process.env.EMAIL,
      to: email,
      subject: "Mail smtp Successfully ✔",
      text: "Test SMTP testing",
      //html: `<b>Email->`+email+`<br>Please Reset Password link :-<a href=http://157.245.104.180:8082/set-password/`+token+`>Password Reset link</a></b>`,
    };
    var mailSend = await transporter.sendMail(info);
    console.log(mailSend);
  },

  //==================== DocumentExpireNotification Email ====================
  DocumentExpireNotification_function: async function (email,email_template,docType) { //message
    console.log(process.env.EMAIL, email);
    let transporter = await nodemailer.createTransport({
      host: "smtpout.secureserver.net",//"smtp.gmail.com",
      port: 465,//587,
      secure: true,//false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    // send mail with defined transport object
    let info = {
      from: "hello@myhygge.io",
      to: email,
      subject: "Your " + docType + "is expiring",
      html: email_template//message 
      // `<b>Please Click Invitation link :-<a href=http://157.245.104.180:4000>Invitation Link</a></b>`,
    };
    var mailSend = await transporter.sendMail(info);
    console.log(mailSend);
  }
};
module.exports = Config;