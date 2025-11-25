// src/domain/team/teamRoutes.js
const express = require("express");
const router = express.Router();
const teamController = require("./teamController");

router.get("/", teamController.getAllTeams);
router.post("/", teamController.createTeam);
router.get("/:id/analytics", teamController.getTeamAnalytics);

module.exports = router;
