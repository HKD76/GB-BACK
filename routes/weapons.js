const express = require("express");
const { connectMongo } = require("../config/database");
const router = express.Router();

// GET /api/weapons - Récupérer toutes les armes
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = "",
      type = "",
      rarity = "",
    } = req.query;
    const db = await connectMongo();
    const collection = db.collection("weapons");

    // Construire le filtre
    let filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (type) filter.type = { $regex: type, $options: "i" };
    if (rarity) filter.rarity = { $regex: rarity, $options: "i" };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const weapons = await collection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await collection.countDocuments(filter);

    res.json({
      weapons,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des armes:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/weapons/:id - Récupérer une arme par ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectMongo();
    const collection = db.collection("weapons");

    const weapon = await collection.findOne({ _id: id });

    if (!weapon) {
      return res.status(404).json({ error: "Arme non trouvée" });
    }

    res.json(weapon);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'arme:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/weapons - Créer une nouvelle arme
router.post("/", async (req, res) => {
  try {
    const weaponData = req.body;
    const db = await connectMongo();
    const collection = db.collection("weapons");

    // Validation basique
    if (!weaponData.name) {
      return res.status(400).json({ error: "Le nom de l'arme est requis" });
    }

    const result = await collection.insertOne({
      ...weaponData,
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(201).json({
      message: "Arme créée avec succès",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'arme:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT /api/weapons/:id - Mettre à jour une arme
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const db = await connectMongo();
    const collection = db.collection("weapons");

    const result = await collection.updateOne(
      { _id: id },
      {
        $set: {
          ...updateData,
          updated_at: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Arme non trouvée" });
    }

    res.json({ message: "Arme mise à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'arme:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE /api/weapons/:id - Supprimer une arme
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectMongo();
    const collection = db.collection("weapons");

    const result = await collection.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Arme non trouvée" });
    }

    res.json({ message: "Arme supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'arme:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/weapons/import - Importer des armes depuis JSON
router.post("/import", async (req, res) => {
  try {
    const { weapons } = req.body;
    const db = await connectMongo();
    const collection = db.collection("weapons");

    if (!Array.isArray(weapons)) {
      return res
        .status(400)
        .json({ error: "Les données doivent être un tableau" });
    }

    // Ajouter des timestamps
    const weaponsWithTimestamps = weapons.map((weapon) => ({
      ...weapon,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const result = await collection.insertMany(weaponsWithTimestamps);

    res.json({
      message: `${result.insertedCount} armes importées avec succès`,
      insertedCount: result.insertedCount,
    });
  } catch (error) {
    console.error("Erreur lors de l'import des armes:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/weapons/stats - Statistiques des armes
router.get("/stats/overview", async (req, res) => {
  try {
    const db = await connectMongo();
    const collection = db.collection("weapons");

    const totalWeapons = await collection.countDocuments();
    const types = await collection.distinct("type");
    const rarities = await collection.distinct("rarity");

    res.json({
      totalWeapons,
      types: types.length,
      rarities: rarities.length,
      uniqueTypes: types,
      uniqueRarities: rarities,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
