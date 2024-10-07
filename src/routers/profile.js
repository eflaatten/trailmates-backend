const express = require("express");
const { changeProfilePicture, changeUsername, getProfileInfo } = require("../controllers/profile");
const { authenticateToken } = require("../middleware/authenticate");
const router = express.Router();

router.post('/change-profile-picture', authenticateToken, changeProfilePicture);
router.post('/change-username', authenticateToken, changeUsername);
router.get('/get-profile', authenticateToken, getProfileInfo);

module.exports = router;