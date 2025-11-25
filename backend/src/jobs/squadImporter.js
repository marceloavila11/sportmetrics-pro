// src/jobs/squadImporter.js
const axios = require("axios");
const db = require("../config/database");
require("dotenv").config();

const API_KEY = process.env.API_FOOTBALL_KEY;
const LEAGUE_ID = 242;
const PRIMARY_SEASON = 2023;
const FALLBACK_SEASON = 2022;
const apiClient = axios.create({
  baseURL: "https://v3.football.api-sports.io",
  headers: {
    "x-rapidapi-key": API_KEY,
    "x-rapidapi-host": "v3.football.api-sports.io",
  },
});

const TEAM_MAPPING = {
  "LDU de Quito": "LDU Quito",
  "Universidad Catolica": "Universidad Católica",
  Macara: "Macará",
  Macará: "Macara",
  "Delfin SC": "Delfín SC",
  "Tecnico Universitario": "Técnico Universitario",
  "Mushuc Runa SC": "Mushuc Runa",
  Cumbayá: "Cumbaya FC",
  "Gualaceo SC": "Gualaceo",
  "9 de Octubre": "9 de Octubre FC",
  "9 de Octubre FC": "9 de Octubre",
  Emelec: "CS Emelec",
  "Guayaquil City FC": "Guayaquil City",
};

const normalize = (str) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const importSquads = async () => {
  console.log("👥 Importación con Fallback (2023 -> 2022)...");

  try {
    const { rows: dbTeams } = await db.query("SELECT id, name FROM teams");
    const responseTeams = await apiClient.get("/teams", {
      params: { league: LEAGUE_ID, season: PRIMARY_SEASON },
    });
    const apiTeamsList = responseTeams.data.response;

    for (const localTeam of dbTeams) {
      const localName = localTeam.name;

      let apiTeamData = apiTeamsList.find(
        (item) => item.team.name === localName
      );

      if (!apiTeamData && TEAM_MAPPING[localName]) {
        apiTeamData = apiTeamsList.find(
          (item) =>
            item.team.name === TEAM_MAPPING[localName] ||
            item.team.name.includes(TEAM_MAPPING[localName])
        );
      }

      if (!apiTeamData) {
        apiTeamData = apiTeamsList.find(
          (item) => normalize(item.team.name) === normalize(localName)
        );
      }

      if (!apiTeamData) {
        continue;
      }

      const apiTeamId = apiTeamData.team.id;

      const checkPlayers = await db.query(
        "SELECT COUNT(*) FROM players WHERE team_id = $1",
        [localTeam.id]
      );
      if (parseInt(checkPlayers.rows[0].count) > 10) {
        console.log(`✅ ${localName}: Ya tiene plantilla completa. Saltando.`);
        continue;
      }

      console.log(
        `⚙️ Buscando jugadores para: ${localName} (ID API: ${apiTeamId})...`
      );

      let playersAdded = 0;
      let seasonToUse = PRIMARY_SEASON;

      let resPlayers = await apiClient.get("/players", {
        params: { team: apiTeamId, season: PRIMARY_SEASON, page: 1 },
      });

      if (!resPlayers.data.response || resPlayers.data.response.length === 0) {
        console.log(`   ⚠️ 2023 vacío. Intentando con 2022...`);
        seasonToUse = FALLBACK_SEASON;
        resPlayers = await apiClient.get("/players", {
          params: { team: apiTeamId, season: FALLBACK_SEASON, page: 1 },
        });
      }

      for (let page = 1; page <= 2; page++) {
        if (page > 1) {
          resPlayers = await apiClient.get("/players", {
            params: { team: apiTeamId, season: seasonToUse, page: page },
          });
        }

        const playersList = resPlayers.data.response;
        if (!playersList || playersList.length === 0) break;

        for (const item of playersList) {
          const p = item.player;
          const s = item.statistics[0];
          let position = s.games.position || "Midfielder";

          if (["Attacker", "Forward"].includes(position)) position = "Forward";
          if (["Defender"].includes(position)) position = "Defender";
          if (["Midfielder"].includes(position)) position = "Midfielder";
          if (["Goalkeeper"].includes(position)) position = "Goalkeeper";

          const height = p.height
            ? parseInt(p.height.replace(/\D/g, ""))
            : null;
          const weight = p.weight
            ? parseInt(p.weight.replace(/\D/g, ""))
            : null;

          await db.query(
            `INSERT INTO players (name, position, nationality, team_id, jersey_number, height_cm, weight_kg, date_of_birth)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT DO NOTHING`,
            [
              p.name,
              position,
              p.nationality,
              localTeam.id,
              s.games.number || null,
              height,
              weight,
              p.birth.date,
            ]
          );
          playersAdded++;
        }
        await sleep(500);
      }

      console.log(
        `   ⚽ Agregados: ${playersAdded} jugadores (Temp: ${seasonToUse})`
      );
      await sleep(1000);
    }

    console.log("\n🎉 Proceso finalizado.");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

importSquads();
