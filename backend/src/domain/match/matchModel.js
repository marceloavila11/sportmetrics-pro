// src/domain/match/matchModel.js
const db = require("../../config/database");

class MatchModel {
  static async createMatch(matchData) {
    const { home_team_id, away_team_id, match_date, competition, season } =
      matchData;

    const query = `
      INSERT INTO matches (
        home_team_id, away_team_id, match_date, competition, season
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      home_team_id,
      away_team_id,
      match_date,
      competition,
      season,
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async getMatchesByTeamId(teamId) {
    const query = `
      SELECT 
        m.id, m.match_date, m.status, m.home_score, m.away_score,
        t1.name as home_team, 
        t2.name as away_team
      FROM matches m
      JOIN teams t1 ON m.home_team_id = t1.id
      JOIN teams t2 ON m.away_team_id = t2.id
      WHERE m.home_team_id = $1 OR m.away_team_id = $1
      ORDER BY m.match_date DESC
    `;
    const { rows } = await db.query(query, [teamId]);
    return rows;
  }

  static async updateScore(matchId, homeScore, awayScore) {
    const query = `
      UPDATE matches
      SET home_score = $1, away_score = $2, status = 'FINISHED'
      WHERE id = $3
      RETURNING *
    `;
    const { rows } = await db.query(query, [homeScore, awayScore, matchId]);
    return rows[0];
  }
}

module.exports = MatchModel;
