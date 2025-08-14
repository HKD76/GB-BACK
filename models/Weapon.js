const { ObjectId } = require("mongodb");

class Weapon {
  constructor(data) {
    this.name = data.name;
    this.type = data.type;
    this.damage = data.damage;
    this.range = data.range;
    this.weight = data.weight;
    this.description = data.description;
    this.rarity = data.rarity;
    this.skills = data.skills || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Validation des données d'arme
  static validate(data) {
    const errors = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push("Le nom de l'arme est requis");
    }

    if (!data.type || data.type.trim().length === 0) {
      errors.push("Le type d'arme est requis");
    }

    if (!data.damage || isNaN(data.damage) || data.damage <= 0) {
      errors.push("Les dégâts doivent être un nombre positif");
    }

    if (data.range && (isNaN(data.range) || data.range < 0)) {
      errors.push("La portée doit être un nombre positif ou zéro");
    }

    if (data.weight && (isNaN(data.weight) || data.weight < 0)) {
      errors.push("Le poids doit être un nombre positif ou zéro");
    }

    if (
      data.rarity &&
      !["common", "uncommon", "rare", "epic", "legendary"].includes(data.rarity)
    ) {
      errors.push(
        "La rareté doit être: common, uncommon, rare, epic, ou legendary"
      );
    }

    return errors;
  }

  // Convertir en objet pour MongoDB
  toMongo() {
    return {
      name: this.name,
      type: this.type,
      damage: this.damage,
      range: this.range,
      weight: this.weight,
      description: this.description,
      rarity: this.rarity,
      skills: this.skills,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Créer une arme à partir d'un document MongoDB
  static fromMongo(doc) {
    if (!doc) return null;

    return {
      _id: doc._id,
      name: doc.name,
      type: doc.type,
      damage: doc.damage,
      range: doc.range,
      weight: doc.weight,
      description: doc.description,
      rarity: doc.rarity,
      skills: doc.skills,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

module.exports = Weapon;
