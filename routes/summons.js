const express = require("express");
const summonService = require("../services/summonService");
const { authenticateToken } = require("../middleware/auth");
require("dotenv").config();

const router = express.Router();

/**
 * GET /api/summons - Récupérer tous les summons
 */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filters = {};
    if (req.query.element) filters.element = req.query.element;
    if (req.query.rarity) filters.rarity = req.query.rarity;
    if (req.query.series) filters.series = req.query.series;
    if (req.query.name) filters.name = req.query.name;
    if (req.query.arcarum) filters.arcarum = req.query.arcarum;
    if (req.query.minAtk) filters.minAtk = req.query.minAtk;
    if (req.query.maxAtk) filters.maxAtk = req.query.maxAtk;
    if (req.query.minHp) filters.minHp = req.query.minHp;
    if (req.query.maxHp) filters.maxHp = req.query.maxHp;
    if (req.query.evoMax) filters.evoMax = req.query.evoMax;
    if (req.query.evoBase) filters.evoBase = req.query.evoBase;

    const result = await summonService.getAllSummons(page, limit, filters);
    res.json(result);
  } catch (error) {
    console.error("Erreur lors de la récupération des summons:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la récupération des summons",
    });
  }
});

/**
 * GET /api/summons/search - Rechercher des summons
 */
router.get("/search", async (req, res) => {
  try {
    const { q, limit = 10, page = 1 } = req.query;

    if (!q) {
      return res.status(400).json({
        error: "Terme de recherche requis",
        message: "Veuillez fournir un terme de recherche",
      });
    }

    const result = await summonService.searchSummons(
      q,
      parseInt(page),
      parseInt(limit)
    );
    res.json({
      ...result,
      searchTerm: q,
    });
  } catch (error) {
    console.error("Erreur lors de la recherche de summons:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la recherche",
    });
  }
});

/**
 * GET /api/summons/stats - Statistiques des summons
 */
router.get("/stats", async (req, res) => {
  try {
    const stats = await summonService.getSummonStats();
    res.json(stats);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message:
        "Une erreur est survenue lors de la récupération des statistiques",
    });
  }
});

/**
 * GET /api/summons/element/:element - Récupérer les summons par élément
 */
router.get("/element/:element", async (req, res) => {
  try {
    const { element } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await summonService.getSummonsByElement(
      element,
      page,
      limit
    );
    res.json(result);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des summons par élément:",
      error
    );
    res.status(500).json({
      error: "Erreur serveur",
      message:
        "Une erreur est survenue lors de la récupération des summons par élément",
    });
  }
});

/**
 * GET /api/summons/rarity/:rarity - Récupérer les summons par rareté
 */
router.get("/rarity/:rarity", async (req, res) => {
  try {
    const { rarity } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await summonService.getSummonsByRarity(rarity, page, limit);
    res.json(result);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des summons par rareté:",
      error
    );
    res.status(500).json({
      error: "Erreur serveur",
      message:
        "Une erreur est survenue lors de la récupération des summons par rareté",
    });
  }
});

/**
 * GET /api/summons/filter - Filtrage strict avec élément et rareté
 */
router.get("/filter", async (req, res) => {
  try {
    const { element, rarity, page = 1, limit = 10 } = req.query;

    if (!element || !rarity) {
      return res.status(400).json({
        error: "Paramètres manquants",
        message: "Les paramètres 'element' et 'rarity' sont obligatoires",
      });
    }

    const filters = { element, rarity };

    if (req.query.series) filters.series = req.query.series;
    if (req.query.name) filters.name = req.query.name;
    if (req.query.arcarum) filters.arcarum = req.query.arcarum;
    if (req.query.minAtk) filters.minAtk = req.query.minAtk;
    if (req.query.maxAtk) filters.maxAtk = req.query.maxAtk;
    if (req.query.minHp) filters.minHp = req.query.minHp;
    if (req.query.maxHp) filters.maxHp = req.query.maxHp;
    if (req.query.evoMax) filters.evoMax = req.query.evoMax;
    if (req.query.evoBase) filters.evoBase = req.query.evoBase;

    const result = await summonService.getAllSummons(
      parseInt(page),
      parseInt(limit),
      filters
    );
    res.json(result);
  } catch (error) {
    console.error("Erreur lors du filtrage des summons:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors du filtrage",
    });
  }
});

/**
 * GET /api/summons/elements - Récupérer les éléments disponibles
 */
router.get("/elements", async (req, res) => {
  try {
    const elements = await summonService.getAvailableElements();
    res.json({
      elements: elements,
      count: elements.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des éléments:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la récupération des éléments",
    });
  }
});

/**
 * GET /api/summons/rarities - Récupérer les raretés disponibles
 */
router.get("/rarities", async (req, res) => {
  try {
    const rarities = await summonService.getAvailableRarities();
    res.json({
      rarities: rarities,
      count: rarities.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des raretés:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la récupération des raretés",
    });
  }
});

/**
 * GET /api/summons/series - Récupérer les séries disponibles
 */
router.get("/series", async (req, res) => {
  try {
    const series = await summonService.getAvailableSeries();
    res.json({
      series: series,
      count: series.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des séries:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la récupération des séries",
    });
  }
});

/**
 * GET /api/summons/:id - Récupérer un summon par ID
 */
router.get("/:id", async (req, res) => {
  try {
    const summon = await summonService.getSummonById(req.params.id);

    if (!summon) {
      return res.status(404).json({
        error: "Summon non trouvé",
        message: "Le summon demandé n'existe pas",
      });
    }

    res.json({
      summon: summon,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du summon:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la récupération du summon",
    });
  }
});

/**
 * POST /api/summons - Créer un nouveau summon
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const summonData = req.body;

    if (!summonData.name || !summonData.element || !summonData.rarity) {
      return res.status(400).json({
        error: "Données manquantes",
        message: "Le nom, l'élément et la rareté sont obligatoires",
      });
    }

    const summonId = await summonService.createSummon(summonData);
    const newSummon = await summonService.getSummonById(summonId);

    res.status(201).json({
      message: "Summon créé avec succès",
      summon: newSummon,
    });
  } catch (error) {
    console.error("Erreur lors de la création du summon:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la création du summon",
    });
  }
});

/**
 * PUT /api/summons/:id - Mettre à jour un summon
 */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const summonId = req.params.id;
    const updateData = req.body;

    if (!updateData.name && !updateData.element && !updateData.rarity) {
      return res.status(400).json({
        error: "Données manquantes",
        message: "Au moins un champ à mettre à jour est requis",
      });
    }

    const success = await summonService.updateSummon(summonId, updateData);

    if (!success) {
      return res.status(404).json({
        error: "Summon non trouvé",
        message: "Le summon à mettre à jour n'existe pas",
      });
    }

    const updatedSummon = await summonService.getSummonById(summonId);

    res.json({
      message: "Summon mis à jour avec succès",
      summon: updatedSummon,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du summon:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la mise à jour du summon",
    });
  }
});

/**
 * DELETE /api/summons/:id - Supprimer un summon
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const success = await summonService.deleteSummon(req.params.id);

    if (!success) {
      return res.status(404).json({
        error: "Summon non trouvé",
        message: "Le summon à supprimer n'existe pas",
      });
    }

    res.json({
      message: "Summon supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du summon:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la suppression du summon",
    });
  }
});

module.exports = router;
