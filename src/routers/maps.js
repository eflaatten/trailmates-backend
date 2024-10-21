const express = require("express");
const router = express.Router();
import { fetchRoutes, fetchPois } from "../controllers/maps";

router.get('/routes', fetchRoutes);
router.get('/pois', fetchPois);

module.exports = router;
