import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'database.sqlite'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'faculty', 'admin')),
    department TEXT,
    year TEXT
  );

  CREATE TABLE IF NOT EXISTS od_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT,
    date TEXT NOT NULL,
    ongoing_time TEXT,
    arrival_time TEXT,
    reason TEXT NOT NULL,
    proof_file TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected')),
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id)
  );
`);

// Migration: Add password column if it doesn't exist (for existing databases)
try {
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const hasPassword = tableInfo.some((col: any) => col.name === 'password');
  if (!hasPassword) {
    db.exec("ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT 'password123'");
  }
  const hasDepartment = tableInfo.some((col: any) => col.name === 'department');
  if (!hasDepartment) {
    db.exec("ALTER TABLE users ADD COLUMN department TEXT");
  }

  const odTableInfo = db.prepare("PRAGMA table_info(od_requests)").all();
  const hasOngoingTime = odTableInfo.some((col: any) => col.name === 'ongoing_time');
  if (!hasOngoingTime) {
    db.exec("ALTER TABLE od_requests ADD COLUMN ongoing_time TEXT");
  }
  const hasArrivalTime = odTableInfo.some((col: any) => col.name === 'arrival_time');
  if (!hasArrivalTime) {
    db.exec("ALTER TABLE od_requests ADD COLUMN arrival_time TEXT");
  }

  const hasYear = tableInfo.some((col: any) => col.name === 'year');
  if (!hasYear) {
    db.exec("ALTER TABLE users ADD COLUMN year TEXT");
  }

  const hasODYear = odTableInfo.some((col: any) => col.name === 'year');
  if (!hasODYear) {
    db.exec("ALTER TABLE od_requests ADD COLUMN year TEXT");
  }
} catch (e) {
  console.error("Migration error:", e);
}

// Seed default admin if not exists
try {
  const adminExists = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
  if (!adminExists) {
    db.prepare("INSERT INTO users (id, name, email, password, role, department) VALUES (?, ?, ?, ?, ?, ?)")
      .run('admin-1', 'System Admin', 'admin@example.com', 'admin123', 'admin', 'Administration');
  }
} catch (e) {
  console.error("Seeding error:", e);
}

export default db;
