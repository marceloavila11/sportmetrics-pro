const axios = require("axios");
const db = require("../config/database");
require("dotenv").config();

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";
const LEAGUE_ID = 239;
const SEASON = 2025;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "x-rapidapi-key": API_KEY,
    "x-rapidapi-host": "v3.football.api-sports.io",
  },
});

const importLigaPro = async () => {
  console.log(`🇪🇨 Conectando a API-Football (LigaPro ${SEASON})...`);

  if (!API_KEY) {
    console.error("❌ Error: Falta la API_FOOTBALL_KEY en el archivo .env");
    process.exit(1);
  }

  try {
    console.log("📡 Descargando partidos...");

    const response = await apiClient.get("/fixtures", {
      params: { league: LEAGUE_ID, season: SEASON },
    });

    if (response.data.errors && Object.keys(response.data.errors).length > 0) {
      console.error(
        "❌ ERROR DE LA API:",
        JSON.stringify(response.data.errors, null, 2)
      );
      process.exit(1);
    }

    const fixtures = response.data.response;
    console.log(`✅ Resultados encontrados: ${response.data.results}`);

    if (fixtures.length === 0) {
      console.log("⚠️ La lista está vacía. Posibles causas:");
      console.log("   1. La temporada seleccionada no tiene datos aún.");
      console.log("   2. Tu plan gratuito no permite acceder a esta liga/año.");
      console.log("   👉 Intenta cambiar SEASON a 2024 o 2023 en el código.");
      process.exit(0);
    }

    console.log("🧹 Limpiando base de datos...");
    await db.query(
      "TRUNCATE TABLE matches, players, coaches, teams RESTART IDENTITY CASCADE"
    );

    const teamsMap = new Map();

    console.log("⚙️ Importando a PostgreSQL...");

    for (const item of fixtures) {
      const { fixture, teams, goals, league } = item;

      let homeTeamId = teamsMap.get(teams.home.id);
      if (!homeTeamId) {
        const res = await db.query(
          `INSERT INTO teams (name, country, stadium_name, logo_url, short_name) 
           VALUES ($1, 'Ecuador', $2, $3, $4) RETURNING id`,
          [
            teams.home.name,
            fixture.venue.name,
            teams.home.logo,
            teams.home.code || teams.home.name.substring(0, 3),
          ]
        );
        homeTeamId = res.rows[0].id;
        teamsMap.set(teams.home.id, homeTeamId);
      }

      let awayTeamId = teamsMap.get(teams.away.id);
      if (!awayTeamId) {
        const res = await db.query(
          `INSERT INTO teams (name, country, stadium_name, logo_url, short_name) 
           VALUES ($1, 'Ecuador', $2, $3, $4) RETURNING id`,
          [
            teams.away.name,
            fixture.venue.name,
            teams.away.logo,
            teams.away.code || teams.away.name.substring(0, 3),
          ]
        );
        awayTeamId = res.rows[0].id;
        teamsMap.set(teams.away.id, awayTeamId);
      }

      let status = "SCHEDULED";
      if (["FT", "AET", "PEN"].includes(fixture.status.short)) {
        status = "FINISHED";
      } else if (["1H", "2H", "HT"].includes(fixture.status.short)) {
        status = "LIVE";
      }

      await db.query(
        `INSERT INTO matches (home_team_id, away_team_id, match_date, status, home_score, away_score, competition, season)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          homeTeamId,
          awayTeamId,
          new Date(fixture.date),
          status,
          goals.home ?? 0,
          goals.away ?? 0,
          league.name,
          league.season.toString(),
        ]
      );
    }

    console.log(
      `🎉 Éxito! Se importaron ${teamsMap.size} equipos y ${fixtures.length} partidos reales de la LigaPro.`
    );
    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Error en la importación:",
      error.response ? error.response.data : error.message
    );
    process.exit(1);
  }
};

importLigaPro();
