const express = require("express");
const Weapon = require("../models/Weapon");
const weaponService = require("../services/weaponService");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

// GET /api/weapons - Récupérer toutes les armes (avec pagination et filtres)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Filtres
    const filters = {};
    if (req.query.type) filters.type = req.query.type;
    if (req.query.rarity) filters.rarity = req.query.rarity;
    if (req.query.name) filters.name = req.query.name;
    if (req.query.minDamage) filters.minDamage = req.query.minDamage;
    if (req.query.maxDamage) filters.maxDamage = req.query.maxDamage;

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

// GET /api/weapons/search - Rechercher des armes par nom
router.get("/search", async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        error: "Terme de recherche requis",
        message: "Veuillez fournir un terme de recherche",
      });
    }

    const weapons = await weaponService.searchWeapons(q, parseInt(limit));

    res.json({
      weapons,
      searchTerm: q,
      count: weapons.length,
    });
  } catch (error) {
    console.error("Erreur lors de la recherche d'armes:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la recherche",
    });
  }
});

// GET /api/weapons/stats - Statistiques des armes
router.get("/stats", async (req, res) => {
  try {
    const stats = await weaponService.getWeaponStats();

    res.json({
      stats,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message:
        "Une erreur est survenue lors de la récupération des statistiques",
    });
  }
});

// GET /api/weapons/:id - Récupérer une arme par ID
router.get("/:id", async (req, res) => {
  try {
    const weapon = await weaponService.findById(req.params.id);

    if (!weapon) {
      return res.status(404).json({
        error: "Arme non trouvée",
        message: "L'arme demandée n'existe pas",
      });
    }

    res.json({
      weapon,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'arme:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la récupération de l'arme",
    });
  }
});

// POST /api/weapons - Créer une nouvelle arme (authentification requise)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const weaponData = req.body;

    // Validation des données
    const validationErrors = Weapon.validate(weaponData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Données invalides",
        details: validationErrors,
      });
    }

    // Créer l'arme
    const weapon = await weaponService.createWeapon(weaponData);

    res.status(201).json({
      message: "Arme créée avec succès",
      weapon,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'arme:", error);

    if (error.message.includes("existe déjà")) {
      return res.status(400).json({
        error: "Erreur de validation",
        message: error.message,
      });
    }

    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la création de l'arme",
    });
  }
});

// PUT /api/weapons/:id - Mettre à jour une arme (authentification requise)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const updateData = req.body;

    // Validation des données de mise à jour
    const validationErrors = Weapon.validate(updateData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Données invalides",
        details: validationErrors,
      });
    }

    // Mettre à jour l'arme
    const weapon = await weaponService.updateWeapon(req.params.id, updateData);

    res.json({
      message: "Arme mise à jour avec succès",
      weapon,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'arme:", error);

    if (
      error.message.includes("existe déjà") ||
      error.message.includes("non trouvée")
    ) {
      return res.status(400).json({
        error: "Erreur de validation",
        message: error.message,
      });
    }

    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la mise à jour de l'arme",
    });
  }
});

// DELETE /api/weapons/:id - Supprimer une arme (authentification requise)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await weaponService.deleteWeapon(req.params.id);

    res.json({
      message: "Arme supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'arme:", error);

    if (error.message.includes("non trouvée")) {
      return res.status(404).json({
        error: "Arme non trouvée",
        message: error.message,
      });
    }

    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la suppression de l'arme",
    });
  }
});

// POST /api/weapons/:id/skills - Ajouter une compétence à une arme
router.post("/:id/skills", authenticateToken, async (req, res) => {
  try {
    const { skillId } = req.body;

    if (!skillId) {
      return res.status(400).json({
        error: "ID de compétence requis",
        message: "Veuillez fournir l'ID de la compétence à ajouter",
      });
    }

    const weapon = await weaponService.addSkillToWeapon(req.params.id, skillId);

    res.json({
      message: "Compétence ajoutée avec succès",
      weapon,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la compétence:", error);

    if (error.message.includes("non trouvée")) {
      return res.status(404).json({
        error: "Arme non trouvée",
        message: error.message,
      });
    }

    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de l'ajout de la compétence",
    });
  }
});

// DELETE /api/weapons/:id/skills/:skillId - Retirer une compétence d'une arme
router.delete("/:id/skills/:skillId", authenticateToken, async (req, res) => {
  try {
    const weapon = await weaponService.removeSkillFromWeapon(
      req.params.id,
      req.params.skillId
    );

    res.json({
      message: "Compétence retirée avec succès",
      weapon,
    });
  } catch (error) {
    console.error("Erreur lors du retrait de la compétence:", error);

    if (error.message.includes("non trouvée")) {
      return res.status(404).json({
        error: "Arme non trouvée",
        message: error.message,
      });
    }

    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors du retrait de la compétence",
    });
  }
});

// POST /api/weapons/import - Importer des armes depuis JSON (authentification requise)
router.post("/import", authenticateToken, async (req, res) => {
  try {
    const { weapons } = req.body;

    if (!Array.isArray(weapons)) {
      return res.status(400).json({
        error: "Format invalide",
        message: "Les données doivent être un tableau d'armes",
      });
    }

    const results = [];
    const errors = [];

    for (const weaponData of weapons) {
      try {
        // Validation
        const validationErrors = Weapon.validate(weaponData);
        if (validationErrors.length > 0) {
          errors.push({
            weapon: weaponData.name || "Arme sans nom",
            errors: validationErrors,
          });
          continue;
        }

        // Créer l'arme
        const weapon = await weaponService.createWeapon(weaponData);
        results.push(weapon);
      } catch (error) {
        errors.push({
          weapon: weaponData.name || "Arme sans nom",
          error: error.message,
        });
      }
    }

    res.json({
      message: `${results.length} armes importées avec succès`,
      imported: results.length,
      errors: errors.length,
      details: {
        successful: results,
        failed: errors,
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
