const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para verificar token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Formato: Bearer <token>

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado. Token requerido." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido o expirado." });
    }
    req.user = user; // Guardamos los datos del usuario en la request
    next();
  });
}

module.exports = authenticateToken;
