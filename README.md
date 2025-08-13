# GB Project - Visualiseur de Données d'Armes et Compétences

Une application web moderne pour visualiser et gérer des données d'armes et de compétences avec une architecture backend robuste utilisant MongoDB et PostgreSQL.

## 🚀 Fonctionnalités

- **Visualisation interactive** des données JSON d'armes et compétences
- **API REST complète** avec authentification JWT
- **Base de données hybride** : MongoDB pour les données de jeu, PostgreSQL pour les utilisateurs
- **Interface moderne** avec recherche, pagination et filtres
- **Sécurité renforcée** avec rate limiting et validation
- **Import automatique** des données JSON existantes

## 🏗️ Architecture

```
GB_PROJECT/
├── config/
│   └── database.js          # Configuration des bases de données
├── routes/
│   ├── weapons.js           # API pour les armes (MongoDB)
│   ├── skills.js            # API pour les compétences (MongoDB)
│   └── users.js             # API pour les utilisateurs (PostgreSQL)
├── scripts/
│   └── import-data.js       # Script d'import des données JSON
├── public/
│   └── index.html           # Interface utilisateur
├── json/
│   ├── weapons.json         # Données d'armes
│   └── weapon_skills.json   # Données de compétences
├── server.js                # Serveur Express principal
├── package.json             # Dépendances Node.js
└── env.example              # Variables d'environnement
```

## 📋 Prérequis

- **Node.js** (version 18 ou supérieure)
- **MongoDB** (local ou MongoDB Atlas)
- **PostgreSQL** (local ou service cloud)
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
cp env.example .env
```

Éditez le fichier `.env` avec vos configurations :

```env
# Configuration du serveur
PORT=3000
NODE_ENV=development

# Configuration MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=gb_project

# Configuration PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=gb_project
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Configuration JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Configuration CORS
FRONTEND_URL=http://localhost:3000
```

### 4. Importer les données

```bash
node scripts/import-data.js
```

### 5. Démarrer l'application

```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 🌐 Déploiement

### Option 1 : Vercel + MongoDB Atlas + Supabase (Recommandé)

#### MongoDB Atlas (Base NoSQL)

1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créer un cluster gratuit (512MB)
3. Créer un utilisateur de base de données
4. Obtenir l'URI de connexion

#### Supabase (Base SQL)

1. Créer un compte sur [Supabase](https://supabase.com)
2. Créer un nouveau projet
3. Obtenir les informations de connexion PostgreSQL

#### Vercel (Hébergement)

1. Créer un compte sur [Vercel](https://vercel.com)
2. Connecter votre repository GitHub
3. Configurer les variables d'environnement :
   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/gb_project
   POSTGRES_HOST=db.supabase.co
   POSTGRES_DB=postgres
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=votre-password
   JWT_SECRET=votre-secret-jwt
   ```

### Option 2 : Railway (Tout-en-un)

1. Créer un compte sur [Railway](https://railway.app)
2. Créer un nouveau projet
3. Ajouter les services :
   - **MongoDB** pour les données de jeu
   - **PostgreSQL** pour les utilisateurs
   - **Node.js** pour l'application
4. Configurer les variables d'environnement

### Option 3 : Render (Alternative)

1. Créer un compte sur [Render](https://render.com)
2. Créer un service web Node.js
3. Ajouter des bases de données MongoDB et PostgreSQL
4. Configurer les variables d'environnement

## 📊 API Endpoints

### Armes (MongoDB)

- `GET /api/weapons` - Liste des armes avec pagination
- `GET /api/weapons/:id` - Détails d'une arme
- `POST /api/weapons` - Créer une arme
- `PUT /api/weapons/:id` - Modifier une arme
- `DELETE /api/weapons/:id` - Supprimer une arme
- `POST /api/weapons/import` - Importer des armes
- `GET /api/weapons/stats/overview` - Statistiques

### Compétences (MongoDB)

- `GET /api/skills` - Liste des compétences
- `GET /api/skills/:id` - Détails d'une compétence
- `POST /api/skills` - Créer une compétence
- `PUT /api/skills/:id` - Modifier une compétence
- `DELETE /api/skills/:id` - Supprimer une compétence
- `POST /api/skills/import` - Importer des compétences
- `GET /api/skills/stats/overview` - Statistiques

### Utilisateurs (PostgreSQL)

- `POST /api/users/register` - Inscription
- `POST /api/users/login` - Connexion
- `GET /api/users/profile` - Profil utilisateur
- `PUT /api/users/profile` - Modifier le profil
- `POST /api/users/change-password` - Changer le mot de passe

## 🔧 Scripts disponibles

```bash
# Démarrage en développement
npm run dev

# Démarrage en production
npm start

# Import des données
node scripts/import-data.js

# Build pour production
npm run build
```

## 🛡️ Sécurité

- **Rate limiting** : 100 requêtes par 15 minutes par IP
- **Helmet.js** : Headers de sécurité
- **CORS** : Configuration sécurisée
- **JWT** : Authentification par token
- **Validation** : Validation des données d'entrée
- **Hachage** : Mots de passe hachés avec bcrypt

## 📈 Coûts estimés

### Solution recommandée (Vercel + MongoDB Atlas + Supabase)

- **Vercel** : Gratuit (limite 100GB/mois)
- **MongoDB Atlas** : Gratuit (512MB)
- **Supabase** : Gratuit (500MB)
- **Total** : 0€/mois pour commencer

### Alternative Railway

- **Railway** : ~5-10€/mois pour un usage modéré

## 🚀 Prochaines étapes

1. **Déployer** l'application selon vos préférences
2. **Configurer** les variables d'environnement en production
3. **Importer** vos données JSON existantes
4. **Tester** toutes les fonctionnalités
5. **Ajouter** des fonctionnalités supplémentaires si nécessaire

## 📞 Support

Pour toute question ou problème :

1. Vérifiez les logs de l'application
2. Consultez la documentation des services utilisés
3. Créez une issue sur GitHub

---

**Note** : N'oubliez pas de changer les clés secrètes en production et de configurer correctement les variables d'environnement selon votre plateforme d'hébergement.
