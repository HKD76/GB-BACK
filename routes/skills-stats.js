const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const router = express.Router();

const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "gb_project";

/**
 * GET /api/skills-stats - Récupérer tous les skills_stats
 */
router.get("/", async (req, res) => {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection("skills_stats");

    const skillsStats = await collection.find({}).toArray();

    await client.close();

    res.json({
      skills_stats: skillsStats,
      count: skillsStats.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des skills_stats:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message:
        "Une erreur est survenue lors de la récupération des skills_stats",
    });
  }
});

/**
 * GET /api/skills-stats/search - Rechercher des skills_stats par nom
 */
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        error: "Terme de recherche requis",
        message: "Veuillez fournir un terme de recherche",
      });
    }

    const client = new MongoClient(mongoUrl);
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection("skills_stats");

    const skillsStats = await collection
      .find({
        $or: [
          { name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
        ],
      })
      .toArray();

    await client.close();

    res.json({
      skills_stats: skillsStats,
      count: skillsStats.length,
      searchTerm: q,
    });
  } catch (error) {
    console.error("Erreur lors de la recherche de skills_stats:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la recherche",
    });
  }
});

/**
 * GET /api/skills-stats/with-tables - Récupérer les skills_stats qui ont des tables
 */
router.get("/with-tables", async (req, res) => {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection("skills_stats");

    const skillsStats = await collection
      .find({
        tables: { $exists: true, $ne: [] },
      })
      .toArray();

    await client.close();

    res.json({
      skills_stats: skillsStats,
      count: skillsStats.length,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des skills_stats avec tables:",
      error
    );
    res.status(500).json({
      error: "Erreur serveur",
      message:
        "Une erreur est survenue lors de la récupération des skills_stats avec tables",
    });
  }
});

/**
 * GET /api/skills-stats/:name - Récupérer un skill_stats par nom
 */
router.get("/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const client = new MongoClient(mongoUrl);
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection("skills_stats");

    const skillStats = await collection.findOne({
      name: { $regex: name, $options: "i" },
    });

    await client.close();

    if (!skillStats) {
      return res.status(404).json({
        error: "Skill stats non trouvé",
        message: `Aucun skill stats trouvé avec le nom: ${name}`,
      });
    }

    res.json({
      skill_stats: skillStats,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du skill_stats:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la récupération du skill_stats",
    });
  }
});

module.exports = router;
