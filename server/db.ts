import mysql from "mysql2/promise";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

let db: any;
const isProduction = process.env.NODE_ENV === "production" || process.env.MYSQL_HOST;

if (isProduction && process.env.MYSQL_HOST) {
  // MySQL Implementation
  db = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  // Initialize MySQL tables
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      phone_e164 VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(255),
      nickname VARCHAR(255),
      gender VARCHAR(50),
      country_code VARCHAR(10)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS merchant_profiles (
      user_id VARCHAR(36) PRIMARY KEY,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS customer_profiles (
      user_id VARCHAR(36) PRIMARY KEY,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS services (
      id VARCHAR(36) PRIMARY KEY,
      merchant_id VARCHAR(36) NOT NULL,
      name VARCHAR(255) NOT NULL,
      price INT NOT NULL,
      duration INT NOT NULL DEFAULT 30,
      description TEXT,
      FOREIGN KEY (merchant_id) REFERENCES users(id),
      UNIQUE(merchant_id, name)
    )
  `);

  try {
    await db.execute("ALTER TABLE services ADD COLUMN duration INT NOT NULL DEFAULT 30");
  } catch (e) {
    // Column might already exist
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS slots (
      id VARCHAR(36) PRIMARY KEY,
      merchant_id VARCHAR(36) NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      is_booked TINYINT(1) DEFAULT 0,
      FOREIGN KEY (merchant_id) REFERENCES users(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS bookings (
      id VARCHAR(36) PRIMARY KEY,
      service_id VARCHAR(36) NOT NULL,
      slot_id VARCHAR(36) NOT NULL,
      customer_id VARCHAR(36) NOT NULL,
      merchant_note TEXT,
      FOREIGN KEY (service_id) REFERENCES services(id),
      FOREIGN KEY (slot_id) REFERENCES slots(id),
      FOREIGN KEY (customer_id) REFERENCES users(id)
    )
  `);
} else {
  // SQLite Fallback for Preview
  db = new Database("booking.db");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT NOT NULL,
      phone_e164 TEXT UNIQUE NOT NULL,
      name TEXT,
      nickname TEXT,
      gender TEXT,
      country_code TEXT
    );

    CREATE TABLE IF NOT EXISTS merchant_profiles (
      user_id TEXT PRIMARY KEY,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS customer_profiles (
      user_id TEXT PRIMARY KEY,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      duration INTEGER NOT NULL DEFAULT 30,
      description TEXT,
      FOREIGN KEY (merchant_id) REFERENCES users(id),
      UNIQUE(merchant_id, name)
    );

    CREATE TABLE IF NOT EXISTS slots (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_booked INTEGER DEFAULT 0,
      FOREIGN KEY (merchant_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      service_id TEXT NOT NULL,
      slot_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      merchant_note TEXT,
      FOREIGN KEY (service_id) REFERENCES services(id),
      FOREIGN KEY (slot_id) REFERENCES slots(id),
      FOREIGN KEY (customer_id) REFERENCES users(id)
    );
  `);

  try {
    db.exec("ALTER TABLE services ADD COLUMN duration INTEGER NOT NULL DEFAULT 30");
  } catch (e) {
    // Column might already exist
  }
}

// Wrapper to normalize query interface between mysql2 and better-sqlite3
export const query = async (sql: string, params: any[] = []) => {
  if (isProduction && process.env.MYSQL_HOST) {
    const [rows] = await db.execute(sql, params);
    return rows;
  } else {
    const stmt = db.prepare(sql);
    if (sql.trim().toUpperCase().startsWith("SELECT")) {
      return stmt.all(...params);
    } else {
      const result = stmt.run(...params);
      return { insertId: result.lastInsertRowid, affectedRows: result.changes };
    }
  }
};

export const getOne = async (sql: string, params: any[] = []) => {
  if (isProduction && process.env.MYSQL_HOST) {
    const [rows] = await db.execute(sql, params);
    return (rows as any[])[0];
  } else {
    return db.prepare(sql).get(...params);
  }
};

export default db;
