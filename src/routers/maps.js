const express = require("express");
const router = express.Router();
const { fetchRoutes, fetchWaypoints, fetchPoisForWaypoints, geocodeLocation } = require("../controllers/maps");

router.post('/routes', fetchRoutes);
router.post('/fetchWaypoints', fetchWaypoints);
router.post('/fetchPoisForWaypoints', fetchPoisForWaypoints);
router.post('/geocode', geocodeLocation);

module.exports = router;
