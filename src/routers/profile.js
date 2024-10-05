const express = require("express");
const { changeProfilePicture, changeUsername, getProfileInfo } = require("../controllers/profile");
const router = express.Router();

router.post('/change-profile-picture', changeProfilePicture);
router.post('/change-username', changeUsername);
router.get('/get-profile', getProfileInfo);

module.exports = router;