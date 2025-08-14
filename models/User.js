const { ObjectId } = require("mongodb");

class User {
  constructor(data) {
    this.username = data.username;
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Validation des données utilisateur
  static validate(data) {
    const errors = [];

    if (!data.username || data.username.length < 3) {
      errors.push("Le nom d'utilisateur doit contenir au moins 3 caractères");
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push("Email invalide");
    }

    if (!data.password || data.password.length < 6) {
      errors.push("Le mot de passe doit contenir au moins 6 caractères");
    }

    return errors;
  }

  // Validation d'email
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Convertir en objet pour MongoDB
  toMongo() {
    return {
      username: this.username,
      email: this.email,
      passwordHash: this.passwordHash,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Créer un utilisateur à partir d'un document MongoDB
  static fromMongo(doc) {
    if (!doc) return null;

    return {
      _id: doc._id,
      username: doc.username,
      email: doc.email,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

module.exports = User;
