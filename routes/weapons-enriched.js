const express = require("express");
const { MongoClient } = require("mongodb");
const skillEnrichmentService = require("../services/skillEnrichmentService");
require("dotenv").config();

const router = express.Router();

const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "gb_project";

/**
 * GET /api/weapons-enriched - Récupérer toutes les armes avec skills enrichis
 */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const enrichSkills = req.query.enrich !== "false";

    const filters = {};
    if (req.query.type) filters.type = req.query.type;
    if (req.query.rarity) filters.rarity = req.query.rarity;
    if (req.query.element) filters.element = req.query.element;
    if (req.query.name) filters.name = req.query.name;
    if (req.query.title) filters.title = req.query.title;
    if (req.query.series) filters.series = req.query.series;
    if (req.query.grp) filters.grp = req.query.grp;
    if (req.query.minAtk) filters.atk2 = { $gte: parseInt(req.query.minAtk) };
    if (req.query.maxAtk) {
      if (filters.atk2) {
        filters.atk2.$lte = parseInt(req.query.maxAtk);
      } else {
        filters.atk2 = { $lte: parseInt(req.query.maxAtk) };
      }
    }
    if (req.query.minHp) filters.hp2 = { $gte: parseInt(req.query.minHp) };
    if (req.query.maxHp) {
      if (filters.hp2) {
        filters.hp2.$lte = parseInt(req.query.maxHp);
      } else {
        filters.hp2 = { $lte: parseInt(req.query.maxHp) };
      }
    }
    if (req.query.evoMax) filters.evo_max = parseInt(req.query.evoMax);
    if (req.query.evoBase) filters.evo_base = parseInt(req.query.evoBase);

    const client = new MongoClient(mongoUrl);
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection("weapons");

    const totalWeapons = await collection.countDocuments(filters);
    const totalPages = Math.ceil(totalWeapons / limit);
    const skip = (page - 1) * limit;

    const weapons = await collection
      .find(filters)
      .skip(skip)
      .limit(limit)
      .toArray();

    await client.close();

    const enrichedWeapons = enrichSkills
      ? await skillEnrichmentService.enrichWeaponsListFast(weapons, true)
      : weapons;

    res.json({
      weapons: enrichedWeapons,
      pagination: {
        currentPage: page,
        totalPages,
        totalWeapons,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      enrichment: {
        enabled: enrichSkills,
        note: enrichSkills
          ? "Skills enrichis avec calculs"
          : "Skills non enrichis pour performance",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des armes enrichies:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message:
        "Une erreur est survenue lors de la récupération des armes enrichies",
    });
  }
});

/**
 * GET /api/weapons-enriched/filter - Filtrage strict avec élément et rareté
 */
router.get("/filter", async (req, res) => {
  try {
    const { element, rarity, page = 1, limit = 10 } = req.query;
    const enrichSkills = req.query.enrich !== "false";

    if (!element || !rarity) {
      return res.status(400).json({
        error: "Paramètres manquants",
        message: "Les paramètres 'element' et 'rarity' sont obligatoires",
      });
    }

    const filters = { element, rarity };

    if (req.query.type) filters.type = req.query.type;
    if (req.query.name) filters.name = req.query.name;
    if (req.query.title) filters.title = req.query.title;
    if (req.query.series) filters.series = req.query.series;
    if (req.query.grp) filters.grp = req.query.grp;
    if (req.query.minAtk) filters.atk2 = { $gte: parseInt(req.query.minAtk) };
    if (req.query.maxAtk) {
      if (filters.atk2) {
        filters.atk2.$lte = parseInt(req.query.maxAtk);
      } else {
        filters.atk2 = { $lte: parseInt(req.query.maxAtk) };
      }
    }
    if (req.query.minHp) filters.hp2 = { $gte: parseInt(req.query.minHp) };
    if (req.query.maxHp) {
      if (filters.hp2) {
        filters.hp2.$lte = parseInt(req.query.maxHp);
      } else {
        filters.hp2 = { $lte: parseInt(req.query.maxHp) };
      }
    }
    if (req.query.evoMax) filters.evo_max = parseInt(req.query.evoMax);
    if (req.query.evoBase) filters.evo_base = parseInt(req.query.evoBase);

    const client = new MongoClient(mongoUrl);
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection("weapons");

    const totalWeapons = await collection.countDocuments(filters);
    const totalPages = Math.ceil(totalWeapons / limit);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const weapons = await collection
      .find(filters)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    await client.close();

    const enrichedWeapons = enrichSkills
      ? await skillEnrichmentService.enrichWeaponsListFast(weapons, true)
      : weapons;

    res.json({
      weapons: enrichedWeapons,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalWeapons,
        limit: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
      requiredFilters: { element, rarity },
      optionalFilters: filters,
      enrichment: {
        enabled: enrichSkills,
        note: enrichSkills
          ? "Skills enrichis avec calculs"
          : "Skills non enrichis pour performance",
      },
    });
  } catch (error) {
    console.error("Erreur lors du filtrage des armes enrichies:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors du filtrage",
    });
  }
});

/**
 * GET /api/weapons-enriched/search - Recherche avec skills enrichis
 */
router.get("/search", async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const enrichSkills = req.query.enrich !== "false";

    if (!q) {
      return res.status(400).json({
        error: "Terme de recherche requis",
        message: "Veuillez fournir un terme de recherche",
      });
    }

    const client = new MongoClient(mongoUrl);
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection("weapons");

    const query = {
      $or: [
        { name: { $regex: q, $options: "i" } },
        { title: { $regex: q, $options: "i" } },
        { "s1 name": { $regex: q, $options: "i" } },
        { "s2 name": { $regex: q, $options: "i" } },
        { "s3 name": { $regex: q, $options: "i" } },
      ],
    };

    const totalWeapons = await collection.countDocuments(query);
    const totalPages = Math.ceil(totalWeapons / limit);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const weapons = await collection
      .find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    await client.close();

    const enrichedWeapons = enrichSkills
      ? await skillEnrichmentService.enrichWeaponsListFast(weapons, true)
      : weapons;

    res.json({
      weapons: enrichedWeapons,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalWeapons,
        limit: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
      searchTerm: q,
      enrichment: {
        enabled: enrichSkills,
        note: enrichSkills
          ? "Skills enrichis avec calculs"
          : "Skills non enrichis pour performance",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la recherche d'armes enrichies:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la recherche",
    });
  }
});

/**
 * GET /api/weapons-enriched/fast - Version rapide sans enrichissement
 */
router.get("/fast", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filters = {};
    if (req.query.type) filters.type = req.query.type;
    if (req.query.rarity) filters.rarity = req.query.rarity;
    if (req.query.element) filters.element = req.query.element;
    if (req.query.name) filters.name = req.query.name;
    if (req.query.title) filters.title = req.query.title;
    if (req.query.series) filters.series = req.query.series;
    if (req.query.grp) filters.grp = req.query.grp;
    if (req.query.minAtk) filters.atk2 = { $gte: parseInt(req.query.minAtk) };
    if (req.query.maxAtk) {
      if (filters.atk2) {
        filters.atk2.$lte = parseInt(req.query.maxAtk);
      } else {
        filters.atk2 = { $lte: parseInt(req.query.maxAtk) };
      }
    }
    if (req.query.minHp) filters.hp2 = { $gte: parseInt(req.query.minHp) };
    if (req.query.maxHp) {
      if (filters.hp2) {
        filters.hp2.$lte = parseInt(req.query.maxHp);
      } else {
        filters.hp2 = { $lte: parseInt(req.query.maxHp) };
      }
    }
    if (req.query.evoMax) filters.evo_max = parseInt(req.query.evoMax);
    if (req.query.evoBase) filters.evo_base = parseInt(req.query.evoBase);

    const client = new MongoClient(mongoUrl);
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection("weapons");

    const totalWeapons = await collection.countDocuments(filters);
    const totalPages = Math.ceil(totalWeapons / limit);
    const skip = (page - 1) * limit;

    const weapons = await collection
      .find(filters)
      .skip(skip)
      .limit(limit)
      .toArray();

    await client.close();

    res.json({
      weapons: weapons,
      pagination: {
        currentPage: page,
        totalPages,
        totalWeapons,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      enrichment: {
        enabled: false,
        note: "Version rapide sans enrichissement",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des armes (fast):", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la récupération des armes",
    });
  }
});

/**
 * GET /api/weapons-enriched/filter/fast - Filtrage strict rapide
 */
router.get("/filter/fast", async (req, res) => {
  try {
    const { element, rarity, page = 1, limit = 10 } = req.query;

    if (!element || !rarity) {
      return res.status(400).json({
        error: "Paramètres manquants",
        message: "Les paramètres 'element' et 'rarity' sont obligatoires",
      });
    }

    const filters = { element, rarity };

    if (req.query.type) filters.type = req.query.type;
    if (req.query.name) filters.name = req.query.name;
    if (req.query.title) filters.title = req.query.title;
    if (req.query.series) filters.series = req.query.series;
    if (req.query.grp) filters.grp = req.query.grp;
    if (req.query.minAtk) filters.atk2 = { $gte: parseInt(req.query.minAtk) };
    if (req.query.maxAtk) {
      if (filters.atk2) {
        filters.atk2.$lte = parseInt(req.query.maxAtk);
      } else {
        filters.atk2 = { $lte: parseInt(req.query.maxAtk) };
      }
    }
    if (req.query.minHp) filters.hp2 = { $gte: parseInt(req.query.minHp) };
    if (req.query.maxHp) {
      if (filters.hp2) {
        filters.hp2.$lte = parseInt(req.query.maxHp);
      } else {
        filters.hp2 = { $lte: parseInt(req.query.maxHp) };
      }
    }
    if (req.query.evoMax) filters.evo_max = parseInt(req.query.evoMax);
    if (req.query.evoBase) filters.evo_base = parseInt(req.query.evoBase);

    const client = new MongoClient(mongoUrl);
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection("weapons");

    const totalWeapons = await collection.countDocuments(filters);
    const totalPages = Math.ceil(totalWeapons / limit);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const weapons = await collection
      .find(filters)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    await client.close();

    res.json({
      weapons: weapons,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalWeapons,
        limit: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
      requiredFilters: { element, rarity },
      optionalFilters: filters,
      enrichment: {
        enabled: false,
        note: "Version rapide sans enrichissement",
      },
    });
  } catch (error) {
    console.error("Erreur lors du filtrage des armes (fast):", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors du filtrage",
    });
  }
});

/**
 * GET /api/weapons-enriched/:id - Récupérer une arme enrichie par ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const enrichSkills = req.query.enrich !== "false";

    const client = new MongoClient(mongoUrl);
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection("weapons");

    let weapon = await collection.findOne({ _id: id });

    if (!weapon) {
      weapon = await collection.findOne({ id: parseInt(id) });
    }

    if (!weapon) {
      weapon = await collection.findOne({ id: id.toString() });
    }

    await client.close();

    if (!weapon) {
      return res.status(404).json({
        error: "Arme non trouvée",
        message: "L'arme demandée n'existe pas",
      });
    }

    const enrichedWeapon = enrichSkills
      ? await skillEnrichmentService.enrichWeaponFast(weapon, true)
      : weapon;

    res.json({
      weapon: enrichedWeapon,
      enrichment: {
        enabled: enrichSkills,
        note: enrichSkills
          ? "Skills enrichis avec calculs"
          : "Skills non enrichis pour performance",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'arme enrichie:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la récupération de l'arme",
    });
  }
});

module.exports = router;
