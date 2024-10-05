const express = require("express");
const { signup, login, logout, changePassword } = require("../controllers/auth");
const { authenticateToken } = require("../middleware/authenticate");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", authenticateToken, logout);
router.post("/change-password", authenticateToken, changePassword);

module.exports = router;
