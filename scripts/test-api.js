const axios = require("axios");

const API_BASE_URL = "http://192.168.1.14:3000";

// Configuration axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Variables globales pour les tests
let authToken = null;
let testUserId = null;
let testWeaponId = null;

// Fonction pour afficher les résultats
function logTest(testName, success, message = "") {
  const status = success ? "✅" : "❌";
  console.log(`${status} ${testName}${message ? `: ${message}` : ""}`);
}

// Test de santé de l'API
async function testHealth() {
  try {
    const response = await api.get("/health");
    logTest("Test de santé de l'API", response.status === 200);
    return true;
  } catch (error) {
    logTest("Test de santé de l'API", false, error.message);
    return false;
  }
}

// Test d'inscription utilisateur
async function testUserRegistration() {
  try {
    const userData = {
      username: `test_user_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: "password123",
    };

    const response = await api.post("/users/register", userData);

    if (response.status === 201 && response.data.token) {
      authToken = response.data.token;
      testUserId = response.data.user._id;
      logTest("Inscription utilisateur", true);
      return true;
    } else {
      logTest("Inscription utilisateur", false, "Réponse invalide");
      return false;
    }
  } catch (error) {
    logTest(
      "Inscription utilisateur",
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test de connexion utilisateur
async function testUserLogin() {
  try {
    const loginData = {
      username: "test_user",
      password: "password123",
    };

    const response = await api.post("/users/login", loginData);

    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      logTest("Connexion utilisateur", true);
      return true;
    } else {
      logTest("Connexion utilisateur", false, "Réponse invalide");
      return false;
    }
  } catch (error) {
    logTest(
      "Connexion utilisateur",
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test de récupération du profil
async function testGetProfile() {
  try {
    const response = await api.get("/users/profile", {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    logTest("Récupération du profil", response.status === 200);
    return response.status === 200;
  } catch (error) {
    logTest(
      "Récupération du profil",
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test de création d'arme
async function testCreateWeapon() {
  try {
    const weaponData = {
      name: `Épée de test ${Date.now()}`,
      type: "épée",
      damage: 25,
      range: 1,
      weight: 3.5,
      description: "Une épée de test",
      rarity: "rare",
    };

    const response = await api.post("/weapons", weaponData, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.status === 201 && response.data.weapon) {
      testWeaponId = response.data.weapon._id;
      logTest("Création d'arme", true);
      return true;
    } else {
      logTest("Création d'arme", false, "Réponse invalide");
      return false;
    }
  } catch (error) {
    logTest(
      "Création d'arme",
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test de récupération des armes
async function testGetWeapons() {
  try {
    const response = await api.get("/weapons");

    logTest("Récupération des armes", response.status === 200);
    return response.status === 200;
  } catch (error) {
    logTest(
      "Récupération des armes",
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test de récupération d'une arme par ID
async function testGetWeaponById() {
  try {
    if (!testWeaponId) {
      logTest(
        "Récupération d'arme par ID",
        false,
        "Aucune arme de test disponible"
      );
      return false;
    }

    const response = await api.get(`/weapons/${testWeaponId}`);

    logTest("Récupération d'arme par ID", response.status === 200);
    return response.status === 200;
  } catch (error) {
    logTest(
      "Récupération d'arme par ID",
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test de mise à jour d'arme
async function testUpdateWeapon() {
  try {
    if (!testWeaponId) {
      logTest("Mise à jour d'arme", false, "Aucune arme de test disponible");
      return false;
    }

    const updateData = {
      description: "Description mise à jour",
    };

    const response = await api.put(`/weapons/${testWeaponId}`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    logTest("Mise à jour d'arme", response.status === 200);
    return response.status === 200;
  } catch (error) {
    logTest(
      "Mise à jour d'arme",
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test de suppression d'arme
async function testDeleteWeapon() {
  try {
    if (!testWeaponId) {
      logTest("Suppression d'arme", false, "Aucune arme de test disponible");
      return false;
    }

    const response = await api.delete(`/weapons/${testWeaponId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    logTest("Suppression d'arme", response.status === 200);
    return response.status === 200;
  } catch (error) {
    logTest(
      "Suppression d'arme",
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test de statistiques des armes
async function testWeaponStats() {
  try {
    const response = await api.get("/weapons/stats");

    logTest("Statistiques des armes", response.status === 200);
    return response.status === 200;
  } catch (error) {
    logTest(
      "Statistiques des armes",
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test de recherche d'armes
async function testSearchWeapons() {
  try {
    const response = await api.get("/weapons/search?q=épée&limit=5");

    logTest("Recherche d'armes", response.status === 200);
    return response.status === 200;
  } catch (error) {
    logTest(
      "Recherche d'armes",
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test de vérification de token
async function testVerifyToken() {
  try {
    const response = await api.get("/users/verify-token", {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    logTest("Vérification de token", response.status === 200);
    return response.status === 200;
  } catch (error) {
    logTest(
      "Vérification de token",
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Fonction principale de test
async function runAllTests() {
  console.log("🚀 Démarrage des tests de l'API...\n");

  const tests = [
    testHealth,
    testUserRegistration,
    testUserLogin,
    testGetProfile,
    testVerifyToken,
    testCreateWeapon,
    testGetWeapons,
    testGetWeaponById,
    testUpdateWeapon,
    testWeaponStats,
    testSearchWeapons,
    testDeleteWeapon,
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    const result = await test();
    if (result) passedTests++;
    console.log(""); // Ligne vide pour la lisibilité
  }

  console.log("📊 Résumé des tests:");
  console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`);
  console.log(`❌ Tests échoués: ${totalTests - passedTests}/${totalTests}`);

  if (passedTests === totalTests) {
    console.log("\n🎉 Tous les tests sont passés avec succès !");
  } else {
    console.log(
      "\n⚠️  Certains tests ont échoué. Vérifiez les logs ci-dessus."
    );
  }
}

// Gestion des erreurs non capturées
process.on("unhandledRejection", (error) => {
  console.error("❌ Erreur non gérée:", error);
  process.exit(1);
});

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error("❌ Erreur lors de l'exécution des tests:", error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testHealth,
  testUserRegistration,
  testUserLogin,
  testGetProfile,
  testCreateWeapon,
  testGetWeapons,
  testGetWeaponById,
  testUpdateWeapon,
  testDeleteWeapon,
  testWeaponStats,
  testSearchWeapons,
  testVerifyToken,
};
