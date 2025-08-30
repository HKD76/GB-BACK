const { MongoClient, ObjectId } = require("mongodb");
const WeaponGrid = require("../models/WeaponGrid");
require("dotenv").config();

class WeaponGridService {
  constructor() {
    this.mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017";
    this.dbName = process.env.DB_NAME || "gb_project";
  }

  async getCollection() {
    const client = new MongoClient(this.mongoUrl);
    await client.connect();
    return client.db(this.dbName).collection("weapon_grids");
  }

  // Créer une nouvelle grille d'armes
  async createWeaponGrid(gridData) {
    try {
      const collection = await this.getCollection();

      // Validation
      const validationErrors = WeaponGrid.validate(gridData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      const weaponGrid = new WeaponGrid(gridData);
      weaponGrid.calculateStats(); // Calculer les statistiques initiales

      const result = await collection.insertOne(weaponGrid.toMongo());
      return result.insertedId.toString();
    } catch (error) {
      throw error;
    }
  }

  // Récupérer une grille par ID
  async getWeaponGridById(id) {
    try {
      const collection = await this.getCollection();
      const grid = await collection.findOne({ _id: new ObjectId(id) });
      return WeaponGrid.fromMongo(grid);
    } catch (error) {
      throw error;
    }
  }

  // Récupérer toutes les grilles d'un utilisateur
  async getWeaponGridsByUserId(userId, page = 1, limit = 10) {
    try {
      const collection = await this.getCollection();

      const totalGrids = await collection.countDocuments({ userId });
      const totalPages = Math.ceil(totalGrids / limit);
      const skip = (page - 1) * limit;

      const grids = await collection
        .find({ userId })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return {
        grids: grids.map((grid) => WeaponGrid.fromMongo(grid)),
        pagination: {
          page,
          limit,
          total: totalGrids,
          totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Récupérer toutes les grilles publiques
  async getPublicWeaponGrids(page = 1, limit = 10, filters = {}) {
    try {
      const collection = await this.getCollection();

      // Construire la requête de filtrage
      const query = { isPublic: true };

      if (filters.element) {
        query["metadata.elements"] = filters.element;
      }
      if (filters.rarity) {
        query["metadata.rarities"] = filters.rarity;
      }
      if (filters.name) {
        query.name = { $regex: filters.name, $options: "i" };
      }
      if (filters.minAtk) {
        query["metadata.totalAtk"] = { $gte: parseInt(filters.minAtk) };
      }
      if (filters.maxAtk) {
        if (query["metadata.totalAtk"]) {
          query["metadata.totalAtk"].$lte = parseInt(filters.maxAtk);
        } else {
          query["metadata.totalAtk"] = { $lte: parseInt(filters.maxAtk) };
        }
      }

      const totalGrids = await collection.countDocuments(query);
      const totalPages = Math.ceil(totalGrids / limit);
      const skip = (page - 1) * limit;

      const grids = await collection
        .find(query)
        .sort({ "stats.views": -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return {
        grids: grids.map((grid) => WeaponGrid.fromMongo(grid)),
        pagination: {
          page,
          limit,
          total: totalGrids,
          totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Rechercher des grilles
  async searchWeaponGrids(query, page = 1, limit = 10, filters = {}) {
    try {
      const collection = await this.getCollection();

      // Construire la requête de recherche
      const searchQuery = {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      };

      // Ajouter les filtres
      if (filters.isPublic !== undefined) {
        searchQuery.isPublic = filters.isPublic;
      }
      if (filters.userId) {
        searchQuery.userId = filters.userId;
      }
      if (filters.element) {
        searchQuery["metadata.elements"] = filters.element;
      }
      if (filters.rarity) {
        searchQuery["metadata.rarities"] = filters.rarity;
      }

      const totalGrids = await collection.countDocuments(searchQuery);
      const totalPages = Math.ceil(totalGrids / limit);
      const skip = (page - 1) * limit;

      const grids = await collection
        .find(searchQuery)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return {
        grids: grids.map((grid) => WeaponGrid.fromMongo(grid)),
        pagination: {
          page,
          limit,
          total: totalGrids,
          totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour une grille
  async updateWeaponGrid(id, updateData) {
    try {
      const collection = await this.getCollection();

      // Validation
      const validationErrors = WeaponGrid.validate(updateData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      const weaponGrid = new WeaponGrid(updateData);
      weaponGrid.calculateStats();
      weaponGrid.updatedAt = new Date();

      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: weaponGrid.toMongo() }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Supprimer une grille
  async deleteWeaponGrid(id) {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Ajouter une arme à une grille
  async addWeaponToGrid(gridId, slot, weaponId, weaponData, selectedLevel = 1) {
    try {
      const collection = await this.getCollection();

      const updateQuery = {
        [`weapons.${slot}`]: {
          weaponId,
          weaponData,
          selectedLevel,
        },
        updatedAt: new Date(),
      };

      const result = await collection.updateOne(
        { _id: new ObjectId(gridId) },
        { $set: updateQuery }
      );

      if (result.modifiedCount > 0) {
        // Recalculer les statistiques
        await this.recalculateGridStats(gridId);
      }

      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Ajouter une summon à une grille
  async addSummonToGrid(
    gridId,
    slot,
    summonId,
    summonData,
    selectedLevel = 0,
    selectedSpecialAura = null
  ) {
    try {
      const collection = await this.getCollection();

      const updateQuery = {
        [`summons.${slot}`]: {
          summonId,
          summonData,
          selectedLevel,
          selectedSpecialAura,
        },
        updatedAt: new Date(),
      };

      const result = await collection.updateOne(
        { _id: new ObjectId(gridId) },
        { $set: updateQuery }
      );

      if (result.modifiedCount > 0) {
        // Recalculer les statistiques
        await this.recalculateGridStats(gridId);
      }

      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Supprimer une arme d'une grille
  async removeWeaponFromGrid(gridId, slot) {
    try {
      const collection = await this.getCollection();

      const updateQuery = {
        [`weapons.${slot}`]: null,
        updatedAt: new Date(),
      };

      const result = await collection.updateOne(
        { _id: new ObjectId(gridId) },
        { $unset: updateQuery }
      );

      if (result.modifiedCount > 0) {
        // Recalculer les statistiques
        await this.recalculateGridStats(gridId);
      }

      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Supprimer une summon d'une grille
  async removeSummonFromGrid(gridId, slot) {
    try {
      const collection = await this.getCollection();

      const updateQuery = {
        [`summons.${slot}`]: null,
        updatedAt: new Date(),
      };

      const result = await collection.updateOne(
        { _id: new ObjectId(gridId) },
        { $unset: updateQuery }
      );

      if (result.modifiedCount > 0) {
        // Recalculer les statistiques
        await this.recalculateGridStats(gridId);
      }

      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Recalculer les statistiques d'une grille
  async recalculateGridStats(gridId) {
    try {
      const grid = await this.getWeaponGridById(gridId);
      if (!grid) return false;

      grid.calculateStats();

      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(gridId) },
        { $set: { metadata: grid.metadata } }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Incrémenter les vues d'une grille
  async incrementGridViews(gridId) {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(gridId) },
        { $inc: { "stats.views": 1 } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Incrémenter les likes d'une grille
  async incrementGridLikes(gridId) {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(gridId) },
        { $inc: { "stats.likes": 1 } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Incrémenter les téléchargements d'une grille
  async incrementGridDownloads(gridId) {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(gridId) },
        { $inc: { "stats.downloads": 1 } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les statistiques globales
  async getGridStats() {
    try {
      const collection = await this.getCollection();

      const stats = await collection
        .aggregate([
          {
            $group: {
              _id: null,
              totalGrids: { $sum: 1 },
              publicGrids: { $sum: { $cond: ["$isPublic", 1, 0] } },
              privateGrids: { $sum: { $cond: ["$isPublic", 0, 1] } },
              totalViews: { $sum: "$stats.views" },
              totalLikes: { $sum: "$stats.likes" },
              totalDownloads: { $sum: "$stats.downloads" },
              avgAtk: { $avg: "$metadata.totalAtk" },
              avgHp: { $avg: "$metadata.totalHp" },
            },
          },
        ])
        .toArray();

      return (
        stats[0] || {
          totalGrids: 0,
          publicGrids: 0,
          privateGrids: 0,
          totalViews: 0,
          totalLikes: 0,
          totalDownloads: 0,
          avgAtk: 0,
          avgHp: 0,
        }
      );
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les grilles populaires
  async getPopularGrids(limit = 10) {
    try {
      const collection = await this.getCollection();

      const grids = await collection
        .find({ isPublic: true })
        .sort({ "stats.views": -1, "stats.likes": -1 })
        .limit(limit)
        .toArray();

      return grids.map((grid) => WeaponGrid.fromMongo(grid));
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les grilles récentes
  async getRecentGrids(limit = 10) {
    try {
      const collection = await this.getCollection();

      const grids = await collection
        .find({ isPublic: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      return grids.map((grid) => WeaponGrid.fromMongo(grid));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = WeaponGridService;
