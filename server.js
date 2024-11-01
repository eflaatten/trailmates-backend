const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routers/auth");
const profileRoutes = require("./src/routers/profile");
const tripRoutes = require("./src/routers/trips");
const mapRoutes = require("./src/routers/maps");
const commentRoutes = require('./src/routers/comments');
require("dotenv").config();

console.log("Starting server initialization...");

const app = express();

console.log("Express app created");

// Middleware
app.use(cors({
  origin: "*", // Allow all origins
}));
app.use(express.json());

// Auth Routes
app.use("/api/auth", authRoutes);

// Profile Routes
app.use("/api/profile", profileRoutes);

// Trip Routes
app.use("/api/trips", tripRoutes);

// Map Routes
app.use("/api/maps", mapRoutes);

// Comment Routes
app.use("/api/comments", commentRoutes);

// Test Route
app.get("/api/test", (req, res) => {
  res.status(200).send("test route working");
});

// Default Route
app.get("/", (req, res) => {
  res.send("Hello from the Capstone Backend!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
