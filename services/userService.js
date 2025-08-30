const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const User = require("../models/User");
const { connectMongo } = require("../config/database");

class UserService {
  constructor() {
    this.collectionName = "users";
  }

  /**
   * Obtient la collection utilisateurs
   */
  async getCollection() {
    const db = await connectMongo();
    return db.collection(this.collectionName);
  }

  /**
   * Crée un nouvel utilisateur
   */
  async createUser(userData) {
    try {
      const collection = await this.getCollection();

      const existingUser = await collection.findOne({
        $or: [{ username: userData.username }, { email: userData.email }],
      });

      if (existingUser) {
        throw new Error("Nom d'utilisateur ou email déjà utilisé");
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      const user = new User({
        ...userData,
        passwordHash,
      });

      const result = await collection.insertOne(user.toMongo());

      return {
        _id: result.insertedId,
        ...User.fromMongo(await collection.findOne({ _id: result.insertedId })),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Trouve un utilisateur par ID
   */
  async findById(userId) {
    try {
      const collection = await this.getCollection();
      const user = await collection.findOne({ _id: new ObjectId(userId) });
      return User.fromMongo(user);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Trouve un utilisateur par nom d'utilisateur ou email
   */
  async findByUsernameOrEmail(identifier) {
    try {
      const collection = await this.getCollection();
      const user = await collection.findOne({
        $or: [{ username: identifier }, { email: identifier }],
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtient tous les utilisateurs avec pagination
   */
  async getAllUsers(page = 1, limit = 10) {
    try {
      const collection = await this.getCollection();
      const skip = (page - 1) * limit;

      const users = await collection
        .find({}, { passwordHash: 0 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await collection.countDocuments();

      return {
        users: users.map((user) => User.fromMongo(user)),
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
   * Met à jour un utilisateur
   */
  async updateUser(userId, updateData) {
    try {
      const collection = await this.getCollection();

      if (updateData.email || updateData.username) {
        const existingUser = await collection.findOne({
          $and: [
            {
              $or: [
                { username: updateData.username },
                { email: updateData.email },
              ],
            },
            { _id: { $ne: new ObjectId(userId) } },
          ],
        });

        if (existingUser) {
          throw new Error("Nom d'utilisateur ou email déjà utilisé");
        }
      }

      const updateFields = {
        ...updateData,
        updatedAt: new Date(),
      };

      const result = await collection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: updateFields }
      );

      if (result.matchedCount === 0) {
        throw new Error("Utilisateur non trouvé");
      }

      return await this.findById(userId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change le mot de passe d'un utilisateur
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const collection = await this.getCollection();

      const user = await collection.findOne({ _id: new ObjectId(userId) });

      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

      if (!isValidPassword) {
        throw new Error("Ancien mot de passe incorrect");
      }

      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      await collection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            passwordHash: newPasswordHash,
            updatedAt: new Date(),
          },
        }
      );

      return { message: "Mot de passe modifié avec succès" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Supprime un utilisateur
   */
  async deleteUser(userId) {
    try {
      const collection = await this.getCollection();

      const result = await collection.deleteOne({ _id: new ObjectId(userId) });

      if (result.deletedCount === 0) {
        throw new Error("Utilisateur non trouvé");
      }

      return { message: "Utilisateur supprimé avec succès" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Vérifie les identifiants de connexion
   */
  async verifyCredentials(identifier, password) {
    try {
      const user = await this.findByUsernameOrEmail(identifier);

      if (!user) {
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        return null;
      }

      return User.fromMongo(user);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();
