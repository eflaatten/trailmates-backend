const express = require("express");
const router = express.Router();
import { fetchRoutes, fetchPois, geocodeLocation } from "../controllers/maps";

router.get('/routes', fetchRoutes);
router.get('/pois', fetchPois);
router.get('/geocode', geocodeLocation);

module.exports = router;
