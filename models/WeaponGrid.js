class WeaponGrid {
  constructor(data = {}) {
    this.name = data.name || "";
    this.description = data.description || "";
    this.userId = data.userId || null;
    this.isPublic = data.isPublic || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();

    this.weapons = data.weapons || {};

    this.summons = data.summons || {};

    this.metadata = data.metadata || {
      totalAtk: 0,
      totalHp: 0,
      weaponCount: 0,
      summonCount: 0,
      elements: [],
      rarities: [],
    };

    this.stats = data.stats || {
      views: 0,
      likes: 0,
      downloads: 0,
    };
  }

  /**
   * Valide les données de grille d'armes
   */
  static validate(data) {
    const errors = [];

    if (!data.name || data.name.trim() === "") {
      errors.push("Le nom de la grille est requis");
    }

    if (data.name && data.name.length > 100) {
      errors.push("Le nom de la grille ne peut pas dépasser 100 caractères");
    }

    if (data.description && data.description.length > 500) {
      errors.push("La description ne peut pas dépasser 500 caractères");
    }

    if (data.weapons) {
      Object.keys(data.weapons).forEach((slot) => {
        const weapon = data.weapons[slot];
        if (weapon && weapon.weaponId && !weapon.weaponData) {
          errors.push(
            `L'arme dans l'emplacement ${slot} doit avoir des données complètes`
          );
        }
        if (
          weapon &&
          weapon.selectedLevel &&
          ![1, 100, 150, 200, 250].includes(weapon.selectedLevel)
        ) {
          errors.push(
            `Le niveau de l'arme dans l'emplacement ${slot} doit être 1, 100, 150, 200 ou 250`
          );
        }
      });
    }

    if (data.summons) {
      Object.keys(data.summons).forEach((slot) => {
        const summon = data.summons[slot];
        if (summon && summon.summonId && !summon.summonData) {
          errors.push(
            `La summon dans l'emplacement ${slot} doit avoir des données complètes`
          );
        }
        if (
          summon &&
          summon.selectedLevel &&
          ![0, 1, 2, 3, 4, 5].includes(summon.selectedLevel)
        ) {
          errors.push(
            `Le niveau de la summon dans l'emplacement ${slot} doit être entre 0 et 5`
          );
        }
      });
    }

    return errors;
  }

  /**
   * Convertit l'objet pour MongoDB
   */
  toMongo() {
    return {
      name: this.name,
      description: this.description,
      userId: this.userId,
      isPublic: this.isPublic,
      weapons: this.weapons,
      summons: this.summons,
      metadata: this.metadata,
      stats: this.stats,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Crée une grille depuis un document MongoDB
   */
  static fromMongo(doc) {
    if (!doc) return null;
    return new WeaponGrid(doc);
  }

  /**
   * Méthodes utilitaires pour les grilles d'armes
   */
  static getElements(grid) {
    const elements = new Set();

    Object.values(grid.weapons).forEach((weapon) => {
      if (weapon && weapon.weaponData && weapon.weaponData.element) {
        elements.add(weapon.weaponData.element);
      }
    });

    Object.values(grid.summons).forEach((summon) => {
      if (summon && summon.summonData && summon.summonData.element) {
        elements.add(summon.summonData.element);
      }
    });

    return Array.from(elements);
  }

  static getRarities(grid) {
    const rarities = new Set();

    Object.values(grid.weapons).forEach((weapon) => {
      if (weapon && weapon.weaponData && weapon.weaponData.rarity) {
        rarities.add(weapon.weaponData.rarity);
      }
    });

    Object.values(grid.summons).forEach((summon) => {
      if (summon && summon.summonData && summon.summonData.rarity) {
        rarities.add(summon.summonData.rarity);
      }
    });

    return Array.from(rarities);
  }

  static calculateStats(grid) {
    let totalAtk = 0;
    let totalHp = 0;
    let weaponCount = 0;
    let summonCount = 0;

    Object.values(grid.weapons).forEach((weapon) => {
      if (weapon && weapon.weaponData) {
        const level = weapon.selectedLevel || 1;
        const atkKey = `atk${level}`;
        const hpKey = `hp${level}`;

        if (weapon.weaponData[atkKey]) {
          totalAtk += weapon.weaponData[atkKey];
        }
        if (weapon.weaponData[hpKey]) {
          totalHp += weapon.weaponData[hpKey];
        }
        weaponCount++;
      }
    });

    Object.values(grid.summons).forEach((summon) => {
      if (summon && summon.summonData) {
        const level = summon.selectedLevel || 0;
        const atkKey = `atk${level + 1}`;
        const hpKey = `hp${level + 1}`;

        if (summon.summonData[atkKey]) {
          totalAtk += summon.summonData[atkKey];
        }
        if (summon.summonData[hpKey]) {
          totalHp += summon.summonData[hpKey];
        }
        summonCount++;
      }
    });

    return {
      totalAtk,
      totalHp,
      weaponCount,
      summonCount,
      elements: this.getElements(grid),
      rarities: this.getRarities(grid),
    };
  }

  static addWeapon(grid, slot, weaponId, weaponData, level = 1) {
    if (slot < 1 || slot > 10) {
      throw new Error("L'emplacement d'arme doit être entre 1 et 10");
    }

    grid.weapons[slot] = {
      weaponId,
      weaponData,
      selectedLevel: level,
      addedAt: new Date(),
    };

    grid.metadata = this.calculateStats(grid);
    grid.updatedAt = new Date();

    return grid;
  }

  static addSummon(grid, slot, summonId, summonData, level = 0) {
    if (slot < 1 || slot > 6) {
      throw new Error("L'emplacement de summon doit être entre 1 et 6");
    }

    grid.summons[slot] = {
      summonId,
      summonData,
      selectedLevel: level,
      addedAt: new Date(),
    };

    grid.metadata = this.calculateStats(grid);
    grid.updatedAt = new Date();

    return grid;
  }

  static removeWeapon(grid, slot) {
    if (grid.weapons[slot]) {
      delete grid.weapons[slot];
      grid.metadata = this.calculateStats(grid);
      grid.updatedAt = new Date();
    }
    return grid;
  }

  static removeSummon(grid, slot) {
    if (grid.summons[slot]) {
      delete grid.summons[slot];
      grid.metadata = this.calculateStats(grid);
      grid.updatedAt = new Date();
    }
    return grid;
  }

  static incrementStats(grid, statType) {
    if (grid.stats && grid.stats[statType] !== undefined) {
      grid.stats[statType]++;
      grid.updatedAt = new Date();
    }
    return grid;
  }
}

module.exports = WeaponGrid;
