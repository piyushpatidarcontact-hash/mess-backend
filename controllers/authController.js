const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// REGISTER
const register = (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if all fields are filled
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if role is valid
  if (role !== 'student' && role !== 'admin') {
    return res.status(400).json({ message: 'Role must be student or admin' });
  }

  // Check if email already exists
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (user) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Save user to database
    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role],
      function (err) {
        if (err) {
          return res.status(500).json({ message: 'Error saving user', error: err.message });
        }
        return res.status(201).json({ message: 'User registered successfully' });
      }
    );
  });
};

// LOGIN
const login = (req, res) => {
  const { email, password } = req.body;

  // Check if all fields are filled
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Check if user exists
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
};

module.exports = { register, login };