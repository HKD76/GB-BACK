const axios = require("axios");

/**
 * Test de l'endpoint POST /api/weapon-grids
 */
async function testWeaponGridsPost() {
  try {
    console.log("🧪 Test de l'endpoint POST /api/weapon-grids...");

    const testData = {
      name: "Test Grid",
      description: "Description de test",
      isPublic: true,
      weapons: {
        1: {
          weaponId: "weapon_123",
          weaponData: {
            id: 123,
            name: "Test Weapon",
            type: "sabre",
            element: "fire",
            rarity: "SSR",
            atk1: 100,
            atk2: 1000,
            hp1: 10,
            hp2: 100,
          },
          selectedLevel: 150,
        },
      },
      summons: {
        1: {
          summonId: "summon_789",
          summonData: {
            id: 789,
            name: "Test Summon",
            element: "fire",
            rarity: "SSR",
            atk1: 200,
            atk2: 2000,
            hp1: 20,
            hp2: 200,
          },
          selectedLevel: 3,
          selectedSpecialAura: "aura_t3",
        },
      },
      metadata: {
        totalAtk: 3000,
        totalHp: 300,
        weaponCount: 1,
        summonCount: 1,
        elements: ["fire"],
      },
    };

    console.log("📤 Envoi des données de test...");
    console.log("URL:", "http://localhost:3000/api/weapon-grids");
    console.log("Données:", JSON.stringify(testData, null, 2));

    const response = await axios.post(
      "http://localhost:3000/api/weapon-grids",
      testData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Succès !");
    console.log("Status:", response.status);
    console.log("Réponse:", response.data);
  } catch (error) {
    console.error("❌ Erreur lors du test:");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      console.error("Données d'erreur:", error.response.data);
    } else if (error.request) {
      console.error("Aucune réponse reçue:", error.request);
    } else {
      console.error("Erreur:", error.message);
    }
  }
}

// Exécuter le test
testWeaponGridsPost();
