import { Router } from "express";

import {
  getMyServices,
  createService,
  updateService,
  deleteService,
} from "../controllers/service.controller.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

// All service management routes require technician authentication
router.use(authenticateToken, authorizeRoles("technician"));

// GET all services owned by the logged-in technician
router.get("/", getMyServices);

// CREATE a new service
router.post("/", createService);

// UPDATE an existing service
router.put("/:id", updateService);

// DELETE an existing service
router.delete("/:id", deleteService);

export default router;
