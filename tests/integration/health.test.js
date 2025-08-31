const request = require("supertest");
const express = require("express");

// Créer une application Express pour les tests
const app = express();

// Ajouter les routes de santé
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    mongodb: process.env.MONGODB_URI ? "Configured" : "Not configured",
    dbName: process.env.DB_NAME || "Not configured",
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "API fonctionne correctement",
    env: {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? "Present" : "Missing",
      DB_NAME: process.env.DB_NAME || "Missing",
      JWT_SECRET: process.env.JWT_SECRET ? "Present" : "Missing",
    },
  });
});

describe("Health API Integration Tests", () => {
  describe("GET /api/health", () => {
    it("devrait retourner le statut de santé de l'API", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("environment");
      expect(response.body).toHaveProperty("mongodb");
      expect(response.body).toHaveProperty("dbName");

      // Vérifier que le timestamp est une date valide
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it("devrait indiquer l'environnement de test", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.body.environment).toBe("test");
    });

    it("devrait indiquer la configuration MongoDB", async () => {
      const response = await request(app).get("/api/health").expect(200);

      // En mode test, MongoDB devrait être configuré
      expect(response.body.mongodb).toBe("Configured");
      expect(response.body.dbName).toBe("test");
    });
  });

  describe("GET /api/test", () => {
    it("devrait retourner les informations de test de l'API", async () => {
      const response = await request(app).get("/api/test").expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "API fonctionne correctement"
      );
      expect(response.body).toHaveProperty("env");
      expect(response.body.env).toHaveProperty("NODE_ENV");
      expect(response.body.env).toHaveProperty("MONGODB_URI");
      expect(response.body.env).toHaveProperty("DB_NAME");
      expect(response.body.env).toHaveProperty("JWT_SECRET");
    });

    it("devrait indiquer les variables d'environnement présentes", async () => {
      const response = await request(app).get("/api/test").expect(200);

      expect(response.body.env.NODE_ENV).toBe("test");
      expect(response.body.env.MONGODB_URI).toBe("Present");
      expect(response.body.env.DB_NAME).toBe("test");
      expect(response.body.env.JWT_SECRET).toBe("Present");
    });
  });
});
