const axios = require("axios");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY; 

// Fetch route from Google Directions API
exports.fetchRoutes = async (req, res) => {
  const { origin, destination } = req.query;

  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(url);

    if (response.data.routes.length === 0) {
      return res.status(404).json({ error: "No route found" });
    }

    const route = response.data.routes[0].overview_polyline.points; // Encoded polyline

    // Return route polyline and legs (for fetching POIs along the route)
    res.json({
      polyline: route,
      legs: response.data.routes[0].legs, // Legs give us waypoints along the route
    });
  } catch (error) {
    console.error("Error fetching route:", error);
    res.status(500).json({ error: "Error fetching route" });
  }
};

// Fetch POIs from Google Places API
exports.fetchPois = async (req, res) => {
  const { waypoints, radius = 5000, type = "restaurant" } = req.body;

  try {
    let pois = [];

    // Limit to fetching POIs around 5-10 waypoints (midpoints)
    for (let i = 0; i < waypoints.length && i < 10; i++) {
      const waypoint = waypoints[i];
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${waypoint}&radius=${radius}&type=${type}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
      const response = await axios.get(url);

      // Accumulate POIs
      pois = [...pois, ...response.data.results];
    }

    // Limit the POIs to the top 5-10 based on rating, or some other metric
    pois = pois.slice(0, 10);

    res.json(pois);
  } catch (error) {
    console.error("Error fetching POIs:", error);
    res.status(500).json({ error: "Error fetching POIs" });
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
