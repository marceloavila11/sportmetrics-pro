// src/ml/engine.js
const db = require("../config/database");

class MLEngine {
  static async calculateTeamStrength(teamId) {
    const leagueAvgGoals = 1.35;

    const query = `
      SELECT 
        COUNT(*) as played,
        SUM(CASE WHEN home_team_id = $1 THEN home_score ELSE away_score END) as gf,
        SUM(CASE WHEN home_team_id = $1 THEN away_score ELSE home_score END) as ga
      FROM matches 
      WHERE (home_team_id = $1 OR away_team_id = $1) 
      AND status = 'FINISHED'
      LIMIT 20
    `;

    const { rows } = await db.query(query, [teamId]);
    const stats = rows[0];

    if (!stats.played || stats.played < 5) {
      return { attack: 1.0, defense: 1.0 };
    }

    const avgGF = stats.gf / stats.played;
    const avgGA = stats.ga / stats.played;

    return {
      attack: avgGF / leagueAvgGoals,
      defense: avgGA / leagueAvgGoals,
    };
  }

  static poisson(lambda, k) {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / this.factorial(k);
  }

  static factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }

  static async predictMatch(homeId, awayId) {
    const homeStrength = await this.calculateTeamStrength(homeId);
    const awayStrength = await this.calculateTeamStrength(awayId);

    const LEAGUE_AVG = 1.35;
    const HOME_ADVANTAGE = 1.15;

    const homeXG =
      homeStrength.attack * awayStrength.defense * LEAGUE_AVG * HOME_ADVANTAGE;
    const awayXG = awayStrength.attack * homeStrength.defense * LEAGUE_AVG;

    let homeWinProb = 0;
    let drawProb = 0;
    let awayWinProb = 0;

    for (let h = 0; h <= 5; h++) {
      for (let a = 0; a <= 5; a++) {
        const prob = this.poisson(homeXG, h) * this.poisson(awayXG, a);

        if (h > a) homeWinProb += prob;
        else if (h === a) drawProb += prob;
        else awayWinProb += prob;
      }
    }

    return {
      probabilities: {
        home_win: (homeWinProb * 100).toFixed(1) + "%",
        draw: (drawProb * 100).toFixed(1) + "%",
        away_win: (awayWinProb * 100).toFixed(1) + "%",
      },
      expected_goals: {
        home: homeXG.toFixed(2),
        away: awayXG.toFixed(2),
      },
      analysis: {
        home_attack_rating: homeStrength.attack.toFixed(2),
        away_defense_rating: awayStrength.defense.toFixed(2),
      },
    };
  }
}

module.exports = MLEngine;
