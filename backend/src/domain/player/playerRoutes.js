// src/domain/player/playerRoutes.js
const express = require("express");
const router = express.Router();
const playerController = require("./playerController");

router.post("/", playerController.createPlayer);
router.get("/:id", playerController.getPlayerProfile);
router.get("/team/:teamId", playerController.getPlayersByTeam);

module.exports = router;
