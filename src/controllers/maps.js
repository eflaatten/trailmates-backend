const axios = require("axios");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY; 

// Fetch route from Google Directions API
exports.fetchRoutes = async (req, res) => {
  const { origin, destination } = req.query;

  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching route:", error);
    res.status(500).json({ error: "Error fetching route" });
  }
};

// Fetch POIs from Google Places API
exports.fetchPois = async (req, res) => {
  const { location, radius, type } = req.query;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching places:", error);
    res.status(500).json({ error: "Error fetching places" });
  }
};

// Geocode location
exports.geocodeLocation = async (req, res) => {
  const { location } = req.query;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      location
    )}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching geocoding data:', error);
    res.status(500).json({ error: 'Error fetching geocoding data' });
  }
};

module.exports = router;
