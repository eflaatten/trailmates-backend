const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routers/auth");
require("dotenv").config();

console.log("Starting server initialization...");

const app = express();

console.log("Express app created");

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.get("/api/test", (req, res) => {
  res.status(200).send("test route working");
});

app.get("/", (req, res) => {
  res.send("Hello from the Capstone Backend!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
