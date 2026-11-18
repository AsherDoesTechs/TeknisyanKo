import { db } from "../config/database.js";

// GET MY SERVICES
export const getMyServices = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT
        s.id,
        s.service_name,
        s.description,
        s.base_price,
        s.is_available,
        s.created_at,
        sc.id AS category_id,
        sc.name AS category_name
      FROM services s
      INNER JOIN technician_profiles tp
        ON s.technician_id = tp.id
      INNER JOIN service_categories sc
        ON s.category_id = sc.id
      WHERE tp.user_id = ?
      ORDER BY s.created_at DESC`,
      [req.user.id],
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      services: rows,
    });
  } catch (error) {
    console.error("Get technician services error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve services.",
    });
  }
};

// ADD SERVICE
export const createService = async (req, res) => {
  const { category_id, service_name, description, base_price } = req.body;

  if (
    !category_id ||
    !service_name ||
    base_price === undefined ||
    base_price === null
  ) {
    return res.status(400).json({
      success: false,
      message: "Category, service name, and base price are required.",
    });
  }

  if (!Number.isInteger(category_id) || category_id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid category ID.",
    });
  }

  if (
    typeof service_name !== "string" ||
    !service_name.trim() ||
    service_name.trim().length > 150
  ) {
    return res.status(400).json({
      success: false,
      message: "Service name must be between 1 and 150 characters.",
    });
  }

  if (
    description !== undefined &&
    description !== null &&
    (typeof description !== "string" || description.length > 5000)
  ) {
    return res.status(400).json({
      success: false,
      message: "Description must be text and cannot exceed 5000 characters.",
    });
  }

  const price = Number(base_price);

  if (!Number.isFinite(price) || price < 0) {
    return res.status(400).json({
      success: false,
      message: "Base price must be a valid non-negative number.",
    });
  }

  try {
    const [profiles] = await db.execute(
      "SELECT id FROM technician_profiles WHERE user_id = ?",
      [req.user.id],
    );

    if (profiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Technician profile not found.",
      });
    }

    const [categories] = await db.execute(
      `SELECT id FROM service_categories
       WHERE id = ? AND is_active = TRUE`,
      [category_id],
    );

    if (categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Selected service category does not exist or is inactive.",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO services
        (technician_id, category_id, service_name, description, base_price)
       VALUES (?, ?, ?, ?, ?)`,
      [
        profiles[0].id,
        category_id,
        service_name.trim(),
        description?.trim() || null,
        price,
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Service created successfully!",
      service_id: result.insertId,
    });
  } catch (error) {
    console.error("Create service error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create service.",
    });
  }
};

// UPDATE MY SERVICE
export const updateService = async (req, res) => {
  const serviceId = Number(req.params.id);

  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid service ID.",
    });
  }

  const { category_id, service_name, description, base_price, is_available } =
    req.body;

  const updates = [];
  const values = [];

  if (category_id !== undefined) {
    if (!Number.isInteger(category_id) || category_id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    updates.push("category_id = ?");
    values.push(category_id);
  }

  if (service_name !== undefined) {
    if (
      typeof service_name !== "string" ||
      !service_name.trim() ||
      service_name.trim().length > 150
    ) {
      return res.status(400).json({
        success: false,
        message: "Service name must be between 1 and 150 characters.",
      });
    }

    updates.push("service_name = ?");
    values.push(service_name.trim());
  }

  if (description !== undefined) {
    if (
      description !== null &&
      (typeof description !== "string" || description.length > 5000)
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be text and cannot exceed 5000 characters.",
      });
    }

    updates.push("description = ?");
    values.push(description?.trim() || null);
  }

  if (base_price !== undefined) {
    const price = Number(base_price);

    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Base price must be a valid non-negative number.",
      });
    }

    updates.push("base_price = ?");
    values.push(price);
  }

  if (is_available !== undefined) {
    if (typeof is_available !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Availability must be true or false.",
      });
    }

    updates.push("is_available = ?");
    values.push(is_available);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one field must be provided.",
    });
  }

  try {
    if (category_id !== undefined) {
      const [categories] = await db.execute(
        `SELECT id FROM service_categories
         WHERE id = ? AND is_active = TRUE`,
        [category_id],
      );

      if (categories.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Selected service category does not exist or is inactive.",
        });
      }
    }

    values.push(serviceId, req.user.id);

    const [result] = await db.execute(
      `UPDATE services s
       INNER JOIN technician_profiles tp
         ON s.technician_id = tp.id
       SET ${updates.join(", ")}
       WHERE s.id = ? AND tp.user_id = ?`,
      values,
    );

    if (result.affectedRows === 0) {
      const [existing] = await db.execute(
        `SELECT s.id
         FROM services s
         INNER JOIN technician_profiles tp
           ON s.technician_id = tp.id
         WHERE s.id = ? AND tp.user_id = ?`,
        [serviceId, req.user.id],
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Service not found or you do not own this service.",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Service updated successfully!",
    });
  } catch (error) {
    console.error("Update service error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update service.",
    });
  }
};

// DELETE MY SERVICE
export const deleteService = async (req, res) => {
  const serviceId = Number(req.params.id);

  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid service ID.",
    });
  }

  try {
    const [result] = await db.execute(
      `DELETE s FROM services s
       INNER JOIN technician_profiles tp
         ON s.technician_id = tp.id
       WHERE s.id = ? AND tp.user_id = ?`,
      [serviceId, req.user.id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found or you do not own this service.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully!",
    });
  } catch (error) {
    console.error("Delete service error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete service.",
    });
  }
};
