class Summon {
  constructor(data = {}) {
    this.unique_key = data.unique_key;
    this.id = data.id;
    this.summonid = data.summonid;

    this.name = data.name;
    this.series = data.series;
    this.series_text = data.series_text;
    this.rarity = data.rarity;
    this.element = data.element;
    this.arcarum = data.arcarum;
    this.jpname = data.jpname;

    this.release_date = data.release_date;
    this["4star_date"] = data["4star_date"];
    this["5star_date"] = data["5star_date"];
    this["6star_date"] = data["6star_date"];

    this.obtain = data.obtain;
    this.obtain_text = data.obtain_text;
    this.homescreen = data.homescreen;

    this.img_full = data.img_full;
    this.img_icon = data.img_icon;
    this.img_square = data.img_square;
    this.img_tall = data.img_tall;

    this.evo_min = data.evo_min;
    this.evo_base = data.evo_base;
    this.evo_max = data.evo_max;

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

    this.call_name = data.call_name;
    this.call1 = data.call1;
    this.call2 = data.call2;
    this.call3 = data.call3;
    this.call4 = data.call4;
    this.call5 = data.call5;
    this.call_t0 = data.call_t0;
    this.call_t1 = data.call_t1;
    this.call_t2 = data.call_t2;
    this.call_t3 = data.call_t3;
    this.call_t4 = data.call_t4;
    this.call_t5 = data.call_t5;
    this.call_reuse = data.call_reuse;
    this.comboable = data.comboable;

    this.call_cd_first1 = data.call_cd_first1;
    this.call_cd_first2 = data.call_cd_first2;
    this.call_cd_first3 = data.call_cd_first3;
    this.call_cd_first4 = data.call_cd_first4;
    this.call_cd_first5 = data.call_cd_first5;
    this.call_cd1 = data.call_cd1;
    this.call_cd2 = data.call_cd2;
    this.call_cd3 = data.call_cd3;
    this.call_cd4 = data.call_cd4;
    this.call_cd5 = data.call_cd5;

    this.combo1 = data.combo1;
    this.combo2 = data.combo2;

    this.aura1 = data.aura1;
    this.aura2 = data.aura2;
    this.aura3 = data.aura3;
    this.aura4 = data.aura4;
    this.aura5 = data.aura5;
    this.aura_t0 = data.aura_t0 || data["aura t0"];
    this.aura_t1 = data.aura_t1 || data["aura t1"];
    this.aura_t2 = data.aura_t2 || data["aura t2"];
    this.aura_t3 = data.aura_t3 || data["aura t3"];
    this.aura_t4 = data.aura_t4 || data["aura t4"];
    this.aura_t5 = data.aura_t5 || data["aura t5"];

    this.subaura1 = data.subaura1;
    this.subaura2 = data.subaura2;
    this.subaura3 = data.subaura3;
    this.subaura4 = data.subaura4;
    this.subaura5 = data.subaura5;
    this.subaura_t0 = data.subaura_t0 || data["subaura t0"];
    this.subaura_t1 = data.subaura_t1 || data["subaura t1"];
    this.subaura_t2 = data.subaura_t2 || data["subaura t2"];
    this.subaura_t3 = data.subaura_t3 || data["subaura t3"];
    this.subaura_t4 = data.subaura_t4 || data["subaura t4"];
    this.subaura_t5 = data.subaura_t5 || data["subaura t5"];

    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Valide les données d'invocation
   */
  static validate(data) {
    const errors = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push("Le nom de l'invocation est requis");
    }

    if (!data.element || data.element.trim().length === 0) {
      errors.push("L'élément de l'invocation est requis");
    }

    if (!data.rarity || data.rarity.trim().length === 0) {
      errors.push("La rareté de l'invocation est requise");
    }

    const validElements = [
      "fire",
      "water",
      "earth",
      "wind",
      "light",
      "dark",
      "null",
    ];
    if (data.element && !validElements.includes(data.element.toLowerCase())) {
      errors.push(
        `Élément invalide. Valeurs acceptées: ${validElements.join(", ")}`
      );
    }

    const validRarities = ["r", "sr", "ssr", "ur"];
    if (data.rarity && !validRarities.includes(data.rarity.toLowerCase())) {
      errors.push(
        `Rareté invalide. Valeurs acceptées: ${validRarities.join(", ")}`
      );
    }

    if (data.atk1 && (isNaN(data.atk1) || data.atk1 < 0)) {
      errors.push("ATK1 doit être un nombre positif");
    }

    if (data.atk2 && (isNaN(data.atk2) || data.atk2 < 0)) {
      errors.push("ATK2 doit être un nombre positif");
    }

    if (data.atk3 && (isNaN(data.atk3) || data.atk3 < 0)) {
      errors.push("ATK3 doit être un nombre positif");
    }

    if (data.atk4 && (isNaN(data.atk4) || data.atk4 < 0)) {
      errors.push("ATK4 doit être un nombre positif");
    }

    if (data.atk5 && (isNaN(data.atk5) || data.atk5 < 0)) {
      errors.push("ATK5 doit être un nombre positif");
    }

    if (data.hp1 && (isNaN(data.hp1) || data.hp1 < 0)) {
      errors.push("HP1 doit être un nombre positif");
    }

    if (data.hp2 && (isNaN(data.hp2) || data.hp2 < 0)) {
      errors.push("HP2 doit être un nombre positif");
    }

    if (data.hp3 && (isNaN(data.hp3) || data.hp3 < 0)) {
      errors.push("HP3 doit être un nombre positif");
    }

    if (data.hp4 && (isNaN(data.hp4) || data.hp4 < 0)) {
      errors.push("HP4 doit être un nombre positif");
    }

    if (data.hp5 && (isNaN(data.hp5) || data.hp5 < 0)) {
      errors.push("HP5 doit être un nombre positif");
    }

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
      unique_key: this.unique_key,
      id: this.id,
      summonid: this.summonid,
      name: this.name,
      series: this.series,
      series_text: this.series_text,
      rarity: this.rarity,
      element: this.element,
      arcarum: this.arcarum,
      jpname: this.jpname,
      release_date: this.release_date,
      "4star_date": this["4star_date"],
      "5star_date": this["5star_date"],
      "6star_date": this["6star_date"],
      obtain: this.obtain,
      obtain_text: this.obtain_text,
      homescreen: this.homescreen,
      img_full: this.img_full,
      img_icon: this.img_icon,
      img_square: this.img_square,
      img_tall: this.img_tall,
      evo_min: this.evo_min,
      evo_base: this.evo_base,
      evo_max: this.evo_max,
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
      call_name: this.call_name,
      call1: this.call1,
      call2: this.call2,
      call3: this.call3,
      call4: this.call4,
      call5: this.call5,
      "call t0": this.call_t0,
      "call t1": this.call_t1,
      "call t2": this.call_t2,
      "call t3": this.call_t3,
      "call t4": this.call_t4,
      "call t5": this.call_t5,
      call_reuse: this.call_reuse,
      comboable: this.comboable,
      call_cd_first1: this.call_cd_first1,
      call_cd_first2: this.call_cd_first2,
      call_cd_first3: this.call_cd_first3,
      call_cd_first4: this.call_cd_first4,
      call_cd_first5: this.call_cd_first5,
      call_cd1: this.call_cd1,
      call_cd2: this.call_cd2,
      call_cd3: this.call_cd3,
      call_cd4: this.call_cd4,
      call_cd5: this.call_cd5,
      combo1: this.combo1,
      combo2: this.combo2,
      aura1: this.aura1,
      aura2: this.aura2,
      aura3: this.aura3,
      aura4: this.aura4,
      aura5: this.aura5,
      "aura t0": this.aura_t0,
      "aura t1": this.aura_t1,
      "aura t2": this.aura_t2,
      "aura t3": this.aura_t3,
      "aura t4": this.aura_t4,
      "aura t5": this.aura_t5,
      subaura1: this.subaura1,
      subaura2: this.subaura2,
      subaura3: this.subaura3,
      subaura4: this.subaura4,
      subaura5: this.subaura5,
      "subaura t0": this.subaura_t0,
      "subaura t1": this.subaura_t1,
      "subaura t2": this.subaura_t2,
      "subaura t3": this.subaura_t3,
      "subaura t4": this.subaura_t4,
      "subaura t5": this.subaura_t5,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Crée une invocation depuis un document MongoDB
   */
  static fromMongo(doc) {
    if (!doc) return null;

    return {
      _id: doc._id,
      unique_key: doc.unique_key,
      id: doc.id,
      summonid: doc.summonid,
      name: doc.name,
      series: doc.series,
      series_text: doc.series_text,
      rarity: doc.rarity,
      element: doc.element,
      arcarum: doc.arcarum,
      jpname: doc.jpname,
      release_date: doc.release_date,
      "4star_date": doc["4star_date"],
      "5star_date": doc["5star_date"],
      "6star_date": doc["6star_date"],
      obtain: doc.obtain,
      obtain_text: doc.obtain_text,
      homescreen: doc.homescreen,
      img_full: doc.img_full,
      img_icon: doc.img_icon,
      img_square: doc.img_square,
      img_tall: doc.img_tall,
      evo_min: doc.evo_min,
      evo_base: doc.evo_base,
      evo_max: doc.evo_max,
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
      call_name: doc.call_name,
      call1: doc.call1,
      call2: doc.call2,
      call3: doc.call3,
      call4: doc.call4,
      call5: doc.call5,
      call_t0: doc.call_t0,
      call_t1: doc.call_t1,
      call_t2: doc.call_t2,
      call_t3: doc.call_t3,
      call_t4: doc.call_t4,
      call_t5: doc.call_t5,
      call_reuse: doc.call_reuse,
      comboable: doc.comboable,
      call_cd_first1: doc.call_cd_first1,
      call_cd_first2: doc.call_cd_first2,
      call_cd_first3: doc.call_cd_first3,
      call_cd_first4: doc.call_cd_first4,
      call_cd_first5: doc.call_cd_first5,
      call_cd1: doc.call_cd1,
      call_cd2: doc.call_cd2,
      call_cd3: doc.call_cd3,
      call_cd4: doc.call_cd4,
      call_cd5: doc.call_cd5,
      combo1: doc.combo1,
      combo2: doc.combo2,
      aura1: doc.aura1,
      aura2: doc.aura2,
      aura3: doc.aura3,
      aura4: doc.aura4,
      aura5: doc.aura5,
      aura_t0: doc.aura_t0,
      aura_t1: doc.aura_t1,
      aura_t2: doc.aura_t2,
      aura_t3: doc.aura_t3,
      aura_t4: doc.aura_t4,
      aura_t5: doc.aura_t5,
      subaura1: doc.subaura1,
      subaura2: doc.subaura2,
      subaura3: doc.subaura3,
      subaura4: doc.subaura4,
      subaura5: doc.subaura5,
      subaura_t0: doc.subaura_t0,
      subaura_t1: doc.subaura_t1,
      subaura_t2: doc.subaura_t2,
      subaura_t3: doc.subaura_t3,
      subaura_t4: doc.subaura_t4,
      subaura_t5: doc.subaura_t5,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Méthodes utilitaires pour les invocations
   */
  static getMaxStats(summon) {
    return {
      atk:
        summon.atk5 || summon.atk4 || summon.atk3 || summon.atk2 || summon.atk1,
      hp: summon.hp5 || summon.hp4 || summon.hp3 || summon.hp2 || summon.hp1,
    };
  }

  static getBaseStats(summon) {
    return {
      atk: summon.atk1,
      hp: summon.hp1,
    };
  }

  static isMaxEvolved(summon) {
    return summon.evo_max && summon.evo_max >= 5;
  }

  static getEvolutionLevel(summon) {
    return summon.evo_max || 0;
  }
}

module.exports = Summon;
