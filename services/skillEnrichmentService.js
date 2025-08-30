const { MongoClient } = require("mongodb");
require("dotenv").config();

class SkillEnrichmentService {
  constructor() {
    this.mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017";
    this.dbName = process.env.DB_NAME || "gb_project";
    this.skillsStatsCache = new Map(); // Cache pour les skills_stats
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.lastCacheUpdate = 0;
  }

  async getSkillsStatsCollection() {
    const client = new MongoClient(this.mongoUrl);
    await client.connect();
    return client.db(this.dbName).collection("skills_stats");
  }

  // Charger tous les skills_stats en cache pour éviter les requêtes multiples
  async loadSkillsStatsCache() {
    const now = Date.now();

    // Vérifier si le cache est encore valide
    if (
      this.skillsStatsCache.size > 0 &&
      now - this.lastCacheUpdate < this.cacheTimeout
    ) {
      return;
    }

    try {
      console.log("🔄 Chargement du cache skills_stats...");
      const collection = await this.getSkillsStatsCollection();
      const allSkillsStats = await collection.find({}).toArray();

      // Vider le cache existant
      this.skillsStatsCache.clear();

      // Remplir le cache
      allSkillsStats.forEach((skill) => {
        this.skillsStatsCache.set(skill.name.toLowerCase(), skill);
      });

      this.lastCacheUpdate = now;
      console.log(
        `✅ Cache skills_stats chargé: ${this.skillsStatsCache.size} skills`
      );
    } catch (error) {
      console.error(
        "❌ Erreur lors du chargement du cache skills_stats:",
        error
      );
    }
  }

  // Décoder les entités HTML
  decodeHtmlEntities(text) {
    if (!text) return text;
    return text
      .replace(/&#039;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  }

  // Parser le nom d'un skill pour extraire l'élément et le type
  parseSkillName(skillName) {
    if (!skillName) return null;

    // Décoder les entités HTML
    skillName = this.decodeHtmlEntities(skillName);

    // Patterns courants pour les noms de skills
    const patterns = [
      // Pattern: "Element's SkillType" (ex: "Fire's Might", "Wind's Aegis")
      /^([A-Za-z]+)'s\s+([A-Za-z\s]+)$/,
      // Pattern: "Element SkillType" (ex: "Fire Might", "Wind Aegis")
      /^([A-Za-z]+)\s+([A-Za-z\s]+)$/,
      // Pattern: "ElementSkillType" (ex: "FireMight", "WindAegis")
      /^([A-Za-z]+)([A-Z][a-z\s]+)$/,
    ];

    for (const pattern of patterns) {
      const match = skillName.match(pattern);
      if (match) {
        const element = match[1].toLowerCase();
        const skillType = match[2].trim();
        return { element, skillType };
      }
    }

    // Si aucun pattern ne correspond, essayer de deviner
    return this.guessSkillInfo(skillName);
  }

  // Extraire le type de skill à partir du nom complet
  extractSkillType(skillName) {
    if (!skillName) return null;

    // Décoder les entités HTML
    skillName = this.decodeHtmlEntities(skillName);

    // Pattern: "Element's SkillType" - extraire seulement SkillType
    const match = skillName.match(/^[A-Za-z]+'s\s+([A-Za-z\s]+)$/);
    if (match) {
      let skillType = match[1].trim();

      // Supprimer les suffixes "II", "III", "IV", etc.
      skillType = skillType.replace(/\s+(II|III|IV|V|VI|VII|VIII|IX|X)$/i, "");

      return skillType;
    }

    // Pattern: "Element SkillType" - extraire seulement SkillType
    const match2 = skillName.match(/^[A-Za-z]+\s+([A-Za-z\s]+)$/);
    if (match2) {
      let skillType = match2[1].trim();

      // Supprimer les suffixes "II", "III", "IV", etc.
      skillType = skillType.replace(/\s+(II|III|IV|V|VI|VII|VIII|IX|X)$/i, "");

      return skillType;
    }

    return null;
  }

  // Ajuster le niveau de skill selon les suffixes (II, III, etc.)
  adjustSkillLevelForSuffix(skillName, baseSkillLevel) {
    if (!skillName) return baseSkillLevel;

    // Décoder les entités HTML
    skillName = this.decodeHtmlEntities(skillName);

    // Détecter les suffixes et ajuster le niveau
    if (skillName.includes(" II")) {
      return Math.min(baseSkillLevel + 5, 20); // +5 niveaux, max 20
    } else if (skillName.includes(" III")) {
      return Math.min(baseSkillLevel + 10, 20); // +10 niveaux, max 20
    } else if (skillName.includes(" IV")) {
      return Math.min(baseSkillLevel + 15, 20); // +15 niveaux, max 20
    } else if (skillName.includes(" V")) {
      return Math.min(baseSkillLevel + 20, 20); // +20 niveaux, max 20
    }

    return baseSkillLevel;
  }

  // Deviner les informations du skill si le parsing échoue
  guessSkillInfo(skillName) {
    const skillNameLower = skillName.toLowerCase();

    // Mapping des éléments
    const elements = ["fire", "water", "earth", "wind", "light", "dark"];
    const foundElement = elements.find((element) =>
      skillNameLower.includes(element)
    );

    // Mapping des types de skills courants
    const skillTypes = [
      "Might",
      "Aegis",
      "Stamina",
      "Enmity",
      "Critical",
      "Verity",
      "Celere",
      "Trium",
      "Primacy",
      "Fandango",
      "Devastation",
      "Dual-Edge",
      "Restraint",
      "Spearhead",
      "Sapience",
      "Sentence",
      "Glory",
      "Mystery",
      "Excelsior",
      "Arts",
      "Strike",
      "Healing",
      "Grace",
      "Majesty",
      "Bladeshield",
      "Heroism",
      "Encouragement",
      "Auspice",
      "Precocity",
    ];

    const foundSkillType = skillTypes.find((type) =>
      skillNameLower.includes(type.toLowerCase())
    );

    return {
      element: foundElement || "unknown",
      skillType: foundSkillType || "unknown",
    };
  }

  // Récupérer les informations détaillées d'un skill depuis le cache
  async getSkillStats(skillType) {
    try {
      // S'assurer que le cache est chargé
      await this.loadSkillsStatsCache();

      // Chercher dans le cache
      const skillStats = this.skillsStatsCache.get(skillType.toLowerCase());
      return skillStats || null;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des stats pour ${skillType}:`,
        error
      );
      return null;
    }
  }

  // Déterminer le modifier (Small, Medium, Big, etc.) depuis le texte du skill
  determineModifier(skillText) {
    if (!skillText) return "unknown";

    const text = skillText.toLowerCase();

    // Mapping des modificateurs
    const modifiers = [
      { keywords: ["small", "slight"], value: "Small" },
      { keywords: ["medium"], value: "Medium" },
      { keywords: ["big", "large"], value: "Big" },
      { keywords: ["big ii", "big 2"], value: "Big II" },
      { keywords: ["massive"], value: "Massive" },
      { keywords: ["unworldly"], value: "Unworldly" },
      { keywords: ["ancestral"], value: "Ancestral" },
    ];

    for (const modifier of modifiers) {
      if (modifier.keywords.some((keyword) => text.includes(keyword))) {
        return modifier.value;
      }
    }

    return "Small"; // Par défaut
  }

  // Calculer les valeurs selon le skill level et le modifier
  calculateSkillValues(skillStats, modifier, skillLevel = 10) {
    if (!skillStats || !skillStats.tables || skillStats.tables.length === 0) {
      return null;
    }

    const results = {};

    for (const table of skillStats.tables) {
      if (!table.rows) continue;

      // Trouver TOUTES les lignes correspondant au modifier
      const modifierRows = table.rows.filter(
        (row) =>
          row.modifier &&
          row.modifier.toLowerCase().includes(modifier.toLowerCase())
      );

      if (modifierRows.length > 0) {
        // Créer un tableau pour toutes les stats de ce modifier
        const stats = [];

        for (const modifierRow of modifierRows) {
          // Extraire les valeurs selon le skill level
          const values = {};
          for (const [key, value] of Object.entries(modifierRow)) {
            if (key !== "modifier" && key !== "stat" && value) {
              values[key] = value;
            }
          }

          stats.push({
            modifier: modifierRow.modifier,
            stat: modifierRow.stat,
            values: values,
            skillLevel: skillLevel,
          });
        }

        results[table.title || "default"] = {
          modifier: modifier,
          stats: stats,
          skillLevel: skillLevel,
        };
      }
    }

    return results;
  }

  // Enrichir un skill avec toutes les informations calculées
  async enrichSkill(skillName, skillText, skillLevel = 10) {
    try {
      // Parser le nom du skill pour obtenir élément et type
      const parsed = this.parseSkillName(skillName);
      if (!parsed) {
        return {
          originalName: skillName,
          originalText: skillText,
          error: "Impossible de parser le nom du skill",
        };
      }

      // Extraire le type de skill (ex: "Might" depuis "Earth's Might")
      const skillType = this.extractSkillType(skillName);
      if (!skillType) {
        return {
          originalName: skillName,
          originalText: skillText,
          error: "Impossible d'extraire le type de skill",
        };
      }

      // Ajuster le niveau de skill selon les suffixes
      const adjustedSkillLevel = this.adjustSkillLevelForSuffix(
        skillName,
        skillLevel
      );

      // Récupérer les stats du skill
      const skillStats = await this.getSkillStats(skillType);
      if (!skillStats) {
        return {
          originalName: skillName,
          originalText: skillText,
          error: "Stats du skill non trouvées",
        };
      }

      // Déterminer le modifier
      const modifier = this.determineModifier(skillText);

      // Calculer les valeurs selon le skill level ajusté
      const calculatedValues = this.calculateSkillValues(
        skillStats,
        modifier,
        adjustedSkillLevel
      );

      return {
        originalName: skillName,
        originalText: skillText,
        parsed: parsed, // Contient { element: "earth", skillType: "Might" }
        skillType: skillType, // Le type extrait pour la recherche
        skillStats: {
          name: skillStats.name,
          description: skillStats.description,
          notes: skillStats.notes,
        },
        modifier: modifier,
        calculatedValues: calculatedValues,
        skillLevel: adjustedSkillLevel,
        originalSkillLevel: skillLevel,
      };
    } catch (error) {
      console.error("Erreur lors de l'enrichissement du skill:", error);
      return {
        originalName: skillName,
        originalText: skillText,
        error: "Erreur lors de l'enrichissement",
      };
    }
  }

  // Enrichir tous les skills d'une arme
  async enrichWeaponSkills(weapon) {
    const enrichedWeapon = { ...weapon };
    const skillsToEnrich = [];

    // Identifier les skills à enrichir
    if (weapon["s1 name"]) {
      skillsToEnrich.push({
        field: "s1",
        name: weapon["s1 name"],
        text: weapon["s1 desc"],
        level: weapon["s1 lvl"] || 10,
      });
    }
    if (weapon["s2 name"]) {
      skillsToEnrich.push({
        field: "s2",
        name: weapon["s2 name"],
        text: weapon["s2 desc"],
        level: weapon["s2 lvl"] || 10,
      });
    }
    if (weapon["s3 name"]) {
      skillsToEnrich.push({
        field: "s3",
        name: weapon["s3 name"],
        text: weapon["s3 desc"],
        level: weapon["s3 lvl"] || 10,
      });
    }

    // Enrichir chaque skill en parallèle pour améliorer les performances
    const enrichmentPromises = skillsToEnrich.map(async (skill) => {
      const enriched = await this.enrichSkill(
        skill.name,
        skill.text,
        skill.level
      );
      return { field: skill.field, enriched };
    });

    const results = await Promise.all(enrichmentPromises);

    // Assigner les résultats enrichis
    results.forEach(({ field, enriched }) => {
      enrichedWeapon[`${field}_enriched`] = enriched;
    });

    return enrichedWeapon;
  }

  // Enrichir une liste d'armes avec limitation du parallélisme
  async enrichWeaponsList(weapons, maxConcurrency = 5) {
    const enrichedWeapons = [];

    // Traiter les armes par lots pour éviter de surcharger la base de données
    for (let i = 0; i < weapons.length; i += maxConcurrency) {
      const batch = weapons.slice(i, i + maxConcurrency);
      const batchPromises = batch.map((weapon) =>
        this.enrichWeaponSkills(weapon)
      );
      const batchResults = await Promise.all(batchPromises);
      enrichedWeapons.push(...batchResults);
    }

    return enrichedWeapons;
  }

  // Version optimisée pour les grandes listes - enrichissement partiel
  async enrichWeaponsListFast(weapons, enrichSkills = true) {
    if (!enrichSkills) {
      return weapons; // Retourner les armes sans enrichissement
    }

    // Charger le cache une seule fois pour toute la liste
    await this.loadSkillsStatsCache();

    return this.enrichWeaponsList(weapons, 10); // Augmenter la concurrence
  }
}

module.exports = new SkillEnrichmentService();
