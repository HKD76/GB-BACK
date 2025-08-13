const { MongoClient } = require("mongodb");
const { Pool } = require("pg");

// Configuration MongoDB
const mongoConfig = {
  url: process.env.MONGODB_URI || "mongodb://localhost:27017",
  dbName: process.env.MONGODB_DB || "gb_project",
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};

// Configuration PostgreSQL
const postgresConfig = {
  host: process.env.POSTGRES_HOST || "localhost",
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || "gb_project",
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "password",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Clients de base de données
let mongoClient = null;
let postgresPool = null;

// Connexion MongoDB
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

// Connexion PostgreSQL
async function connectPostgres() {
  try {
    if (!postgresPool) {
      postgresPool = new Pool(postgresConfig);
      console.log("✅ Connexion PostgreSQL établie");
    }
    return postgresPool;
  } catch (error) {
    console.error("❌ Erreur de connexion PostgreSQL:", error);
    throw error;
  }
}

// Fermeture des connexions
async function closeConnections() {
  try {
    if (mongoClient) {
      await mongoClient.close();
      console.log("🔌 Connexion MongoDB fermée");
    }
    if (postgresPool) {
      await postgresPool.end();
      console.log("🔌 Connexion PostgreSQL fermée");
    }
  } catch (error) {
    console.error("❌ Erreur lors de la fermeture des connexions:", error);
  }
}

// Initialisation des collections/tableaux
async function initializeDatabase() {
  try {
    // MongoDB - Créer les collections
    const mongoDb = await connectMongo();

    // Créer les collections si elles n'existent pas
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

    // PostgreSQL - Créer la table users
    const postgresClient = await connectPostgres();
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await postgresClient.query(createUsersTable);
    console.log('📦 Table "users" créée/vérifiée');
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
  connectPostgres,
  closeConnections,
  initializeDatabase,
  mongoConfig,
  postgresConfig,
};
