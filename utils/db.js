// Database connection file
// Creates a MySQL connection pool to TiDB cloud database
// Uses environment variables from .env.local for security
// mysqlPool is imported by all API routes
const mysql = require('mysql2');

export const mysqlPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
});
