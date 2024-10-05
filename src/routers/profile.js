const express = require("express");
const { changeProfilePicture, changeUsername } = require("../controllers/profile");
const router = express.Router();

router.post('/change-profile-picture', changeProfilePicture);
router.post('/change-username', changeUsername);

module.exports = router;