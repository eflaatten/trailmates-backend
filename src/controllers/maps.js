const axios = require("axios");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Fetch route from Google Directions API
exports.fetchRoutes = async (req, res) => {
  const { origin, destination } = req.query;

  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(url);

    if (!response.data.routes || response.data.routes.length === 0) {
      return res.status(404).json({ error: "No route found" });
    }

    const route = response.data.routes[0].overview_polyline.points;

    res.json({
      polyline: route,
      legs: response.data.routes[0].legs,
    });
  } catch (error) {
    console.error("Error fetching route:", error);
    res.status(500).json({ error: "Error fetching route" });
  }
};

// Fetch waypoints along a route
exports.fetchWaypoints = async (req, res) => {
  const { origin, destination } = req.body;
  console.log("Origin:", origin, "Destination:", destination);

  try {
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`;
    const directionsResponse = await axios.get(directionsUrl);

    if (!directionsResponse.data.routes || directionsResponse.data.routes.length === 0) {
      return res.status(404).json({ error: "No route found between locations." });
    }

    const route = directionsResponse.data.routes[0];
    const overviewPolyline = route.overview_polyline?.points;

    if (!overviewPolyline) {
      return res.status(500).json({ error: "No overview polyline found in route data." });
    }

    // Decode polyline into waypoints
    const waypoints = decodePolyline(overviewPolyline);

    // Calculate total route distance in miles
    const distanceInMeters = route.legs.reduce((sum, leg) => sum + (leg.distance ? leg.distance.value : 0), 0);
    const distanceInMiles = distanceInMeters / 1609.34; // Convert meters to miles

    // Determine interval based on distance
    let interval;
    if (distanceInMiles <= 200) {
      interval = Math.floor(waypoints.length / 3); // 3 waypoints for short trips
    } else if (distanceInMiles <= 1000) {
      interval = Math.floor(waypoints.length / 5); // 5 waypoints for medium trips
    } else {
      interval = Math.floor(waypoints.length / 10); // 10 waypoints for long trips
    }

    // Select waypoints based on interval
    const selectedWaypoints = waypoints.filter((_, index) => index % interval === 0);
    console.log("Selected waypoints based on distance:", selectedWaypoints);

    res.json({ waypoints: selectedWaypoints });
  } catch (error) {
    console.error("Error fetching waypoints:", error);
    res.status(500).json({ error: "Error fetching waypoints" });
  }
};

// Decode polyline into an array of latitude and longitude points
function decodePolyline(encoded) {
  let points = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let result = 1, shift = 0, b;
    do {
      b = encoded.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 1;
    shift = 0;
    do {
      b = encoded.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ lat: lat * 1e-5, lng: lng * 1e-5 });
  }

  return points;
}

// Fetch POIs near each waypoint
// PLACES API PRICE CRITICAL - SWITCHED TO OVERPASS API
// exports.fetchPoisForWaypoints = async (req, res) => {
//   const { waypoints, radius = 80000, type = "restaurant" } = req.body;
//   console.log("Waypoints for POI fetching:", waypoints);

//   try {
//     let allPois = {};

//     for (const waypoint of waypoints) {
//       console.log(
//         `Fetching POIs for waypoint: ${waypoint.lat},${waypoint.lng}`
//       );
//       const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${waypoint.lat},${waypoint.lng}&radius=${radius}&type=${type}&key=${GOOGLE_MAPS_API_KEY}`;
//       const response = await axios.get(url);

//       const pois = response.data.results
//         .sort((a, b) => b.rating - a.rating)
//         .slice(0, 3);
//       allPois[`${waypoint.lat},${waypoint.lng}`] = pois;
//     }

//     console.log("Final POIs for each waypoint:", allPois);

//     res.json(allPois);
//   } catch (error) {
//     console.error("Error fetching POIs for each waypoint:", error);
//     res.status(500).json({ error: "Error fetching POIs for each waypoint" });
//   }
// };
// Fetch POIs near each waypoint using Overpass API
exports.fetchPoisForWaypoints = async (req, res) => {
  const { waypoints, radius = 80000, type = "restaurant" } = req.body;
  console.log("Waypoints for POI fetching:", waypoints);

  try {
    let allPois = {};

    for (const waypoint of waypoints) {
      console.log(`Fetching POIs for waypoint: ${waypoint.lat},${waypoint.lng}`);

      // Overpass query template for fetching POIs of a specific type within a radius
      const overpassQuery = `
        [out:json];
        node["amenity"="${type}"](around:${radius},${waypoint.lat},${waypoint.lng});
        out body;
      `;

      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
      const response = await axios.get(url);

      const pois = response.data.elements
        .map(poi => ({
          name: poi.tags.name || "Unknown",
          lat: poi.lat,
          lng: poi.lon,
          type: poi.tags.amenity || type,
          // Overpass doesn't provide ratings, but other info may be added here
        }))
        .slice(0, 3); // Slice the top 3 results for each waypoint

      allPois[`${waypoint.lat},${waypoint.lng}`] = pois;
    }

    console.log("Final POIs for each waypoint:", allPois);

    res.json(allPois);
  } catch (error) {
    console.error("Error fetching POIs for each waypoint:", error);
    res.status(500).json({ error: "Error fetching POIs for each waypoint" });
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
    console.error("Error fetching geocoding data:", error);
    res.status(500).json({ error: "Error fetching geocoding data" });
  }
};
