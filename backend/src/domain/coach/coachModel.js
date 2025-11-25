// src/domain/coach/coachModel.js
const db = require("../../config/database");

class CoachModel {
  static async getCoachByTeamId(teamId) {
    const query = `
      SELECT * FROM coaches 
      WHERE current_team_id = $1
      LIMIT 1
    `;
    const { rows } = await db.query(query, [teamId]);
    return rows[0];
  }

  static async getTeamPerformance(teamId) {
    const query = `
      SELECT 
        COUNT(*) as games_managed,
        SUM(CASE 
          WHEN home_team_id = $1 AND home_score > away_score THEN 1
          WHEN away_team_id = $1 AND away_score > home_score THEN 1
          ELSE 0 END) as wins,
        SUM(CASE 
          WHEN home_team_id = $1 AND home_score = away_score THEN 1
          WHEN away_team_id = $1 AND away_score = home_score THEN 1
          ELSE 0 END) as draws,
        SUM(CASE 
            WHEN home_team_id = $1 THEN home_score 
            ELSE away_score END) as goals_for
      FROM matches 
      WHERE (home_team_id = $1 OR away_team_id = $1) 
      AND status = 'FINISHED'
    `;
    const { rows } = await db.query(query, [teamId]);
    return rows[0];
  }
}

module.exports = CoachModel;
