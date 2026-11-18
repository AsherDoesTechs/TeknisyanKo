import { db } from "../config/database.js";

// GET ALL PENDING TECHNICIANS
export const getPendingTechnicians = async (req, res) => {
  try {
    const [technicians] = await db.query(
      `SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        tp.bio,
        tp.years_of_experience,
        tp.verification_status,
        tp.created_at
      FROM users u
      INNER JOIN technician_profiles tp
        ON tp.user_id = u.id
      WHERE u.role = 'technician'
        AND tp.verification_status = 'pending'
      ORDER BY tp.created_at DESC`,
    );

    return res.status(200).json({
      success: true,
      total: technicians.length,
      technicians,
    });
  } catch (error) {
    console.error("Get pending technicians error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve pending technicians.",
    });
  }
};

// UPDATE TECHNICIAN VERIFICATION STATUS
export const updateTechnicianVerification = async (req, res) => {
  try {
    const technicianId = Number(req.params.id);
    const { verification_status } = req.body;

    if (!Number.isInteger(technicianId) || technicianId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid technician ID.",
      });
    }

    const allowedStatuses = ["verified", "rejected"];

    if (!allowedStatuses.includes(verification_status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either verified or rejected.",
      });
    }

    const [result] = await db.query(
      `UPDATE technician_profiles tp
       INNER JOIN users u ON u.id = tp.user_id
       SET tp.verification_status = ?
       WHERE u.id = ?
         AND u.role = 'technician'`,
      [verification_status, technicianId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Technician not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Technician ${verification_status} successfully.`,
      technician_id: technicianId,
      verification_status,
    });
  } catch (error) {
    console.error("Update technician verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update technician verification.",
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const [
      [userStats],
      [technicianStats],
      [bookingStats],
      [bookingStatusStats],
      [recentBookings],
    ] = await Promise.all([
      // CUSTOMER AND USER COUNTS
      db.query(`
        SELECT
          COUNT(*) AS total_users,
          SUM(role = 'customer') AS total_customers,
          SUM(role = 'technician') AS total_technicians
        FROM users
      `),

      // TECHNICIAN VERIFICATION COUNTS
      db.query(`
        SELECT
          COUNT(*) AS total_profiles,
          SUM(verification_status = 'pending') AS pending_technicians,
          SUM(verification_status = 'verified') AS verified_technicians,
          SUM(verification_status = 'rejected') AS rejected_technicians
        FROM technician_profiles
      `),

      // TOTAL BOOKINGS
      db.query(`
        SELECT COUNT(*) AS total_bookings
        FROM bookings
      `),

      // BOOKINGS GROUPED BY STATUS
      db.query(`
        SELECT status, COUNT(*) AS total
        FROM bookings
        GROUP BY status
      `),

      // FIVE MOST RECENT BOOKINGS
      db.query(`
        SELECT
          b.id,
          b.booking_reference,
          b.status,
          b.scheduled_at,
          b.created_at,
          s.service_name,
          CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
          CONCAT(t.first_name, ' ', t.last_name) AS technician_name
        FROM bookings b
        JOIN users c ON c.id = b.customer_id
        JOIN users t ON t.id = b.technician_id
        JOIN services s ON s.id = b.service_id
        ORDER BY b.created_at DESC
        LIMIT 5
      `),
    ]);

    return res.status(200).json({
      success: true,
      dashboard: {
        users: {
          total: Number(userStats.total_users),
          customers: Number(userStats.total_customers),
          technicians: Number(userStats.total_technicians),
        },
        technician_verification: {
          total: Number(technicianStats.total_profiles),
          pending: Number(technicianStats.pending_technicians || 0),
          verified: Number(technicianStats.verified_technicians || 0),
          rejected: Number(technicianStats.rejected_technicians || 0),
        },
        bookings: {
          total: Number(bookingStats.total_bookings),
          by_status: bookingStatusStats.reduce((result, item) => {
            result[item.status] = Number(item.total);
            return result;
          }, {}),
        },
        recent_bookings: recentBookings,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard statistics.",
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    // VALIDATE PAGINATION
    const currentPage = Number(page);
    const pageLimit = Number(limit);

    if (
      !Number.isInteger(currentPage) ||
      currentPage < 1 ||
      !Number.isInteger(pageLimit) ||
      pageLimit < 1 ||
      pageLimit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters.",
      });
    }

    const validStatuses = [
      "pending",
      "accepted",
      "in_progress",
      "completed",
      "cancelled",
      "rejected",
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status.",
      });
    }

    const offset = (currentPage - 1) * pageLimit;

    let conditions = [];
    let params = [];

    // FILTER BY STATUS
    if (status) {
      conditions.push("b.status = ?");
      params.push(status);
    }

    // SEARCH BOOKING REFERENCE, CUSTOMER, OR TECHNICIAN
    if (search) {
      conditions.push(`(
        b.booking_reference LIKE ?
        OR CONCAT(c.first_name, ' ', c.last_name) LIKE ?
        OR CONCAT(t.first_name, ' ', t.last_name) LIKE ?
      )`);

      const searchTerm = `%${search}%`;

      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // GET TOTAL MATCHING BOOKINGS
    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total
       FROM bookings b
       JOIN users c ON c.id = b.customer_id
       JOIN users t ON t.id = b.technician_id
       ${whereClause}`,
      params,
    );

    // GET BOOKING RECORDS
    const [bookings] = await db.query(
      `SELECT
        b.id,
        b.booking_reference,
        b.status,
        b.scheduled_at,
        b.service_address,
        b.service_description,
        b.estimated_price,
        b.final_price,
        b.created_at,
        b.updated_at,

        b.customer_id,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        c.phone AS customer_phone,

        b.technician_id,
        CONCAT(t.first_name, ' ', t.last_name) AS technician_name,
        t.phone AS technician_phone,

        b.service_id,
        s.service_name,
        sc.name AS category_name

       FROM bookings b
       JOIN users c ON c.id = b.customer_id
       JOIN users t ON t.id = b.technician_id
       JOIN services s ON s.id = b.service_id
       JOIN service_categories sc ON sc.id = s.category_id

       ${whereClause}

       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageLimit, offset],
    );

    const total = Number(countResult[0].total);

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page: currentPage,
        limit: pageLimit,
        total_pages: Math.ceil(total / pageLimit),
      },
      bookings,
    });
  } catch (error) {
    console.error("Get all bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve bookings.",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;

    // VALIDATE PAGINATION
    const currentPage = Number(page);
    const pageLimit = Number(limit);

    if (
      !Number.isInteger(currentPage) ||
      currentPage < 1 ||
      !Number.isInteger(pageLimit) ||
      pageLimit < 1 ||
      pageLimit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters.",
      });
    }

    const validRoles = ["customer", "technician", "admin"];
    const validStatuses = ["active", "inactive", "suspended"];

    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account status.",
      });
    }

    if (search && typeof search !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid search value.",
      });
    }

    const offset = (currentPage - 1) * pageLimit;

    const conditions = [];
    const params = [];

    // FILTER BY ROLE
    if (role) {
      conditions.push("u.role = ?");
      params.push(role);
    }

    // FILTER BY ACCOUNT STATUS
    if (status) {
      conditions.push("u.account_status = ?");
      params.push(status);
    }

    // SEARCH USERS
    if (search?.trim()) {
      conditions.push(`(
        CONCAT(u.first_name, ' ', u.last_name) LIKE ?
        OR u.email LIKE ?
        OR u.phone LIKE ?
      )`);

      const searchTerm = `%${search.trim()}%`;

      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // GET TOTAL MATCHING USERS
    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total
       FROM users u
       ${whereClause}`,
      params,
    );

    // GET USERS
    const [users] = await db.query(
      `SELECT
        u.id,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        u.email,
        u.phone,
        u.role,
        u.account_status,
        u.created_at,
        tp.verification_status

       FROM users u
       LEFT JOIN technician_profiles tp
         ON tp.user_id = u.id

       ${whereClause}

       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageLimit, offset],
    );

    const total = Number(countResult[0].total);

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page: currentPage,
        limit: pageLimit,
        total_pages: Math.ceil(total / pageLimit),
      },
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users.",
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { account_status } = req.body;

    // VALIDATE USER ID
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    // VALIDATE ACCOUNT STATUS
    const validStatuses = ["active", "inactive", "suspended"];

    if (!validStatuses.includes(account_status)) {
      return res.status(400).json({
        success: false,
        message: "Account status must be active, inactive, or suspended.",
      });
    }

    // CHECK IF USER EXISTS
    const [users] = await db.query(
      `SELECT id, role, account_status
       FROM users
       WHERE id = ?`,
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = users[0];

    // PROTECT ADMIN ACCOUNTS
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Administrator accounts cannot be modified through this endpoint.",
      });
    }

    // CHECK IF STATUS IS ALREADY THE SAME
    if (user.account_status === account_status) {
      return res.status(409).json({
        success: false,
        message: `User account is already ${account_status}.`,
      });
    }

    // UPDATE ACCOUNT STATUS
    await db.query(
      `UPDATE users
       SET account_status = ?
       WHERE id = ? AND role != 'admin'`,
      [account_status, userId],
    );

    return res.status(200).json({
      success: true,
      message: `User account successfully ${account_status}.`,
      user: {
        id: userId,
        role: user.role,
        previous_status: user.account_status,
        account_status,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user account status.",
    });
  }
};
