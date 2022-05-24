// module.exports.HRAAdminInvitationTemp=function(data){
// let HRAAdminInvitationTemp=`<!doctype html>
// <html lang="en">
// 	<head>
// 		<meta charset="utf-8">
// 		<title> HR Admin invitation</title>
// 		<base href="/">
// 		<meta name="viewport" content="width=device-width, initial-scale=1">
// 		<link href="https://fonts.googleapis.com/css2?family=Poppins:display=swap" rel="stylesheet">
// 	</head>
// 	<body style="background: #fcfcfc;">
// 		<table id="header" width="700px"  border="0" style="margin:0 auto;background:linear-gradient(90deg, #B681FB, #AAA0FC);">
// 			<tr>
// 				<td>
// 					<table width="600" height="120px" border="0" style="margin:0 auto">
// 						<tr>
// 							<td>
// 								<img src="http://20.74.180.163:4000/hugge.png" style="width: 204px;" alt="" />
// 							</td>
// 						</tr>
// 					</table>
// 				</td>
// 			</tr>
// 		</table>
// 		<table id="body" width="700px"  border="0" style="margin:0 auto;background: #fff;">
// 			<tr>
// 				<td>
// 					<table width="600" border="0" style="margin:0 auto">
// 						<tr>
// 							<td>
// 								<h3 style="margin:30px 0; color:#6863FA;font-family:'Poppins', sans-serif;font-size: 24px;">MyHygge Email ID</h3>
// 							</td>
// 						</tr>
// 						<tr>
// 							<td>
// 								<p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">Hi [First Name],</p>
// 							</td>
// 						</tr>
// 						<tr>
// 							<td>
// 								<p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">Your MyHygge email ID is: (insert email)</p>
// 							</td>
// 						</tr>
// 						<tr>
// 							<td>
// 								<p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">
// 								Password: (insert)
// 								</p>
// 							</td>
// 						</tr>
// 						<tr>
// 							<td>
// 								<p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">
// 								Login Now  (clickable button)
// 								</p>
// 							</td>
// 						</tr>
						
						
// 						<tr>
// 							<td>
// 								<p  style="margin:20px 0 20px; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">
// 									Cheers!
// 								</p>
// 							</td>
// 						</tr>
// 						<tr>
// 							<td>
// 								<p  style="margin:20px 0 30px; color:#C86CE6;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">
// 									Hygge Team
// 								</p>
// 							</td>
// 						</tr>
// 					</table>
// 				</td>
// 			</tr>
// 		</table>
// 		<table id="footer" width="700px"  border="0" style="margin:0 auto;background:#FFAA2A">
// 			<tr>
// 				<td>
// 					<table width="600" height="48px" border="0" style="margin:0 auto">
// 						<tr>
// 							<td>
// 								<p style="margin:0; color:#fff;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">Stay in touch with us</p>
// 							</td>
// 							<td style="display: flex;
// 							height: 100%;
// 							justify-content: space-between;
// 							align-items: center;">
// 								<a href="" style="color: #fff;font-size: 20px;"><i class="fa fa-facebook"></i></a>
// 								<a href="" style="color: #fff;font-size: 20px;"><i class="fa fa-google"></i></a>
// 								<a href="" style="color: #fff;font-size: 20px;"><i class="fa fa-instagram"></i></a>
// 							</td>
// 						</tr>
// 					</table>
// 				</td>
// 			</tr>
// 		</table>
// 		<script src="https://use.fontawesome.com/5508b80a54.js"></script>
// 	</body>
// </html>`
// return HRAAdminInvitationTemp;
// }

module.exports.HRAAdminInvitationTemp = function (emailId, token, name) {
	let HRAAdminInvitationTemp = `<!doctype html>
  <html lang="en">
	  <head>
		  <meta charset="utf-8">
		  <title> HR Admin invitation</title>
		  <base href="/">
		  <meta name="viewport" content="width=device-width, initial-scale=1">
		  <link href="https://fonts.googleapis.com/css2?family=Poppins:display=swap" rel="stylesheet">
	  </head>
	  <body style="background: #fcfcfc;">
		  <table id="header" width="700px"  border="0" style="margin:0 auto;background:linear-gradient(90deg, #B681FB, #AAA0FC);">
			  <tr>
				  <td>
					  <table width="600" height="120px" border="0" style="margin:0 auto">
						  <tr>
							  <td>
								  <img src="http://20.74.180.163:4000/hugge.png" style="width: 204px;" alt="" />
							  </td>
						  </tr>
					  </table>
				  </td>
			  </tr>
		  </table>
		  <table id="body" width="700px"  border="0" style="margin:0 auto;background: #fff;">
			  <tr>
				  <td>
					  <table width="600" border="0" style="margin:0 auto">
						  <tr>
							  <td>
								  <h3 style="margin:30px 0; color:#6863FA;font-family:'Poppins', sans-serif;font-size: 24px;">MyHygge Email ID</h3>
							  </td>
						  </tr>
						  <tr>
							  <td>
								  <p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">Hi ${name},</p>
							  </td>
						  </tr>
						  <tr>
							  <td>
								  <p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">Your MyHygge email ID is: ${emailId}</p>
							  </td>
						  </tr>
						  <tr>
							  <td>
								  <p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;color:blue">
								   <span style="color:black">Create Your Password</span>: <a href="${process.env.IP_URL}:8082/set-password/${token}">
				   <u>click here</u>
				   </a>
								  </p>
							  </td>
						  </tr>
						  
						  
						  <tr>
							  <td>
								  <p  style="margin:20px 0 20px; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">
									  Cheers!
								  </p>
							  </td>
						  </tr>
						  <tr>
							  <td>
								  <p  style="margin:20px 0 30px; color:#C86CE6;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">
									  Hygge Team
								  </p>
							  </td>
						  </tr>
					  </table>
				  </td>
			  </tr>
		  </table>
		  <table id="footer" width="700px"  border="0" style="margin:0 auto;background:#FFAA2A">
			  <tr>
				  <td>
					  <table width="600" height="48px" border="0" style="margin:0 auto">
						  <tr>
							  <td>
								  <p style="margin:0; color:#fff;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">Stay in touch with us</p>
							  </td>
							  <td style="display: flex;
							  height: 100%;
							  justify-content: space-between;
							  align-items: center;">
								  <a href="" style="color: #fff;font-size: 20px;"><i class="fa fa-facebook"></i></a>
								  <a href="" style="color: #fff;font-size: 20px;"><i class="fa fa-google"></i></a>
								  <a href="" style="color: #fff;font-size: 20px;"><i class="fa fa-instagram"></i></a>
							  </td>
						  </tr>
					  </table>
				  </td>
			  </tr>
		  </table>
		  <script src="https://use.fontawesome.com/5508b80a54.js"></script>
	  </body>
  </html>`
	return HRAAdminInvitationTemp;
  }
  
  // HR Admin invitation - MyHygge email ID
  // Subject: MyHygge Email ID
  // Hi [First Name],
  // Your MyHygge email ID is: (insert email)
  // Password: (insert)
  // Login Now  (clickable button)
  // Cheers,
  // Hygge Team

// HR Admin invitation - MyHygge email ID
// Subject: MyHygge Email ID
// Hi [First Name],
// Your MyHygge email ID is: (insert email)
// Password: (insert)
// Login Now  (clickable button)
// Cheers,
// Hygge Team
