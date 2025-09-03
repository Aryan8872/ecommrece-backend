import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/auth.config.js";
import dotenv from "dotenv"
dotenv.config()
// helper: get token string from header (supports "Bearer <token>" or just the token)
const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) return null;
  if (typeof authHeader !== "string") return null;
  return authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
};

// helper: normalize role strings for comparisons
const normalizeRole = (r) => String(r || "").toLowerCase().replace(/[\s_]/g, "");

// Middleware: ensure a valid token is present (but do NOT set req.user)
export const verifyToken = (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ message: "Unauthorized: Missing token" });

    // just verify; we don't attach payload to req
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

// Middleware factory: allow only specific roles (reads token itself; does not rely on req.user)
export const authorizeRoles = (...allowedRoles) => {
  const allowed = allowedRoles.map(normalizeRole);
  return (req, res, next) => {
    try {
      const token = getTokenFromHeader(req);
      if (!token) return res.status(401).json({ message: "Unauthorized: Missing token" });

      const payload = jwt.verify(token, JWT_SECRET);
      const role = normalizeRole(payload.role);

      if (!allowed.includes(role)) {
        return res.status(403).json({ message: "Forbidden: Insufficient role" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
  };
};

// Middleware: allow the owner (by id in params) OR admin/super-admin roles
export const authorizeSelfOrAdmin = (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ message: "Unauthorized: Missing token" });

    const payload = jwt.verify(token, JWT_SECRET);

    // Try both payload.id and payload.sub (common JWT fields)
    const userIdFromToken = String(payload.id ?? payload.sub ?? "");
    const paramId = String(req.params.id ?? req.params.userId ?? "");

    const roleNormalized = normalizeRole(payload.role);
    const isAdmin = roleNormalized === "admin" || roleNormalized === "superadmin";

    const isSelf = userIdFromToken && paramId && userIdFromToken === paramId;

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: "Forbidden: Only the user or an admin can perform this action" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};
