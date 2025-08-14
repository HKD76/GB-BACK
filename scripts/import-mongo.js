require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

async function importData() {
  try {
    console.log("🚀 Début de l'import des données...");
    console.log("URI:", process.env.MONGODB_URI);

    // Connexion directe avec l'URI
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log("✅ Connexion MongoDB établie");

    const db = client.db("gb_project");
    console.log("📊 Base de données:", db.databaseName);

    // Importer les armes
    console.log("📦 Import des armes...");
    const weaponsPath = path.join(__dirname, "../json/weapons.json");
    if (fs.existsSync(weaponsPath)) {
      const weaponsData = JSON.parse(fs.readFileSync(weaponsPath, "utf8"));
      const weaponsCollection = db.collection("weapons");

      // Vider la collection existante
      await weaponsCollection.deleteMany({});
      console.log("🗑️  Collection weapons vidée");

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
      console.log("🗑️  Collection weapon_skills vidée");

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

    // Vérifier les collections
    const collections = await db.listCollections().toArray();
    console.log(
      "📦 Collections créées:",
      collections.map((c) => c.name)
    );

    await client.close();
    console.log("🎉 Import terminé avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de l'import:", error);
    process.exit(1);
  }
}

importData();
