const express = require("express");
const { changeEmail, changeUsername, getProfileInfo, changeProfilePicture, removeProfilePicture } = require("../controllers/profile");
const { authenticateToken } = require("../middleware/authenticate");
const multer = require('multer');
const storage = multer.memoryStorage(); // Use memory storage for immediate upload
const upload = multer({ storage: storage }).single("profile_picture");
const router = express.Router();

router.post('/change-email', authenticateToken, changeEmail);
router.post('/change-username', authenticateToken, changeUsername);
router.get('/get-profile', authenticateToken, getProfileInfo);
router.post('/changeProfilePicture', authenticateToken, upload, changeProfilePicture);
router.delete('/removeProfilePicture', authenticateToken, removeProfilePicture);

module.exports = router;