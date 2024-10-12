const db = require("../config/db");
const axios = require("axios");
const { uploadToBlobStorage } = require("../blob/uploadToBlobStorage");

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

exports.changeProfilePicture = async (req, res) => {
  const { userId } = req.user; 
  const file = req.file; 

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const blobUrl = await uploadToBlobStorage(
      file.buffer,
      `profile-${userId}.jpg`
    );
    const [result] = await db.query(
      "UPDATE users SET profile_picture = ? WHERE userId = ?",
      [blobUrl, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile picture updated successfully", url: blobUrl });
  } catch (error) {
    console.error("Change profile picture error:", error);
    res.status(500).json({ message: "Error updating profile picture" });
  }
};

exports.removeProfilePicture = async (req, res) => {
  const { userId } = req.user;

  try {
    const [users] = await db.query(
      "SELECT profile_picture FROM users WHERE userId = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    if (!user.profile_picture) {
      return res.status(400).json({ message: "No profile picture to remove" });
    }

    const fileName = user.profile_picture.split("/").pop();

    try {
      await axios.delete(user.profile_picture);
    } catch (deleteError) {
      console.error("Error deleting file from blob storage:", deleteError);
      return res
        .status(500)
        .json({ message: "Error deleting profile picture from storage" });
    }

    await db.query("UPDATE users SET profile_picture = NULL WHERE userId = ?", [
      userId,
    ]);

    res.json({ message: "Profile picture removed successfully", fileName });
  } catch (error) {
    console.error("Remove profile picture error:", error);
    res.status(500).json({ message: "Error removing profile picture" });
  }
};


// exports.removeProfilePicture = async (req, res) => {
//   const { userId } = req.user;

//   try {
//     const [users] = await db.query(
//       "SELECT profile_picture FROM users WHERE userId = ?",
//       [userId]
//     );

//     if (users.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const user = users[0];

//     if (!user.profile_picture) {
//       return res.status(400).json({ message: "No profile picture to remove" });
//     }

//     const fileName = user.profile_picture.split("/").pop();
//     await axios.delete(user.profile_picture);
//     await db.query("UPDATE users SET profile_picture = NULL WHERE userId = ?", [
//       userId,
//     ]);

//     res.json({ message: "Profile picture removed successfully", fileName });
//   } catch (error) {
//     console.error("Remove profile picture error:", error);
//     res.status(500).json({ message: "Error removing profile picture" });
//   }
// }