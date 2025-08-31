// Configuration globale pour les tests Jest
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";
process.env.MONGODB_URI = "mongodb://localhost:27017/test";
process.env.DB_NAME = "test";

global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error,
};

jest.setTimeout(30000);

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
});

afterAll(async () => {
  if (mongod) {
    await mongod.stop();
  }
});

afterEach(async () => {
  jest.clearAllMocks();
});
