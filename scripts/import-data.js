const fs = require("fs");
const path = require("path");
const { connectMongo, initializeDatabase } = require("../config/database");

async function importData() {
  try {
    console.log("🚀 Début de l'import des données...");

    // Initialiser les bases de données
    await initializeDatabase();

    // Connexion MongoDB
    const db = await connectMongo();

    // Importer les armes
    console.log("📦 Import des armes...");
    const weaponsPath = path.join(__dirname, "../json/weapons.json");
    if (fs.existsSync(weaponsPath)) {
      const weaponsData = JSON.parse(fs.readFileSync(weaponsPath, "utf8"));
      const weaponsCollection = db.collection("weapons");

      // Vider la collection existante
      await weaponsCollection.deleteMany({});

      // Ajouter des timestamps
      const weaponsWithTimestamps = weaponsData.map((weapon) => ({
        ...weapon,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      const weaponsResult = await weaponsCollection.insertMany(
        weaponsWithTimestamps
      );
      console.log(`✅ ${weaponsResult.insertedCount} armes importées`);
    } else {
      console.log("⚠️  Fichier weapons.json non trouvé");
    }

    // Importer les compétences
    console.log("📦 Import des compétences...");
    const skillsPath = path.join(__dirname, "../json/weapon_skills.json");
    if (fs.existsSync(skillsPath)) {
      const skillsData = JSON.parse(fs.readFileSync(skillsPath, "utf8"));
      const skillsCollection = db.collection("weapon_skills");

      // Vider la collection existante
      await skillsCollection.deleteMany({});

      // Ajouter des timestamps
      const skillsWithTimestamps = skillsData.map((skill) => ({
        ...skill,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      const skillsResult = await skillsCollection.insertMany(
        skillsWithTimestamps
      );
      console.log(`✅ ${skillsResult.insertedCount} compétences importées`);
    } else {
      console.log("⚠️  Fichier weapon_skills.json non trouvé");
    }

    console.log("🎉 Import terminé avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de l'import:", error);
    process.exit(1);
  }
}

// Exécuter l'import si le script est appelé directement
if (require.main === module) {
  importData();
}

module.exports = { importData };
