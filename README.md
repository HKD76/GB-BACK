# GB Project - API Node.js avec MongoDB

Une API REST complète pour gérer des utilisateurs, des armes et des compétences avec MongoDB. Inclut un système d'authentification JWT robuste et des opérations CRUD complètes.

## 🚀 Fonctionnalités

- **API REST complète** avec authentification JWT
- **Base de données MongoDB** pour toutes les données
- **Système d'authentification** complet (inscription, connexion, gestion de profil)
- **Gestion des armes** avec validation et statistiques
- **Gestion des compétences** (structure prête)
- **Sécurité renforcée** avec rate limiting, validation et headers de sécurité
- **Documentation complète** de l'API
- **Tests automatisés** pour vérifier le bon fonctionnement

## 🏗️ Architecture

```
GB_PROJECT/
├── config/
│   └── database.js          # Configuration MongoDB
├── models/
│   ├── User.js              # Modèle utilisateur
│   └── Weapon.js            # Modèle arme
├── services/
│   ├── userService.js       # Service utilisateur
│   └── weaponService.js     # Service arme
├── middleware/
│   └── auth.js              # Middleware d'authentification
├── routes/
│   ├── weapons.js           # API pour les armes
│   ├── skills.js            # API pour les compétences
│   └── users.js             # API pour les utilisateurs
├── scripts/
│   ├── import-mongo.js      # Import des données MongoDB
│   ├── test-mongo.js        # Test de connexion MongoDB
│   └── test-api.js          # Tests de l'API
├── public/
│   └── index.html           # Interface utilisateur
├── json/
│   ├── weapons.json         # Données d'armes
│   └── weapon_skills.json   # Données de compétences
├── server.js                # Serveur Express principal
├── package.json             # Dépendances Node.js
├── .env.example             # Variables d'environnement
├── API_DOCUMENTATION.md     # Documentation complète de l'API
└── README.md                # Ce fichier
```

## 📋 Prérequis

- **Node.js** (version 18 ou supérieure)
- **MongoDB** (local ou MongoDB Atlas)
- **npm** ou **yarn**

## 🛠️ Installation

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd GB_PROJECT
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration des variables d'environnement

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos configurations :

```env
# Configuration du serveur
PORT=3000
NODE_ENV=development

# Configuration MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=gb_project

# Configuration JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Configuration CORS
FRONTEND_URL=http://localhost:3000
```

### 4. Démarrer MongoDB

**Local :**

```bash
# Sur macOS avec Homebrew
brew services start mongodb-community

# Sur Ubuntu/Debian
sudo systemctl start mongod

# Sur Windows
net start MongoDB
```

**MongoDB Atlas :**

- Créez un cluster gratuit sur [MongoDB Atlas](https://www.mongodb.com/atlas)
- Obtenez l'URI de connexion et mettez-la dans `MONGODB_URI`

### 5. Démarrer l'application

```bash
# Mode développement avec nodemon
npm run dev

# Mode production
npm start
```

L'API sera accessible sur `http://localhost:3000/api`

## 🧪 Tests

### Tester l'API

```bash
# Assurez-vous que le serveur est démarré
npm start

# Dans un autre terminal, lancez les tests
npm run test-api
```

### Tester la connexion MongoDB

```bash
npm run test-mongo
```

## 📊 API Endpoints

### 🔐 Authentification

- `POST /api/users/register` - Inscription d'un utilisateur
- `POST /api/users/login` - Connexion utilisateur
- `GET /api/users/verify-token` - Vérifier la validité du token

### 👤 Gestion du Profil

- `GET /api/users/profile` - Obtenir le profil (authentification requise)
- `PUT /api/users/profile` - Mettre à jour le profil (authentification requise)
- `POST /api/users/change-password` - Changer le mot de passe (authentification requise)

### 👥 Gestion des Utilisateurs

- `GET /api/users` - Liste des utilisateurs avec pagination (authentification requise)
- `GET /api/users/:id` - Obtenir un utilisateur par ID (authentification requise)
- `DELETE /api/users/:id` - Supprimer un utilisateur (authentification requise)

### ⚔️ Gestion des Armes

- `GET /api/weapons` - Liste des armes avec filtres et pagination
- `GET /api/weapons/search` - Rechercher des armes par nom
- `GET /api/weapons/stats` - Statistiques des armes
- `GET /api/weapons/:id` - Obtenir une arme par ID
- `POST /api/weapons` - Créer une arme (authentification requise)
- `PUT /api/weapons/:id` - Mettre à jour une arme (authentification requise)
- `DELETE /api/weapons/:id` - Supprimer une arme (authentification requise)
- `POST /api/weapons/:id/skills` - Ajouter une compétence à une arme (authentification requise)
- `DELETE /api/weapons/:id/skills/:skillId` - Retirer une compétence d'une arme (authentification requise)
- `POST /api/weapons/import` - Importer des armes depuis JSON (authentification requise)

### 🎯 Gestion des Compétences

Les endpoints pour les compétences suivent le même pattern que les armes.

### 🏥 Santé de l'API

- `GET /api/health` - Vérifier l'état de l'API

## 🔧 Scripts disponibles

```bash
# Démarrage en développement
npm run dev

# Démarrage en production
npm start

# Import des données MongoDB
npm run import-mongo

# Test de connexion MongoDB
npm run test-mongo

# Test complet de l'API
npm run test-api

# Build pour production
npm run build
```

## 📖 Documentation

Consultez le fichier `API_DOCUMENTATION.md` pour une documentation complète de l'API avec des exemples d'utilisation.

## 🛡️ Sécurité

- **Rate limiting** : 100 requêtes par 15 minutes par IP
- **Helmet.js** : Headers de sécurité
- **CORS** : Configuration sécurisée
- **JWT** : Authentification par token avec expiration (24h)
- **Validation** : Validation complète des données d'entrée
- **Hachage** : Mots de passe hachés avec bcrypt (10 rounds)
- **Middleware d'authentification** : Protection des routes sensibles

## 🌐 Déploiement

### Option 1 : Vercel + MongoDB Atlas (Recommandé)

1. **MongoDB Atlas** :

   - Créez un cluster M0 (gratuit)
   - Obtenez l'URI de connexion

2. **Vercel** :
   - Connectez votre repository GitHub
   - Configurez les variables d'environnement :
     ```
     MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/gb_project
     JWT_SECRET=votre-secret-jwt-super-securise
     NODE_ENV=production
     ```

### Option 2 : Railway

1. Créez un compte sur [Railway](https://railway.app)
2. Ajoutez un service MongoDB
3. Déployez votre application Node.js
4. Configurez les variables d'environnement

### Option 3 : Render

1. Créez un compte sur [Render](https://render.com)
2. Créez un service web Node.js
3. Ajoutez une base de données MongoDB
4. Configurez les variables d'environnement

## 📈 Exemples d'utilisation

### Inscription et Connexion

```bash
# 1. Inscription
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "password123"
  }'

# 2. Connexion
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "password": "password123"
  }'
```

### Utilisation avec Token

```bash
# Récupérer le profil utilisateur
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <votre_token>"

# Créer une arme
curl -X POST http://localhost:3000/api/weapons \
  -H "Authorization: Bearer <votre_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arc magique",
    "type": "arc",
    "damage": 20,
    "range": 10,
    "weight": 2.0,
    "description": "Un arc enchanté",
    "rarity": "uncommon"
  }'
```

## 🚀 Prochaines étapes

1. **Déployer** l'application selon vos préférences
2. **Configurer** les variables d'environnement en production
3. **Importer** vos données JSON existantes
4. **Tester** toutes les fonctionnalités avec les scripts fournis
5. **Étendre** l'API selon vos besoins spécifiques

## 📞 Support

Pour toute question ou problème :

1. Vérifiez les logs de l'application
2. Consultez la documentation de l'API (`API_DOCUMENTATION.md`)
3. Lancez les tests pour diagnostiquer les problèmes
4. Créez une issue sur GitHub

---

**Note** : N'oubliez pas de changer la clé JWT_SECRET en production et de configurer correctement les variables d'environnement selon votre plateforme d'hébergement.
