const { MongoClient } = require("mongodb");
require("dotenv").config();

// Configuration MongoDB
const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "gb_project";

// Charger le fichier JSON des stats des skills
const skillsStats = require("../json/skills_stats.json");

async function importSkillsStats() {
  let client;

  try {
    console.log("🔗 Connexion à MongoDB...");
    client = new MongoClient(mongoUrl);
    await client.connect();

    const db = client.db(dbName);
    const skillsStatsCollection = db.collection("skills_stats");

    console.log("🗑️ Suppression de l'ancienne collection skills_stats...");
    await skillsStatsCollection.drop().catch(() => {
      console.log("⚠️ Collection skills_stats n'existait pas, création...");
    });

    console.log("📊 Import des données skills_stats...");

    // Préparer les données avec timestamps
    const skillsStatsWithTimestamps = skillsStats.map((skill, index) => ({
      ...skill,
      created_at: new Date(),
      updated_at: new Date(),
      _id: index + 1, // ID séquentiel pour faciliter la recherche
    }));

    // Insérer les données
    const result = await skillsStatsCollection.insertMany(
      skillsStatsWithTimestamps
    );

    console.log(`✅ Import terminé avec succès !`);
    console.log(`📈 ${result.insertedCount} skills_stats importés`);

    // Vérifier l'import
    const count = await skillsStatsCollection.countDocuments();
    console.log(
      `🔍 Vérification : ${count} documents dans la collection skills_stats`
    );

    // Afficher quelques exemples
    const examples = await skillsStatsCollection.find({}).limit(3).toArray();
    console.log("\n📋 Exemples de skills_stats importés :");
    examples.forEach((skill, index) => {
      console.log(
        `${index + 1}. ${skill.name} - ${skill.description.substring(0, 50)}...`
      );
    });

    console.log("\n🎉 Import des skills_stats terminé avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de l'import des skills_stats:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("🔌 Connexion MongoDB fermée");
    }
  }
}

// Exécuter l'import
importSkillsStats();
