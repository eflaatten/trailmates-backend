const db = require("../config/db");

exports.createComment = async (req, res) => {
  const { userId } = req.user;
  const { tripId } = req.params;
  const { body } = req.body;

  const createdAt = new Date().toISOString();

  try {
    const [result] = await db.query(
      "INSERT INTO Comments (tripId, userId, body, created_at) VALUES (?, ?, ?, ?)",
      [tripId, userId, body, createdAt]
    )
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ message: "Error creating comment" });
  }
}

exports.deleteComment = async (req, res) => {
  const { userId } = req.user;
  const { commentId } = req.params;

  try {
    const [result] = await db.query(
      "DELETE FROM Comments WHERE commentId = ? AND userId = ?",
      [commentId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Error deleting comment" });
  }
}

exports.editComment = async (req, res) => {
  const { userId } = req.user;
  const { commentId } = req.params;
  const { body } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE Comments SET body = ? WHERE commentId = ? AND userId = ?",
      [body, commentId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json({ message: "Comment updated successfully" });
  } catch (error) {
    console.error("Edit comment error:", error);
    res.status(500).json({ message: "Error updating comment" });
  }
}