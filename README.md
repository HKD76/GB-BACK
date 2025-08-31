# GB Project - API de Gestion de Jeu

API REST pour gérer des armes, compétences et invocations dans un jeu. Développée avec Node.js, Express et MongoDB.

## 🚀 Installation Rapide

### Prérequis

- Node.js 18+
- MongoDB (local ou Atlas)

### Installation

```bash
# Cloner et installer
git clone https://github.com/HKD76/GB-BACK.git
cd GB_PROJECT
npm install

# Configuration
cp env.example .env
# Éditer .env avec vos paramètres

# Démarrer
npm run dev
```

L'API sera disponible sur `http://localhost:3000`

## 📋 Fonctionnalités

- **Gestion d'armes** : CRUD, recherche, filtres
- **Système d'invocations** : Créatures invocables
- **Compétences** : Enrichissement des armes
- **Grilles d'armes** : Organisation des équipements
- **Authentification JWT** : Sécurisation des routes
- **Tests automatisés** : 59 tests unitaires et d'intégration

## 🔗 API Endpoints

### Armes

- `GET /api/weapons` - Liste avec pagination
- `GET /api/weapons/:id` - Détail d'une arme
- `GET /api/weapons/search?q=sword` - Recherche
- `GET /api/weapons-enriched` - Liste avec compétences enrichies
- `GET /api/weapons-enriched/:id` - Détail d'une arme avec compétences enrichies
- `GET /api/weapons-enriched/filter` - Filtrage avec compétences enrichies
- `GET /api/weapons-enriched/filter/fast` - Filtrage rapide sans enrichissement

### Invocations

- `GET /api/summons` - Liste des invocations
- `GET /api/summons/:id` - Détail d'une invocation

### Utilisateurs

- `POST /api/users/register` - Inscription
- `POST /api/users/login` - Connexion
- `GET /api/users/profile` - Profil (auth requise)

### Autres

- `GET /api/health` - Statut de l'API
- `GET /api/skills` - Compétences
- `GET /api/weapon-grids` - Grilles d'armes

## 🛠️ Scripts Utiles

```bash
npm start              # Production
npm run dev            # Développement
npm test               # Tous les tests
npm run test:unit      # Tests unitaires
npm run import-mongo   # Import données
```

## 🏗️ Architecture

```
├── config/          # Configuration DB
├── middleware/      # Auth JWT
├── models/          # Modèles MongoDB
├── routes/          # Routes API
├── services/        # Logique métier
├── scripts/         # Utilitaires
├── tests/           # Tests (59 tests)
└── json/            # Données de base
```

## 🔒 Sécurité

- Authentification JWT
- Validation des données
- CORS configuré
- Rate limiting

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
npm i -g vercel
vercel login
vercel
```

### Variables d'environnement

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
DB_NAME=gb_project
JWT_SECRET=votre_secret_jwt
NODE_ENV=production
```

## 🧪 Tests

Suite de tests complète avec MongoDB Memory Server :

- **59 tests** couvrant les fonctionnalités principales
- Tests unitaires (services, middleware)
- Tests d'intégration (API, base de données)
- CI/CD automatique sur GitHub Actions

## 📊 Monitoring

- Health check : `/api/health`
- Logs automatiques
- Tests CI/CD

## 🤝 Contribution

1. Fork le projet
2. Créer une branche : `git checkout -b feature/nouvelle-fonctionnalite`
3. Commit : `git commit -m 'Ajout nouvelle fonctionnalité'`
4. Push : `git push origin feature/nouvelle-fonctionnalite`
5. Ouvrir une Pull Request

---
