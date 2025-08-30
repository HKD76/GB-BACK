# GB Project API

API REST pour la gestion d'armes, compétences et invocations dans un jeu.

## 🚀 Déploiement sur Vercel

### Prérequis

- Compte GitHub
- Compte Vercel
- Base de données MongoDB (MongoDB Atlas recommandé)

### Étapes de déploiement

1. **Préparer la base de données**

   - Créer un cluster MongoDB Atlas
   - Obtenir l'URI de connexion
   - Configurer les variables d'environnement

2. **Déployer sur Vercel**

   ```bash
   # Installer Vercel CLI
   npm i -g vercel

   # Se connecter à Vercel
   vercel login

   # Déployer
   vercel
   ```

3. **Configurer les variables d'environnement**
   - Aller sur le dashboard Vercel
   - Projet → Settings → Environment Variables
   - Ajouter :
     - `MONGODB_URI` : URI de votre base MongoDB
     - `DB_NAME` : Nom de votre base de données
     - `JWT_SECRET` : Clé secrète pour JWT
     - `NODE_ENV` : production

## 📁 Architecture

```
├── config/
│   └── database.js          # Configuration MongoDB
├── middleware/
│   └── auth.js              # Authentification JWT
├── models/
│   ├── User.js              # Modèle utilisateur
│   ├── Weapon.js            # Modèle arme
│   ├── Summon.js            # Modèle invocation
│   └── WeaponGrid.js        # Modèle grille d'armes
├── routes/
│   ├── users.js             # Routes utilisateurs
│   ├── weapons.js           # Routes armes
│   ├── weapons-enriched.js  # Routes armes enrichies
│   ├── summons.js           # Routes invocations
│   ├── skills.js            # Routes compétences
│   ├── skills-stats.js      # Routes statistiques
│   └── weapon-grids.js      # Routes grilles d'armes
├── services/
│   ├── userService.js       # Logique utilisateurs
│   ├── weaponService.js     # Logique armes
│   ├── summonService.js     # Logique invocations
│   ├── weaponGridService.js # Logique grilles
│   └── skillEnrichmentService.js # Enrichissement skills
├── scripts/
│   ├── import-mongo.js      # Import données MongoDB
│   ├── test-mongo.js        # Test connexion
│   └── test-api.js          # Tests API
├── json/
│   ├── weapons.json         # Données d'armes
│   ├── summons.json         # Données d'invocations
│   ├── skills_stats.json    # Statistiques compétences
│   └── weapon_skills.json   # Compétences d'armes
├── server.js                # Point d'entrée
├── vercel.json              # Configuration Vercel
└── package.json             # Dépendances
```

## 🔧 Configuration

### Variables d'environnement requises

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database
DB_NAME=gb_project
JWT_SECRET=votre_secret_jwt_super_securise
NODE_ENV=production
FRONTEND_URL=https://votre-frontend.vercel.app
```

### Scripts disponibles

```bash
npm start          # Démarre le serveur
npm run dev        # Mode développement avec nodemon
npm run build      # Build pour production
npm run test-api   # Test de l'API
```

## 📚 API Endpoints

### Santé

- `GET /api/health` - Statut de l'API

### Utilisateurs

- `POST /api/users/register` - Inscription
- `POST /api/users/login` - Connexion
- `GET /api/users/profile` - Profil utilisateur

### Armes

- `GET /api/weapons` - Liste des armes
- `GET /api/weapons/:id` - Détail d'une arme
- `GET /api/weapons/search` - Recherche d'armes
- `GET /api/weapons-enriched` - Armes avec skills enrichis

### Invocations

- `GET /api/summons` - Liste des invocations
- `GET /api/summons/:id` - Détail d'une invocation

### Compétences

- `GET /api/skills` - Liste des compétences
- `GET /api/skills-stats` - Statistiques des compétences

### Grilles d'armes

- `GET /api/weapon-grids` - Liste des grilles
- `POST /api/weapon-grids` - Créer une grille
- `GET /api/weapon-grids/:id` - Détail d'une grille

## 🔒 Sécurité

- **Helmet** : Headers de sécurité
- **CORS** : Configuration cross-origin
- **Rate Limiting** : Limitation des requêtes
- **JWT** : Authentification sécurisée
- **Validation** : Validation des données

## 🚀 Déploiement

L'API est configurée pour être déployée sur Vercel avec :

- Configuration automatique des routes
- Variables d'environnement sécurisées
- Build optimisé pour Node.js
- Monitoring et logs automatiques

## 📊 Monitoring

- **Vercel Analytics** : Métriques de performance
- **Logs** : Logs d'erreurs et d'accès
- **Health Check** : Endpoint `/api/health`

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request
