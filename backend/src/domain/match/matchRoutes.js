// src/domain/match/matchRoutes.js
const express = require("express");
const router = express.Router();
const matchController = require("./matchController");
const predictionController = require("./predictionController");
router.post("/", matchController.scheduleMatch);

router.patch("/:matchId/result", matchController.recordResult);
router.post("/predict", predictionController.predictMatch);
module.exports = router;
