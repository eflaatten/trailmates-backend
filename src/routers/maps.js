const express = require("express");
const router = express.Router();
const { fetchRoutes, fetchWaypoints, fetchPoisForWaypoints, geocodeLocation } = require("../controllers/maps");

router.get('/routes', fetchRoutes);
router.post('/fetchWaypoints', fetchWaypoints);
router.post('/fetchPoisForWaypoints', fetchPoisForWaypoints);
router.get('/geocode', geocodeLocation);

module.exports = router;
