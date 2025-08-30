const express = require("express");
const Weapon = require("../models/Weapon");
const weaponService = require("../services/weaponService");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

/**
 * GET /api/weapons - Récupérer toutes les armes avec pagination et filtres
 */
router.get("/", async (req, res) => {
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
    if (req.query.minAtk) filters.minAtk = req.query.minAtk;
    if (req.query.maxAtk) filters.maxAtk = req.query.maxAtk;
    if (req.query.minHp) filters.minHp = req.query.minHp;
    if (req.query.maxHp) filters.maxHp = req.query.maxHp;
    if (req.query.evoMax) filters.evoMax = req.query.evoMax;
    if (req.query.evoBase) filters.evoBase = req.query.evoBase;

    const result = await weaponService.getAllWeapons(page, limit, filters);

    res.json({
      weapons: result.weapons,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des armes:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la récupération des armes",
    });
  }
});

/**
 * GET /api/weapons/element/:element - Récupérer les armes par élément
 */
router.get("/element/:element", async (req, res) => {
  try {
    const { element } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filters = { element: element };
    if (req.query.rarity) filters.rarity = req.query.rarity;
    if (req.query.type) filters.type = req.query.type;
    if (req.query.minAtk) filters.minAtk = req.query.minAtk;
    if (req.query.maxAtk) filters.maxAtk = req.query.maxAtk;
    if (req.query.minHp) filters.minHp = req.query.minHp;
    if (req.query.maxHp) filters.maxHp = req.query.maxHp;

    const result = await weaponService.getAllWeapons(page, limit, filters);
    res.json({
      weapons: result.weapons,
      pagination: result.pagination,
      element: element,
      filters: filters,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des armes par élément:",
      error
    );
    res.status(500).json({
      error: "Erreur serveur",
      message:
        "Une erreur est survenue lors de la récupération des armes par élément",
    });
  }
});

/**
 * GET /api/weapons/rarity/:rarity - Récupérer les armes par rareté
 */
router.get("/rarity/:rarity", async (req, res) => {
  try {
    const { rarity } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filters = { rarity: rarity };
    if (req.query.element) filters.element = req.query.element;
    if (req.query.type) filters.type = req.query.type;
    if (req.query.minAtk) filters.minAtk = req.query.minAtk;
    if (req.query.maxAtk) filters.maxAtk = req.query.maxAtk;
    if (req.query.minHp) filters.minHp = req.query.minHp;
    if (req.query.maxHp) filters.maxHp = req.query.maxHp;

    const result = await weaponService.getAllWeapons(page, limit, filters);
    res.json({
      weapons: result.weapons,
      pagination: result.pagination,
      rarity: rarity,
      filters: filters,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des armes par rareté:",
      error
    );
    res.status(500).json({
      error: "Erreur serveur",
      message:
        "Une erreur est survenue lors de la récupération des armes par rareté",
    });
  }
});

/**
 * GET /api/weapons/element/:element/rarity/:rarity - Récupérer les armes par élément ET rareté
 */
router.get("/element/:element/rarity/:rarity", async (req, res) => {
  try {
    const { element, rarity } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filters = { element: element, rarity: rarity };
    if (req.query.type) filters.type = req.query.type;
    if (req.query.minAtk) filters.minAtk = req.query.minAtk;
    if (req.query.maxAtk) filters.maxAtk = req.query.maxAtk;
    if (req.query.minHp) filters.minHp = req.query.minHp;
    if (req.query.maxHp) filters.maxHp = req.query.maxHp;

    const result = await weaponService.getAllWeapons(page, limit, filters);
    res.json({
      weapons: result.weapons,
      pagination: result.pagination,
      element: element,
      rarity: rarity,
      filters: filters,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des armes par élément et rareté:",
      error
    );
    res.status(500).json({
      error: "Erreur serveur",
      message:
        "Une erreur est survenue lors de la récupération des armes par élément et rareté",
    });
  }
});

/**
 * GET /api/weapons/filter - Récupérer les armes avec élément ET rareté obligatoires
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

    if (req.query.type) filters.type = req.query.type;
    if (req.query.name) filters.name = req.query.name;
    if (req.query.title) filters.title = req.query.title;
    if (req.query.series) filters.series = req.query.series;
    if (req.query.grp) filters.grp = req.query.grp;
    if (req.query.minAtk) filters.minAtk = req.query.minAtk;
    if (req.query.maxAtk) filters.maxAtk = req.query.maxAtk;
    if (req.query.minHp) filters.minHp = req.query.minHp;
    if (req.query.maxHp) filters.maxHp = req.query.maxHp;
    if (req.query.evoMax) filters.evoMax = req.query.evoMax;
    if (req.query.evoBase) filters.evoBase = req.query.evoBase;

    const result = await weaponService.getAllWeapons(
      parseInt(page),
      parseInt(limit),
      filters
    );

    res.json({
      weapons: result.weapons,
      pagination: result.pagination,
      requiredFilters: { element, rarity },
      optionalFilters: filters,
    });
  } catch (error) {
    console.error("Erreur lors du filtrage des armes:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors du filtrage",
    });
  }
});

/**
 * GET /api/weapons/elements - Récupérer la liste des éléments disponibles
 */
router.get("/elements", async (req, res) => {
  try {
    const elements = await weaponService.getAvailableElements();
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
 * GET /api/weapons/rarities - Récupérer la liste des raretés disponibles
 */
router.get("/rarities", async (req, res) => {
  try {
    const rarities = await weaponService.getAvailableRarities();
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
 * GET /api/weapons/types - Récupérer la liste des types d'armes disponibles
 */
router.get("/types", async (req, res) => {
  try {
    const types = await weaponService.getAvailableTypes();
    res.json({
      types: types,
      count: types.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des types:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la récupération des types",
    });
  }
});

/**
 * GET /api/weapons/search - Rechercher des armes par nom
 */
router.get("/search", async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        error: "Terme de recherche requis",
        message: "Veuillez fournir un terme de recherche",
      });
    }

    const result = await weaponService.searchWeapons(
      q,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      weapons: result.weapons,
      pagination: result.pagination,
      searchTerm: q,
    });
  } catch (error) {
    console.error("Erreur lors de la recherche d'armes:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la recherche",
    });
  }
});

/**
 * GET /api/weapons/stats - Statistiques des armes
 */
router.get("/stats", async (req, res) => {
  try {
    const stats = await weaponService.getWeaponStats();
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
 * GET /api/weapons/:id - Récupérer une arme par ID
 */
router.get("/:id", async (req, res) => {
  try {
    const weapon = await weaponService.getWeaponById(req.params.id);

    if (!weapon) {
      return res.status(404).json({
        error: "Arme non trouvée",
        message: "L'arme demandée n'existe pas",
      });
    }

    res.json({
      weapon: weapon,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'arme:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la récupération de l'arme",
    });
  }
});

/**
 * POST /api/weapons - Créer une nouvelle arme
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const weaponData = req.body;

    const validationErrors = Weapon.validate(weaponData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Données invalides",
        details: validationErrors,
      });
    }

    const weaponId = await weaponService.createWeapon(weaponData);
    const newWeapon = await weaponService.getWeaponById(weaponId);

    res.status(201).json({
      message: "Arme créée avec succès",
      weapon: newWeapon,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'arme:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la création de l'arme",
    });
  }
});

/**
 * PUT /api/weapons/:id - Mettre à jour une arme
 */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const weaponId = req.params.id;
    const updateData = req.body;

    const validationErrors = Weapon.validate(updateData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Données invalides",
        details: validationErrors,
      });
    }

    const success = await weaponService.updateWeapon(weaponId, updateData);

    if (!success) {
      return res.status(404).json({
        error: "Arme non trouvée",
        message: "L'arme à mettre à jour n'existe pas",
      });
    }

    const updatedWeapon = await weaponService.getWeaponById(weaponId);

    res.json({
      message: "Arme mise à jour avec succès",
      weapon: updatedWeapon,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'arme:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la mise à jour de l'arme",
    });
  }
});

/**
 * DELETE /api/weapons/:id - Supprimer une arme
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const success = await weaponService.deleteWeapon(req.params.id);

    if (!success) {
      return res.status(404).json({
        error: "Arme non trouvée",
        message: "L'arme à supprimer n'existe pas",
      });
    }

    res.json({
      message: "Arme supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'arme:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la suppression de l'arme",
    });
  }
});

/**
 * POST /api/weapons/:id/skills - Ajouter une compétence à une arme
 */
router.post("/:id/skills", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { skillName, skillDescription, skillLevel = 1 } = req.body;

    if (!skillName || !skillDescription) {
      return res.status(400).json({
        error: "Données manquantes",
        message: "Le nom et la description de la compétence sont requis",
      });
    }

    const weapon = await weaponService.getWeaponById(id);
    if (!weapon) {
      return res.status(404).json({
        error: "Arme non trouvée",
        message: "L'arme n'existe pas",
      });
    }

    const updateData = {
      [`s${skillLevel}_name`]: skillName,
      [`s${skillLevel}_desc`]: skillDescription,
      [`s${skillLevel}_lvl`]: skillLevel,
    };

    await weaponService.updateWeapon(id, updateData);

    res.json({
      message: "Compétence ajoutée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la compétence:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de l'ajout de la compétence",
    });
  }
});

/**
 * DELETE /api/weapons/:id/skills/:skillId - Retirer une compétence d'une arme
 */
router.delete("/:id/skills/:skillId", authenticateToken, async (req, res) => {
  try {
    const { id, skillId } = req.params;

    const weapon = await weaponService.getWeaponById(id);
    if (!weapon) {
      return res.status(404).json({
        error: "Arme non trouvée",
        message: "L'arme n'existe pas",
      });
    }

    const updateData = {
      [`s${skillId}_name`]: null,
      [`s${skillId}_desc`]: null,
      [`s${skillId}_lvl`]: null,
    };

    await weaponService.updateWeapon(id, updateData);

    res.json({
      message: "Compétence retirée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors du retrait de la compétence:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors du retrait de la compétence",
    });
  }
});

/**
 * POST /api/weapons/import - Importer des armes depuis JSON
 */
router.post("/import", authenticateToken, async (req, res) => {
  try {
    const { weapons } = req.body;

    if (!weapons || !Array.isArray(weapons)) {
      return res.status(400).json({
        error: "Données invalides",
        message: "Un tableau d'armes est requis",
      });
    }

    const createdWeapons = [];
    const errors = [];

    for (const weaponData of weapons) {
      try {
        const validationErrors = Weapon.validate(weaponData);
        if (validationErrors.length > 0) {
          errors.push({
            weapon: weaponData.name || "Arme sans nom",
            errors: validationErrors,
          });
          continue;
        }

        const weaponId = await weaponService.createWeapon(weaponData);
        const weapon = await weaponService.getWeaponById(weaponId);
        createdWeapons.push(weapon);
      } catch (error) {
        errors.push({
          weapon: weaponData.name || "Arme sans nom",
          error: error.message,
        });
      }
    }

    res.status(201).json({
      message: "Import terminé",
      created: createdWeapons.length,
      errors: errors.length,
      details: {
        createdWeapons,
        errors,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'import des armes:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de l'import",
    });
  }
});

module.exports = router;
