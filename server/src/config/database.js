import "dotenv/config";
import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "teknisyanko",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const testDatabaseConnection = async () => {
  try {
    const connection = await db.getConnection();

    const [rows] = await connection.query(
      "SELECT DATABASE() AS database_name, VERSION() AS mysql_version",
    );

    console.log("MySQL database connected successfully!");
    console.log("Database:", rows[0].database_name);
    console.log("MySQL Version:", rows[0].mysql_version);

    connection.release();
    return true;
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
    return false;
  }
};
