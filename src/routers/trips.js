const express = require("express");
const { getTrips, getUsersTrips, createTrip, deleteTripByUserId } = require("../controllers/trips");
const { authenticateToken } = require("../middleware/authenticate");
const router = express.Router();

// GET All Trips
router.get("/getTrips", getTrips);

// GET Trips by userId
router.get("/getUserTrips", authenticateToken, getUsersTrips);

// CREATE Trip
router.post("/createTrip", authenticateToken, createTrip);

// DELETE Trip by userId
router.delete("/deleteTrip/:tripId", authenticateToken, deleteTripByUserId);

module.exports = router;