const { MongoClient } = require("mongodb");

const mongoConfig = {
  url: process.env.MONGODB_URI || "mongodb://localhost:27017",
  dbName: process.env.MONGODB_DB || "gb_project",
  options: {},
};

let mongoClient = null;

/**
 * Établit la connexion MongoDB
 */
async function connectMongo() {
  try {
    if (!mongoClient) {
      mongoClient = new MongoClient(mongoConfig.url, mongoConfig.options);
      await mongoClient.connect();
      console.log("✅ Connexion MongoDB établie");
    }
    return mongoClient.db(mongoConfig.dbName);
  } catch (error) {
    console.error("❌ Erreur de connexion MongoDB:", error);
    throw error;
  }
}

/**
 * Ferme les connexions MongoDB
 */
async function closeConnections() {
  try {
    if (mongoClient) {
      await mongoClient.close();
      console.log("🔌 Connexion MongoDB fermée");
    }
  } catch (error) {
    console.error("❌ Erreur lors de la fermeture des connexions:", error);
  }
}

/**
 * Initialise les collections de la base de données
 */
async function initializeDatabase() {
  try {
    const mongoDb = await connectMongo();

    const collections = await mongoDb.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);

    if (!collectionNames.includes("weapons")) {
      await mongoDb.createCollection("weapons");
      console.log('📦 Collection "weapons" créée');
    }

    if (!collectionNames.includes("weapon_skills")) {
      await mongoDb.createCollection("weapon_skills");
      console.log('📦 Collection "weapon_skills" créée');
    }

    if (!collectionNames.includes("skills_stats")) {
      await mongoDb.createCollection("skills_stats");
      console.log('📦 Collection "skills_stats" créée');
    }

    if (!collectionNames.includes("summons")) {
      await mongoDb.createCollection("summons");
      console.log('📦 Collection "summons" créée');
    }

    if (!collectionNames.includes("weapon_grids")) {
      await mongoDb.createCollection("weapon_grids");
      console.log('📦 Collection "weapon_grids" créée');
    }

    if (!collectionNames.includes("users")) {
      await mongoDb.createCollection("users");
      console.log('📦 Collection "users" créée');
    }
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'initialisation de la base de données:",
      error
    );
    throw error;
  }
}

module.exports = {
  connectMongo,
  closeConnections,
  initializeDatabase,
  mongoConfig,
};
