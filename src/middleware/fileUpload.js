const multer = require("multer");

const storage = multer.memoryStorage(); // Store the file in memory

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
}).single("profile_picture"); // Specify the name of the field expected

module.exports = upload;
