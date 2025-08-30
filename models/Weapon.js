const { ObjectId } = require("mongodb");

class Weapon {
  constructor(data) {
    this.name = data.name;
    this.title = data.title;
    this.type = data.type;
    this.element = data.element;
    this.rarity = data.rarity;
    this.series = data.series;
    this.grp = data.grp;

    this.atk1 = data.atk1;
    this.atk2 = data.atk2;
    this.atk3 = data.atk3;
    this.atk4 = data.atk4;
    this.atk5 = data.atk5;
    this.hp1 = data.hp1;
    this.hp2 = data.hp2;
    this.hp3 = data.hp3;
    this.hp4 = data.hp4;
    this.hp5 = data.hp5;

    this.evo_min = data.evo_min;
    this.evo_base = data.evo_base;
    this.evo_max = data.evo_max;
    this.evo_red = data.evo_red;

    this.ca1_name = data.ca1_name;
    this.ca1_desc = data.ca1_desc;
    this.ca2_name = data.ca2_name;
    this.ca2_desc = data.ca2_desc;
    this.ca3_name = data.ca3_name;
    this.ca3_desc = data.ca3_desc;

    this.ca_mul0 = data.ca_mul0;
    this.ca_mul3 = data.ca_mul3;
    this.ca_mul4 = data.ca_mul4;
    this.ca_mul5 = data.ca_mul5;
    this.ca_mul6 = data.ca_mul6;
    this.ca_cap0 = data.ca_cap0;
    this.ca_cap3 = data.ca_cap3;
    this.ca_cap4 = data.ca_cap4;
    this.ca_cap5 = data.ca_cap5;
    this.ca_cap6 = data.ca_cap6;

    this.s1_name = data.s1_name;
    this.s1_desc = data.s1_desc;
    this.s1_lvl = data.s1_lvl;
    this.s2_name = data.s2_name;
    this.s2_desc = data.s2_desc;
    this.s2_lvl = data.s2_lvl;
    this.s3_name = data.s3_name;
    this.s3_desc = data.s3_desc;
    this.s3_lvl = data.s3_lvl;

    this.img_full = data.img_full;
    this.img_icon = data.img_icon;
    this.img_square = data.img_square;
    this.img_tall = data.img_tall;

    this.bullets = data.bullets;
    this.bullet1 = data.bullet1;
    this.bullet2 = data.bullet2;
    this.bullet3 = data.bullet3;
    this.bullet4 = data.bullet4;
    this.bullet5 = data.bullet5;
    this.bullet6 = data.bullet6;
    this.bullet7 = data.bullet7;
    this.bullet8 = data.bullet8;
    this.bullet9 = data.bullet9;

    this.filters = data.filters || [];

    this.any_weapon = data.any_weapon;
    this.arcarum = data.arcarum;
    this.awakening = data.awakening;
    this.awakening_type1 = data.awakening_type1;
    this.awakening_type2 = data.awakening_type2;
    this.parent = data.parent;
    this.slot11_req = data.slot11_req;

    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Valide les données d'arme
   */
  static validate(data) {
    const errors = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push("Le nom de l'arme est requis");
    }

    if (!data.type || data.type.trim().length === 0) {
      errors.push("Le type d'arme est requis");
    }

    if (!data.element || data.element.trim().length === 0) {
      errors.push("L'élément de l'arme est requis");
    }

    if (!data.rarity || data.rarity.trim().length === 0) {
      errors.push("La rareté de l'arme est requise");
    }

    return errors;
  }

  /**
   * Valide les statistiques de l'arme
   */
  static validateStats(data) {
    const errors = [];

    if (data.atk1 && (isNaN(data.atk1) || data.atk1 < 0)) {
      errors.push("ATK1 doit être un nombre positif");
    }

    if (data.hp1 && (isNaN(data.hp1) || data.hp1 < 0)) {
      errors.push("HP1 doit être un nombre positif");
    }

    return errors;
  }

  /**
   * Valide l'évolution de l'arme
   */
  static validateEvolution(data) {
    const errors = [];

    if (data.evo_min && (isNaN(data.evo_min) || data.evo_min < 0)) {
      errors.push("EVO_MIN doit être un nombre positif");
    }

    if (data.evo_max && (isNaN(data.evo_max) || data.evo_max < 0)) {
      errors.push("EVO_MAX doit être un nombre positif");
    }

    return errors;
  }

  /**
   * Convertit l'objet pour MongoDB
   */
  toMongo() {
    return {
      name: this.name,
      title: this.title,
      type: this.type,
      element: this.element,
      rarity: this.rarity,
      series: this.series,
      grp: this.grp,

      atk1: this.atk1,
      atk2: this.atk2,
      atk3: this.atk3,
      atk4: this.atk4,
      atk5: this.atk5,
      hp1: this.hp1,
      hp2: this.hp2,
      hp3: this.hp3,
      hp4: this.hp4,
      hp5: this.hp5,

      evo_min: this.evo_min,
      evo_base: this.evo_base,
      evo_max: this.evo_max,
      evo_red: this.evo_red,

      ca1_name: this.ca1_name,
      ca1_desc: this.ca1_desc,
      ca2_name: this.ca2_name,
      ca2_desc: this.ca2_desc,
      ca3_name: this.ca3_name,
      ca3_desc: this.ca3_desc,

      ca_mul0: this.ca_mul0,
      ca_mul3: this.ca_mul3,
      ca_mul4: this.ca_mul4,
      ca_mul5: this.ca_mul5,
      ca_mul6: this.ca_mul6,
      ca_cap0: this.ca_cap0,
      ca_cap3: this.ca_cap3,
      ca_cap4: this.ca_cap4,
      ca_cap5: this.ca_cap5,
      ca_cap6: this.ca_cap6,

      s1_name: this.s1_name,
      s1_desc: this.s1_desc,
      s1_lvl: this.s1_lvl,
      s2_name: this.s2_name,
      s2_desc: this.s2_desc,
      s2_lvl: this.s2_lvl,
      s3_name: this.s3_name,
      s3_desc: this.s3_desc,
      s3_lvl: this.s3_lvl,

      img_full: this.img_full,
      img_icon: this.img_icon,
      img_square: this.img_square,
      img_tall: this.img_tall,

      bullets: this.bullets,
      bullet1: this.bullet1,
      bullet2: this.bullet2,
      bullet3: this.bullet3,
      bullet4: this.bullet4,
      bullet5: this.bullet5,
      bullet6: this.bullet6,
      bullet7: this.bullet7,
      bullet8: this.bullet8,
      bullet9: this.bullet9,

      filters: this.filters,

      any_weapon: this.any_weapon,
      arcarum: this.arcarum,
      awakening: this.awakening,
      awakening_type1: this.awakening_type1,
      awakening_type2: this.awakening_type2,
      parent: this.parent,
      slot11_req: this.slot11_req,

      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Crée une arme depuis un document MongoDB
   */
  static fromMongo(doc) {
    if (!doc) return null;

    return {
      _id: doc._id,
      name: doc.name,
      title: doc.title,
      type: doc.type,
      element: doc.element,
      rarity: doc.rarity,
      series: doc.series,
      grp: doc.grp,

      atk1: doc.atk1,
      atk2: doc.atk2,
      atk3: doc.atk3,
      atk4: doc.atk4,
      atk5: doc.atk5,
      hp1: doc.hp1,
      hp2: doc.hp2,
      hp3: doc.hp3,
      hp4: doc.hp4,
      hp5: doc.hp5,

      evo_min: doc.evo_min,
      evo_base: doc.evo_base,
      evo_max: doc.evo_max,
      evo_red: doc.evo_red,

      ca1_name: doc.ca1_name,
      ca1_desc: doc.ca1_desc,
      ca2_name: doc.ca2_name,
      ca2_desc: doc.ca2_desc,
      ca3_name: doc.ca3_name,
      ca3_desc: doc.ca3_desc,

      ca_mul0: doc.ca_mul0,
      ca_mul3: doc.ca_mul3,
      ca_mul4: doc.ca_mul4,
      ca_mul5: doc.ca_mul5,
      ca_mul6: doc.ca_mul6,
      ca_cap0: doc.ca_cap0,
      ca_cap3: doc.ca_cap3,
      ca_cap4: doc.ca_cap4,
      ca_cap5: doc.ca_cap5,
      ca_cap6: doc.ca_cap6,

      s1_name: doc.s1_name,
      s1_desc: doc.s1_desc,
      s1_lvl: doc.s1_lvl,
      s2_name: doc.s2_name,
      s2_desc: doc.s2_desc,
      s2_lvl: doc.s2_lvl,
      s3_name: doc.s3_name,
      s3_desc: doc.s3_desc,
      s3_lvl: doc.s3_lvl,

      img_full: doc.img_full,
      img_icon: doc.img_icon,
      img_square: doc.img_square,
      img_tall: doc.img_tall,

      bullets: doc.bullets,
      bullet1: doc.bullet1,
      bullet2: doc.bullet2,
      bullet3: doc.bullet3,
      bullet4: doc.bullet4,
      bullet5: doc.bullet5,
      bullet6: doc.bullet6,
      bullet7: doc.bullet7,
      bullet8: doc.bullet8,
      bullet9: doc.bullet9,

      filters: doc.filters,

      any_weapon: doc.any_weapon,
      arcarum: doc.arcarum,
      awakening: doc.awakening,
      awakening_type1: doc.awakening_type1,
      awakening_type2: doc.awakening_type2,
      parent: doc.parent,
      slot11_req: doc.slot11_req,

      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Méthodes utilitaires pour les armes
   */
  static getMaxStats(weapon) {
    return {
      atk:
        weapon.atk5 || weapon.atk4 || weapon.atk3 || weapon.atk2 || weapon.atk1,
      hp: weapon.hp5 || weapon.hp4 || weapon.hp3 || weapon.hp2 || weapon.hp1,
    };
  }

  static getBaseStats(weapon) {
    return {
      atk: weapon.atk1,
      hp: weapon.hp1,
    };
  }

  static isMaxEvolved(weapon) {
    return weapon.evo_max && weapon.evo_max >= 5;
  }

  static getEvolutionLevel(weapon) {
    return weapon.evo_max || 0;
  }
}

module.exports = Weapon;
