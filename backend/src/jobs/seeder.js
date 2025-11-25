// src/jobs/seeder.js
const db = require("../config/database");

const teamsData = [
  {
    name: "LDU Quito",
    country: "Ecuador",
    stadium: "Rodrigo Paz Delgado",
    short: "LDU",
    strength: 90,
  },
  {
    name: "Independiente del Valle",
    country: "Ecuador",
    stadium: "Banco Guayaquil",
    short: "IDV",
    strength: 88,
  },
  {
    name: "Barcelona SC",
    country: "Ecuador",
    stadium: "Monumental BP",
    short: "BSC",
    strength: 85,
  },
  {
    name: "CS Emelec",
    country: "Ecuador",
    stadium: "George Capwell",
    short: "CSE",
    strength: 82,
  },
  {
    name: "Universidad Católica",
    country: "Ecuador",
    stadium: "Olímpico Atahualpa",
    short: "UCA",
    strength: 78,
  },
  {
    name: "El Nacional",
    country: "Ecuador",
    stadium: "Olímpico Atahualpa",
    short: "NAC",
    strength: 75,
  },
  {
    name: "Aucas",
    country: "Ecuador",
    stadium: "Gonzalo Pozo Ripalda",
    short: "AUC",
    strength: 74,
  },
  {
    name: "Deportivo Cuenca",
    country: "Ecuador",
    stadium: "A. Serrano Aguilar",
    short: "CUE",
    strength: 70,
  },
  {
    name: "Macará",
    country: "Ecuador",
    stadium: "Bellavista",
    short: "MAC",
    strength: 68,
  },
  {
    name: "Mushuc Runa",
    country: "Ecuador",
    stadium: "Echaleche",
    short: "MUS",
    strength: 65,
  },
  {
    name: "Orense SC",
    country: "Ecuador",
    stadium: "9 de Mayo",
    short: "ORE",
    strength: 62,
  },
  {
    name: "Delfín SC",
    country: "Ecuador",
    stadium: "Jocay",
    short: "DEL",
    strength: 60,
  },
];

const firstNames = [
  "Pedro",
  "Juan",
  "Carlos",
  "Luis",
  "José",
  "Jhon",
  "Byron",
  "Moisés",
  "Enner",
  "Ángel",
  "Félix",
  "Pervis",
  "Kendry",
  "Alexander",
  "Hernán",
  "Damián",
  "Gabriel",
  "Joao",
  "Franklin",
  "Walter",
  "Miller",
  "Junior",
  "Adonis",
  "Romario",
  "Gonzalo",
  "Ezequiel",
  "Facundo",
  "Francisco",
];
const lastNames = [
  "Caicedo",
  "Plata",
  "Estupiñán",
  "Hincapié",
  "Minda",
  "Valencia",
  "Mena",
  "Torres",
  "Preciado",
  "Domínguez",
  "Galíndez",
  "Campana",
  "Sornoza",
  "Díaz",
  "Burrai",
  "Ortiz",
  "Rodríguez",
  "Chalá",
  "Corozo",
  "Quiñónez",
  "Arreaga",
  "Palacios",
  "Cifuentes",
  "Gruezo",
  "Franco",
  "Sánchez",
  "Ibarra",
];

const positionsStructure = [
  { code: "Goalkeeper", count: 3 },
  { code: "Defender", count: 8 },
  { code: "Midfielder", count: 8 },
  { code: "Forward", count: 6 },
];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomBirthDate = () => {
  const end = new Date();
  end.setFullYear(end.getFullYear() - 18);
  const start = new Date();
  start.setFullYear(start.getFullYear() - 36);
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

const generateScore = (homeStrength, awayStrength) => {
  const homeAdvantage = 15;
  const diff = homeStrength + homeAdvantage - awayStrength;
  let homeGoals = 0,
    awayGoals = 0;

  if (diff > 20) {
    homeGoals = Math.floor(Math.random() * 4) + 1;
    awayGoals = Math.floor(Math.random() * 2);
  } else if (diff < -20) {
    homeGoals = Math.floor(Math.random() * 2);
    awayGoals = Math.floor(Math.random() * 4) + 1;
  } else {
    homeGoals = Math.floor(Math.random() * 3);
    awayGoals = Math.floor(Math.random() * 3);
  }

  return { homeGoals, awayGoals };
};

const seedDatabase = async () => {
  console.log(
    "🇪🇨 Iniciando Seeder Completo (Equipos + Jugadores + Partidos)..."
  );

  try {
    await db.query(
      "TRUNCATE TABLE matches, players, coaches, teams RESTART IDENTITY CASCADE"
    );

    console.log("⚽ Creando equipos y fichando jugadores...");
    const teamsMap = [];

    for (const team of teamsData) {
      const res = await db.query(
        "INSERT INTO teams (name, country, stadium_name, short_name) VALUES ($1, $2, $3, $4) RETURNING id",
        [team.name, team.country, team.stadium, team.short]
      );
      const teamId = res.rows[0].id;
      teamsMap.push({ id: teamId, strength: team.strength });

      let jerseyNumbers = Array.from({ length: 99 }, (_, i) => i + 1).sort(
        () => Math.random() - 0.5
      );

      for (const posGroup of positionsStructure) {
        for (let i = 0; i < posGroup.count; i++) {
          const name = `${getRandomElement(firstNames)} ${getRandomElement(
            lastNames
          )}`;
          const position = posGroup.code;
          const nationality = "Ecuador";
          const jersey = jerseyNumbers.pop();
          const dob = getRandomBirthDate();

          let height = 170 + Math.floor(Math.random() * 15);
          if (position === "Goalkeeper" || position === "Defender") height += 5;
          const weight = height - 100 + Math.floor(Math.random() * 10);

          await db.query(
            `
            INSERT INTO players (name, position, nationality, team_id, jersey_number, height_cm, weight_kg, date_of_birth)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
            [name, position, nationality, teamId, jersey, height, weight, dob]
          );
        }
      }
    }
    console.log(
      `✅ Equipos y aprox ${teamsData.length * 25} jugadores creados.`
    );

    console.log("📅 Simulando calendario de partidos...");
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 2;
    let totalMatches = 0;

    for (let year = startYear; year <= currentYear; year++) {
      for (let i = 0; i < teamsMap.length; i++) {
        for (let j = 0; j < teamsMap.length; j++) {
          if (i === j) continue;
          const homeTeam = teamsMap[i];
          const awayTeam = teamsMap[j];
          const month = ((i + j) % 10) + 1;
          const day = ((i * j) % 28) + 1;
          const matchDate = new Date(year, month, day, 16, 0, 0);
          const today = new Date();

          let status = "SCHEDULED";
          let homeScore = 0,
            awayScore = 0;

          if (matchDate < today) {
            status = "FINISHED";
            const result = generateScore(homeTeam.strength, awayTeam.strength);
            homeScore = result.homeGoals;
            awayScore = result.awayGoals;
          }

          await db.query(
            `INSERT INTO matches (home_team_id, away_team_id, match_date, status, home_score, away_score, competition, season)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              homeTeam.id,
              awayTeam.id,
              matchDate,
              status,
              homeScore,
              awayScore,
              "LigaPro Ecuabet",
              year.toString(),
            ]
          );
          totalMatches++;
        }
      }
    }

    console.log(
      `✅ Base de datos lista: ${teamsData.length} Equipos, Plantillas Completas y ${totalMatches} Partidos.`
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

seedDatabase();
