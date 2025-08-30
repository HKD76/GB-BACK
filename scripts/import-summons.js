const { MongoClient } = require("mongodb");
require("dotenv").config();

// Configuration MongoDB
const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "gb_project";

// Charger le fichier JSON des summons
const summons = require("../json/summons.json");

async function importSummons() {
  let client;

  try {
    console.log("🔗 Connexion à MongoDB...");
    client = new MongoClient(mongoUrl);
    await client.connect();

    const db = client.db(dbName);
    const summonsCollection = db.collection("summons");

    console.log("🗑️ Suppression de l'ancienne collection summons...");
    await summonsCollection.drop().catch(() => {
      console.log("⚠️ Collection summons n'existait pas, création...");
    });

    console.log("📊 Import des données summons...");

    // Préparer les données avec timestamps
    const summonsWithTimestamps = summons.map((summon, index) => ({
      ...summon,
      created_at: new Date(),
      updated_at: new Date(),
      _id: index + 1, // ID séquentiel pour faciliter la recherche
    }));

    // Insérer les données
    const result = await summonsCollection.insertMany(summonsWithTimestamps);

    console.log(`✅ Import terminé avec succès !`);
    console.log(`📈 ${result.insertedCount} summons importés`);

    // Vérifier l'import
    const count = await summonsCollection.countDocuments();
    console.log(
      `🔍 Vérification : ${count} documents dans la collection summons`
    );

    // Afficher quelques exemples
    const examples = await summonsCollection.find({}).limit(3).toArray();
    console.log("\n📋 Exemples de summons importés :");
    examples.forEach((summon, index) => {
      console.log(
        `${index + 1}. ${summon.name} (${summon.element} ${
          summon.rarity
        }) - ATK: ${summon.atk2}, HP: ${summon.hp2}`
      );
    });

    // Statistiques rapides
    console.log("\n📊 Statistiques rapides :");
    const elementStats = await summonsCollection
      .aggregate([
        { $group: { _id: "$element", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    console.log("Par élément :");
    elementStats.forEach((stat) => {
      console.log(`  ${stat._id}: ${stat.count} summons`);
    });

    const rarityStats = await summonsCollection
      .aggregate([
        { $group: { _id: "$rarity", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    console.log("\nPar rareté :");
    rarityStats.forEach((stat) => {
      console.log(`  ${stat._id}: ${stat.count} summons`);
    });

    console.log("\n🎉 Import des summons terminé avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de l'import des summons:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("🔌 Connexion MongoDB fermée");
    }
  }
}

// Exécuter l'import
importSummons();
