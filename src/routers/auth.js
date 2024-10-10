const express = require("express");
const { signup, login, logout, changePassword, deleteAccount } = require("../controllers/auth");
const { authenticateToken } = require("../middleware/authenticate");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", authenticateToken, logout);
router.post("/change-password", authenticateToken, changePassword);
router.post("/delete-account", authenticateToken, deleteAccount);

module.exports = router;
