import { Router } from "express";

import {
  createReview,
  getTechnicianReviews,
} from "../controllers/review.controller.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

// CUSTOMER: Submit a review
router.post(
  "/booking/:bookingId",
  authenticateToken,
  authorizeRoles("customer"),
  createReview,
);

// PUBLIC: View technician reviews
router.get("/technician/:technicianId", getTechnicianReviews);

export default router;
