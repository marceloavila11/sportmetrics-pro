// src/index.js
const app = require("./app");
const db = require("./config/database");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    const res = await db.query("SELECT NOW()");
    console.log(`📚 DB conectada a las: ${res.rows[0].now}`);

    app.listen(PORT, () => {
      console.log(`
      🚀 Server running on port ${PORT}
      🏆 SportMetrics Pro - Backend
      `);
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
  }
};

startServer();
