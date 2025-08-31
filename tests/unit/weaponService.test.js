const weaponService = require("../../services/weaponService");
const {
  createTestWeapon,
  mockResponse,
  mockRequest,
} = require("../utils/testHelpers");

// Mock MongoDB
jest.mock("mongodb", () => ({
  MongoClient: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(),
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
        findOne: jest.fn().mockResolvedValue(null),
        insertOne: jest.fn().mockResolvedValue({ insertedId: "test-id" }),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
        countDocuments: jest.fn().mockResolvedValue(0),
      }),
    }),
  })),
}));

describe("WeaponService", () => {
  let mockCollection;
  let mockSkillsCollection;

  beforeEach(() => {
    // Mock des collections
    mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
      findOne: jest.fn().mockResolvedValue(null),
      insertOne: jest.fn().mockResolvedValue({ insertedId: "test-id" }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      countDocuments: jest.fn().mockResolvedValue(0),
    };

    mockSkillsCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      }),
    };

    // Mock des méthodes getCollection
    weaponService.getCollection = jest.fn().mockResolvedValue(mockCollection);
    weaponService.getSkillsCollection = jest
      .fn()
      .mockResolvedValue(mockSkillsCollection);
  });

  describe("getAllWeapons", () => {
    it("devrait retourner une liste d'armes avec pagination", async () => {
      const testWeapons = [
        createTestWeapon({ name: "Épée 1" }),
        createTestWeapon({ name: "Épée 2" }),
      ];

      mockCollection.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(testWeapons),
          }),
        }),
      });

      mockCollection.countDocuments.mockResolvedValue(2);

      const result = await weaponService.getAllWeapons(1, 10);

      expect(result.weapons).toEqual(testWeapons);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it("devrait appliquer les filtres correctement", async () => {
      const filters = {
        type: "sword",
        rarity: "SR",
        element: "fire",
      };

      await weaponService.getAllWeapons(1, 10, filters);

      expect(mockCollection.find).toHaveBeenCalledWith({
        type: "sword",
        rarity: "SR",
        element: "fire",
      });
    });

    it("devrait gérer les erreurs de base de données", async () => {
      mockCollection.find.mockImplementation(() => {
        throw new Error("Erreur de base de données");
      });

      await expect(weaponService.getAllWeapons()).rejects.toThrow(
        "Erreur de base de données"
      );
    });
  });

  describe("getWeaponById", () => {
    it("devrait retourner une arme par son ID", async () => {
      const testWeapon = createTestWeapon({ _id: "test-id" });
      mockCollection.findOne.mockResolvedValue(testWeapon);

      const result = await weaponService.getWeaponById("test-id");

      expect(result).toEqual(testWeapon);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: "test-id" });
    });

    it("devrait retourner null si l'arme n'existe pas", async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await weaponService.getWeaponById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("createWeapon", () => {
    it("devrait créer une nouvelle arme", async () => {
      const weaponData = createTestWeapon();
      const insertedWeapon = { _id: "test-id", ...weaponData };

      mockCollection.insertOne.mockResolvedValue({ insertedId: "test-id" });
      mockCollection.findOne.mockResolvedValue(insertedWeapon);

      const result = await weaponService.createWeapon(weaponData);

      expect(result).toBe("test-id");
      expect(mockCollection.insertOne).toHaveBeenCalledWith(weaponData);
    });

    it("devrait gérer les erreurs lors de la création", async () => {
      const weaponData = createTestWeapon();
      mockCollection.insertOne.mockRejectedValue(
        new Error("Erreur de création")
      );

      await expect(weaponService.createWeapon(weaponData)).rejects.toThrow(
        "Erreur de création"
      );
    });
  });

  describe("updateWeapon", () => {
    it("devrait mettre à jour une arme existante", async () => {
      const weaponId = "test-id";
      const updateData = { name: "Épée Modifiée" };
      const updatedWeapon = { _id: weaponId, ...updateData };

      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockCollection.findOne.mockResolvedValue(updatedWeapon);

      const result = await weaponService.updateWeapon(weaponId, updateData);

      expect(result).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: weaponId },
        { $set: updateData }
      );
    });

    it("devrait retourner null si l'arme n'existe pas", async () => {
      const weaponId = "non-existent-id";
      const updateData = { name: "Épée Modifiée" };

      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const result = await weaponService.updateWeapon(weaponId, updateData);

      expect(result).toBe(false);
    });
  });

  describe("deleteWeapon", () => {
    it("devrait supprimer une arme", async () => {
      const weaponId = "test-id";
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await weaponService.deleteWeapon(weaponId);

      expect(result).toBe(true);
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: weaponId });
    });

    it("devrait retourner false si l'arme n'existe pas", async () => {
      const weaponId = "non-existent-id";
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const result = await weaponService.deleteWeapon(weaponId);

      expect(result).toBe(false);
    });
  });

  describe("enrichWeaponsWithSkills", () => {
    it("devrait enrichir les armes avec les détails des skills", async () => {
      const weapons = [
        {
          name: "Épée Test",
          "s1 name": "Skill 1",
          "s2 name": "Skill 2",
        },
      ];

      const skills = [
        {
          name: "Skill 1",
          text: "Description Skill 1",
          jpname: "スキル1",
          jptext: "スキル1の説明",
        },
        {
          name: "Skill 2",
          text: "Description Skill 2",
          jpname: "スキル2",
          jptext: "スキル2の説明",
        },
      ];

      mockSkillsCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(skills),
      });

      const result = await weaponService.enrichWeaponsWithSkills(weapons);

      expect(result[0].s1_details).toEqual({
        name: "Skill 1",
        text: "Description Skill 1",
        jpname: "スキル1",
        jptext: "スキル1の説明",
      });

      expect(result[0].s2_details).toEqual({
        name: "Skill 2",
        text: "Description Skill 2",
        jpname: "スキル2",
        jptext: "スキル2の説明",
      });
    });

    it("devrait retourner les armes originales si aucune skill n'est trouvée", async () => {
      const weapons = [
        {
          name: "Épée Test",
          "s1 name": "Skill Inconnu",
        },
      ];

      mockSkillsCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });

      const result = await weaponService.enrichWeaponsWithSkills(weapons);

      expect(result).toEqual(weapons);
    });

    it("devrait gérer les erreurs et retourner les armes originales", async () => {
      const weapons = [{ name: "Épée Test" }];

      mockSkillsCollection.find.mockImplementation(() => {
        throw new Error("Erreur de base de données");
      });

      const result = await weaponService.enrichWeaponsWithSkills(weapons);

      expect(result).toEqual(weapons);
    });
  });
});
