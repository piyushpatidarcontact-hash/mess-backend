const db = require('../config/db');
const crypto = require('crypto');

const MEAL_TIMINGS = {
  lunch: {
    start: { hour: 12, minute: 0 },
    end: { hour: 15, minute: 0 },
    generateAt: { hour: 11, minute: 40 }
  },
  dinner: {
    start: { hour: 20, minute: 0 },
    end: { hour: 22, minute: 30 },
    generateAt: { hour: 19, minute: 40 }
  }
};

const generateToken = () => {
  return crypto.randomBytes(16).toString('hex');
};

const getCurrentTime = () => {
  const now = new Date();
  return {
    hour: now.getHours(),
    minute: now.getMinutes(),
    dateString: now.toISOString().split('T')[0]
  };
};

const isWithinMealTime = (mealType) => {
  const { hour, minute } = getCurrentTime();
  const timing = MEAL_TIMINGS[mealType];
  const currentMinutes = hour * 60 + minute;
  const startMinutes = timing.start.hour * 60 + timing.start.minute;
  const endMinutes = timing.end.hour * 60 + timing.end.minute;
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

const generateMealToken = (req, res) => {
  const { meal_type } = req.body;
  const user_id = req.user.id;

  if (!meal_type || !['lunch', 'dinner'].includes(meal_type)) {
    return res.status(400).json({ message: 'meal_type must be lunch or dinner' });
  }

  const { hour, minute, dateString } = getCurrentTime();
  const timing = MEAL_TIMINGS[meal_type];
  const currentMinutes = hour * 60 + minute;
  const generateAtMinutes = timing.generateAt.hour * 60 + timing.generateAt.minute;
  const endMinutes = timing.end.hour * 60 + timing.end.minute;

  if (currentMinutes < generateAtMinutes) {
    return res.status(400).json({
      message: `${meal_type} tokens will be available at ${timing.generateAt.hour}:${String(timing.generateAt.minute).padStart(2, '0')}`
    });
  }

  if (currentMinutes > endMinutes) {
    return res.status(400).json({
      message: `${meal_type} time has ended for today`
    });
  }

  db.get(
    'SELECT * FROM meal_tokens WHERE user_id = ? AND meal_type = ? AND date = ?',
    [user_id, meal_type, dateString],
    (err, existingToken) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      if (existingToken) {
        return res.status(400).json({
          message: `You already have a ${meal_type} token for today`,
          token: existingToken.token
        });
      }

      const expiresAt = `${dateString} ${timing.end.hour}:${String(timing.end.minute).padStart(2, '0')}:00`;
      const token = generateToken();

      db.run(
        'INSERT INTO meal_tokens (user_id, meal_type, token, date, expires_at) VALUES (?, ?, ?, ?, ?)',
        [user_id, meal_type, token, dateString, expiresAt],
        function (err) {
          if (err) {
            return res.status(500).json({ message: 'Error generating token', error: err.message });
          }
          return res.status(201).json({
            message: `${meal_type} token generated successfully`,
            token: token,
            meal_type: meal_type,
            date: dateString,
            expires_at: expiresAt
          });
        }
      );
    }
  );
};

const verifyMealToken = (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  db.get('SELECT * FROM meal_tokens WHERE token = ?', [token], (err, mealToken) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    if (!mealToken) {
      return res.status(404).json({ message: 'Invalid token' });
    }

    if (mealToken.is_used === 1) {
      return res.status(400).json({ message: 'Token already used' });
    }

    if (!isWithinMealTime(mealToken.meal_type)) {
      return res.status(400).json({
        message: 'This token is not valid at current time'
      });
    }

    const now = new Date();
    const expiresAt = new Date(mealToken.expires_at);
    if (now > expiresAt) {
      return res.status(400).json({ message: 'Token has expired' });
    }

    db.run('UPDATE meal_tokens SET is_used = 1 WHERE token = ?', [token], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating token', error: err.message });
      }

      db.run(
        'INSERT INTO attendance (user_id, date, meal_type, status) VALUES (?, ?, ?, ?)',
        [mealToken.user_id, mealToken.date, mealToken.meal_type, 'present'],
        function (err) {
          if (err) {
            return res.status(500).json({ message: 'Error marking attendance', error: err.message });
          }
          return res.status(200).json({
            message: 'Token verified successfully. Attendance marked as present!',
            meal_type: mealToken.meal_type,
            date: mealToken.date
          });
        }
      );
    });
  });
};

const getMyTokens = (req, res) => {
  const user_id = req.user.id;

  db.all('SELECT * FROM meal_tokens WHERE user_id = ?', [user_id], (err, tokens) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    return res.status(200).json({ tokens });
  });
};

module.exports = { generateMealToken, verifyMealToken, getMyTokens };