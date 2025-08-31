const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

/**
 * Génère un token JWT de test
 * @param {Object} payload
 * @returns {string}
 */
const generateTestToken = (payload = {}) => {
  const defaultPayload = {
    userId: "test-user-id",
    email: "test@example.com",
    role: "user",
    ...payload,
  };

  return jwt.sign(defaultPayload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

/**
 * Hash un mot de passe pour les tests
 * @param {string} password
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Compare un mot de passe avec son hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Crée des données de test pour les armes
 * @returns {Object}
 */
const createTestWeapon = (overrides = {}) => ({
  name: "Épée de Test",
  type: "sword",
  rarity: "SR",
  element: "fire",
  attack: 1000,
  hp: 500,
  skills: ["skill1", "skill2"],
  image: "test-image.jpg",
  ...overrides,
});

/**
 * Crée des données de test pour les utilisateurs
 * @returns {Object}
 */
const createTestUser = (overrides = {}) => ({
  username: "testuser",
  email: "test@example.com",
  password: "password123",
  role: "user",
  ...overrides,
});

/**
 * Crée des données de test pour les invocations
 * @returns {Object}
 */
const createTestSummon = (overrides = {}) => ({
  name: "Invocation de Test",
  element: "fire",
  rarity: "SSR",
  attack: 800,
  hp: 400,
  skills: ["summon-skill1"],
  image: "test-summon.jpg",
  ...overrides,
});

/**
 * Mock pour les réponses Express
 */
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Mock pour les requêtes Express
 */
const mockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  ...overrides,
});

module.exports = {
  generateTestToken,
  hashPassword,
  comparePassword,
  createTestWeapon,
  createTestUser,
  createTestSummon,
  mockResponse,
  mockRequest,
};
