# Documentation de l'API GB Project

## Vue d'ensemble

Cette API Node.js permet de gérer des utilisateurs, des armes et des compétences avec MongoDB. Elle inclut un système d'authentification JWT complet.

## Base URL

```
http://localhost:3000/api
```

## Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification. Incluez le token dans l'en-tête Authorization :

```
Authorization: Bearer <votre_token_jwt>
```

## Endpoints

### 🔐 Authentification Utilisateur

#### POST /api/users/register

Inscrire un nouvel utilisateur.

**Corps de la requête :**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "motdepasse123"
}
```

**Réponse :**

```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/users/login

Se connecter avec un compte existant.

**Corps de la requête :**

```json
{
  "username": "john_doe",
  "password": "motdepasse123"
}
```

**Réponse :**

```json
{
  "message": "Connexion réussie",
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /api/users/verify-token

Vérifier la validité du token JWT.

**En-têtes :** `Authorization: Bearer <token>`

**Réponse :**

```json
{
  "valid": true,
  "user": {
    "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### 👤 Gestion du Profil Utilisateur

#### GET /api/users/profile

Obtenir le profil de l'utilisateur connecté.

**En-têtes :** `Authorization: Bearer <token>`

**Réponse :**

```json
{
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /api/users/profile

Mettre à jour le profil utilisateur.

**En-têtes :** `Authorization: Bearer <token>`

**Corps de la requête :**

```json
{
  "username": "john_doe_updated",
  "email": "john.updated@example.com"
}
```

#### POST /api/users/change-password

Changer le mot de passe.

**En-têtes :** `Authorization: Bearer <token>`

**Corps de la requête :**

```json
{
  "currentPassword": "ancien_mot_de_passe",
  "newPassword": "nouveau_mot_de_passe"
}
```

### 👥 Gestion des Utilisateurs (Admin)

#### GET /api/users

Obtenir tous les utilisateurs avec pagination.

**En-têtes :** `Authorization: Bearer <token>`

**Paramètres de requête :**

- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre d'éléments par page (défaut: 10)

**Réponse :**

```json
{
  "users": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "username": "john_doe",
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

#### GET /api/users/:id

Obtenir un utilisateur par ID.

**En-têtes :** `Authorization: Bearer <token>`

#### DELETE /api/users/:id

Supprimer un utilisateur (seulement son propre compte).

**En-têtes :** `Authorization: Bearer <token>`

### ⚔️ Gestion des Armes

#### GET /api/weapons

Obtenir toutes les armes avec filtres et pagination.

**Paramètres de requête :**

- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre d'éléments par page (défaut: 10)
- `type` (optionnel) : Filtrer par type d'arme
- `rarity` (optionnel) : Filtrer par rareté
- `name` (optionnel) : Rechercher par nom
- `minDamage` (optionnel) : Dégâts minimum
- `maxDamage` (optionnel) : Dégâts maximum

**Réponse :**

```json
{
  "weapons": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "Épée de feu",
      "type": "épée",
      "damage": 25,
      "range": 1,
      "weight": 3.5,
      "description": "Une épée enflammée",
      "rarity": "rare",
      "skills": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

#### GET /api/weapons/search

Rechercher des armes par nom.

**Paramètres de requête :**

- `q` (requis) : Terme de recherche
- `limit` (optionnel) : Nombre de résultats (défaut: 10)

#### GET /api/weapons/stats

Obtenir les statistiques des armes.

**Réponse :**

```json
{
  "stats": {
    "general": {
      "totalWeapons": 100,
      "avgDamage": 15.5,
      "maxDamage": 50,
      "minDamage": 1,
      "avgWeight": 2.3
    },
    "byType": [
      {
        "_id": "épée",
        "count": 25,
        "avgDamage": 18.2
      }
    ],
    "byRarity": [
      {
        "_id": "common",
        "count": 50
      }
    ]
  }
}
```

#### GET /api/weapons/:id

Obtenir une arme par ID.

#### POST /api/weapons

Créer une nouvelle arme.

**En-têtes :** `Authorization: Bearer <token>`

**Corps de la requête :**

```json
{
  "name": "Épée de feu",
  "type": "épée",
  "damage": 25,
  "range": 1,
  "weight": 3.5,
  "description": "Une épée enflammée",
  "rarity": "rare"
}
```

#### PUT /api/weapons/:id

Mettre à jour une arme.

**En-têtes :** `Authorization: Bearer <token>`

#### DELETE /api/weapons/:id

Supprimer une arme.

**En-têtes :** `Authorization: Bearer <token>`

#### POST /api/weapons/:id/skills

Ajouter une compétence à une arme.

**En-têtes :** `Authorization: Bearer <token>`

**Corps de la requête :**

```json
{
  "skillId": "60f7b3b3b3b3b3b3b3b3b3b3"
}
```

#### DELETE /api/weapons/:id/skills/:skillId

Retirer une compétence d'une arme.

**En-têtes :** `Authorization: Bearer <token>`

#### POST /api/weapons/import

Importer des armes depuis JSON.

**En-têtes :** `Authorization: Bearer <token>`

**Corps de la requête :**

```json
{
  "weapons": [
    {
      "name": "Épée de feu",
      "type": "épée",
      "damage": 25,
      "range": 1,
      "weight": 3.5,
      "description": "Une épée enflammée",
      "rarity": "rare"
    }
  ]
}
```

### 🎯 Gestion des Compétences

Les endpoints pour les compétences suivent le même pattern que les armes.

### 🏥 Santé de l'API

#### GET /api/health

Vérifier l'état de l'API.

**Réponse :**

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

## 🔪 Routes des Armes (Weapons)

### GET /api/weapons

Récupère toutes les armes avec pagination et filtres.

**Paramètres de requête :**

- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre d'armes par page (défaut: 10)
- `type` (optionnel) : Type d'arme (ex: "sabre", "sword")
- `rarity` (optionnel) : Rareté (ex: "N", "R", "SR", "SSR")
- `element` (optionnel) : Élément (ex: "wind", "fire", "water")
- `name` (optionnel) : Recherche par nom
- `title` (optionnel) : Recherche par titre
- `series` (optionnel) : Série d'arme
- `grp` (optionnel) : Groupe d'arme
- `minAtk` (optionnel) : Attaque minimum
- `maxAtk` (optionnel) : Attaque maximum
- `minHp` (optionnel) : HP minimum
- `maxHp` (optionnel) : HP maximum
- `evoMax` (optionnel) : Évolution maximum
- `evoBase` (optionnel) : Évolution de base

**Exemple de réponse :**

```json
{
  "weapons": [
    {
      "_id": "689f2af62046a0d2c79300da",
      "name": "Spatha",
      "title": "Wind Sword",
      "type": "sabre",
      "element": "wind",
      "rarity": "N",
      "atk1": 75,
      "atk2": 510,
      "hp1": 6,
      "hp2": 42,
      "evo_max": 3,
      "ca1_name": "Double Slash",
      "ca1_desc": "Small Wind damage to a foe.",
      "filters": ["element-wind", "rarity-n", "type-sabre"],
      "createdAt": "2025-08-15T12:41:26.593Z",
      "updatedAt": "2025-08-15T12:41:26.593Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 295,
    "totalItems": 2950,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### GET /api/weapons/element/:element

Récupère les armes d'un élément spécifique.

**Paramètres :**

- `element` : Élément de l'arme (ex: "wind", "fire", "water", "earth", "light", "dark")

**Paramètres de requête additionnels :**

- `rarity` (optionnel) : Filtrer par rareté
- `type` (optionnel) : Filtrer par type
- `minAtk`, `maxAtk` (optionnels) : Filtrer par attaque
- `minHp`, `maxHp` (optionnels) : Filtrer par HP

**Exemple :**

```bash
GET /api/weapons/element/wind?rarity=N&minAtk=100
```

### GET /api/weapons/rarity/:rarity

Récupère les armes d'une rareté spécifique.

**Paramètres :**

- `rarity` : Rareté de l'arme (ex: "N", "R", "SR", "SSR")

**Paramètres de requête additionnels :**

- `element` (optionnel) : Filtrer par élément
- `type` (optionnel) : Filtrer par type
- `minAtk`, `maxAtk` (optionnels) : Filtrer par attaque
- `minHp`, `maxHp` (optionnels) : Filtrer par HP

**Exemple :**

```bash
GET /api/weapons/rarity/SSR?element=fire&minAtk=500
```

### GET /api/weapons/element/:element/rarity/:rarity

Récupère les armes d'un élément ET d'une rareté spécifiques.

**Paramètres :**

- `element` : Élément de l'arme
- `rarity` : Rareté de l'arme

**Paramètres de requête additionnels :**

- `type` (optionnel) : Filtrer par type
- `minAtk`, `maxAtk` (optionnels) : Filtrer par attaque
- `minHp`, `maxHp` (optionnels) : Filtrer par HP

**Exemple :**

```bash
GET /api/weapons/element/wind/rarity/SSR?minAtk=400
```

### GET /api/weapons/filter

Récupère les armes avec élément ET rareté obligatoires.

**Paramètres de requête obligatoires :**

- `element` (requis) : Élément de l'arme (ex: "wind", "fire", "water", "earth", "light", "dark")
- `rarity` (requis) : Rareté de l'arme (ex: "N", "R", "SR", "SSR")

**Paramètres de requête optionnels :**

- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre d'armes par page (défaut: 10)
- `type` (optionnel) : Type d'arme
- `name` (optionnel) : Recherche par nom
- `title` (optionnel) : Recherche par titre
- `series` (optionnel) : Série d'arme
- `grp` (optionnel) : Groupe d'arme
- `minAtk`, `maxAtk` (optionnels) : Filtrer par attaque
- `minHp`, `maxHp` (optionnels) : Filtrer par HP
- `evoMax`, `evoBase` (optionnels) : Filtrer par évolution

**Exemples :**

```bash
# Requête valide avec élément et rareté
GET /api/weapons/filter?element=wind&rarity=SSR

# Requête avec filtres additionnels
GET /api/weapons/filter?element=fire&rarity=SR&minAtk=2000&type=sabre

# Requête invalide (manque de paramètres)
GET /api/weapons/filter?element=wind
# Retourne une erreur 400
```

**Exemple de réponse :**

```json
{
  "weapons": [
    {
      "_id": "689f2af62046a0d2c7930a37",
      "name": "Abu Simbel",
      "title": null,
      "type": "melee",
      "element": "wind",
      "rarity": "SSR",
      "atk1": 382,
      "atk2": 2326,
      "hp1": 31,
      "hp2": 201,
      "filters": ["element-wind", "rarity-ssr", "type-melee"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "pages": 16
  },
  "requiredFilters": {
    "element": "wind",
    "rarity": "SSR"
  },
  "optionalFilters": {
    "element": "wind",
    "rarity": "SSR",
    "minAtk": "2000"
  },
  "message": "Armes trouvées pour l'élément wind et la rareté SSR"
}
```

**Exemple d'erreur (paramètres manquants) :**

```json
{
  "error": "Paramètres manquants",
  "message": "Les paramètres 'element' et 'rarity' sont obligatoires",
  "required": ["element", "rarity"],
  "received": {
    "element": "wind",
    "rarity": null
  }
}
```

### GET /api/weapons/elements

Récupère la liste de tous les éléments disponibles.

**Exemple de réponse :**

```json
{
  "elements": ["dark", "earth", "fire", "light", "water", "wind"],
  "count": 6
}
```

### GET /api/weapons/rarities

Récupère la liste de toutes les raretés disponibles.

**Exemple de réponse :**

```json
{
  "rarities": ["N", "R", "SR", "SSR"],
  "count": 4
}
```

### GET /api/weapons/types

Récupère la liste de tous les types d'armes disponibles.

**Exemple de réponse :**

```json
{
  "types": [
    "axe",
    "bow",
    "dagger",
    "gun",
    "harp",
    "katana",
    "lance",
    "sabre",
    "spear",
    "staff",
    "sword"
  ],
  "count": 11
}
```

### GET /api/weapons/search

Recherche des armes par nom ou titre.

**Paramètres de requête :**

- `q` (requis) : Terme de recherche
- `limit` (optionnel) : Nombre maximum de résultats (défaut: 10)

**Exemple :**

```bash
GET /api/weapons/search?q=sword&limit=5
```

### GET /api/weapons/stats

Récupère les statistiques des armes.

**Exemple de réponse :**

```json
{
  "stats": {
    "general": {
      "totalWeapons": 2950,
      "avgAtk": 255.5,
      "maxAtk": 510,
      "minAtk": 75,
      "avgHp": 21.0,
      "maxHp": 42,
      "minHp": 6
    },
    "byType": [
      {
        "_id": "sabre",
        "count": 450,
        "avgAtk": 280.2,
        "avgHp": 22.1
      }
    ],
    "byElement": [
      {
        "_id": "wind",
        "count": 500,
        "avgAtk": 260.3
      }
    ],
    "byRarity": [
      {
        "_id": "N",
        "count": 1200
      }
    ]
  }
}
```

### GET /api/weapons/:id

Récupère une arme spécifique par son ID.

**Paramètres :**

- `id` : ID de l'arme

**Exemple :**

```bash
GET /api/weapons/689f2af62046a0d2c79300da
```

## 🔧 Routes des Skills d'Armes (Weapon Skills)

### GET /api/skills

Récupère tous les skills d'armes avec pagination.

**Paramètres de requête :**

- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre de skills par page (défaut: 10)
- `name` (optionnel) : Recherche par nom
- `type` (optionnel) : Type de skill

**Exemple de réponse :**

```json
{
  "skills": [
    {
      "_id": "689f2af62046a0d2c79300db",
      "name": "Double Slash",
      "description": "Small Wind damage to a foe.",
      "type": "attack",
      "level": 1,
      "createdAt": "2025-08-15T12:41:26.593Z",
      "updatedAt": "2025-08-15T12:41:26.593Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 500,
    "totalItems": 5000,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### GET /api/skills/:id

Récupère un skill spécifique par son ID.

**Paramètres :**

- `id` : ID du skill

## 🔐 Routes d'Authentification (Users)

### POST /api/users/register

Inscription d'un nouvel utilisateur.

**Corps de la requête :**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "motdepasse123"
}
```

**Exemple de réponse :**

```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "_id": "689f2af62046a0d2c79300dc",
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2025-08-15T12:41:26.593Z"
  }
}
```

### POST /api/users/login

Connexion d'un utilisateur.

**Corps de la requête :**

```json
{
  "username": "john_doe",
  "password": "motdepasse123"
}
```

**Exemple de réponse :**

```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "689f2af62046a0d2c79300dc",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### GET /api/users/profile

Récupère le profil de l'utilisateur connecté.

**Headers requis :**

```
Authorization: Bearer <token>
```

**Exemple de réponse :**

```json
{
  "user": {
    "_id": "689f2af62046a0d2c79300dc",
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2025-08-15T12:41:26.593Z",
    "updatedAt": "2025-08-15T12:41:26.593Z"
  }
}
```

### PUT /api/users/profile

Met à jour le profil de l'utilisateur connecté.

**Headers requis :**

```
Authorization: Bearer <token>
```

**Corps de la requête :**

```json
{
  "username": "john_doe_updated",
  "email": "john.updated@example.com"
}
```

### POST /api/users/change-password

Change le mot de passe de l'utilisateur connecté.

**Headers requis :**

```
Authorization: Bearer <token>
```

**Corps de la requête :**

```json
{
  "currentPassword": "ancienmotdepasse",
  "newPassword": "nouveaumotdepasse"
}
```

### GET /api/users/verify-token

Vérifie si le token JWT est valide.

**Headers requis :**

```
Authorization: Bearer <token>
```

**Exemple de réponse :**

```json
{
  "valid": true,
  "user": {
    "_id": "689f2af62046a0d2c79300dc",
    "username": "john_doe"
  }
}
```

## 🏥 Route de Santé (Health Check)

### GET /api/health

Vérifie l'état de l'API.

**Exemple de réponse :**

```json
{
  "status": "OK",
  "timestamp": "2025-08-15T12:41:26.593Z",
  "version": "1.0.0",
  "database": "connected",
  "uptime": "2h 15m 30s"
}
```

## Codes d'Erreur

- `400` : Requête invalide (données manquantes ou incorrectes)
- `401` : Non authentifié (token manquant ou invalide)
- `403` : Accès refusé (permissions insuffisantes)
- `404` : Ressource non trouvée
- `500` : Erreur serveur interne

## Exemples d'Utilisation

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

## Validation des Données

### Utilisateur

- `username` : Minimum 3 caractères
- `email` : Format email valide
- `password` : Minimum 6 caractères

### Arme

- `name` : Requis, non vide
- `type` : Requis, non vide
- `damage` : Nombre positif requis
- `range` : Nombre positif ou zéro (optionnel)
- `weight` : Nombre positif ou zéro (optionnel)
- `rarity` : Une des valeurs : common, uncommon, rare, epic, legendary

## Sécurité

- Mots de passe hashés avec bcrypt
- Tokens JWT avec expiration (24h par défaut)
- Validation des données côté serveur
- Protection CORS configurée
- Rate limiting activé
- Headers de sécurité avec Helmet
