const MLEngine = require("../../ml/engine");
const TeamModel = require("../team/teamModel"); 

const predictMatch = async (req, res) => {
  try {
    const { homeId, awayId } = req.body;

    if (!homeId || !awayId) {
      return res.status(400).json({ message: "Faltan homeId y awayId" });
    }
    const prediction = await MLEngine.predictMatch(homeId, awayId);
    const reasons = [];
    const hAtt = parseFloat(prediction.analysis.home_attack_rating);
    const aDef = parseFloat(prediction.analysis.away_defense_rating);
    const hProb = parseFloat(prediction.probabilities.home_win);

    if (hProb > 50) {
      reasons.push("El equipo local tiene una probabilidad alta de victoria.");
    }
    if (hAtt > 1.2) {
      reasons.push("El ataque del local es superior al promedio de la liga.");
    }
    if (aDef > 1.2) {
      reasons.push(
        "La defensa visitante ha estado concediendo muchos goles recientemente."
      );
    }
    if (reasons.length === 0)
      reasons.push("Partido muy reñido, cualquier cosa puede pasar.");

    res.status(200).json({
      status: "success",
      data: {
        fixture: { home: homeId, away: awayId },
        prediction: prediction,
        explanation: reasons,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { predictMatch };
