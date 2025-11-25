// src/domain/match/matchController.js
const MatchModel = require("./matchModel");

const scheduleMatch = async (req, res) => {
  try {
    const { home_team_id, away_team_id, match_date } = req.body;

    if (home_team_id === away_team_id) {
      return res.status(400).json({
        status: "fail",
        message: "El equipo local y visitante no pueden ser el mismo.",
      });
    }

    const newMatch = await MatchModel.createMatch(req.body);
    res.status(201).json({
      status: "success",
      data: newMatch,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al programar el partido",
      error: error.message,
    });
  }
};

const recordResult = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { home_score, away_score } = req.body;

    const updatedMatch = await MatchModel.updateScore(
      matchId,
      home_score,
      away_score
    );

    if (!updatedMatch) {
      return res.status(404).json({ message: "Partido no encontrado" });
    }

    res.status(200).json({
      status: "success",
      data: updatedMatch,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al actualizar resultado",
      error: error.message,
    });
  }
};

module.exports = { scheduleMatch, recordResult };
