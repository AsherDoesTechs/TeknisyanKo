import { db } from "../config/database.js";

// CREATE CUSTOMER REVIEW
export const createReview = async (req, res) => {
  try {
    const customerId = req.user.id;
    const bookingId = Number(req.params.bookingId);
    const { rating, comment } = req.body;

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5.",
      });
    }

    if (
      comment !== undefined &&
      comment !== null &&
      (typeof comment !== "string" || comment.length > 2000)
    ) {
      return res.status(400).json({
        success: false,
        message: "Comment must be a string with a maximum of 2000 characters.",
      });
    }

    const [bookings] = await db.query(
      `SELECT id, customer_id, technician_id, status
       FROM bookings
       WHERE id = ? AND customer_id = ?`,
      [bookingId, customerId],
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const booking = bookings[0];

    if (booking.status !== "completed") {
      return res.status(409).json({
        success: false,
        message: "You can only review completed bookings.",
      });
    }

    const [result] = await db.query(
      `INSERT INTO reviews
       (booking_id, customer_id, technician_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [
        bookingId,
        customerId,
        booking.technician_id,
        rating,
        comment?.trim() || null,
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review: {
        id: result.insertId,
        booking_id: bookingId,
        technician_id: booking.technician_id,
        rating,
        comment: comment?.trim() || null,
      },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this booking.",
      });
    }

    console.error("Create review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit review.",
    });
  }
};

// GET PUBLIC TECHNICIAN REVIEWS
export const getTechnicianReviews = async (req, res) => {
  try {
    const technicianId = Number(req.params.technicianId);

    if (!Number.isInteger(technicianId) || technicianId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid technician ID.",
      });
    }

    const [reviews] = await db.query(
      `SELECT
         r.id,
         r.rating,
         r.comment,
         r.created_at,
         CONCAT(c.first_name, ' ', c.last_name) AS customer_name
       FROM reviews r
       JOIN users c ON c.id = r.customer_id
       WHERE r.technician_id = ?
       ORDER BY r.created_at DESC`,
      [technicianId],
    );

    const averageRating =
      reviews.length > 0
        ? Number(
            (
              reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length
            ).toFixed(1),
          )
        : 0;

    return res.status(200).json({
      success: true,
      total: reviews.length,
      average_rating: averageRating,
      reviews,
    });
  } catch (error) {
    console.error("Get technician reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve technician reviews.",
    });
  }
};
