import { Router } from "express";

import {
  register,
  login,
  getCurrentUser,
} from "../controllers/auth.controller.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

// Public authentication routes
router.post("/register", register);
router.post("/login", login);

// Get logged-in user
router.get("/me", authenticateToken, getCurrentUser);

// Customer-only route
router.get(
  "/customer-only",
  authenticateToken,
  authorizeRoles("customer"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome to the customer area!",
    });
  },
);

// Technician-only route
router.get(
  "/technician-only",
  authenticateToken,
  authorizeRoles("technician"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome to the technician area!",
    });
  },
);

// Admin-only route
router.get(
  "/admin-only",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome to the administrator area!",
    });
  },
);

export default router;
