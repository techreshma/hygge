var fs = require("fs");
var DateFormate_Config = {

  Date_Formate_function: async function( ) { 

  }

};

module.exports = DateFormate_Config


// function Person(dob) {
//   this.birthday = new Date(dob);
//   this.calculateAge = function() {
//     const diff = Date.now() - this.birthday.getTime(); 
//     const ageDate = new Date(diff); 
//     // console.log(ageDate.getUTCFullYear()); // 1989
//     return Math.abs(ageDate.getUTCFullYear() - 1970);
//   };
// }
// var age =new Person('2000-1-1').calculateAge();
// select DATE_FORMAT(convert_tz(now(),@@session.time_zone,'+05:30') ,'%b %d %Y %h:%i:%s %p') 