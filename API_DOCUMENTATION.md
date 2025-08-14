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
