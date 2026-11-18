import { Router } from "express";

import {
  createBooking,
  getMyBookings,
  getIncomingBookings,
  respondToBooking,
  updateBookingStatus,
} from "../controllers/booking.controller.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();

// CUSTOMER ROUTES
router.post("/", authenticateToken, authorizeRoles("customer"), createBooking);

router.get("/", authenticateToken, authorizeRoles("customer"), getMyBookings);

// TECHNICIAN ROUTES
router.get(
  "/technician/incoming",
  authenticateToken,
  authorizeRoles("technician"),
  getIncomingBookings,
);

router.put(
  "/technician/:id/respond",
  authenticateToken,
  authorizeRoles("technician"),
  respondToBooking,
);

router.put(
  "/technician/:id/status",
  authenticateToken,
  authorizeRoles("technician"),
  updateBookingStatus,
);

export default router;
