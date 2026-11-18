import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../config/database.js";

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },
  );
};

// ==========================================
// REGISTER CUSTOMER OR TECHNICIAN
// ==========================================

export const register = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    password,
    role = "customer",
    bio,
    years_of_experience,
  } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "First name, last name, email, and password are required.",
    });
  }

  if (!["customer", "technician"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid registration role.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long.",
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await connection.execute(
      `INSERT INTO users
       (first_name, last_name, email, phone, password_hash, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        first_name.trim(),
        last_name.trim(),
        email.trim().toLowerCase(),
        phone?.trim() || null,
        passwordHash,
        role,
      ],
    );

    const userId = result.insertId;

    // Create a technician profile when registering as a technician
    if (role === "technician") {
      await connection.execute(
        `INSERT INTO technician_profiles
         (user_id, bio, years_of_experience)
         VALUES (?, ?, ?)`,
        [userId, bio?.trim() || null, Number(years_of_experience) || 0],
      );
    }

    await connection.commit();

    const user = {
      id: userId,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim().toLowerCase(),
      role,
    };

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Account registered successfully!",
      token,
      user,
    });
  } catch (error) {
    await connection.rollback();

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email or phone number is already registered.",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to register account.",
    });
  } finally {
    connection.release();
  }
};

// ==========================================
// LOGIN
// ==========================================

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  try {
    const [rows] = await db.execute(
      `SELECT
        id,
        first_name,
        last_name,
        email,
        password_hash,
        role,
        account_status
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email.trim().toLowerCase()],
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = rows[0];

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.account_status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not currently active.",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to log in.",
    });
  }
};

// ==========================================
// GET CURRENT USER PROFILE
// ==========================================

export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    let technicianProfile = null;

    if (user.role === "technician") {
      const [profiles] = await db.execute(
        `SELECT
          id,
          bio,
          years_of_experience,
          profile_image,
          verification_status
         FROM technician_profiles
         WHERE user_id = ?
         LIMIT 1`,
        [user.id],
      );

      technicianProfile = profiles[0] || null;
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        technician_profile: technicianProfile,
      },
    });
  } catch (error) {
    console.error("Profile retrieval error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve user profile.",
    });
  }
};
