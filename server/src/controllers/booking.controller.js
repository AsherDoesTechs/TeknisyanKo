import { db } from "../config/database.js";
import { randomUUID } from "crypto";

// CREATE CUSTOMER BOOKING
export const createBooking = async (req, res) => {
  try {
    const customerId = req.user.id;

    const {
      technician_id,
      service_id,
      scheduled_at,
      service_address,
      service_description,
    } = req.body;

    // 1. Validate required fields
    if (!technician_id || !service_id || !scheduled_at || !service_address) {
      return res.status(400).json({
        success: false,
        message: "Technician, service, schedule, and address are required.",
      });
    }

    // 2. Validate technician and service IDs
    const technicianId = Number(technician_id);
    const serviceId = Number(service_id);

    if (
      !Number.isInteger(technicianId) ||
      technicianId <= 0 ||
      !Number.isInteger(serviceId) ||
      serviceId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid technician or service ID.",
      });
    }

    // 3. Validate schedule
    const scheduledDate = new Date(scheduled_at);

    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date and time.",
      });
    }

    if (scheduledDate.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Appointment must be scheduled in the future.",
      });
    }

    // 4. Validate service address
    if (
      typeof service_address !== "string" ||
      !service_address.trim() ||
      service_address.trim().length > 500
    ) {
      return res.status(400).json({
        success: false,
        message: "Service address must be between 1 and 500 characters.",
      });
    }

    // 5. Validate service description
    if (
      service_description !== undefined &&
      (typeof service_description !== "string" ||
        service_description.length > 5000)
    ) {
      return res.status(400).json({
        success: false,
        message: "Service description must not exceed 5000 characters.",
      });
    }

    // 6. Verify technician and selected service
    const [services] = await db.query(
      `SELECT
        s.id AS service_id,
        s.technician_id,
        s.base_price,
        s.service_name,
        u.id AS technician_user_id
      FROM services s
      INNER JOIN technician_profiles tp
        ON tp.id = s.technician_id
      INNER JOIN users u
        ON u.id = tp.user_id
      INNER JOIN service_categories sc
        ON sc.id = s.category_id
      WHERE s.id = ?
        AND u.id = ?
        AND u.role = 'technician'
        AND u.account_status = 'active'
        AND tp.verification_status = 'verified'
        AND s.is_available = TRUE
        AND sc.is_active = TRUE`,
      [serviceId, technicianId],
    );

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Available service not found for this technician.",
      });
    }

    const selectedService = services[0];

    // 7. Generate unique booking reference
    const bookingReference = `TK-${randomUUID()
      .replace(/-/g, "")
      .substring(0, 12)
      .toUpperCase()}`;

    // 8. Create booking
    const [result] = await db.query(
      `INSERT INTO bookings (
        customer_id,
        technician_id,
        service_id,
        booking_reference,
        scheduled_at,
        service_address,
        service_description,
        status,
        estimated_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        customerId,
        technicianId,
        serviceId,
        bookingReference,
        scheduledDate,
        service_address.trim(),
        service_description?.trim() || null,
        selectedService.base_price,
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      booking: {
        id: result.insertId,
        booking_reference: bookingReference,
        technician_id: technicianId,
        service_id: serviceId,
        service_name: selectedService.service_name,
        scheduled_at: scheduledDate,
        service_address: service_address.trim(),
        service_description: service_description?.trim() || null,
        status: "pending",
        estimated_price: selectedService.base_price,
      },
    });
  } catch (error) {
    console.error("Create booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create booking.",
    });
  }
};

// GET CUSTOMER BOOKING HISTORY
export const getMyBookings = async (req, res) => {
  try {
    const customerId = req.user.id;

    const [bookings] = await db.query(
      `SELECT
        b.id,
        b.booking_reference,
        b.scheduled_at,
        b.service_address,
        b.service_description,
        b.status,
        b.estimated_price,
        b.final_price,
        b.created_at,

        s.id AS service_id,
        s.service_name,

        sc.name AS category_name,

        u.id AS technician_id,
        u.first_name AS technician_first_name,
        u.last_name AS technician_last_name,
        u.phone AS technician_phone,

        tp.profile_image

      FROM bookings b

      INNER JOIN services s
        ON s.id = b.service_id

      INNER JOIN service_categories sc
        ON sc.id = s.category_id

      INNER JOIN users u
        ON u.id = b.technician_id

      LEFT JOIN technician_profiles tp
        ON tp.user_id = u.id

      WHERE b.customer_id = ?

      ORDER BY b.created_at DESC`,
      [customerId],
    );

    return res.status(200).json({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get customer bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve booking history.",
    });
  }
};

// GET INCOMING BOOKINGS FOR TECHNICIAN
export const getIncomingBookings = async (req, res) => {
  try {
    const technicianId = req.user.id;

    const [bookings] = await db.query(
      `SELECT
        b.id,
        b.booking_reference,
        b.scheduled_at,
        b.service_address,
        b.service_description,
        b.status,
        b.estimated_price,
        b.created_at,

        s.service_name,
        sc.name AS category_name,

        u.id AS customer_id,
        u.first_name AS customer_first_name,
        u.last_name AS customer_last_name,
        u.phone AS customer_phone

      FROM bookings b

      INNER JOIN services s
        ON s.id = b.service_id

      INNER JOIN service_categories sc
        ON sc.id = s.category_id

      INNER JOIN users u
        ON u.id = b.customer_id

      WHERE b.technician_id = ?
        AND b.status = 'pending'

      ORDER BY b.created_at DESC`,
      [technicianId],
    );

    return res.status(200).json({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get incoming bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve incoming bookings.",
    });
  }
};

// ACCEPT OR REJECT A BOOKING
export const respondToBooking = async (req, res) => {
  try {
    const technicianId = req.user.id;
    const bookingId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be accepted or rejected.",
      });
    }

    const [result] = await db.query(
      `UPDATE bookings
       SET status = ?
       WHERE id = ?
         AND technician_id = ?
         AND status = 'pending'`,
      [status, bookingId, technicianId],
    );

    if (result.affectedRows === 0) {
      const [existing] = await db.query(
        `SELECT id, status
         FROM bookings
         WHERE id = ? AND technician_id = ?`,
        [bookingId, technicianId],
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Booking not found or not assigned to you.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "This booking has already been processed.",
        current_status: existing[0].status,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Booking ${status} successfully.`,
      booking_id: bookingId,
      status,
    });
  } catch (error) {
    console.error("Respond to booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to respond to booking.",
    });
  }
};

// UPDATE JOB PROGRESS
export const updateBookingStatus = async (req, res) => {
  try {
    const technicianId = req.user.id;
    const bookingId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const allowedTransitions = {
      in_progress: "accepted",
      completed: "in_progress",
    };

    if (!Object.prototype.hasOwnProperty.call(allowedTransitions, status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be in_progress or completed.",
      });
    }

    const previousStatus = allowedTransitions[status];

    const [result] = await db.query(
      `UPDATE bookings
       SET status = ?
       WHERE id = ?
         AND technician_id = ?
         AND status = ?`,
      [status, bookingId, technicianId, previousStatus],
    );

    if (result.affectedRows === 0) {
      const [existing] = await db.query(
        `SELECT id, status
         FROM bookings
         WHERE id = ?
           AND technician_id = ?`,
        [bookingId, technicianId],
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Booking not found or not assigned to you.",
        });
      }

      return res.status(409).json({
        success: false,
        message: `Cannot change booking from ${existing[0].status} to ${status}.`,
        current_status: existing[0].status,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}.`,
      booking_id: bookingId,
      previous_status: previousStatus,
      status,
    });
  } catch (error) {
    console.error("Update booking status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update booking status.",
    });
  }
};
