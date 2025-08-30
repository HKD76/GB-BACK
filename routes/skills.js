const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const router = express.Router();

const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "gb_project";

/**
 * GET /api/skills - Récupérer tous les weapon_skills
 */
router.get("/", async (req, res) => {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection("weapon_skills");

    const skills = await collection.find({}).toArray();

    await client.close();

    res.json({
      skills: skills,
      count: skills.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des skills:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la récupération des skills",
    });
  }
});

/**
 * GET /api/skills/search - Rechercher des skills par nom
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
    const collection = db.collection("weapon_skills");

    const skills = await collection
      .find({
        $or: [
          { name: { $regex: q, $options: "i" } },
          { text: { $regex: q, $options: "i" } },
        ],
      })
      .toArray();

    await client.close();

    res.json({
      skills: skills,
      count: skills.length,
      searchTerm: q,
    });
  } catch (error) {
    console.error("Erreur lors de la recherche de skills:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la recherche",
    });
  }
});

/**
 * GET /api/skills/:name - Récupérer un skill par nom
 */
router.get("/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const client = new MongoClient(mongoUrl);
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection("weapon_skills");

    const skill = await collection.findOne({
      name: { $regex: name, $options: "i" },
    });

    await client.close();

    if (!skill) {
      return res.status(404).json({
        error: "Skill non trouvé",
        message: `Aucun skill trouvé avec le nom: ${name}`,
      });
    }

    res.json({
      skill: skill,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du skill:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la récupération du skill",
    });
  }
});

module.exports = router;
