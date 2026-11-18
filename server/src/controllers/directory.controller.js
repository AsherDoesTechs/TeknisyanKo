import { db } from "../config/database.js";

// GET PUBLIC TECHNICIAN DIRECTORY
export const getTechnicianDirectory = async (req, res) => {
  try {
    const search = req.query.search?.trim() || "";
    const categoryId = req.query.category_id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    // Validate pagination
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 50
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid pagination values. Page must be positive and limit must be between 1 and 50.",
      });
    }

    // Validate search
    if (typeof search !== "string" || search.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Search must not exceed 100 characters.",
      });
    }

    // Validate category filter
    let parsedCategoryId = null;

    if (categoryId !== undefined) {
      parsedCategoryId = Number(categoryId);

      if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID.",
        });
      }
    }

    const conditions = [
      "u.role = 'technician'",
      "u.account_status = 'active'",
      "tp.verification_status = 'verified'",
    ];

    const values = [];

    // Search technician name or service name
    if (search) {
      conditions.push(`
        (
          u.first_name LIKE ?
          OR u.last_name LIKE ?
          OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?
          OR EXISTS (
            SELECT 1
            FROM services ss
            WHERE ss.technician_id = tp.id
              AND ss.is_available = TRUE
              AND ss.service_name LIKE ?
          )
        )
      `);

      const keyword = `%${search}%`;

      values.push(keyword, keyword, keyword, keyword);
    }

    // Filter by service category
    if (parsedCategoryId !== null) {
      conditions.push(`
        EXISTS (
          SELECT 1
          FROM services cs
          WHERE cs.technician_id = tp.id
            AND cs.category_id = ?
            AND cs.is_available = TRUE
        )
      `);

      values.push(parsedCategoryId);
    }

    const whereClause = conditions.join(" AND ");

    // Get total number of matching technicians
    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM users u
       INNER JOIN technician_profiles tp
         ON u.id = tp.user_id
       WHERE ${whereClause}`,
      values,
    );

    const total = countRows[0].total;
    const offset = (page - 1) * limit;

    // Retrieve technicians
    const [technicians] = await db.execute(
      `SELECT
        u.id AS technician_user_id,
        u.first_name,
        u.last_name,
        tp.bio,
        tp.years_of_experience,
        tp.profile_image,

        (
          SELECT COUNT(*)
          FROM services s
          WHERE s.technician_id = tp.id
            AND s.is_available = TRUE
        ) AS services_count,

        (
          SELECT ROUND(AVG(r.rating), 1)
          FROM reviews r
          WHERE r.technician_id = u.id
        ) AS average_rating,

        (
          SELECT COUNT(*)
          FROM reviews r
          WHERE r.technician_id = u.id
        ) AS review_count

       FROM users u
       INNER JOIN technician_profiles tp
         ON u.id = tp.user_id

       WHERE ${whereClause}

       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset],
    );

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
      technicians,
    });
  } catch (error) {
    console.error("Technician directory error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve technician directory.",
    });
  }
};

// GET PUBLIC TECHNICIAN DETAILS
export const getTechnicianDetails = async (req, res) => {
  const technicianId = Number(req.params.id);

  if (!Number.isInteger(technicianId) || technicianId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid technician ID.",
    });
  }

  try {
    // Retrieve technician profile
    const [technicians] = await db.execute(
      `SELECT
        u.id AS technician_user_id,
        u.first_name,
        u.last_name,
        tp.bio,
        tp.years_of_experience,
        tp.profile_image,

        (
          SELECT ROUND(AVG(r.rating), 1)
          FROM reviews r
          WHERE r.technician_id = u.id
        ) AS average_rating,

        (
          SELECT COUNT(*)
          FROM reviews r
          WHERE r.technician_id = u.id
        ) AS review_count

      FROM users u
      INNER JOIN technician_profiles tp
        ON u.id = tp.user_id

      WHERE u.id = ?
        AND u.role = 'technician'
        AND u.account_status = 'active'
        AND tp.verification_status = 'verified'

      LIMIT 1`,
      [technicianId],
    );

    if (technicians.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Verified technician not found.",
      });
    }

    // Retrieve technician's available services
    const [services] = await db.execute(
      `SELECT
        s.id,
        s.service_name,
        s.description,
        s.base_price,
        sc.id AS category_id,
        sc.name AS category_name,
        sc.icon AS category_icon

      FROM services s

      INNER JOIN technician_profiles tp
        ON s.technician_id = tp.id

      INNER JOIN service_categories sc
        ON s.category_id = sc.id

      WHERE tp.user_id = ?
        AND s.is_available = TRUE
        AND sc.is_active = TRUE

      ORDER BY s.created_at DESC`,
      [technicianId],
    );

    return res.status(200).json({
      success: true,
      technician: {
        ...technicians[0],
        services_count: services.length,
        services,
      },
    });
  } catch (error) {
    console.error("Technician details error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve technician details.",
    });
  }
};
