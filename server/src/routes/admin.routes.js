import { Router } from "express";

import {
  getPendingTechnicians,
  updateTechnicianVerification,
  getDashboardStats,
  getAllBookings,
  getAllUsers,
  updateUserStatus,
} from "../controllers/admin.controller.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

// All admin routes require administrator authentication.
router.use(authenticateToken, authorizeRoles("admin"));

// GET pending technician applications
router.get("/technicians/pending", getPendingTechnicians);
router.get("/dashboard", getDashboardStats);
router.get("/bookings", getAllBookings);
router.get("/users", getAllUsers);

// APPROVE OR REJECT technician
router.put("/technicians/:id/verification", updateTechnicianVerification);
router.put("/users/:id/status", updateUserStatus);

export default router;
