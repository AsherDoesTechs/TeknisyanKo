import { db } from "../config/database.js";

// ==========================================
// GET TECHNICIAN PROFILE
// ==========================================

export const getMyProfile = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        tp.id AS technician_id,
        tp.bio,
        tp.years_of_experience,
        tp.profile_image,
        tp.verification_status,
        tp.created_at
       FROM users u
       INNER JOIN technician_profiles tp
         ON u.id = tp.user_id
       WHERE u.id = ?
       LIMIT 1`,
      [req.user.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Technician profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      technician: rows[0],
    });
  } catch (error) {
    console.error("Get technician profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve technician profile.",
    });
  }
};

// ==========================================
// UPDATE TECHNICIAN PROFILE
// ==========================================

export const updateMyProfile = async (req, res) => {
  const { bio, years_of_experience } = req.body;

  if (bio === undefined && years_of_experience === undefined) {
    return res.status(400).json({
      success: false,
      message: "At least one profile field must be provided.",
    });
  }

  if (
    years_of_experience !== undefined &&
    (!Number.isInteger(years_of_experience) ||
      years_of_experience < 0 ||
      years_of_experience > 100)
  ) {
    return res.status(400).json({
      success: false,
      message: "Years of experience must be a whole number between 0 and 100.",
    });
  }

  try {
    const [result] = await db.execute(
      `UPDATE technician_profiles
       SET
         bio = COALESCE(?, bio),
         years_of_experience = COALESCE(?, years_of_experience)
       WHERE user_id = ?`,
      [
        bio === undefined ? null : bio.trim(),
        years_of_experience ?? null,
        req.user.id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Technician profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Technician profile updated successfully!",
    });
  } catch (error) {
    console.error("Update technician profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update technician profile.",
    });
  }
};
