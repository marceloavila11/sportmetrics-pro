// src/domain/coach/coachController.js
const CoachModel = require("./coachModel");

const getCoachAnalytics = async (req, res) => {
  try {
    const { teamId } = req.params;

    const coach = await CoachModel.getCoachByTeamId(teamId);

    if (!coach) {
      return res
        .status(404)
        .json({ message: "Este equipo no tiene entrenador asignado." });
    }

    const stats = await CoachModel.getTeamPerformance(teamId);

    const games = parseInt(stats.games_managed) || 0;
    const wins = parseInt(stats.wins) || 0;
    const goals = parseInt(stats.goals_for) || 0;

    const winRate = games > 0 ? ((wins / games) * 100).toFixed(1) : 0;
    const goalsPerGame = games > 0 ? (goals / games).toFixed(2) : 0;

    let tacticalStyle = "Equilibrado";
    let tags = [];

    if (parseFloat(goalsPerGame) > 1.8) {
      tacticalStyle = "Fútbol Total (Ofensivo)";
      tags.push("High Pressing");
    } else if (parseFloat(goalsPerGame) < 1.0 && parseFloat(winRate) > 40) {
      tacticalStyle = "Catenaccio (Defensivo)";
      tags.push("Solid Block");
    } else if (parseFloat(winRate) < 30) {
      tacticalStyle = "En Reconstrucción";
      tags.push("Under Pressure");
    } else {
      tacticalStyle = "Posesión Controlada";
    }

    res.status(200).json({
      status: "success",
      data: {
        id: coach.id,
        name: coach.name,
        nationality: coach.nationality,
        metrics: {
          matches_managed: games,
          win_rate: `${winRate}%`,
          goals_per_match: goalsPerGame,
          tactical_style: tacticalStyle,
          tags: tags,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getCoachAnalytics };
