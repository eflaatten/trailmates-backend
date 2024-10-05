const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Signup Controller
exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const query =
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(query, [username, email, hashedPassword], (err, result) => {
      if (err) {
        console.error("Signup error:", err);
        return res.status(500).json({ message: "Error creating user" });
      }
      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (error) {
    console.error("Password hashing error:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};

// Login Controller
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [users] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (users.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = users[0];
    // Ensure the field name matches the database schema
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//Logout Controller
exports.logout = (req, res) => {
  res.json({ message: "Logout successful" });
};

exports.changePassword = async (req, res) => {
  const { userId } = req.user;
  const { currentPassword, newPassword } = req.body;

  try {
    const [users] = await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Error updating password" });
  }
}
