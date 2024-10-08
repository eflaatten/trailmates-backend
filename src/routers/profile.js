const express = require("express");
const { changeEmail, changeUsername, getProfileInfo } = require("../controllers/profile");
const { authenticateToken } = require("../middleware/authenticate");
const router = express.Router();

router.post('/change-email', authenticateToken, changeEmail);
router.post('/change-username', authenticateToken, changeUsername);
router.get('/get-profile', authenticateToken, getProfileInfo);

module.exports = router;