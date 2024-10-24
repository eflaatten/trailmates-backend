const express = require("express");
const router = express.Router();
const { fetchRoutes, fetchPois, geocodeLocation } = require("../controllers/maps");

router.get('/routes', fetchRoutes);
router.post('/pois', fetchPois);
router.get('/geocode', geocodeLocation);

module.exports = router;
