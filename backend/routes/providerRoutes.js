const express = require('express');
const router = express.Router();
const db = require('../db'); // ඔබේ db.js ඇති නිවැරදිම පාර

// 🚨 මෙතැනට router.post('/') ලෙස පමණක් දීම ප්‍රමාණවත්ය! 
// මන්දයත් server.js එකේ app.use('/api/provider', providerRoutes) ලෙස ඇති බැවිනි.
router.post('/register', (req, res) => {
  const { user_id, experience, rate, bio, category, location, availability, is_available } = req.body;

  // අනිවාර්ය දත්ත පරීක්ෂාව
  if (!experience || !rate || !bio || !category || !location) {
    return res.status(400).json({ error: "කරුනාවෙන් සියලුම විස්තර නිවැරදිව ඇතුළත් කරන්න!" });
  }

  const isAvailable = typeof availability === 'boolean'
    ? availability
    : Boolean(is_available);

  // phpMyAdmin එකේ ඔබේ Table එකට ගැළපෙන SQL Query එක
  const sql = `INSERT INTO provider_profiles 
    (user_id, experience_years, hourly_rate, bio, category, location, is_available) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    user_id || 1,
    parseInt(experience),
    parseFloat(rate),
    bio,
    category,
    location,
    isAvailable ? 1 : 0
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("MySQL Error Details:", err);
      return res.status(500).json({ error: "Database එකට දත්ත දැමීම අසාර්ථකයි." });
    }
    return res.status(200).json({ 
      success: true, 
      message: "Provider Profile එක සාර්ථකව නිම කරන ලදී!",
      insertId: result.insertId 
    });
  });
});

router.put('/availability', async (req, res) => {
  try {
    const { userId, isAvailable } = req.body;
    if (typeof userId === 'undefined') {
      return res.status(400).json({ success: false, message: 'userId is required.' });
    }

    const availabilityValue = isAvailable ? 1 : 0;
    const sql = 'UPDATE provider_profiles SET is_available = ? WHERE user_id = ?';
    const [result] = await db.query(sql, [availabilityValue, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    }

    return res.status(200).json({ success: true, message: 'Availability updated successfully.' });
  } catch (err) {
    console.error('Error updating provider availability:', err);
    return res.status(500).json({ success: false, message: 'Failed to update availability.', error: err.message });
  }
});

router.get('/bookings/:providerId', async (req, res) => {
  try {
    const providerId = req.params.providerId;
    const sql = `
      SELECT b.id, b.client_id, b.provider_id, b.booking_date, b.booking_time, b.status,
             u.name AS client_name, u.email AS client_email, u.location AS client_location,
             pp.category AS service_category
      FROM Bookings b
      LEFT JOIN users u ON u.user_id = b.client_id
      LEFT JOIN provider_profiles pp ON pp.user_id = b.provider_id
      WHERE b.provider_id = ? AND b.status = 'pending'
      ORDER BY b.booking_date ASC, b.booking_time ASC
    `;
    const [rows] = await db.query(sql, [providerId]);
    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching provider bookings:', err);
    return res.status(500).json({ success: false, message: 'Failed to load provider bookings.', error: err.message });
  }
});

module.exports = router;