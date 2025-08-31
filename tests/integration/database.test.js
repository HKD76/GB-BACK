const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Database Integration Tests', () => {
  let mongod;
  let client;
  let db;

  beforeAll(async () => {
    // Démarrer MongoDB Memory Server
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    // Connecter au serveur de test
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('test');
  });

  afterAll(async () => {
    // Nettoyer et fermer les connexions
    if (client) {
      await client.close();
    }
    if (mongod) {
      await mongod.stop();
    }
  });

  beforeEach(async () => {
    // Nettoyer la base de données avant chaque test
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({});
    }
  });

  describe('Weapons Collection', () => {
    it('devrait pouvoir insérer et récupérer des armes', async () => {
      const weaponsCollection = db.collection('weapons');
      
      const testWeapon = {
        name: 'Épée de Test',
        type: 'sword',
        rarity: 'SR',
        element: 'fire',
        attack: 1000,
        hp: 500
      };

      // Insérer une arme
      const result = await weaponsCollection.insertOne(testWeapon);
      expect(result.insertedId).toBeDefined();

      // Récupérer l'arme
      const retrievedWeapon = await weaponsCollection.findOne({ _id: result.insertedId });
      expect(retrievedWeapon).toEqual({
        _id: result.insertedId,
        ...testWeapon
      });
    });

    it('devrait pouvoir filtrer les armes par élément', async () => {
      const weaponsCollection = db.collection('weapons');
      
      const weapons = [
        { name: 'Épée de Feu', element: 'fire', type: 'sword' },
        { name: 'Épée d\'Eau', element: 'water', type: 'sword' },
        { name: 'Épée de Terre', element: 'earth', type: 'sword' }
      ];

      await weaponsCollection.insertMany(weapons);

      // Filtrer par élément feu
      const fireWeapons = await weaponsCollection.find({ element: 'fire' }).toArray();
      expect(fireWeapons).toHaveLength(1);
      expect(fireWeapons[0].name).toBe('Épée de Feu');
    });

    it('devrait pouvoir mettre à jour une arme', async () => {
      const weaponsCollection = db.collection('weapons');
      
      const weapon = { name: 'Épée Originale', attack: 1000 };
      const result = await weaponsCollection.insertOne(weapon);

      // Mettre à jour l'attaque
      await weaponsCollection.updateOne(
        { _id: result.insertedId },
        { $set: { attack: 1200 } }
      );

      const updatedWeapon = await weaponsCollection.findOne({ _id: result.insertedId });
      expect(updatedWeapon.attack).toBe(1200);
    });

    it('devrait pouvoir supprimer une arme', async () => {
      const weaponsCollection = db.collection('weapons');
      
      const weapon = { name: 'Épée à Supprimer' };
      const result = await weaponsCollection.insertOne(weapon);

      // Supprimer l'arme
      await weaponsCollection.deleteOne({ _id: result.insertedId });

      const deletedWeapon = await weaponsCollection.findOne({ _id: result.insertedId });
      expect(deletedWeapon).toBeNull();
    });
  });

  describe('Users Collection', () => {
    it('devrait pouvoir insérer et récupérer des utilisateurs', async () => {
      const usersCollection = db.collection('users');
      
      const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'user'
      };

      const result = await usersCollection.insertOne(testUser);
      expect(result.insertedId).toBeDefined();

      const retrievedUser = await usersCollection.findOne({ _id: result.insertedId });
      expect(retrievedUser).toEqual({
        _id: result.insertedId,
        ...testUser
      });
    });

    it('devrait pouvoir rechercher un utilisateur par email', async () => {
      const usersCollection = db.collection('users');
      
      const user = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword'
      };

      await usersCollection.insertOne(user);

      const foundUser = await usersCollection.findOne({ email: 'test@example.com' });
      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe('test@example.com');
    });
  });

  describe('Skills Collection', () => {
    it('devrait pouvoir insérer et récupérer des skills', async () => {
      const skillsCollection = db.collection('weapon_skills');
      
      const testSkill = {
        name: 'Skill de Test',
        text: 'Description du skill',
        jpname: 'テストスキル',
        jptext: 'スキルの説明'
      };

      const result = await skillsCollection.insertOne(testSkill);
      expect(result.insertedId).toBeDefined();

      const retrievedSkill = await skillsCollection.findOne({ _id: result.insertedId });
      expect(retrievedSkill).toEqual({
        _id: result.insertedId,
        ...testSkill
      });
    });
  });

  describe('Database Performance', () => {
    it('devrait pouvoir gérer de multiples opérations simultanées', async () => {
      const weaponsCollection = db.collection('weapons');
      
      // Créer plusieurs armes en parallèle
      const weapons = Array.from({ length: 10 }, (_, i) => ({
        name: `Épée ${i + 1}`,
        type: 'sword',
        rarity: 'SR',
        element: 'fire'
      }));

      const insertPromises = weapons.map(weapon => weaponsCollection.insertOne(weapon));
      const results = await Promise.all(insertPromises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.insertedId).toBeDefined();
      });

      // Vérifier que toutes les armes ont été insérées
      const count = await weaponsCollection.countDocuments();
      expect(count).toBe(10);
    });

    it('devrait pouvoir effectuer des requêtes avec index', async () => {
      const weaponsCollection = db.collection('weapons');
      
      // Créer un index sur le champ element
      await weaponsCollection.createIndex({ element: 1 });

      const weapons = [
        { name: 'Épée de Feu', element: 'fire' },
        { name: 'Épée d\'Eau', element: 'water' },
        { name: 'Épée de Feu 2', element: 'fire' }
      ];

      await weaponsCollection.insertMany(weapons);

      // Rechercher avec l'index
      const fireWeapons = await weaponsCollection.find({ element: 'fire' }).toArray();
      expect(fireWeapons).toHaveLength(2);
    });
  });
});
