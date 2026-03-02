const db = require('../config/db');

const addMenu = (req, res) => {
  const { date, breakfast, lunch, dinner } = req.body;

  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
  }

  db.run(
    'INSERT INTO menu (date, breakfast, lunch, dinner) VALUES (?, ?, ?, ?)',
    [date, breakfast, lunch, dinner],
    function (err) {
      if (err) {
        return res.status(500).json({ message: 'Error adding menu', error: err.message });
      }
      return res.status(201).json({ message: 'Menu added successfully', id: this.lastID });
    }
  );
};

const updateMenu = (req, res) => {
  const { id } = req.params;
  const { date, breakfast, lunch, dinner } = req.body;

  db.run(
    'UPDATE menu SET date = ?, breakfast = ?, lunch = ?, dinner = ? WHERE id = ?',
    [date, breakfast, lunch, dinner, id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: 'Error updating menu', error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Menu not found' });
      }
      return res.status(200).json({ message: 'Menu updated successfully' });
    }
  );
};

const deleteMenu = (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM menu WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Error deleting menu', error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    return res.status(200).json({ message: 'Menu deleted successfully' });
  });
};

const getMenu = (req, res) => {
  db.all('SELECT * FROM menu', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching menu', error: err.message });
    }
    return res.status(200).json({ menu: rows });
  });
};

module.exports = { addMenu, updateMenu, deleteMenu, getMenu };