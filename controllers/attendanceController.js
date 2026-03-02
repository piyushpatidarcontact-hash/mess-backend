const db = require('../config/db');

// GET ALL ATTENDANCE - Admin only
const getAllAttendance = (req, res) => {
  db.all(
    `SELECT attendance.id, users.name, users.email, attendance.date, 
    attendance.meal_type, attendance.status 
    FROM attendance 
    JOIN users ON attendance.user_id = users.id 
    ORDER BY attendance.date DESC`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      return res.status(200).json({ attendance: rows });
    }
  );
};

// GET MY ATTENDANCE - Student
const getMyAttendance = (req, res) => {
  const user_id = req.user.id;

  db.all(
    `SELECT id, date, meal_type, status FROM attendance WHERE user_id = ? ORDER BY date DESC`,
    [user_id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      return res.status(200).json({ attendance: rows });
    }
  );
};

// GET ATTENDANCE BY DATE - Admin only
const getAttendanceByDate = (req, res) => {
  const { date } = req.params;

  db.all(
    `SELECT attendance.id, users.name, users.email, attendance.date,
    attendance.meal_type, attendance.status
    FROM attendance
    JOIN users ON attendance.user_id = users.id
    WHERE attendance.date = ?
    ORDER BY attendance.meal_type`,
    [date],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      return res.status(200).json({ attendance: rows });
    }
  );
};

// GET ATTENDANCE BY STUDENT - Admin only
const getAttendanceByStudent = (req, res) => {
  const { user_id } = req.params;

  db.all(
    `SELECT attendance.id, users.name, users.email, attendance.date,
    attendance.meal_type, attendance.status
    FROM attendance
    JOIN users ON attendance.user_id = users.id
    WHERE attendance.user_id = ?
    ORDER BY attendance.date DESC`,
    [user_id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      return res.status(200).json({ attendance: rows });
    }
  );
};

module.exports = { getAllAttendance, getMyAttendance, getAttendanceByDate, getAttendanceByStudent };