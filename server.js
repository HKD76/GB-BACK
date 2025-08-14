const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const weaponsRoutes = require("./routes/weapons");
const skillsRoutes = require("./routes/skills");
const usersRoutes = require("./routes/users");
const { initializeDatabase } = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de sécurité
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
});
app.use(limiter);

// Middleware pour parser JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes statiques pour le frontend
app.use(express.static("public"));

// Routes API
app.use("/api/weapons", weaponsRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/users", usersRoutes);

// Route de santé
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Route par défaut
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Gestion des erreurs 404
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Erreur interne du serveur",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Une erreur est survenue",
  });
});

// Initialiser la base de données et démarrer le serveur
async function startServer() {
  try {
    // Initialiser la base de données
    await initializeDatabase();
    console.log("✅ Base de données initialisée");

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📊 Environnement: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`🔐 API Documentation: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Erreur lors du démarrage du serveur:", error);
    process.exit(1);
  }
}

startServer();
