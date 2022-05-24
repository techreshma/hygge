module.exports.DocExpiryTemp=function(name,document_name,expire_date){
let DocExpiryTemp=`<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>Email</title>
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
								<h3 style="margin:30px 0; color:#6863FA;font-family:'Poppins', sans-serif;font-size: 24px;">Welcome to MyHygge</h3>
							</td>
						</tr>
						<tr>
							<td>
								<p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">Hello `+name+`</p>
							</td>
						</tr>
						<tr>
							<td>
								<p  style="margin:20px 0; color:#000;font-family:'Poppins', sans-serif;font-size:16px;line-height: 24px;">
									We know you’re busy and just wanted to remind you that your `+document_name+` will expire on `+expire_date+`.
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
return DocExpiryTemp;
}
// Subject: Your [insert document name] is expiring!
// Hi [First Name],
// We know you’re busy and just wanted to remind you that your [insert document name] will expire on [insert date].
// Cheers,
// Hygge Team
// // 