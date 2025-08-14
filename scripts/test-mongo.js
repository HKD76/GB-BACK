require("dotenv").config();
const { MongoClient } = require("mongodb");

async function testConnection() {
  try {
    console.log("🔍 Test de connexion MongoDB...");
    console.log("URI:", process.env.MONGODB_URI);

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();

    console.log("✅ Connexion réussie !");

    const db = client.db("gb_project");
    console.log("📊 Base de données:", db.databaseName);

    // Lister les collections
    const collections = await db.listCollections().toArray();
    console.log(
      "📦 Collections trouvées:",
      collections.map((c) => c.name)
    );

    // Compter les documents
    if (collections.length > 0) {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`📄 ${collection.name}: ${count} documents`);
      }
    }

    await client.close();
    console.log("🔌 Connexion fermée");
  } catch (error) {
    console.error("❌ Erreur de connexion:", error.message);
  }
}

testConnection();
