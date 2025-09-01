const express = require("express");
const router = express.Router();
const WeaponGridService = require("../services/weaponGridService");

const weaponGridService = new WeaponGridService();

const handleError = (res, error) => {
  console.error("Erreur WeaponGrid:", error);
  res.status(500).json({
    error: "Erreur serveur",
    message:
      error.message ||
      "Une erreur est survenue lors du traitement de la requête",
  });
};

/**
 * GET /api/weapon-grids - Récupérer toutes les grilles publiques
 */
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      element,
      rarity,
      name,
      minAtk,
      maxAtk,
    } = req.query;

    const filters = {};
    if (element) filters.element = element;
    if (rarity) filters.rarity = rarity;
    if (name) filters.name = name;
    if (minAtk) filters.minAtk = minAtk;
    if (maxAtk) filters.maxAtk = maxAtk;

    const result = await weaponGridService.getPublicWeaponGrids(
      parseInt(page),
      parseInt(limit),
      filters
    );

    res.json({
      success: true,
      weaponGrids: result.grids,
      pagination: result.pagination,
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/weapon-grids/user/:userId - Récupérer les grilles d'un utilisateur
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await weaponGridService.getWeaponGridsByUserId(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      weaponGrids: result.grids,
      pagination: result.pagination,
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/weapon-grids/search - Rechercher des grilles
 */
router.get("/search", async (req, res) => {
  try {
    const {
      q,
      page = 1,
      limit = 10,
      isPublic,
      userId,
      element,
      rarity,
    } = req.query;

    if (!q) {
      return res.status(400).json({
        error: "Paramètre de recherche manquant",
        message: "Le paramètre 'q' est requis pour la recherche",
      });
    }

    const filters = {};
    if (isPublic !== undefined) filters.isPublic = isPublic === "true";
    if (userId) filters.userId = userId;
    if (element) filters.element = element;
    if (rarity) filters.rarity = rarity;

    const result = await weaponGridService.searchWeaponGrids(
      q,
      parseInt(page),
      parseInt(limit),
      filters
    );

    res.json({
      success: true,
      weaponGrids: result.grids,
      pagination: result.pagination,
      searchTerm: q,
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/weapon-grids/popular - Grilles populaires
 */
router.get("/popular", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await weaponGridService.getPopularWeaponGrids(
      parseInt(limit)
    );

    res.json({
      success: true,
      weaponGrids: result.grids,
      count: result.grids.length,
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/weapon-grids/recent - Grilles récentes
 */
router.get("/recent", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await weaponGridService.getRecentWeaponGrids(
      parseInt(limit)
    );

    res.json({
      success: true,
      weaponGrids: result.grids,
      count: result.grids.length,
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/weapon-grids/stats - Statistiques globales
 */
router.get("/stats", async (req, res) => {
  try {
    const stats = await weaponGridService.getGlobalStats();

    res.json({
      success: true,
      stats: stats,
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * GET /api/weapon-grids/:id - Récupérer une grille par ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const grid = await weaponGridService.getWeaponGridById(id);

    if (!grid) {
      return res.status(404).json({
        error: "Grille non trouvée",
        message: "La grille demandée n'existe pas",
      });
    }

    res.json({
      success: true,
      weaponGrid: grid,
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * POST /api/weapon-grids - Créer une nouvelle grille
 */
router.post("/", async (req, res) => {
  try {
    const gridData = req.body;

    if (!gridData.name) {
      return res.status(400).json({
        error: "Données manquantes",
        message: "Le nom de la grille est requis",
      });
    }

    if (!gridData.userId) {
      gridData.userId = "default_user";
    }

    const gridId = await weaponGridService.createWeaponGrid(gridData);

    res.status(201).json({
      success: true,
      message: "Grille créée avec succès",
      gridId: gridId,
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * PUT /api/weapon-grids/:id - Mettre à jour une grille
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!updateData.name && !updateData.description && !updateData.isPublic) {
      return res.status(400).json({
        error: "Données manquantes",
        message: "Au moins un champ à mettre à jour est requis",
      });
    }

    const success = await weaponGridService.updateWeaponGrid(id, updateData);

    if (!success) {
      return res.status(404).json({
        error: "Grille non trouvée",
        message: "La grille à mettre à jour n'existe pas",
      });
    }

    res.json({
      success: true,
      message: "Grille mise à jour avec succès",
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * DELETE /api/weapon-grids/:id - Supprimer une grille
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const success = await weaponGridService.deleteWeaponGrid(id);

    if (!success) {
      return res.status(404).json({
        error: "Grille non trouvée",
        message: "La grille à supprimer n'existe pas",
      });
    }

    res.json({
      success: true,
      message: "Grille supprimée avec succès",
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * POST /api/weapon-grids/:id/weapons - Ajouter une arme à une grille
 */
router.post("/:id/weapons", async (req, res) => {
  try {
    const { id } = req.params;
    const { slot, weaponId, weaponData, level = 1 } = req.body;

    if (!slot || !weaponId || !weaponData) {
      return res.status(400).json({
        error: "Données manquantes",
        message: "Le slot, l'ID de l'arme et les données de l'arme sont requis",
      });
    }

    if (slot < 1 || slot > 10) {
      return res.status(400).json({
        error: "Slot invalide",
        message: "Le slot doit être entre 1 et 10",
      });
    }

    const success = await weaponGridService.addWeaponToGrid(
      id,
      slot,
      weaponId,
      weaponData,
      level
    );

    if (!success) {
      return res.status(404).json({
        error: "Grille non trouvée",
        message: "La grille n'existe pas",
      });
    }

    res.json({
      success: true,
      message: "Arme ajoutée à la grille avec succès",
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * DELETE /api/weapon-grids/:id/weapons/:slot - Supprimer une arme d'une grille
 */
router.delete("/:id/weapons/:slot", async (req, res) => {
  try {
    const { id, slot } = req.params;

    const success = await weaponGridService.removeWeaponFromGrid(id, slot);

    if (!success) {
      return res.status(404).json({
        error: "Grille non trouvée",
        message: "La grille n'existe pas",
      });
    }

    res.json({
      success: true,
      message: "Arme supprimée de la grille avec succès",
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * POST /api/weapon-grids/:id/summons - Ajouter une summon à une grille
 */
router.post("/:id/summons", async (req, res) => {
  try {
    const { id } = req.params;
    const { slot, summonId, summonData, level = 0 } = req.body;

    if (!slot || !summonId || !summonData) {
      return res.status(400).json({
        error: "Données manquantes",
        message:
          "Le slot, l'ID de la summon et les données de la summon sont requis",
      });
    }

    if (slot < 1 || slot > 6) {
      return res.status(400).json({
        error: "Slot invalide",
        message: "Le slot doit être entre 1 et 6",
      });
    }

    const success = await weaponGridService.addSummonToGrid(
      id,
      slot,
      summonId,
      summonData,
      level
    );

    if (!success) {
      return res.status(404).json({
        error: "Grille non trouvée",
        message: "La grille n'existe pas",
      });
    }

    res.json({
      success: true,
      message: "Summon ajoutée à la grille avec succès",
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * DELETE /api/weapon-grids/:id/summons/:slot - Supprimer une summon d'une grille
 */
router.delete("/:id/summons/:slot", async (req, res) => {
  try {
    const { id, slot } = req.params;

    const success = await weaponGridService.removeSummonFromGrid(id, slot);

    if (!success) {
      return res.status(404).json({
        error: "Grille non trouvée",
        message: "La grille n'existe pas",
      });
    }

    res.json({
      success: true,
      message: "Summon supprimée de la grille avec succès",
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * POST /api/weapon-grids/:id/like - Liker une grille
 */
router.post("/:id/like", async (req, res) => {
  try {
    const { id } = req.params;

    const success = await weaponGridService.likeWeaponGrid(id);

    if (!success) {
      return res.status(404).json({
        error: "Grille non trouvée",
        message: "La grille n'existe pas",
      });
    }

    res.json({
      success: true,
      message: "Grille likée avec succès",
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * POST /api/weapon-grids/:id/download - Télécharger une grille
 */
router.post("/:id/download", async (req, res) => {
  try {
    const { id } = req.params;

    const success = await weaponGridService.downloadWeaponGrid(id);

    if (!success) {
      return res.status(404).json({
        error: "Grille non trouvée",
        message: "La grille n'existe pas",
      });
    }

    res.json({
      success: true,
      message: "Téléchargement enregistré avec succès",
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * POST /api/weapon-grids/:id/recalculate - Recalculer les statistiques
 */
router.post("/:id/recalculate", async (req, res) => {
  try {
    const { id } = req.params;

    const success = await weaponGridService.recalculateGridStats(id);

    if (!success) {
      return res.status(404).json({
        error: "Grille non trouvée",
        message: "La grille n'existe pas",
      });
    }

    res.json({
      success: true,
      message: "Statistiques recalculées avec succès",
    });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
