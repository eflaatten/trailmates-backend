const express = require("express");
const { authenticateToken } = require("../middleware/authenticate");
const router = express.Router();

router.post("/createComment", authenticateToken, createComment);
router.delete("/deleteComment/:commentId", authenticateToken, deleteComment);
router.put("/editComment/:commentId", authenticateToken, editComment);

module.exports = router;