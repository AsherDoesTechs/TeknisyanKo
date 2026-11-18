import { Router } from "express";

import {
  getMyProfile,
  updateMyProfile,
} from "../controllers/technician.controller.js";

import {
  getTechnicianDirectory,
  getTechnicianDetails,
} from "../controllers/directory.controller.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

// PUBLIC ROUTES
// Browse verified technicians
// PUBLIC ROUTES
router.get("/", getTechnicianDirectory);
router.get("/:id", getTechnicianDetails);

// PROTECTED ROUTES
// Technician profile management
router.get(
  "/me",
  authenticateToken,
  authorizeRoles("technician"),
  getMyProfile,
);

router.put(
  "/me",
  authenticateToken,
  authorizeRoles("technician"),
  updateMyProfile,
);

export default router;
