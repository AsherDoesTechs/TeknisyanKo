import jwt from "jsonwebtoken";
import { db } from "../config/database.js";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
    });
  }

  try {
    // VERIFY JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // CHECK CURRENT USER INFORMATION IN MYSQL
    const [users] = await db.query(
      `SELECT id, role, account_status
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [decoded.id],
    );

    // CHECK IF ACCOUNT STILL EXISTS
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists.",
      });
    }

    const user = users[0];

    // CHECK CURRENT ACCOUNT STATUS
    if (user.account_status !== "active") {
      return res.status(403).json({
        success: false,
        message: `Your account is ${user.account_status}. Access denied.`,
      });
    }

    // USE CURRENT DATABASE ROLE
    req.user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token.",
      });
    }

    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication service temporarily unavailable.",
    });
  }
};

// ROLE AUTHORIZATION
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource.",
      });
    }

    next();
  };
};
