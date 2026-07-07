const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Provider Profile එක Register කරන API එක
router.post('/register', (req, res) => {
  const {
    user_id,
    name,
    email,
    password,
    role,
    user_location,
    experience,
    rate,
    bio,
    category,
    location,
    availability,
    is_available
  } = req.body;

  if (!experience || !rate || !bio || !category || !location) {
    return res.status(400).json({ error: 'Please fill in all provider profile details.' });
  }

  const isAvailable = typeof availability === 'boolean' ? availability : Boolean(is_available);
  const providerLocation = location || user_location || '';
  const normalizedRole = (role || 'provider').toString().toLowerCase();

  const insertProviderProfile = (resolvedUserId) => {
    const sql = `INSERT INTO provider_profiles
      (user_id, experience_years, hourly_rate, bio, category, location, is_available)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      resolvedUserId,
      parseInt(experience, 10),
      parseFloat(rate),
      bio,
      category,
      providerLocation,
      isAvailable ? 1 : 0
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('MySQL Error Details:', err);
        return res.status(500).json({ error: 'Failed to save provider profile.' });
      }
      return res.status(200).json({
        success: true,
        message: 'Provider profile created successfully!',
        user_id: resolvedUserId,
        insertId: result.insertId
      });
    });
  };

  if (user_id) {
    return insertProviderProfile(user_id);
  }

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required to create a user account.' });
  }

  const userSql = `INSERT INTO users (name, email, password, role, location) VALUES (?, ?, ?, ?, ?)`;
  db.query(userSql, [name, email, password, normalizedRole, providerLocation], (userErr, userResult) => {
    if (userErr) {
      console.error('User insert error:', userErr);
      return res.status(500).json({ error: 'Failed to create user account.' });
    }
    return insertProviderProfile(userResult.insertId);
  });
});

// 2. Availability Status එක Toggle/Update කරන API එක
router.put('/availability', (req, res) => {
  const { userId, isAvailable } = req.body;
  if (typeof userId === 'undefined') {
    return res.status(400).json({ success: false, message: 'userId is required.' });
  }

  const availabilityValue = isAvailable ? 1 : 0;
  const sql = 'UPDATE provider_profiles SET is_available = ? WHERE user_id = ?';

  db.query(sql, [availabilityValue, userId], (err, result) => {
    if (err) {
      console.error('Error updating provider availability:', err);
      return res.status(500).json({ success: false, message: 'Failed to update availability.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Provider profile not found.' });
    }
    return res.status(200).json({ success: true, message: 'Availability updated successfully.' });
  });
});

// 3. Provider ට අදාළ Booking Requests (Pending) ලබාගන්නා API එක
router.get('/bookings/:providerId', (req, res) => {
  const providerId = req.params.providerId;
  const sql = `
    SELECT b.id, b.client_id, b.provider_id, b.booking_date, b.booking_time, b.status,
           u.name AS client_name, u.email AS client_email, u.location AS client_location,
           pp.category AS service_category
    FROM bookings b
    LEFT JOIN users u ON u.user_id = b.client_id
    LEFT JOIN provider_profiles pp ON pp.user_id = b.provider_id
    WHERE b.provider_id = ? AND b.status = 'pending'
    ORDER BY b.booking_date ASC, b.booking_time ASC
  `;

  db.query(sql, [providerId], (err, rows) => {
    if (err) {
      console.error('Error fetching provider bookings:', err);
      return res.status(500).json({ success: false, message: 'Failed to load provider bookings.' });
    }
    return res.status(200).json(rows);
  });
});

// 4. Search available providers by service/category
router.get('/search', (req, res) => {
  const service = (req.query.service || '').toString().trim();

  let sql = `
    SELECT
      pp.user_id AS id,
      u.name,
      pp.experience_years,
      pp.hourly_rate,
      pp.category,
      pp.location,
      pp.profile_pic
    FROM provider_profiles pp
    JOIN users u ON u.user_id = pp.user_id
    WHERE u.role = 'provider'
    AND pp.is_available = 1
  `;

  const values = [];

  if (service) {
    const searchValue = `%${service.toLowerCase()}%`;
    sql += ` AND (LOWER(pp.category) LIKE ? OR LOWER(u.name) LIKE ?)`;
    values.push(searchValue, searchValue);
  }

  sql += ' ORDER BY pp.user_id DESC';

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error fetching providers:', err);
      return res.status(500).json({ success: false, message: 'Failed to load providers.' });
    }

    return res.status(200).json(results);
  });
});

// 5. Available providers for the dashboard
router.get('/available-providers', (req, res) => {
  const service = (req.query.service || req.query.category || '').toString().trim();

  let sql = `
    SELECT
      pp.user_id AS id,
      COALESCE(u.name, 'Provider') AS name,
      pp.experience_years,
      pp.hourly_rate,
      pp.category,
      pp.location,
      pp.profile_image,
      pp.bio,
      pp.is_available
    FROM provider_profiles pp
    LEFT JOIN users u ON u.user_id = pp.user_id
    WHERE pp.is_available = 1
  `;

  const values = [];

  if (service) {
    const searchValue = `%${service.toLowerCase()}%`;
    sql += ` AND (
      LOWER(pp.category) LIKE ? OR
      LOWER(u.name) LIKE ? OR
      LOWER(pp.bio) LIKE ?
    )`;
    values.push(searchValue, searchValue, searchValue);
  }

  sql += ' ORDER BY pp.user_id DESC';

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error fetching available providers:', err);
      return res.status(500).json({ success: false, message: 'Failed to load available providers.' });
    }
    return res.status(200).json(results);
  });
});

// 6. Create a booking request from the user dashboard
router.post('/bookings/create', (req, res) => {
  const { provider_id, client_name, service_category, booking_date, booking_time } = req.body;

  if (!provider_id || !client_name || !service_category || !booking_date || !booking_time) {
    return res.status(400).json({ success: false, message: 'Please provide all booking details.' });
  }

  const query = `INSERT INTO bookings
    (provider_id, client_name, service_category, booking_date, booking_time, status)
    VALUES (?, ?, ?, ?, ?, 'pending')`;

  db.query(query, [provider_id, client_name, service_category, booking_date, booking_time], (err, result) => {
    if (err) {
      console.error('Booking error:', err);
      return res.status(500).json({ success: false, message: 'Booking failed.' });
    }
    return res.status(201).json({ success: true, message: 'Booking request created successfully!', bookingId: result.insertId });
  });
});

module.exports = router;