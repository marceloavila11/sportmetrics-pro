const express = require("express");
const router = express.Router();
const coachController = require("./coachController");

// GET /api/coaches/team/:teamId
router.get("/team/:teamId", coachController.getCoachAnalytics);

module.exports = router;
