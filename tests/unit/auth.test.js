const jwt = require("jsonwebtoken");
const {
  authenticateToken,
  requireRole,
  requireOwnership,
} = require("../../middleware/auth");
const userService = require("../../services/userService");
const {
  generateTestToken,
  mockRequest,
  mockResponse,
} = require("../utils/testHelpers");

// Mock du service utilisateur
jest.mock("../../services/userService");

describe("Auth Middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = jest.fn();

    // Reset des mocks
    jest.clearAllMocks();
  });

  describe("authenticateToken", () => {
    it("devrait authentifier un token valide", async () => {
      const token = generateTestToken();
      const mockUser = {
        _id: "test-user-id",
        username: "testuser",
        email: "test@example.com",
        role: "user",
      };

      req.headers.authorization = `Bearer ${token}`;
      userService.findById.mockResolvedValue(mockUser);

      await authenticateToken(req, res, next);

      expect(userService.findById).toHaveBeenCalledWith("test-user-id");
      expect(req.user).toEqual({
        userId: "test-user-id",
        username: "test@example.com",
        role: "user",
        ...mockUser,
      });
      expect(next).toHaveBeenCalled();
    });

    it("devrait rejeter une requête sans token", async () => {
      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Token d'accès requis",
        message: "Veuillez vous connecter pour accéder à cette ressource",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("devrait rejeter un token invalide", async () => {
      req.headers.authorization = "Bearer invalid-token";

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Token invalide",
        message: "Le token fourni n'est pas valide",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("devrait rejeter un token expiré", async () => {
      const expiredToken = jwt.sign(
        { userId: "test-user-id" },
        process.env.JWT_SECRET,
        { expiresIn: "-1h" }
      );

      req.headers.authorization = `Bearer ${expiredToken}`;

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Token expiré",
        message: "Votre session a expiré, veuillez vous reconnecter",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("devrait rejeter un token avec un utilisateur inexistant", async () => {
      const token = generateTestToken();
      req.headers.authorization = `Bearer ${token}`;
      userService.findById.mockResolvedValue(null);

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Token invalide",
        message: "Utilisateur non trouvé",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("devrait gérer les erreurs de service", async () => {
      const token = generateTestToken();
      req.headers.authorization = `Bearer ${token}`;
      userService.findById.mockRejectedValue(
        new Error("Erreur de base de données")
      );

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erreur d'authentification",
        message: "Une erreur est survenue lors de la vérification du token",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("requireRole", () => {
    it("devrait autoriser l'accès avec un rôle valide", () => {
      req.user = { userId: "test-id", role: "user" };
      const middleware = requireRole(["user"]);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("devrait refuser l'accès sans utilisateur authentifié", () => {
      const middleware = requireRole(["user"]);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Non authentifié",
        message: "Veuillez vous connecter",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("devrait refuser l'accès avec un rôle insuffisant", () => {
      req.user = { userId: "test-id", role: "user" };
      const middleware = requireRole(["admin"]);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Accès refusé",
        message: "Vous n'avez pas les permissions nécessaires",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("devrait autoriser l'accès sans restriction de rôle", () => {
      req.user = { userId: "test-id", role: "user" };
      const middleware = requireRole([]);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("requireOwnership", () => {
    it("devrait autoriser l'accès au propriétaire de la ressource", () => {
      req.user = { userId: "test-id" };
      req.params = { userId: "test-id" };
      const middleware = requireOwnership("userId");

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("devrait refuser l'accès sans utilisateur authentifié", () => {
      const middleware = requireOwnership("userId");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Non authentifié",
        message: "Veuillez vous connecter",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("devrait refuser l'accès à un utilisateur non propriétaire", () => {
      req.user = { userId: "test-id" };
      req.params = { userId: "other-id" };
      const middleware = requireOwnership("userId");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Accès refusé",
        message: "Vous ne pouvez modifier que vos propres données",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("devrait vérifier dans le body si le paramètre n'est pas dans params", () => {
      req.user = { userId: "test-id" };
      req.body = { userId: "test-id" };
      const middleware = requireOwnership("userId");

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("devrait autoriser l'accès si aucun paramètre de propriété n'est spécifié", () => {
      req.user = { userId: "test-id" };
      const middleware = requireOwnership("userId");

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
