import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "siavem_secret_key_2026";

// Verificar que el usuario esté autenticado
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

// Verificar que el usuario tenga el rol requerido
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "No tenés permisos para esta acción" });
    }
    next();
  };
};
