// src/domain/team/teamModel.js
const db = require("../../config/database");

class TeamModel {
  static async getAllTeams() {
    const query = "SELECT * FROM teams ORDER BY name ASC";
    const { rows } = await db.query(query);
    return rows;
  }

  static async createTeam(teamData) {
    const { name, country, stadium_name } = teamData;
    const query = `
      INSERT INTO teams (name, country, stadium_name)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [name, country, stadium_name];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async getFinishedMatches(teamId, limit = 10) {
    const query = `
      SELECT 
        m.id, m.match_date, m.home_team_id, m.away_team_id, 
        m.home_score, m.away_score,
        t_home.name as home_name,
        t_away.name as away_name
      FROM matches m
      JOIN teams t_home ON m.home_team_id = t_home.id
      JOIN teams t_away ON m.away_team_id = t_away.id
      WHERE (m.home_team_id = $1 OR m.away_team_id = $1)
        AND m.status = 'FINISHED'
      ORDER BY m.match_date DESC
      LIMIT $2
    `;
    const { rows } = await db.query(query, [teamId, limit]);
    return rows;
  }
}

module.exports = TeamModel;
