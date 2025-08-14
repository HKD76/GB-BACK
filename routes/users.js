const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const userService = require("../services/userService");
const { authenticateToken, requireOwnership } = require("../middleware/auth");
const router = express.Router();

// POST /api/users/register - Inscription d'un utilisateur
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation des données
    const validationErrors = User.validate({ username, email, password });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Données invalides",
        details: validationErrors,
      });
    }

    // Créer l'utilisateur
    const user = await userService.createUser({ username, email, password });

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);

    if (error.message.includes("déjà utilisé")) {
      return res.status(400).json({
        error: "Erreur de validation",
        message: error.message,
      });
    }

    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de l'inscription",
    });
  }
});

// POST /api/users/login - Connexion d'un utilisateur
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        error: "Données manquantes",
        message: "Nom d'utilisateur et mot de passe requis",
      });
    }

    // Vérifier les identifiants
    const user = await userService.verifyCredentials(username, password);

    if (!user) {
      return res.status(401).json({
        error: "Identifiants invalides",
        message: "Nom d'utilisateur ou mot de passe incorrect",
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Connexion réussie",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la connexion",
    });
  }
});

// GET /api/users/profile - Profil de l'utilisateur connecté
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await userService.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        error: "Utilisateur non trouvé",
        message: "L'utilisateur n'existe plus",
      });
    }

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la récupération du profil",
    });
  }
});

// PUT /api/users/profile - Mettre à jour le profil
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { username, email } = req.body;

    // Validation
    if (!username && !email) {
      return res.status(400).json({
        error: "Données manquantes",
        message: "Au moins un champ à mettre à jour est requis",
      });
    }

    // Validation des champs individuels
    const updateData = {};
    if (username) {
      if (username.length < 3) {
        return res.status(400).json({
          error: "Nom d'utilisateur invalide",
          message: "Le nom d'utilisateur doit contenir au moins 3 caractères",
        });
      }
      updateData.username = username;
    }

    if (email) {
      if (!User.isValidEmail(email)) {
        return res.status(400).json({
          error: "Email invalide",
          message: "Format d'email invalide",
        });
      }
      updateData.email = email;
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await userService.updateUser(
      req.user.userId,
      updateData
    );

    res.json({
      message: "Profil mis à jour avec succès",
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);

    if (error.message.includes("déjà utilisé")) {
      return res.status(400).json({
        error: "Erreur de validation",
        message: error.message,
      });
    }

    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la mise à jour du profil",
    });
  }
});

// POST /api/users/change-password - Changer le mot de passe
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Données manquantes",
        message: "Ancien et nouveau mot de passe requis",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "Mot de passe invalide",
        message: "Le nouveau mot de passe doit contenir au moins 6 caractères",
      });
    }

    // Changer le mot de passe
    await userService.changePassword(
      req.user.userId,
      currentPassword,
      newPassword
    );

    res.json({
      message: "Mot de passe modifié avec succès",
    });
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);

    if (
      error.message.includes("incorrect") ||
      error.message.includes("non trouvé")
    ) {
      return res.status(400).json({
        error: "Erreur de validation",
        message: error.message,
      });
    }

    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors du changement de mot de passe",
    });
  }
});

// GET /api/users/verify-token - Vérifier la validité du token
router.get("/verify-token", authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      userId: req.user.userId,
      username: req.user.username,
      email: req.user.email,
    },
  });
});

// GET /api/users - Obtenir tous les utilisateurs (avec pagination)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await userService.getAllUsers(page, limit);

    res.json({
      users: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message:
        "Une erreur est survenue lors de la récupération des utilisateurs",
    });
  }
});

// GET /api/users/:id - Obtenir un utilisateur par ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const user = await userService.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "Utilisateur non trouvé",
        message: "L'utilisateur demandé n'existe pas",
      });
    }

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message:
        "Une erreur est survenue lors de la récupération de l'utilisateur",
    });
  }
});

// DELETE /api/users/:id - Supprimer un utilisateur
router.delete(
  "/:id",
  authenticateToken,
  requireOwnership("id"),
  async (req, res) => {
    try {
      await userService.deleteUser(req.params.id);

      res.json({
        message: "Utilisateur supprimé avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);

      if (error.message.includes("non trouvé")) {
        return res.status(404).json({
          error: "Utilisateur non trouvé",
          message: error.message,
        });
      }

      res.status(500).json({
        error: "Erreur serveur",
        message:
          "Une erreur est survenue lors de la suppression de l'utilisateur",
      });
    }
  }
);

module.exports = router;
