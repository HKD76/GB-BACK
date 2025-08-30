const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const weaponsRoutes = require("./routes/weapons");
const weaponsEnrichedRoutes = require("./routes/weapons-enriched");
const summonsRoutes = require("./routes/summons");
const skillsRoutes = require("./routes/skills");
const skillsStatsRoutes = require("./routes/skills-stats");
const usersRoutes = require("./routes/users");
const weaponGridsRoutes = require("./routes/weapon-grids");
const { initializeDatabase } = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use("/api/weapons", weaponsRoutes);
app.use("/api/weapons-enriched", weaponsEnrichedRoutes);
app.use("/api/summons", summonsRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/skills-stats", skillsStatsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/weapon-grids", weaponGridsRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "API GB Project",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      weapons: "/api/weapons",
      summons: "/api/summons",
      users: "/api/users",
      weaponGrids: "/api/weapon-grids",
    },
  });
});

app.use("*", (req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

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

/**
 * Initialise la base de données et démarre le serveur
 */
async function startServer() {
  try {
    await initializeDatabase();
    console.log("✅ Base de données initialisée");

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
