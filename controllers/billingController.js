const db = require('../config/db');

// Meal prices configuration
const MEAL_PRICES = {
  lunch_price: 50,
  dinner_price: 50
};

// GET MONTHLY BILL - Admin only
const getMonthlyBill = (req, res) => {
  const { studentId, year, month } = req.params;

  // Format month to match date stored in database
  // Example: year=2026, month=2 → "2026-02%"
  const monthPadded = String(month).padStart(2, '0');
  const datePattern = `${year}-${monthPadded}-%`;

  // Check if student exists
  db.get('SELECT * FROM users WHERE id = ? AND role = ?', [studentId, 'student'], (err, student) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Count lunch attendance
    db.get(
      `SELECT COUNT(*) as lunch_count FROM attendance 
       WHERE user_id = ? AND meal_type = 'lunch' AND status = 'present' AND date LIKE ?`,
      [studentId, datePattern],
      (err, lunchResult) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err.message });
        }

        // Count dinner attendance
        db.get(
          `SELECT COUNT(*) as dinner_count FROM attendance 
           WHERE user_id = ? AND meal_type = 'dinner' AND status = 'present' AND date LIKE ?`,
          [studentId, datePattern],
          (err, dinnerResult) => {
            if (err) {
              return res.status(500).json({ message: 'Database error', error: err.message });
            }

            const lunch_count = lunchResult.lunch_count;
            const dinner_count = dinnerResult.dinner_count;

            // Check if no attendance found
            if (lunch_count === 0 && dinner_count === 0) {
              return res.status(404).json({
                message: `No attendance found for student ${student.name} in ${year}-${monthPadded}`
              });
            }

            // Calculate bill
            const total_lunch_cost = lunch_count * MEAL_PRICES.lunch_price;
            const total_dinner_cost = dinner_count * MEAL_PRICES.dinner_price;
            const total_amount = total_lunch_cost + total_dinner_cost;

            return res.status(200).json({
              student_id: parseInt(studentId),
              student_name: student.name,
              student_email: student.email,
              month: `${year}-${monthPadded}`,
              lunch_count: lunch_count,
              dinner_count: dinner_count,
              lunch_price: MEAL_PRICES.lunch_price,
              dinner_price: MEAL_PRICES.dinner_price,
              total_lunch_cost: total_lunch_cost,
              total_dinner_cost: total_dinner_cost,
              total_amount: total_amount
            });
          }
        );
      }
    );
  });
};

module.exports = { getMonthlyBill };