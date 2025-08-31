const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "gb_project";

/**
 * Importe les summons depuis le fichier JSON mis à jour
 */
async function importSummons() {
  let client;

  try {
    console.log("🔗 Connexion à MongoDB...");
    client = new MongoClient(mongoUrl);
    await client.connect();

    const db = client.db(dbName);
    const summonsCollection = db.collection("summons");

    console.log("📦 Lecture du fichier summons.json...");
    const summonsPath = path.join(__dirname, "../json/summons.json");

    if (!fs.existsSync(summonsPath)) {
      throw new Error("Fichier summons.json non trouvé");
    }

    const summonsData = JSON.parse(fs.readFileSync(summonsPath, "utf8"));
    console.log(
      `📋 ${summonsData.length} summons trouvées dans le fichier JSON`
    );

    console.log("🗑️  Vidage de la collection summons...");
    await summonsCollection.deleteMany({});
    console.log("✅ Collection summons vidée");

    console.log("📝 Ajout des timestamps...");
    const summonsWithTimestamps = summonsData.map((summon, index) => ({
      ...summon,
      _id: index + 1, // Utiliser un ID séquentiel
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    console.log("💾 Insertion des summons dans MongoDB...");
    const result = await summonsCollection.insertMany(summonsWithTimestamps);

    console.log(`✅ ${result.insertedCount} summons importées avec succès !`);

    // Vérifier qu'Agni a bien ses auras T3, T4, T5
    console.log("\n🔍 Vérification des données d'Agni...");
    const agni = await summonsCollection.findOne({ name: "Agni" });

    if (agni) {
      console.log("✅ Agni trouvé dans la base de données");
      console.log(`   aura_t3: ${agni.aura_t3 ? "✅ Présent" : "❌ Manquant"}`);
      console.log(`   aura_t4: ${agni.aura_t4 ? "✅ Présent" : "❌ Manquant"}`);
      console.log(`   aura_t5: ${agni.aura_t5 ? "✅ Présent" : "❌ Manquant"}`);
      console.log(
        `   subaura_t1: ${agni.subaura_t1 ? "✅ Présent" : "❌ Manquant"}`
      );
      console.log(
        `   subaura_t5: ${agni.subaura_t5 ? "✅ Présent" : "❌ Manquant"}`
      );
    } else {
      console.log("❌ Agni non trouvé dans la base de données");
    }

    console.log("\n🎉 Import des summons terminé avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de l'import des summons:", error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log("🔌 Connexion MongoDB fermée");
    }
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log("🚀 Démarrage de l'import des summons...");
  console.log("=".repeat(50));

  await importSummons();

  console.log("=".repeat(50));
  console.log("✨ Script terminé !");
}

// Exécuter le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { importSummons };
