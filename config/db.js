const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'mess.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to connect to database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

db.run('PRAGMA foreign_keys = ON');

db.serialize(() => {

  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('student', 'admin')) DEFAULT 'student'
  )`, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table ready');
    }
  });

  // Menu table
  db.run(`CREATE TABLE IF NOT EXISTS menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    breakfast TEXT,
    lunch TEXT,
    dinner TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating menu table:', err.message);
    } else {
      console.log('Menu table ready');
    }
  });

  // Attendance table
  db.run(`CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    meal_type TEXT CHECK(meal_type IN ('breakfast', 'lunch', 'dinner')),
    status TEXT CHECK(status IN ('present', 'absent')) DEFAULT 'absent',
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`, (err) => {
    if (err) {
      console.error('Error creating attendance table:', err.message);
    } else {
      console.log('Attendance table ready');
    }
  });

  // Meal tokens table
  db.run(`CREATE TABLE IF NOT EXISTS meal_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    meal_type TEXT CHECK(meal_type IN ('lunch', 'dinner')),
    token TEXT UNIQUE NOT NULL,
    date TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    is_used INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`, (err) => {
    if (err) {
      console.error('Error creating meal_tokens table:', err.message);
    } else {
      console.log('Meal tokens table ready');
    }
  });

});

module.exports = db;