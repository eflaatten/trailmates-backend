const db = require("../config/db");
const axios = require("axios");


// GET Profile controllers
exports.getProfileInfo = async (req, res) => {
  console.log("Function called.")
  const { userId } = req.user;

  try {
    const [users] = await db.query(
      "SELECT userId, username, email, profile_picture, created_at FROM users WHERE userId = ?",
      [userId]
    );

    console.log("Query result:", users);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users[0]);
  } catch (error) {
    console.error("Get profile info error:", error);
    res.status(500).json({ message: "Error getting profile info" });
  }
}

// UPDATE Profile controllers 

exports.changeProfilePicture = async (req, res) => {
  try {
    if (!req.body.profile_picture) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileData = req.body.profile_picture; 
    const vercelBlobUrl = "https://bh43x1pj1kqhnkff.public.blob.vercel-storage.com"; 

    const response = await axios.post(vercelBlobUrl, fileData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (response.status === 200) {
      const blobUrl = response.data.url;

      const userId = req.user.userId; 
      await db.sequelize.query(
        `UPDATE users SET profile_picture = :blobUrl WHERE userId = :userId`,
        {
          replacements: { blobUrl, userId },
          type: db.sequelize.QueryTypes.UPDATE,
        }
      );

      return res.status(200).json({
        message: "Profile picture updated successfully",
        profile_picture_url: blobUrl,
      });
    } else {
      return res.status(response.status).json({
        message: "Failed to upload to Blob storage",
      });
    }
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return res.status(500).json({ message: "Error updating profile picture" });
  }
};


exports.changeUsername = async (req, res) => {
  const { userId } = req.user;
  const { username } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE users SET username = ? WHERE userId = ?",
      [username, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Username updated successfully" });
  } catch (error) {
    console.error("Change username error:", error);
    res.status(500).json({ message: "Error updating username" });
  }
}

exports.changeEmail = async (req, res) => {
  const { userId } = req.user;
  const { email } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE users SET email = ? WHERE userId = ?",
      [email, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Email updated successfully" });
  } catch (error) {
    console.error("Change email error:", error);
    res.status(500).json({ message: "Error updating email" });
  }
}
