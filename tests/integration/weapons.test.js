const request = require("supertest");
const express = require("express");
const weaponsRoutes = require("../../routes/weapons");
const weaponService = require("../../services/weaponService");
const { generateTestToken } = require("../utils/testHelpers");

// Mock du service d'armes
jest.mock("../../services/weaponService");

// Mock du middleware d'authentification
jest.mock("../../middleware/auth", () => ({
  authenticateToken: (req, res, next) => next(),
}));

// Mock du modèle Weapon
jest.mock("../../models/Weapon", () => ({
  validate: jest.fn().mockReturnValue([]),
}));

// Créer une application Express pour les tests
const app = express();
app.use(express.json());
app.use("/api/weapons", weaponsRoutes);

describe("Weapons API Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Réinitialiser la validation du modèle Weapon
    const Weapon = require("../../models/Weapon");
    Weapon.validate.mockReturnValue([]);
  });

  describe("GET /api/weapons", () => {
    it("devrait retourner une liste d'armes avec pagination", async () => {
      const mockWeapons = [
        {
          _id: "1",
          name: "Épée de Test 1",
          type: "sword",
          rarity: "SR",
          element: "fire",
          attack: 1000,
          hp: 500,
        },
        {
          _id: "2",
          name: "Épée de Test 2",
          type: "sword",
          rarity: "SSR",
          element: "water",
          attack: 1200,
          hp: 600,
        },
      ];

      const mockResult = {
        weapons: mockWeapons,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1,
        },
      };

      weaponService.getAllWeapons.mockResolvedValue(mockResult);

      const response = await request(app).get("/api/weapons").expect(200);

      expect(response.body.weapons).toEqual(mockWeapons);
      expect(response.body.pagination).toEqual(mockResult.pagination);
      expect(weaponService.getAllWeapons).toHaveBeenCalledWith(1, 10, {});
    });

    it("devrait appliquer les filtres de requête", async () => {
      const mockResult = {
        weapons: [],
        pagination: { page: 1, limit: 5, total: 0, pages: 0 },
      };

      weaponService.getAllWeapons.mockResolvedValue(mockResult);

      await request(app)
        .get("/api/weapons?type=sword&rarity=SR&element=fire&page=2&limit=5")
        .expect(200);

      expect(weaponService.getAllWeapons).toHaveBeenCalledWith(2, 5, {
        type: "sword",
        rarity: "SR",
        element: "fire",
      });
    });

    it("devrait gérer les erreurs du service", async () => {
      weaponService.getAllWeapons.mockRejectedValue(
        new Error("Erreur de base de données")
      );

      const response = await request(app).get("/api/weapons").expect(500);

      expect(response.body.error).toBe("Erreur serveur");
      expect(response.body.message).toBe(
        "Une erreur est survenue lors de la récupération des armes"
      );
    });
  });

  describe("GET /api/weapons/element/:element", () => {
    it("devrait retourner les armes filtrées par élément", async () => {
      const mockWeapons = [
        {
          _id: "1",
          name: "Épée de Feu",
          element: "fire",
          type: "sword",
          rarity: "SR",
        },
      ];

      const mockResult = {
        weapons: mockWeapons,
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      };

      weaponService.getAllWeapons.mockResolvedValue(mockResult);

      const response = await request(app)
        .get("/api/weapons/element/fire")
        .expect(200);

      expect(response.body.weapons).toEqual(mockWeapons);
      expect(response.body.element).toBe("fire");
      expect(weaponService.getAllWeapons).toHaveBeenCalledWith(1, 10, {
        element: "fire",
      });
    });

    it("devrait appliquer des filtres supplémentaires", async () => {
      const mockResult = {
        weapons: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      };

      weaponService.getAllWeapons.mockResolvedValue(mockResult);

      await request(app)
        .get("/api/weapons/element/fire?rarity=SR&type=sword")
        .expect(200);

      expect(weaponService.getAllWeapons).toHaveBeenCalledWith(1, 10, {
        element: "fire",
        rarity: "SR",
        type: "sword",
      });
    });
  });

  describe("GET /api/weapons/rarity/:rarity", () => {
    it("devrait retourner les armes filtrées par rareté", async () => {
      const mockWeapons = [
        {
          _id: "1",
          name: "Épée SSR",
          rarity: "SSR",
          element: "fire",
          type: "sword",
        },
      ];

      const mockResult = {
        weapons: mockWeapons,
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      };

      weaponService.getAllWeapons.mockResolvedValue(mockResult);

      const response = await request(app)
        .get("/api/weapons/rarity/SSR")
        .expect(200);

      expect(response.body.weapons).toEqual(mockWeapons);
      expect(response.body.rarity).toBe("SSR");
      expect(weaponService.getAllWeapons).toHaveBeenCalledWith(1, 10, {
        rarity: "SSR",
      });
    });
  });

  describe("GET /api/weapons/:id", () => {
    it("devrait retourner une arme spécifique", async () => {
      const mockWeapon = {
        _id: "test-id",
        name: "Épée de Test",
        type: "sword",
        rarity: "SR",
        element: "fire",
      };

      weaponService.getWeaponById.mockResolvedValue(mockWeapon);

      const response = await request(app)
        .get("/api/weapons/test-id")
        .expect(200);

      expect(response.body.weapon).toEqual(mockWeapon);
      expect(weaponService.getWeaponById).toHaveBeenCalledWith("test-id");
    });

    it("devrait retourner 404 si l'arme n'existe pas", async () => {
      weaponService.getWeaponById.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/weapons/non-existent-id")
        .expect(404);

      expect(response.body.error).toBe("Arme non trouvée");
    });

    it("devrait gérer les erreurs du service", async () => {
      weaponService.getWeaponById.mockRejectedValue(
        new Error("Erreur de base de données")
      );

      const response = await request(app)
        .get("/api/weapons/test-id")
        .expect(500);

      expect(response.body.error).toBe("Erreur serveur");
    });
  });

  describe("POST /api/weapons", () => {
    it("devrait créer une nouvelle arme", async () => {
      const weaponData = {
        name: "Nouvelle Épée",
        type: "sword",
        rarity: "SR",
        element: "fire",
        atk1: 1000,
        hp1: 500,
      };

      const createdWeapon = { _id: "new-id", ...weaponData };
      weaponService.createWeapon.mockResolvedValue("new-id");
      weaponService.getWeaponById.mockResolvedValue(createdWeapon);

      const response = await request(app)
        .post("/api/weapons")
        .send(weaponData)
        .expect(201);

      expect(response.body.weapon).toEqual(createdWeapon);
      expect(weaponService.createWeapon).toHaveBeenCalledWith(weaponData);
    });

    it("devrait valider les données requises", async () => {
      const invalidData = {
        type: "sword",
        // name manquant
      };

      // Mock la validation pour retourner des erreurs
      const Weapon = require("../../models/Weapon");
      Weapon.validate.mockReturnValue(["Le nom de l'arme est requis"]);

      const response = await request(app)
        .post("/api/weapons")
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe("Données invalides");
    });

    it("devrait gérer les erreurs de création", async () => {
      const weaponData = {
        name: "Test Weapon",
        type: "sword",
        element: "fire",
        rarity: "SR",
      };
      weaponService.createWeapon.mockRejectedValue(
        new Error("Erreur de création")
      );

      const response = await request(app)
        .post("/api/weapons")
        .send(weaponData)
        .expect(500);

      expect(response.body.error).toBe("Erreur serveur");
    });
  });

  describe("PUT /api/weapons/:id", () => {
    it("devrait mettre à jour une arme existante", async () => {
      const updateData = {
        name: "Épée Modifiée",
        type: "sword",
        element: "fire",
        rarity: "SR",
      };
      const updatedWeapon = { _id: "test-id", ...updateData };

      weaponService.updateWeapon.mockResolvedValue(true);
      weaponService.getWeaponById.mockResolvedValue(updatedWeapon);

      const response = await request(app)
        .put("/api/weapons/test-id")
        .send(updateData)
        .expect(200);

      expect(response.body.weapon).toEqual(updatedWeapon);
      expect(weaponService.updateWeapon).toHaveBeenCalledWith(
        "test-id",
        updateData
      );
    });

    it("devrait retourner 404 si l'arme n'existe pas", async () => {
      const updateData = {
        name: "Épée Modifiée",
        type: "sword",
        element: "fire",
        rarity: "SR",
      };
      weaponService.updateWeapon.mockResolvedValue(false);

      const response = await request(app)
        .put("/api/weapons/non-existent-id")
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe("Arme non trouvée");
    });
  });

  describe("DELETE /api/weapons/:id", () => {
    it("devrait supprimer une arme", async () => {
      weaponService.deleteWeapon.mockResolvedValue(true);

      const response = await request(app)
        .delete("/api/weapons/test-id")
        .expect(200);

      expect(response.body.message).toBe("Arme supprimée avec succès");
      expect(weaponService.deleteWeapon).toHaveBeenCalledWith("test-id");
    });

    it("devrait retourner 404 si l'arme n'existe pas", async () => {
      weaponService.deleteWeapon.mockResolvedValue(false);

      const response = await request(app)
        .delete("/api/weapons/non-existent-id")
        .expect(404);

      expect(response.body.error).toBe("Arme non trouvée");
    });
  });
});
