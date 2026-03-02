const db = require('../config/db');

const MEAL_PRICES = {
  lunch_price: 50,
  dinner_price: 50
};

const getDashboardStats = (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.substring(0, 7);
  const monthPattern = `${currentMonth}-%`;

  // Count total students
  db.get(`SELECT COUNT(*) as total_students FROM users WHERE role = 'student'`, [], (err, studentResult) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });

    // Count total admins
    db.get(`SELECT COUNT(*) as total_admins FROM users WHERE role = 'admin'`, [], (err, adminResult) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });

      // Count today's total attendance
      db.get(
        `SELECT COUNT(*) as todays_attendance FROM attendance WHERE date = ? AND status = 'present'`,
        [today],
        (err, todayResult) => {
          if (err) return res.status(500).json({ message: 'Database error', error: err.message });

          // Count today's lunch
          db.get(
            `SELECT COUNT(*) as todays_lunch FROM attendance WHERE date = ? AND meal_type = 'lunch' AND status = 'present'`,
            [today],
            (err, lunchResult) => {
              if (err) return res.status(500).json({ message: 'Database error', error: err.message });

              // Count today's dinner
              db.get(
                `SELECT COUNT(*) as todays_dinner FROM attendance WHERE date = ? AND meal_type = 'dinner' AND status = 'present'`,
                [today],
                (err, dinnerResult) => {
                  if (err) return res.status(500).json({ message: 'Database error', error: err.message });

                  // Count current month total meals
                  db.get(
                    `SELECT COUNT(*) as monthly_meals FROM attendance WHERE date LIKE ? AND status = 'present'`,
                    [monthPattern],
                    (err, monthlyResult) => {
                      if (err) return res.status(500).json({ message: 'Database error', error: err.message });

                      // Count current month lunch and dinner separately for revenue
                      db.get(
                        `SELECT 
                          SUM(CASE WHEN meal_type = 'lunch' THEN 1 ELSE 0 END) as monthly_lunch,
                          SUM(CASE WHEN meal_type = 'dinner' THEN 1 ELSE 0 END) as monthly_dinner
                        FROM attendance WHERE date LIKE ? AND status = 'present'`,
                        [monthPattern],
                        (err, revenueData) => {
                          if (err) return res.status(500).json({ message: 'Database error', error: err.message });

                          const monthly_lunch = revenueData.monthly_lunch || 0;
                          const monthly_dinner = revenueData.monthly_dinner || 0;
                          const current_month_revenue =
                            monthly_lunch * MEAL_PRICES.lunch_price +
                            monthly_dinner * MEAL_PRICES.dinner_price;

                          return res.status(200).json({
                            stats: {
                              total_students: studentResult.total_students,
                              total_admins: adminResult.total_admins,
                              today: today,
                              todays_attendance_count: todayResult.todays_attendance,
                              todays_lunch_count: lunchResult.todays_lunch,
                              todays_dinner_count: dinnerResult.todays_dinner,
                              current_month: currentMonth,
                              current_month_total_meals: monthlyResult.monthly_meals,
                              current_month_revenue: current_month_revenue,
                              meal_prices: {
                                lunch_price: MEAL_PRICES.lunch_price,
                                dinner_price: MEAL_PRICES.dinner_price
                              }
                            }
                          });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });
};

module.exports = { getDashboardStats };