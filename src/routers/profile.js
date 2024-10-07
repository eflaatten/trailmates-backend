const express = require("express");
const { changeProfilePicture, changeUsername, getProfileInfo } = require("../controllers/profile");
const { authenticateToken } = require("../middleware/authenticate");
const upload = require('../middleware/fileUpload');
const router = express.Router();

router.post('/change-profile-picture', authenticateToken, upload, changeProfilePicture);
router.post('/change-username', authenticateToken, changeUsername);
router.get('/get-profile', authenticateToken, getProfileInfo);

module.exports = router;