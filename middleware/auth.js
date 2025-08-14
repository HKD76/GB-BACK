const jwt = require("jsonwebtoken");
const userService = require("../services/userService");

// Middleware d'authentification JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: "Token d'accès requis",
        message: "Veuillez vous connecter pour accéder à cette ressource",
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // Vérifier que l'utilisateur existe toujours
    const user = await userService.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: "Token invalide",
        message: "Utilisateur non trouvé",
      });
    }

    // Ajouter les informations utilisateur à la requête
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      ...user,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({
        error: "Token invalide",
        message: "Le token fourni n'est pas valide",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expiré",
        message: "Votre session a expiré, veuillez vous reconnecter",
      });
    }

    console.error("Erreur d'authentification:", error);
    return res.status(500).json({
      error: "Erreur d'authentification",
      message: "Une erreur est survenue lors de la vérification du token",
    });
  }
};

// Middleware pour vérifier les rôles (optionnel pour l'avenir)
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Non authentifié",
        message: "Veuillez vous connecter",
      });
    }

    // Pour l'instant, tous les utilisateurs ont le même rôle
    // Vous pouvez étendre cela plus tard en ajoutant un champ 'role' au modèle User
    if (roles && roles.length > 0) {
      // Vérification basique - à adapter selon vos besoins
      if (!roles.includes("user")) {
        return res.status(403).json({
          error: "Accès refusé",
          message: "Vous n'avez pas les permissions nécessaires",
        });
      }
    }

    next();
  };
};

// Middleware pour vérifier la propriété (l'utilisateur ne peut modifier que ses propres données)
const requireOwnership = (paramName = "userId") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Non authentifié",
        message: "Veuillez vous connecter",
      });
    }

    const resourceUserId = req.params[paramName] || req.body[paramName];

    if (resourceUserId && resourceUserId !== req.user.userId) {
      return res.status(403).json({
        error: "Accès refusé",
        message: "Vous ne pouvez modifier que vos propres données",
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requireOwnership,
};
