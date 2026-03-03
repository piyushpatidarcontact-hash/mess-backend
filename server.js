const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const billingRoutes = require('./routes/billingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { authenticateToken } = require('./middleware/authMiddleware');

dotenv.config();

const app = express();

// Allow requests from frontend
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://mess-frontend-2lra.onrender.com"
  ],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'You have access to this protected route!',
    user: req.user
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Mess Management API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
