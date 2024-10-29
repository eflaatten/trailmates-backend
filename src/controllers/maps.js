const axios = require("axios");

exports.fetchRoutes = async (req, res) => {
  const { origin, destination } = req.body; // Expecting objects with lat and lng keys

  // Validate parameters
  if (
    !origin ||
    !origin.lat ||
    !origin.lng ||
    !destination ||
    !destination.lat ||
    !destination.lng
  ) {
    return res
      .status(400)
      .json({ error: "Origin and destination with lat and lng are required" });
  }

  try {
    // Construct coordinates for OSRM (longitude,latitude format)
    const originCoords = `${origin.lng},${origin.lat}`;
    const destinationCoords = `${destination.lng},${destination.lat}`;

    // Construct and encode the OSRM request URL
    const url = `https://router.project-osrm.org/route/v1/driving/${encodeURIComponent(
      originCoords
    )};${encodeURIComponent(
      destinationCoords
    )}?overview=full&geometries=polyline`;

    console.log("Encoded OSRM URL:", url); // Log the complete URL

    // Send the request to OSRM
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "tripmates/1.0 (https://tripmates.org)",
      },
    });

    if (!response.data.routes || response.data.routes.length === 0) {
      return res.status(404).json({ error: "No route found" });
    }

    const route = response.data.routes[0].geometry;

    res.json({
      polyline: route,
      legs: response.data.routes[0].legs,
    });
  } catch (error) {
    console.error(
      "Error fetching route:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Error fetching route" });
  }
};

// Fetch waypoints along a route from OSRM
exports.fetchWaypoints = async (req, res) => {
  const { origin, destination } = req.body; // Ensure you're accessing from req.body

  // Log origin and destination to verify they're being received
  console.log("Origin:", origin);
  console.log("Destination:", destination);

  // Validate parameters
  if (!origin || !destination) {
    return res.status(400).json({ error: "Origin and destination are required" });
  }

  try {
    // Reverse coordinates for OSRM format (longitude,latitude)
    const originCoords = origin.split(',').reverse().join(',');
    const destinationCoords = destination.split(',').reverse().join(',');

    const url = `http://router.project-osrm.org/route/v1/driving/${originCoords};${destinationCoords}?overview=full&geometries=polyline`;
    console.log("OSRM URL:", url); // Log the complete URL being requested

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "tripmates/1.0 (https://tripmates.org)",
      },
    });

    if (!response.data.routes || response.data.routes.length === 0) {
      return res.status(404).json({ error: "No route found between locations." });
    }

    const route = response.data.routes[0];
    const overviewPolyline = route.geometry;

    if (!overviewPolyline) {
      return res.status(500).json({ error: "No overview polyline found in route data." });
    }

    // Decode polyline into waypoints (use existing decodePolyline function if available)
    const waypoints = decodePolyline(overviewPolyline);

    res.json({ waypoints });
  } catch (error) {
    console.error("Error fetching waypoints:", error.response ? error.response.data : error.message);
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
  const { location } = req.body; // Retrieve location from the body

  // Validate that location is provided
  if (!location) {
    return res.status(400).json({ error: "Location is required" });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      location
    )}&format=json&addressdetails=1`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "tripmates/1.0 (https://tripmates.org)",
      },
    });

    // Check if data is returned and format the response
    if (response.data && response.data.length > 0) {
      const data = response.data.map((item) => ({
        name: item.display_name,
        lat: item.lat,
        lon: item.lon,
        address: item.address,
      }));
      res.json(data);
    } else {
      res.status(404).json({ error: "Location not found" });
    }
  } catch (error) {
    console.error("Error fetching geocoding data:", error);
    res.status(500).json({ error: "Error fetching geocoding data" });
  }
};