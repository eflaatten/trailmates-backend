const db = require("../config/db");

// GET Trips

exports.getTrips = async (req, res) => {
  try {
    const [trips] = await db.query("SELECT * FROM trips");
    res.json(trips);
  } catch (error) {
    console.error("Get trips error:", error);
    res.status(500).json({ message: "Error getting trips" });
  }
}

// GET Users Trips 
exports.getUsersTrips = async (req, res) => {
  const { userId } = req.user;
  try {
    const [trips] = await db.query("SELECT * FROM trips WHERE userId = ?", [userId]);
    res.json(trips);
  } catch (error) {
    console.error("Get trips error:", error);
    res.status(500).json({ message: "Error getting trips" });
  }
}

// POST Create Trip

exports.createTrip = async (req, res) => {
  const { userId } = req.user;
  const { trip_name, trip_description, start_date, end_date, destination } = req.body;

  try {
    const [result] = await db.query(
      "INSERT INTO trips (userId, trip_name, trip_description, start_date, end_date, destination) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, trip_name, trip_description, start_date, end_date, destination]
    );

    res.json({ message: "Trip created successfully", tripId: result.insertId });
  } catch (error) {
    console.error("Create trip error:", error);
    res.status(500).json({ message: "Error creating trip" });
  }
}