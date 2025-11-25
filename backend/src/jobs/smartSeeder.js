// src/jobs/smartSeeder.js
const axios = require("axios");
const db = require("../config/database");
require("dotenv").config();

const API_KEY = process.env.API_FOOTBALL_KEY;
const LEAGUE_ID = 242;
const HISTORICAL_SEASONS = [2021, 2022, 2023];
const SIMULATION_SEASONS = [2024, 2025];

const apiClient = axios.create({
  baseURL: "https://v3.football.api-sports.io",
  headers: {
    "x-rapidapi-key": API_KEY,
    "x-rapidapi-host": "v3.football.api-sports.io",
  },
});

const teamStatsCache = new Map();
let leagueAvgGoals = 0;

const fetchSeasonData = async (season) => {
  console.log(`📡 Descargando datos históricos: Temporada ${season}...`);
  try {
    const response = await apiClient.get("/fixtures", {
      params: { league: LEAGUE_ID, season: season, status: "FT" },
    });
    return response.data.response;
  } catch (error) {
    console.error(`❌ Error bajando ${season}:`, error.message);
    return [];
  }
};

const processHistory = async () => {
  console.log("🧠 Analizando rendimiento histórico (Data Science)...");

  let totalGoalsLeague = 0;
  let totalMatchesLeague = 0;

  for (const season of HISTORICAL_SEASONS) {
    const fixtures = await fetchSeasonData(season);

    for (const match of fixtures) {
      const { teams, goals } = match;

      if (goals.home === null || goals.away === null) continue;

      totalGoalsLeague += goals.home + goals.away;
      totalMatchesLeague++;

      const updateStats = (team, scored, conceded) => {
        if (!teamStatsCache.has(team.id)) {
          teamStatsCache.set(team.id, {
            id: team.id,
            name: team.name,
            logo: team.logo,
            venue: match.fixture.venue.name,
            stats: { gf: 0, ga: 0, played: 0 },
          });
        }
        const data = teamStatsCache.get(team.id);
        data.stats.gf += scored;
        data.stats.ga += conceded;
        data.stats.played++;
      };

      updateStats(teams.home, goals.home, goals.away);
      updateStats(teams.away, goals.away, goals.home);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  const avgGoalsPerMatch = totalGoalsLeague / totalMatchesLeague;

  console.log(
    `📊 Promedio de gol por partido en LigaPro: ${avgGoalsPerMatch.toFixed(2)}`
  );
  teamStatsCache.forEach((team) => {
    const avgGF = team.stats.gf / team.stats.played;
    const avgGA = team.stats.ga / team.stats.played;

    team.ratings = {
      attack: avgGF / (avgGoalsPerMatch / 2),
      defense: avgGA / (avgGoalsPerMatch / 2),
    };
  });
};

const simulateScore = (homeTeam, awayTeam) => {
  const homeAdvantage = 1.15;
  const homePotential =
    homeTeam.ratings.attack * awayTeam.ratings.defense * homeAdvantage;

  const awayPotential = awayTeam.ratings.attack * homeTeam.ratings.defense;

  const getGoals = (lambda) => {
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    return k - 1;
  };

  return {
    homeScore: getGoals(homePotential * 1.3),
    awayScore: getGoals(awayPotential * 1.3),
  };
};

const run = async () => {
  try {
    console.log("🧹 Limpiando base de datos...");
    await db.query(
      "TRUNCATE TABLE matches, players, coaches, teams RESTART IDENTITY CASCADE"
    );
    await processHistory();

    console.log("💾 Guardando equipos en base de datos...");
    const dbIdMap = new Map();

    const topTeams = Array.from(teamStatsCache.values())
      .sort((a, b) => b.stats.played - a.stats.played)
      .slice(0, 16);

    for (const team of topTeams) {
      const res = await db.query(
        `INSERT INTO teams (name, country, stadium_name, logo_url, short_name) 
         VALUES ($1, 'Ecuador', $2, $3, $4) RETURNING id`,
        [
          team.name,
          team.venue,
          team.logo,
          team.name.substring(0, 3).toUpperCase(),
        ]
      );
      dbIdMap.set(team.id, res.rows[0].id);

      console.log(
        `   ✅ ${team.name} (Att: ${team.ratings.attack.toFixed(
          2
        )}, Def: ${team.ratings.defense.toFixed(2)})`
      );
    }

    console.log("🔮 Iniciando Simulación Futura...");

    for (const season of SIMULATION_SEASONS) {
      console.log(`📅 Simulando Temporada ${season}...`);

      for (let i = 0; i < topTeams.length; i++) {
        for (let j = 0; j < topTeams.length; j++) {
          if (i === j) continue;

          const homeTeamAPI = topTeams[i];
          const awayTeamAPI = topTeams[j];

          const { homeScore, awayScore } = simulateScore(
            homeTeamAPI,
            awayTeamAPI
          );

          const month = Math.floor(Math.random() * 10) + 1;
          const day = Math.floor(Math.random() * 28) + 1;
          const matchDate = new Date(season, month, day, 15, 0, 0);

          const today = new Date();
          let status = "SCHEDULED";
          let finalHome = 0,
            finalAway = 0;

          if (matchDate < today) {
            status = "FINISHED";
            finalHome = homeScore;
            finalAway = awayScore;
          }

          await db.query(
            `INSERT INTO matches (home_team_id, away_team_id, match_date, status, home_score, away_score, competition, season)
             VALUES ($1, $2, $3, $4, $5, $6, 'LigaPro Ecuabet (Sim)', $7)`,
            [
              dbIdMap.get(homeTeamAPI.id),
              dbIdMap.get(awayTeamAPI.id),
              matchDate,
              status,
              finalHome,
              finalAway,
              season.toString(),
            ]
          );
        }
      }
    }

    console.log("🚀 ¡Proceso completado! Data Science aplicada.");
    console.log("   - Se analizaron 3 años de historia.");
    console.log("   - Se calcularon coeficientes de ataque/defensa.");
    console.log("   - Se simularon 2024 y 2025 basados en esos datos.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  }
};

run();
