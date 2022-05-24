var multer = require("multer");
// var upload = multer().single('avatar')

var upload = multer({ dest: "upload/profile" });

var storage = multer.diskStorage({
  destination: function (req, file, cd) {
    cd(null, "upload/profile");
  },

  filename: function (req, file, cd) {
    var str = file.originalname;
    var dotIndex = str.lastIndexOf(".");
    var ext = str.substring(dotIndex);
    var val = ext.split(".")[1];
    cd(null, Date.now() + "-image." + val);
  },
});

var upload = multer({
  storage: storage,
}).any("");

// //------------------------ UploadFile ------------------------
module.exports.profileImageUpload = async (req, res) => {
  try {
    upload(req, res, async (err) => {      
      var imagename = req.files;
      path = await imagename.map((data) => {
        return data.filename;
      });
      res.status(200).json({
        success: true,
        message: "image upload successfully",
        data: path
      });
    });
  } catch (err) {
    res.status(400).json(message.err);
  }
};
