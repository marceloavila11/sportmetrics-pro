// src/domain/team/teamController.js
const TeamModel = require("./teamModel");

const getAllTeams = async (req, res) => {
  try {
    const teams = await TeamModel.getAllTeams();
    res.status(200).json({
      status: "success",
      results: teams.length,
      data: teams,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener los equipos",
      error: error.message,
    });
  }
};

const createTeam = async (req, res) => {
  try {
    const { name, country } = req.body;
    if (!name || !country) {
      return res.status(400).json({
        status: "fail",
        message: "Por favor proporciona nombre y país del equipo",
      });
    }

    const newTeam = await TeamModel.createTeam(req.body);
    res.status(201).json({
      status: "success",
      data: newTeam,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al crear el equipo",
      error: error.message,
    });
  }
};

const getTeamAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const matches = await TeamModel.getFinishedMatches(id, 10);

    if (matches.length === 0) {
      return res
        .status(200)
        .json({ message: "No hay suficientes datos para analizar." });
    }

    let stats = {
      matches_played: matches.length,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_scored: 0,
      goals_conceded: 0,
      clean_sheets: 0,
      form: [],
    };

    matches.forEach((match) => {
      const isHome = match.home_team_id === parseInt(id);
      const myScore = isHome ? match.home_score : match.away_score;
      const opponentScore = isHome ? match.away_score : match.home_score;

      stats.goals_scored += myScore;
      stats.goals_conceded += opponentScore;

      if (opponentScore === 0) stats.clean_sheets++;

      let resultCode;

      if (myScore > opponentScore) {
        stats.wins++;
        resultCode = "W";
      } else if (myScore === opponentScore) {
        stats.draws++;
        resultCode = "D";
      } else {
        stats.losses++;
        resultCode = "L";
      }

      stats.form.push(resultCode);
    });

    const analytics = {
      overview: {
        games_played: stats.matches_played,
        record: `${stats.wins}W - ${stats.draws}D - ${stats.losses}L`,
        win_rate: ((stats.wins / stats.matches_played) * 100).toFixed(1) + "%",
      },
      attack: {
        total_goals: stats.goals_scored,
        avg_goals_per_game: (stats.goals_scored / stats.matches_played).toFixed(
          2
        ),
      },
      defense: {
        total_conceded: stats.goals_conceded,
        avg_conceded_per_game: (
          stats.goals_conceded / stats.matches_played
        ).toFixed(2),
        clean_sheets: stats.clean_sheets,
      },
      recent_form: stats.form,
    };

    res.status(200).json({
      status: "success",
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al calcular analíticas",
      error: error.message,
    });
  }
};

module.exports = { getAllTeams, createTeam, getTeamAnalytics };
