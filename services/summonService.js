const { MongoClient } = require("mongodb");
const Summon = require("../models/Summon");
require("dotenv").config();

class SummonService {
  constructor() {
    this.mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017";
    this.dbName = process.env.DB_NAME || "gb_project";
  }

  async getCollection() {
    const client = new MongoClient(this.mongoUrl);
    await client.connect();
    return client.db(this.dbName).collection("summons");
  }

  // Créer un nouveau summon
  async createSummon(summonData) {
    try {
      const collection = await this.getCollection();

      // Validation
      const validationErrors = Summon.validate(summonData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      const summon = new Summon(summonData);
      const result = await collection.insertOne(summon.toMongo());
      return result.insertedId;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer un summon par ID
  async getSummonById(id) {
    try {
      const collection = await this.getCollection();
      const summon = await collection.findOne({ _id: id });
      return Summon.fromMongo(summon);
    } catch (error) {
      throw error;
    }
  }

  // Récupérer un summon par unique_key
  async getSummonByUniqueKey(uniqueKey) {
    try {
      const collection = await this.getCollection();
      const summon = await collection.findOne({ unique_key: uniqueKey });
      return Summon.fromMongo(summon);
    } catch (error) {
      throw error;
    }
  }

  // Récupérer tous les summons avec pagination et filtres
  async getAllSummons(page = 1, limit = 10, filters = {}) {
    try {
      const collection = await this.getCollection();

      // Construire la requête de filtrage
      const query = {};

      if (filters.element) query.element = filters.element;
      if (filters.rarity) query.rarity = filters.rarity;
      if (filters.series) query.series = filters.series;
      if (filters.name) query.name = { $regex: filters.name, $options: "i" };
      if (filters.arcarum) query.arcarum = filters.arcarum;

      // Filtres sur les statistiques
      if (filters.minAtk) query.atk2 = { $gte: parseInt(filters.minAtk) };
      if (filters.maxAtk) {
        if (query.atk2) {
          query.atk2.$lte = parseInt(filters.maxAtk);
        } else {
          query.atk2 = { $lte: parseInt(filters.maxAtk) };
        }
      }

      if (filters.minHp) query.hp2 = { $gte: parseInt(filters.minHp) };
      if (filters.maxHp) {
        if (query.hp2) {
          query.hp2.$lte = parseInt(filters.maxHp);
        } else {
          query.hp2 = { $lte: parseInt(filters.maxHp) };
        }
      }

      // Filtres sur l'évolution
      if (filters.evoMax) query.evo_max = parseInt(filters.evoMax);
      if (filters.evoBase) query.evo_base = parseInt(filters.evoBase);

      // Compter le total
      const totalSummons = await collection.countDocuments(query);
      const totalPages = Math.ceil(totalSummons / limit);
      const skip = (page - 1) * limit;

      // Récupérer les summons
      const summons = await collection
        .find(query)
        .skip(skip)
        .limit(limit)
        .toArray();

      return {
        summons: summons.map((summon) => Summon.fromMongo(summon)),
        pagination: {
          currentPage: page,
          totalPages,
          totalSummons,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Rechercher des summons
  async searchSummons(searchTerm, page = 1, limit = 10) {
    try {
      const collection = await this.getCollection();

      const query = {
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { series: { $regex: searchTerm, $options: "i" } },
          { call_name: { $regex: searchTerm, $options: "i" } },
          { jpname: { $regex: searchTerm, $options: "i" } },
        ],
      };

      const totalSummons = await collection.countDocuments(query);
      const totalPages = Math.ceil(totalSummons / limit);
      const skip = (page - 1) * limit;

      const summons = await collection
        .find(query)
        .skip(skip)
        .limit(limit)
        .toArray();

      return {
        summons: summons.map((summon) => Summon.fromMongo(summon)),
        pagination: {
          currentPage: page,
          totalPages,
          totalSummons,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour un summon
  async updateSummon(id, updateData) {
    try {
      const collection = await this.getCollection();

      updateData.updated_at = new Date();
      const result = await collection.updateOne(
        { _id: id },
        { $set: updateData }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Supprimer un summon
  async deleteSummon(id) {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteOne({ _id: id });
      return result.deletedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les statistiques des summons
  async getSummonStats() {
    try {
      const collection = await this.getCollection();

      const stats = await collection
        .aggregate([
          {
            $group: {
              _id: null,
              totalSummons: { $sum: 1 },
              avgAtk: { $avg: "$atk2" },
              maxAtk: { $max: "$atk2" },
              minAtk: { $min: "$atk2" },
              avgHp: { $avg: "$hp2" },
              maxHp: { $max: "$hp2" },
              minHp: { $min: "$hp2" },
            },
          },
        ])
        .toArray();

      const elementStats = await collection
        .aggregate([
          {
            $group: {
              _id: "$element",
              count: { $sum: 1 },
              avgAtk: { $avg: "$atk2" },
              avgHp: { $avg: "$hp2" },
            },
          },
          { $sort: { count: -1 } },
        ])
        .toArray();

      const rarityStats = await collection
        .aggregate([
          {
            $group: {
              _id: "$rarity",
              count: { $sum: 1 },
              avgAtk: { $avg: "$atk2" },
              avgHp: { $avg: "$hp2" },
            },
          },
          { $sort: { count: -1 } },
        ])
        .toArray();

      const seriesStats = await collection
        .aggregate([
          {
            $group: {
              _id: "$series",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ])
        .toArray();

      return {
        general: stats[0] || {},
        byElement: elementStats,
        byRarity: rarityStats,
        bySeries: seriesStats,
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les summons par élément
  async getSummonsByElement(element, page = 1, limit = 10) {
    try {
      const collection = await this.getCollection();

      const query = { element: element.toLowerCase() };
      const totalSummons = await collection.countDocuments(query);
      const totalPages = Math.ceil(totalSummons / limit);
      const skip = (page - 1) * limit;

      const summons = await collection
        .find(query)
        .skip(skip)
        .limit(limit)
        .toArray();

      return {
        summons: summons.map((summon) => Summon.fromMongo(summon)),
        pagination: {
          currentPage: page,
          totalPages,
          totalSummons,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        element: element,
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les summons par rareté
  async getSummonsByRarity(rarity, page = 1, limit = 10) {
    try {
      const collection = await this.getCollection();

      const query = { rarity: rarity.toUpperCase() };
      const totalSummons = await collection.countDocuments(query);
      const totalPages = Math.ceil(totalSummons / limit);
      const skip = (page - 1) * limit;

      const summons = await collection
        .find(query)
        .skip(skip)
        .limit(limit)
        .toArray();

      return {
        summons: summons.map((summon) => Summon.fromMongo(summon)),
        pagination: {
          currentPage: page,
          totalPages,
          totalSummons,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        rarity: rarity,
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les éléments disponibles
  async getAvailableElements() {
    try {
      const collection = await this.getCollection();
      const elements = await collection.distinct("element");
      return elements.sort();
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les raretés disponibles
  async getAvailableRarities() {
    try {
      const collection = await this.getCollection();
      const rarities = await collection.distinct("rarity");
      return rarities.sort();
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les séries disponibles
  async getAvailableSeries() {
    try {
      const collection = await this.getCollection();
      const series = await collection.distinct("series");
      return series.filter((s) => s).sort();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new SummonService();
