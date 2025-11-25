// src/domain/player/playerController.js
const PlayerModel = require("./playerModel");

const createPlayer = async (req, res) => {
  try {
    const { name, position, team_id } = req.body;

    if (!name || !position || !team_id) {
      return res.status(400).json({
        status: "fail",
        message: "Faltan campos obligatorios (name, position, team_id)",
      });
    }

    const newPlayer = await PlayerModel.createPlayer(req.body);
    res.status(201).json({
      status: "success",
      data: newPlayer,
    });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({
        status: "fail",
        message: "El ID del equipo proporcionado no existe.",
      });
    }
    res.status(500).json({
      status: "error",
      message: "Error al registrar el jugador",
      error: error.message,
    });
  }
};

const getPlayersByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const players = await PlayerModel.getPlayersByTeamId(teamId);

    res.status(200).json({
      status: "success",
      results: players.length,
      data: players,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener jugadores",
      error: error.message,
    });
  }
};
const getPlayerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const player = await PlayerModel.getPlayerProfile(id);

    if (!player) {
      return res.status(404).json({ message: "Jugador no encontrado" });
    }

    const impactScore =
      player.total_goals * 3 +
      player.total_assists * 2 +
      parseFloat(player.average_rating) * 5;

    res.status(200).json({
      status: "success",
      data: {
        ...player,
        metrics: {
          impact_score: Math.round(impactScore),
          goals_per_match: (player.total_goals / player.appearances).toFixed(2),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPlayer, getPlayersByTeam, getPlayerProfile };
