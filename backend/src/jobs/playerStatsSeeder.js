// src/jobs/playerStatsSeeder.js
const db = require("../config/database");

const gaussianRandom = (min, max, skew) => {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5;
  if (num > 1 || num < 0) num = gaussianRandom(min, max, skew);
  else {
    num = Math.pow(num, skew);
    num *= max - min;
    num += min;
  }
  return num;
};

const generateStats = async () => {
  console.log(
    "📊 Generando Estadísticas de Jugadores (Simulación Basada en Roles)..."
  );

  try {
    const { rows: players } = await db.query(
      "SELECT id, position, name FROM players"
    );

    console.log(`⚡ Procesando ${players.length} jugadores...`);

    for (const player of players) {
      let goals = 0;
      let assists = 0;
      let yellows = 0;
      let reds = 0;
      let rating = 6.0;

      const apps = Math.floor(Math.random() * 15) + 10;
      const mins = apps * (Math.floor(Math.random() * 30) + 60);

      switch (player.position) {
        case "Forward":
          goals = Math.floor(gaussianRandom(2, 18, 1));
          assists = Math.floor(Math.random() * 6);
          rating = gaussianRandom(6.5, 8.5, 1);
          break;

        case "Midfielder":
          goals = Math.floor(Math.random() * 8);
          assists = Math.floor(gaussianRandom(3, 12, 1));
          rating = gaussianRandom(6.8, 8.2, 1);
          break;

        case "Defender":
          goals = Math.floor(Math.random() * 4);
          assists = Math.floor(Math.random() * 4);
          yellows = Math.floor(Math.random() * 10);
          if (Math.random() > 0.8) reds = 1;
          rating = gaussianRandom(6.4, 7.8, 1);
          break;

        case "Goalkeeper":
          rating = gaussianRandom(6.5, 8.0, 1);
          break;
      }

      await db.query(
        `
        UPDATE players 
        SET 
          total_goals = $1,
          total_assists = $2,
          total_cards_yellow = $3,
          total_cards_red = $4,
          minutes_played = $5,
          appearances = $6,
          average_rating = $7
        WHERE id = $8
      `,
        [
          goals,
          assists,
          yellows,
          reds,
          mins,
          apps,
          rating.toFixed(1),
          player.id,
        ]
      );
    }

    console.log("✅ Estadísticas generadas exitosamente.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

generateStats();
