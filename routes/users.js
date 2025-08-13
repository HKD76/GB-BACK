const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { connectPostgres } = require("../config/database");
const router = express.Router();

// Middleware d'authentification
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token d'accès requis" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token invalide" });
  }
};

// POST /api/users/register - Inscription d'un utilisateur
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const postgresClient = await connectPostgres();

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await postgresClient.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Nom d'utilisateur ou email déjà utilisé" });
    }

    // Hasher le mot de passe
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const result = await postgresClient.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
      [username, email, passwordHash]
    );

    const user = result.rows[0];

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/users/login - Connexion d'un utilisateur
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const postgresClient = await connectPostgres();

    // Validation
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Nom d'utilisateur et mot de passe requis" });
    }

    // Trouver l'utilisateur
    const result = await postgresClient.query(
      "SELECT * FROM users WHERE username = $1 OR email = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ error: "Nom d'utilisateur ou mot de passe incorrect" });
    }

    const user = result.rows[0];

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res
        .status(401)
        .json({ error: "Nom d'utilisateur ou mot de passe incorrect" });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/users/profile - Profil de l'utilisateur connecté
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const postgresClient = await connectPostgres();

    const result = await postgresClient.query(
      "SELECT id, username, email, created_at, updated_at FROM users WHERE id = $1",
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT /api/users/profile - Mettre à jour le profil
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { username, email } = req.body;
    const postgresClient = await connectPostgres();

    // Validation
    if (!username && !email) {
      return res
        .status(400)
        .json({ error: "Au moins un champ à mettre à jour est requis" });
    }

    // Vérifier si le nouveau nom d'utilisateur ou email existe déjà
    if (username || email) {
      const existingUser = await postgresClient.query(
        "SELECT * FROM users WHERE (username = $1 OR email = $2) AND id != $3",
        [username || "", email || "", req.user.userId]
      );

      if (existingUser.rows.length > 0) {
        return res
          .status(400)
          .json({ error: "Nom d'utilisateur ou email déjà utilisé" });
      }
    }

    // Construire la requête de mise à jour
    let updateQuery = "UPDATE users SET updated_at = CURRENT_TIMESTAMP";
    let params = [];
    let paramCount = 0;

    if (username) {
      paramCount++;
      updateQuery += `, username = $${paramCount}`;
      params.push(username);
    }

    if (email) {
      paramCount++;
      updateQuery += `, email = $${paramCount}`;
      params.push(email);
    }

    paramCount++;
    updateQuery += ` WHERE id = $${paramCount} RETURNING id, username, email, created_at, updated_at`;
    params.push(req.user.userId);

    const result = await postgresClient.query(updateQuery, params);

    res.json({
      message: "Profil mis à jour avec succès",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/users/change-password - Changer le mot de passe
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const postgresClient = await connectPostgres();

    // Validation
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Ancien et nouveau mot de passe requis" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "Le nouveau mot de passe doit contenir au moins 6 caractères",
      });
    }

    // Récupérer l'utilisateur
    const userResult = await postgresClient.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Vérifier l'ancien mot de passe
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      userResult.rows[0].password_hash
    );

    if (!isValidPassword) {
      return res.status(401).json({ error: "Ancien mot de passe incorrect" });
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe
    await postgresClient.query(
      "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [newPasswordHash, req.user.userId]
    );

    res.json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/users/verify-token - Vérifier la validité du token
router.get("/verify-token", authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      userId: req.user.userId,
      username: req.user.username,
    },
  });
});

module.exports = router;
