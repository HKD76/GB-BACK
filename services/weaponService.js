const { MongoClient } = require("mongodb");
require("dotenv").config();

class WeaponService {
  constructor() {
    this.mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017";
    this.dbName = process.env.DB_NAME || "gb_project";
  }

  async getCollection() {
    const client = new MongoClient(this.mongoUrl);
    await client.connect();
    return client.db(this.dbName).collection("weapons");
  }

  async getSkillsCollection() {
    const client = new MongoClient(this.mongoUrl);
    await client.connect();
    return client.db(this.dbName).collection("weapon_skills");
  }

  /**
   * Enrichit les armes avec les informations des skills
   */
  async enrichWeaponsWithSkills(weapons) {
    if (!weapons || weapons.length === 0) return weapons;

    try {
      const skillsCollection = await this.getSkillsCollection();

      const allSkills = await skillsCollection.find({}).toArray();
      const skillsMap = new Map();

      allSkills.forEach((skill) => {
        if (skill.name) {
          skillsMap.set(skill.name, skill);
        }
      });

      const enrichedWeapons = weapons.map((weapon) => {
        const enrichedWeapon = { ...weapon };

        if (weapon["s1 name"] && skillsMap.has(weapon["s1 name"])) {
          const skill1 = skillsMap.get(weapon["s1 name"]);
          enrichedWeapon.s1_details = {
            name: skill1.name,
            text: skill1.text,
            jpname: skill1.jpname,
            jptext: skill1.jptext,
          };
        }

        if (weapon["s2 name"] && skillsMap.has(weapon["s2 name"])) {
          const skill2 = skillsMap.get(weapon["s2 name"]);
          enrichedWeapon.s2_details = {
            name: skill2.name,
            text: skill2.text,
            jpname: skill2.jpname,
            jptext: skill2.jptext,
          };
        }

        if (weapon["s3 name"] && skillsMap.has(weapon["s3 name"])) {
          const skill3 = skillsMap.get(weapon["s3 name"]);
          enrichedWeapon.s3_details = {
            name: skill3.name,
            text: skill3.text,
            jpname: skill3.jpname,
            jptext: skill3.jptext,
          };
        }

        return enrichedWeapon;
      });

      return enrichedWeapons;
    } catch (error) {
      console.error(
        "Erreur lors de l'enrichissement des armes avec les skills:",
        error
      );
      return weapons;
    }
  }

  /**
   * Obtient toutes les armes avec pagination et filtres
   */
  async getAllWeapons(page = 1, limit = 10, filters = {}) {
    try {
      const collection = await this.getCollection();
      const skip = (page - 1) * limit;

      const query = {};
      if (filters.type) query.type = filters.type;
      if (filters.rarity) query.rarity = filters.rarity;
      if (filters.element) query.element = filters.element;
      if (filters.name) query.name = { $regex: filters.name, $options: "i" };
      if (filters.title) query.title = { $regex: filters.title, $options: "i" };
      if (filters.series) query.series = filters.series;
      if (filters.grp) query.grp = filters.grp;

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

      if (filters.evoMax) query.evo_max = parseInt(filters.evoMax);
      if (filters.evoBase) query.evo_base = parseInt(filters.evoBase);

      const total = await collection.countDocuments(query);
      const weapons = await collection
        .find(query)
        .skip(skip)
        .limit(limit)
        .toArray();

      const enrichedWeapons = await this.enrichWeaponsWithSkills(weapons);

      return {
        weapons: enrichedWeapons,
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

  /**
   * Obtient une arme par ID
   */
  async getWeaponById(id) {
    try {
      const collection = await this.getCollection();
      const weapon = await collection.findOne({ _id: id });

      if (!weapon) {
        return null;
      }

      const enrichedWeapon = await this.enrichWeaponsWithSkills([weapon]);
      return enrichedWeapon[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Recherche des armes par nom
   */
  async searchWeapons(searchTerm, page = 1, limit = 10) {
    try {
      const collection = await this.getCollection();
      const skip = (page - 1) * limit;

      const query = {
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { title: { $regex: searchTerm, $options: "i" } },
        ],
      };

      const total = await collection.countDocuments(query);
      const weapons = await collection
        .find(query)
        .skip(skip)
        .limit(limit)
        .toArray();

      const enrichedWeapons = await this.enrichWeaponsWithSkills(weapons);

      return {
        weapons: enrichedWeapons,
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

  /**
   * Obtient les statistiques des armes
   */
  async getWeaponStats() {
    try {
      const collection = await this.getCollection();

      const stats = await collection
        .aggregate([
          {
            $group: {
              _id: null,
              totalWeapons: { $sum: 1 },
              avgAtk: { $avg: "$atk2" },
              avgHp: { $avg: "$hp2" },
              maxAtk: { $max: "$atk2" },
              maxHp: { $max: "$hp2" },
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
            },
          },
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
        ])
        .toArray();

      return {
        general: stats[0] || {},
        byElement: elementStats,
        byRarity: rarityStats,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crée une nouvelle arme
   */
  async createWeapon(weaponData) {
    try {
      const collection = await this.getCollection();
      const result = await collection.insertOne(weaponData);
      return result.insertedId;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Met à jour une arme
   */
  async updateWeapon(id, updateData) {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: id },
        { $set: updateData }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Supprime une arme
   */
  async deleteWeapon(id) {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteOne({ _id: id });
      return result.deletedCount > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new WeaponService();
