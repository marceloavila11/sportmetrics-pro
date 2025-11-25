// src/domain/player/playerModel.js
const db = require("../../config/database");

class PlayerModel {
  static async createPlayer(playerData) {
    const {
      name,
      position,
      nationality,
      team_id,
      jersey_number,
      height_cm,
      weight_kg,
      date_of_birth,
    } = playerData;

    const query = `
      INSERT INTO players (
        name, position, nationality, team_id, 
        jersey_number, height_cm, weight_kg, date_of_birth
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      name,
      position,
      nationality,
      team_id,
      jersey_number,
      height_cm,
      weight_kg,
      date_of_birth,
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async getPlayersByTeamId(teamId) {
    const query =
      "SELECT * FROM players WHERE team_id = $1 ORDER BY jersey_number ASC";
    const { rows } = await db.query(query, [teamId]);
    return rows;
  }

  static async getPlayerById(id) {
    const query = "SELECT * FROM players WHERE id = $1";
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
  static async getPlayerProfile(id) {
    const query = `
      SELECT 
        p.*,
        t.name as team_name,
        t.logo_url as team_logo
      FROM players p
      JOIN teams t ON p.team_id = t.id
      WHERE p.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

module.exports = PlayerModel;
