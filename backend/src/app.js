// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const teamRoutes = require("./domain/team/teamRoutes");
const playerRoutes = require("./domain/player/playerRoutes");
const matchRoutes = require("./domain/match/matchRoutes");
const coachRoutes = require("./domain/coach/coachRoutes");
const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/teams", teamRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/coaches", coachRoutes);
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "🏆 SportMetrics Pro API is running",
    timestamp: new Date(),
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

module.exports = app;
