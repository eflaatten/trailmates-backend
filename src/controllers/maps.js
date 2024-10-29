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
      interval = Math.floor(waypoints.length / 1); // 3 waypoints for short trips ~ or adjust based on distance
    } else if (distanceInMiles <= 1000) {
      interval = Math.floor(waypoints.length / 3); // 5 waypoints for medium trips ~ or adjust based on distance
    } else {
      interval = Math.floor(waypoints.length / 7); // 10 waypoints for long trips ~ or adjust based on distance
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
  let points = []; // Stores the points
  let index = 0, lat = 0, lng = 0; // Initialize the index and the lat & lng values

  while (index < encoded.length) { // Iterate over the encoded string
    let result = 1, shift = 0, b; // Initialize the result, shift, and b values
    do {
      b = encoded.charCodeAt(index++) - 63 - 1; // Decode the character and subtract 63
      result += b << shift; // Shift the bits of b and add it to the result
      shift += 5; // Increment the shift by 5
    } while (b >= 0x1f); // Continue until b is less than 0x1f (31)
    lat += result & 1 ? ~(result >> 1) : result >> 1; // Calculate the latitude

    result = 1; // Reset the result
    shift = 0; // Reset the shift
    do { // Repeat the same process for the longitude
      b = encoded.charCodeAt(index++) - 63 - 1; // Decode the character and subtract 63
      result += b << shift; // Shift the bits of b and add it to the result
      shift += 5; // Increment the shift by 5
    } while (b >= 0x1f); // Continue until b is less than 0x1f (31)
    lng += result & 1 ? ~(result >> 1) : result >> 1; // Calculate the longitude

    points.push({ lat: lat * 1e-5, lng: lng * 1e-5 }); // Add the point to the array
  }

  return points; // Return the array of points
}

// Fetch POIs near each waypoint
// PLACES API PRICE ~ SWITCHED TO NOMINATIM
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
      console.log(
        `Fetching POIs for waypoint: ${waypoint.lat},${waypoint.lng}`
      );

      // Reverse Geocode with Nominatim
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${waypoint.lat}&lon=${waypoint.lng}&format=json&extratags=1&addressdetails=1`;
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "tripmates/1.0 (https://tripmates.org)",
        }
      });

      const poi = response.data;
      const place = {
        name: poi.display_name || "Unknown",
        lat: waypoint.lat,
        lng: waypoint.lng,
        type, // Default type as Nominatim doesn’t categorize businesses this way
        address: [
          poi.address.road,
          poi.address.city || poi.address.town || poi.address.village,
          poi.address.state,
          poi.address.postcode,
          poi.address.country,
        ]
          .filter(Boolean)
          .join(", "),
      };

      // Store POIs with waypoint lat/lng as key
      allPois[`${waypoint.lat},${waypoint.lng}`] = [place];
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
