// module.exports.EmpInvitationTemp=function(data){
// let EmpInvitationTemp =`<!doctype html>
// <html lang="en">
// 	<head>
// 		<meta charset="utf-8">
// 		<title>JIVR</title>
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
// 								<h3 style="margin:30px 0; color:#6863FA;font-family:'Poppins', sans-serif;font-size: 24px;">Welcome to MyHygge</h3>
// 							</td>
// 						</tr>
// 						<tr>
// 							<td>
// 								<p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">Hello [first name of employee]</p>
// 							</td>
// 						</tr>
// 						<tr>
// 							<td>
// 								<p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">
// 									We’re excited to welcome you to HyggeLife. This is your first step towards more positive collaboration and getting your wellness fix!
// 								</p>
// 							</td>
// 						</tr>
// 						<tr>
// 							<td>
// 								<p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">
// 									Download the Hygge app by using the QR code below or search for <a href="" style="color:#3F51B5;text-decoration: none;">{insert link}</a> on the iOS app store or Android market.
// 								</p>
// 							</td>
// 						</tr>
// 						<tr>
// 							<td>
// 								<p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">
// 									The username is your work email ID and you can create a password using the link below or alternatively, copy and paste it into your web browser:
// 								</p>
// 							</td>
// 						</tr>
// 						<tr>
// 							<td>
// 								<p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">
// 									<a href="" style="color:#3F51B5;text-decoration: none;">{insert link}</a>
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
// return EmpInvitationTemp;
// }
// Employee invitation - 	REQUIRES CHANGES 
// Subject: Welcome to MyHygge
// Hello [first name of employee],
// We’re excited to welcome you to HyggeLife. This is your first step towards more positive collaboration and getting your wellness fix! 
// Download the Hygge app by using the QR code below or search for {insert link} on the iOS app store or Android market. 
// The username is your work email ID and you can create a password using the link below or alternatively, copy and paste it into your web browser:
// {insert link}
// Cheers!
// Hygge Team 



module.exports.EmpInvitationTemp=function( email,token,qrcode,fullName){
	let EmpInvitationTemp =`<!doctype html>
	<html lang="en">
		<head>
			<meta charset="utf-8">
			<title>JIVR</title>
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
									<img src="http://20.74.180.163:4000/hugge.png" style="height: 102px;width: 204px;" alt="" />
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
									<h3 style="margin:30px 0; color:#6863FA;font-family:'Poppins', sans-serif;font-size: 24px;">Welcome to MyHygge</h3>
								</td>
							</tr>
							<tr>
								<td>
									<p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">Hello ${fullName}</p>
								</td>
							</tr>
							<tr>
								<td>
									<p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">
										We’re excited to welcome you to HyggeLife. This is your first step towards more positive collaboration and getting your wellness fix!
									</p>
								</td>
							</tr>
							<tr>
								<td>
									<p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">
										Download the Hygge app by using the QR code below or search for <a href="" style="color:#3F51B5;text-decoration: none;">{insert link}</a> on the iOS app store or Android market.
									</p>
								</td>
							</tr>
							<tr>
								<td>
									<p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">
										The username is your work email ID and you can create a password using the link below or alternatively, copy and paste it into your web browser:
									</p>
								</td>
							</tr>
							<tr>
								<td>
									<p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">
										<a style="color:#3F51B5;text-decoration: none;" href="${process.env.IP_URL}:8082/set-password/${token}">Create Your Password</a>
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
	return EmpInvitationTemp;
	}