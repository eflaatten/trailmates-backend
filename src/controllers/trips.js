const db = require("../config/db");
const axios = require("axios");
require("dotenv").config();

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
  const { trip_name, trip_description, start_date, end_date, destination, starting_location} = req.body;

  try {
    const prompt = `Generate a summary road trip named "${trip_name}" starting from ${starting_location} to ${destination} from ${start_date} to ${end_date}. 
    Include:
    2. Recommend hotels to stay at along or at the destination with a link to their website.
    3. Recommend sights or activities to do along the route or at the destination with a link to their website.
    Make it detailed but concise (under 200 words).
    DO NOT include a day by day itinerary.
    For the links, but the name of the link in brackets, [like this](http://www.example.com).`;
    const openai_response = await axios.post("https://api.openai.com/v1/chat/completions", 
    {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPEN_AI_API_KEY}`
      }
    }
  )

    const tripSummary = openai_response.data.choices[0].message.content;

    const [result] = await db.query(
      "INSERT INTO trips (userId, trip_name, trip_description, start_date, end_date, destination, openai_response, starting_location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [userId, trip_name, trip_description, start_date, end_date, destination, tripSummary, starting_location]
    );

    res.json({
      message: "Trip created successfully",
      openai_response: tripSummary,
      tripId: result.insertId
    });
  } catch (error) {
    console.error("Create trip error:", error);
    res.status(500).json({ message: "Error creating trip" });
  }
}

exports.deleteTripByUserId = async (req, res) => {
  const { userId } = req.user;
  const { tripId } = req.params;

  try {
    const [result] = await db.query("DELETE FROM trips WHERE userId = ? AND tripId = ?", [userId, tripId]);
    if (result.affectedRows) {
      res.json({ message: "Trip deleted successfully" });
    } else {
      res.status(404).json({ message: "Trip not found" });
    }
  } catch (error) {
    console.error("Delete trip error:", error);
    res.status(500).json({ message: "Error deleting trip" });
  }
}