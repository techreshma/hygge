module.exports.AdminInvitationTemp=function(data){
    let AdminInvitationTemp=`<!doctype html>
    <html lang="en">
	<head>
		<meta charset="utf-8">
		<title>Hygge Admin Team </title>
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
								<h3 style="margin:30px 0; color:#6863FA;font-family:'Poppins', sans-serif;font-size: 24px;">You’re Invited to Hygge admin team </h3>
							</td>
						</tr>
						<tr>
							<td>
								<p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">Hi [First Name],</p>
							</td>
						</tr>
						<tr>
							<td>
								<p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">
									You have been added as an admin on Hygge to help manage our team. You can use the same username and password that you use to login on mobile. 
								</p>
							</td>
						</tr>
						<tr>
							<td>
								<p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">
								  Login Now (clickable button)
								</p>
							</td>
						</tr>
						<tr>
							<td>
								<p style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">Regards,</p>
								<p>{Insert name}</p>
								<p>{Insert designation}</p>
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
return AdminInvitationTemp;
}

// Sub - Admin invitation - Customer email ID
// Subject: You’re Invited to Hygge admin team 
// Hi [First Name],
// You have been added as an admin on Hygge to help manage our team. You can use the same username and password that you use to login on mobile. 
// Login Now (clickable button)
// Regards,
// {Insert name}
// {Insert designation}