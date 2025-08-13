const express = require("express");
const { connectMongo } = require("../config/database");
const router = express.Router();

// GET /api/skills - Récupérer toutes les compétences
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = "",
      type = "",
      element = "",
    } = req.query;
    const db = await connectMongo();
    const collection = db.collection("weapon_skills");

    // Construire le filtre
    let filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (type) filter.type = { $regex: type, $options: "i" };
    if (element) filter.element = { $regex: element, $options: "i" };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const skills = await collection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await collection.countDocuments(filter);

    res.json({
      skills,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des compétences:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/skills/:id - Récupérer une compétence par ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectMongo();
    const collection = db.collection("weapon_skills");

    const skill = await collection.findOne({ _id: id });

    if (!skill) {
      return res.status(404).json({ error: "Compétence non trouvée" });
    }

    res.json(skill);
  } catch (error) {
    console.error("Erreur lors de la récupération de la compétence:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/skills - Créer une nouvelle compétence
router.post("/", async (req, res) => {
  try {
    const skillData = req.body;
    const db = await connectMongo();
    const collection = db.collection("weapon_skills");

    // Validation basique
    if (!skillData.name) {
      return res
        .status(400)
        .json({ error: "Le nom de la compétence est requis" });
    }

    const result = await collection.insertOne({
      ...skillData,
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(201).json({
      message: "Compétence créée avec succès",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la compétence:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT /api/skills/:id - Mettre à jour une compétence
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const db = await connectMongo();
    const collection = db.collection("weapon_skills");

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
      return res.status(404).json({ error: "Compétence non trouvée" });
    }

    res.json({ message: "Compétence mise à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la compétence:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE /api/skills/:id - Supprimer une compétence
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectMongo();
    const collection = db.collection("weapon_skills");

    const result = await collection.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Compétence non trouvée" });
    }

    res.json({ message: "Compétence supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la compétence:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/skills/import - Importer des compétences depuis JSON
router.post("/import", async (req, res) => {
  try {
    const { skills } = req.body;
    const db = await connectMongo();
    const collection = db.collection("weapon_skills");

    if (!Array.isArray(skills)) {
      return res
        .status(400)
        .json({ error: "Les données doivent être un tableau" });
    }

    // Ajouter des timestamps
    const skillsWithTimestamps = skills.map((skill) => ({
      ...skill,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const result = await collection.insertMany(skillsWithTimestamps);

    res.json({
      message: `${result.insertedCount} compétences importées avec succès`,
      insertedCount: result.insertedCount,
    });
  } catch (error) {
    console.error("Erreur lors de l'import des compétences:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/skills/stats/overview - Statistiques des compétences
router.get("/stats/overview", async (req, res) => {
  try {
    const db = await connectMongo();
    const collection = db.collection("weapon_skills");

    const totalSkills = await collection.countDocuments();
    const types = await collection.distinct("type");
    const elements = await collection.distinct("element");

    res.json({
      totalSkills,
      types: types.length,
      elements: elements.length,
      uniqueTypes: types,
      uniqueElements: elements,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/skills/by-weapon/:weaponId - Compétences par arme
router.get("/by-weapon/:weaponId", async (req, res) => {
  try {
    const { weaponId } = req.params;
    const db = await connectMongo();
    const collection = db.collection("weapon_skills");

    const skills = await collection.find({ weapon_id: weaponId }).toArray();

    res.json(skills);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des compétences par arme:",
      error
    );
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
