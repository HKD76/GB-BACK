const { ObjectId } = require("mongodb");
const Weapon = require("../models/Weapon");
const { connectMongo } = require("../config/database");

class WeaponService {
  constructor() {
    this.collectionName = "weapons";
  }

  // Obtenir la collection armes
  async getCollection() {
    const db = await connectMongo();
    return db.collection(this.collectionName);
  }

  // Créer une nouvelle arme
  async createWeapon(weaponData) {
    try {
      const collection = await this.getCollection();

      // Vérifier si l'arme existe déjà
      const existingWeapon = await collection.findOne({
        name: weaponData.name,
      });
      if (existingWeapon) {
        throw new Error("Une arme avec ce nom existe déjà");
      }

      // Créer l'arme
      const weapon = new Weapon(weaponData);
      const result = await collection.insertOne(weapon.toMongo());

      return {
        _id: result.insertedId,
        ...Weapon.fromMongo(
          await collection.findOne({ _id: result.insertedId })
        ),
      };
    } catch (error) {
      throw error;
    }
  }

  // Trouver une arme par ID
  async findById(weaponId) {
    try {
      const collection = await this.getCollection();
      const weapon = await collection.findOne({ _id: new ObjectId(weaponId) });
      return Weapon.fromMongo(weapon);
    } catch (error) {
      throw error;
    }
  }

  // Obtenir toutes les armes (avec pagination et filtres)
  async getAllWeapons(page = 1, limit = 10, filters = {}) {
    try {
      const collection = await this.getCollection();
      const skip = (page - 1) * limit;

      // Construire les filtres
      const query = {};
      if (filters.type) query.type = filters.type;
      if (filters.rarity) query.rarity = filters.rarity;
      if (filters.name) query.name = { $regex: filters.name, $options: "i" };
      if (filters.minDamage)
        query.damage = { $gte: parseInt(filters.minDamage) };
      if (filters.maxDamage) {
        if (query.damage) {
          query.damage.$lte = parseInt(filters.maxDamage);
        } else {
          query.damage = { $lte: parseInt(filters.maxDamage) };
        }
      }

      const weapons = await collection
        .find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await collection.countDocuments(query);

      return {
        weapons: weapons.map((weapon) => Weapon.fromMongo(weapon)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour une arme
  async updateWeapon(weaponId, updateData) {
    try {
      const collection = await this.getCollection();

      // Vérifier si le nouveau nom existe déjà
      if (updateData.name) {
        const existingWeapon = await collection.findOne({
          name: updateData.name,
          _id: { $ne: new ObjectId(weaponId) },
        });

        if (existingWeapon) {
          throw new Error("Une arme avec ce nom existe déjà");
        }
      }

      const updateFields = {
        ...updateData,
        updatedAt: new Date(),
      };

      const result = await collection.updateOne(
        { _id: new ObjectId(weaponId) },
        { $set: updateFields }
      );

      if (result.matchedCount === 0) {
        throw new Error("Arme non trouvée");
      }

      return await this.findById(weaponId);
    } catch (error) {
      throw error;
    }
  }

  // Supprimer une arme
  async deleteWeapon(weaponId) {
    try {
      const collection = await this.getCollection();

      const result = await collection.deleteOne({
        _id: new ObjectId(weaponId),
      });

      if (result.deletedCount === 0) {
        throw new Error("Arme non trouvée");
      }

      return { message: "Arme supprimée avec succès" };
    } catch (error) {
      throw error;
    }
  }

  // Rechercher des armes par nom
  async searchWeapons(searchTerm, limit = 10) {
    try {
      const collection = await this.getCollection();

      const weapons = await collection
        .find({ name: { $regex: searchTerm, $options: "i" } })
        .limit(limit)
        .toArray();

      return weapons.map((weapon) => Weapon.fromMongo(weapon));
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les statistiques des armes
  async getWeaponStats() {
    try {
      const collection = await this.getCollection();

      const stats = await collection
        .aggregate([
          {
            $group: {
              _id: null,
              totalWeapons: { $sum: 1 },
              avgDamage: { $avg: "$damage" },
              maxDamage: { $max: "$damage" },
              minDamage: { $min: "$damage" },
              avgWeight: { $avg: "$weight" },
            },
          },
        ])
        .toArray();

      const typeStats = await collection
        .aggregate([
          {
            $group: {
              _id: "$type",
              count: { $sum: 1 },
              avgDamage: { $avg: "$damage" },
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
            },
          },
          { $sort: { count: -1 } },
        ])
        .toArray();

      return {
        general: stats[0] || {},
        byType: typeStats,
        byRarity: rarityStats,
      };
    } catch (error) {
      throw error;
    }
  }

  // Ajouter une compétence à une arme
  async addSkillToWeapon(weaponId, skillId) {
    try {
      const collection = await this.getCollection();

      const result = await collection.updateOne(
        { _id: new ObjectId(weaponId) },
        {
          $addToSet: { skills: skillId },
          $set: { updatedAt: new Date() },
        }
      );

      if (result.matchedCount === 0) {
        throw new Error("Arme non trouvée");
      }

      return await this.findById(weaponId);
    } catch (error) {
      throw error;
    }
  }

  // Retirer une compétence d'une arme
  async removeSkillFromWeapon(weaponId, skillId) {
    try {
      const collection = await this.getCollection();

      const result = await collection.updateOne(
        { _id: new ObjectId(weaponId) },
        {
          $pull: { skills: skillId },
          $set: { updatedAt: new Date() },
        }
      );

      if (result.matchedCount === 0) {
        throw new Error("Arme non trouvée");
      }

      return await this.findById(weaponId);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new WeaponService();
