# Tests Unitaires et d'Intégration - GB Project

Configuration simple de tests unitaires et d'intégration pour le projet GB Project.

## Structure des Tests

```
tests/
├── README.md                 # Cette documentation
├── setup.js                  # Configuration globale Jest
├── utils/
│   └── testHelpers.js        # Utilitaires pour les tests
├── unit/                     # Tests unitaires
│   ├── weaponService.test.js # Tests du service d'armes
│   └── auth.test.js          # Tests du middleware d'authentification
├── integration/              # Tests d'intégration
│   ├── weapons.test.js       # Tests des routes d'armes
│   ├── health.test.js        # Tests de l'API de santé
│   └── database.test.js      # Tests de la base de données
└── fixtures/                 # Données de test
```

## Configuration

### Variables d'Environnement de Test

Les tests utilisent les variables d'environnement suivantes :

- `NODE_ENV=test`
- `JWT_SECRET=test-secret-key`
- `MONGODB_URI=mongodb://localhost:27017/test` (remplacé par MongoDB Memory Server)
- `DB_NAME=test`

### MongoDB Memory Server

Les tests utilisent MongoDB Memory Server pour créer une base de données temporaire en mémoire, ce qui permet :

- Des tests isolés et reproductibles
- Pas de dépendance à une base de données externe
- Nettoyage automatique entre les tests

## Commandes de Test

### Exécuter tous les tests

```bash
npm test
```

### Exécuter les tests en mode watch

```bash
npm run test:watch
```

### Exécuter uniquement les tests unitaires

```bash
npm run test:unit
```

### Exécuter uniquement les tests d'intégration

```bash
npm run test:integration
```

## Types de Tests

### Tests Unitaires (`tests/unit/`)

Testent les composants individuels de manière isolée :

- **Services** : Logique métier, accès aux données
- **Middleware** : Authentification, autorisation, validation
- **Utilitaires** : Fonctions helper, validations

#### Exemple de Test Unitaire

```javascript
describe("WeaponService", () => {
  it("devrait retourner une liste d'armes avec pagination", async () => {
    // Arrange
    const mockWeapons = [
      /* données de test */
    ];
    mockCollection.find.mockReturnValue(/* mock */);

    // Act
    const result = await weaponService.getAllWeapons(1, 10);

    // Assert
    expect(result.weapons).toEqual(mockWeapons);
  });
});
```

### Tests d'Intégration (`tests/integration/`)

Testent l'interaction entre plusieurs composants :

- **Routes API** : Endpoints HTTP, validation des requêtes/réponses
- **Base de données** : Opérations CRUD, requêtes complexes
- **Services complets** : Workflows métier end-to-end

#### Exemple de Test d'Intégration

```javascript
describe("Weapons API", () => {
  it("devrait retourner une liste d'armes", async () => {
    const response = await request(app).get("/api/weapons").expect(200);

    expect(response.body.weapons).toBeDefined();
  });
});
```

## Utilitaires de Test

### `testHelpers.js`

Contient des fonctions utilitaires pour faciliter les tests :

- `generateTestToken()` : Génère un token JWT de test
- `hashPassword()` : Hash un mot de passe pour les tests
- `createTestWeapon()` : Crée des données d'arme de test
- `createTestUser()` : Crée des données d'utilisateur de test
- `mockRequest()` / `mockResponse()` : Mocks Express

### Exemple d'Utilisation

```javascript
const { createTestWeapon, generateTestToken } = require("../utils/testHelpers");

const weaponData = createTestWeapon({ name: "Épée Spéciale" });
const token = generateTestToken({ userId: "test-user" });
```

## Bonnes Pratiques

### 1. Isolation des Tests

- Chaque test doit être indépendant
- Utiliser `beforeEach()` pour réinitialiser l'état
- Nettoyer les mocks avec `jest.clearAllMocks()`

### 2. Nommage des Tests

- Utiliser des descriptions claires et en français
- Suivre le pattern "devrait [comportement attendu]"
- Grouper les tests logiquement avec `describe()`

### 3. Structure AAA

- **Arrange** : Préparer les données et mocks
- **Act** : Exécuter la fonction testée
- **Assert** : Vérifier les résultats

### 4. Gestion des Erreurs

- Tester les cas d'erreur et d'exception
- Vérifier les messages d'erreur appropriés
- Tester les codes de statut HTTP

### 5. Tests Simples

- Tester les fonctionnalités principales
- Vérifier les cas d'erreur basiques
- Maintenir une structure claire et lisible

## Ajout de Nouveaux Tests

### 1. Test Unitaire pour un Service

```javascript
// tests/unit/newService.test.js
const NewService = require("../../services/newService");

describe("NewService", () => {
  it("devrait effectuer l'opération attendue", async () => {
    // Test implementation
  });
});
```

### 2. Test d'Intégration pour une Route

```javascript
// tests/integration/newRoute.test.js
const request = require("supertest");
const app = require("../../server"); // ou créer une app de test

describe("New Route", () => {
  it("devrait répondre correctement", async () => {
    const response = await request(app).get("/api/new-endpoint").expect(200);
  });
});
```

### 3. Test de Base de Données

```javascript
// tests/integration/newDatabase.test.js
describe("New Database Operations", () => {
  it("devrait effectuer l'opération CRUD", async () => {
    // Test avec MongoDB Memory Server
  });
});
```

## Dépannage

### Erreurs Communes

1. **Timeout des tests** : Augmenter `jest.setTimeout()` dans `setup.js`
2. **MongoDB Memory Server** : Vérifier que le port n'est pas utilisé
3. **Mocks non réinitialisés** : Utiliser `jest.clearAllMocks()` dans `beforeEach()`

### Debug des Tests

```bash
# Exécuter un test spécifique
npm test -- --testNamePattern="nom du test"

# Mode debug avec console.log
NODE_ENV=test DEBUG=* npm test

# Exécuter avec plus de détails
npm test -- --verbose
```

## Intégration Continue

Les tests sont configurés pour s'exécuter automatiquement dans GitHub Actions :

- Tests unitaires et d'intégration
- Validation automatique à chaque push/PR
- Notification de succès/échec
