const express = require('express');
const db = require('../db');
const router = express.Router();

const isBookingTableIssue = (error) => error && (
  error.code === 'ER_NO_SUCH_TABLE' ||
  error.code === 'ER_BAD_FIELD_ERROR'
);

const normalizeStatusForLegacyTable = (status) => {
  if (!status) return status;
  const value = status.toString().toLowerCase();
  if (value === 'approved') return 'accepted';
  return value;
};

// A provider is only unavailable for the exact date/time that already has an
// active booking.  Rejected and cancelled requests do not reserve a slot.
const hasActiveBookingForSlot = async (providerId, bookingDate, bookingTime) => {
  try {
    const [rows] = await db.query(
      `SELECT id FROM user_bookings
       WHERE providerId = ? AND bookingDate = ? AND bookingTime = ?
       AND LOWER(status) NOT IN ('rejected', 'cancelled')
       LIMIT 1`,
      [providerId, bookingDate, bookingTime]
    );
    return rows.length > 0;
  } catch (error) {
    if (!isBookingTableIssue(error)) throw error;

    const [rows] = await db.query(
      `SELECT booking_id FROM Bookings
       WHERE provider_id = ? AND booking_date = ? AND booking_time = ?
       AND LOWER(status) NOT IN ('rejected', 'cancelled')
       LIMIT 1`,
      [providerId, bookingDate, bookingTime]
    );
    return rows.length > 0;
  }
};

const createBooking = async (req, res) => {
  const clientId = Number(req.body.clientid || req.body.clientId || req.body.client_id);
  const providerId = Number(req.body.providerid || req.body.providerId || req.body.provider_id);
  const bookingDate = req.body.bookingDate || req.body.booking_date || req.body.date;
  const bookingTime = req.body.bookingTime || req.body.booking_time || req.body.time;
  const paymentMethod = req.body.paymentMethod || req.body.payment_method || 'Cash after service';
  const status = req.body.status || 'Pending';
  const allowedPaymentMethods = ['Card payment', 'Bank transfer', 'Cash after service'];

  if (!Number.isInteger(clientId) || !Number.isInteger(providerId) || clientId <= 0 || providerId <= 0 || !bookingDate || !bookingTime) {
    return res.status(400).json({ error: 'Client, provider, date, and time are required.' });
  }

  if (clientId === providerId) {
    return res.status(400).json({ error: 'You cannot create a booking with your own provider account.' });
  }

  if (!allowedPaymentMethods.includes(paymentMethod)) {
    return res.status(400).json({ error: 'Please select a valid payment method.' });
  }

  try {
    if (await hasActiveBookingForSlot(providerId, bookingDate, bookingTime)) {
      return res.status(409).json({
        error: 'This provider is not available for the selected date and time. Please choose another slot.'
      });
    }

    const sql = 'INSERT INTO user_bookings (clientId, providerId, bookingDate, bookingTime, paymentMethod, status) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [clientId, providerId, bookingDate, bookingTime, paymentMethod, status]);
    return res.status(201).json({ success: true, message: 'Booking request created successfully.', bookingId: result.insertId });
  } catch (error) {
    if (!isBookingTableIssue(error)) {
      return res.status(500).json({ error: error.message });
    }

    try {
      const fallbackSql = 'INSERT INTO Bookings (client_id, provider_id, booking_date, booking_time, status) VALUES (?, ?, ?, ?, ?)';
      const [result] = await db.query(fallbackSql, [
        clientId,
        providerId,
        bookingDate,
        bookingTime,
        normalizeStatusForLegacyTable(status)
      ]);
      return res.status(201).json({ success: true, message: 'Booking request created successfully.', bookingId: result.insertId });
    } catch (fallbackError) {
      return res.status(500).json({ error: fallbackError.message });
    }
  }
};

const getBookingsForUser = async (req, res, wrapResponse = false) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.query(
      `SELECT ub.id, ub.clientId, ub.providerId, ub.bookingDate, ub.bookingTime, ub.paymentMethod, ub.status,
              provider.name AS providerName,
              client.name AS clientName,
              (SELECT profile.category FROM provider_profiles profile
               WHERE profile.user_id = ub.providerId ORDER BY profile.id DESC LIMIT 1) AS category
       FROM user_bookings ub
       LEFT JOIN users provider ON provider.user_id = ub.providerId
       LEFT JOIN users client ON client.user_id = ub.clientId
       WHERE ub.clientId = ? OR ub.providerId = ?
       ORDER BY ub.bookingDate DESC, ub.bookingTime DESC`,
      [userId, userId]
    );
    return res.status(200).json(wrapResponse ? { success: true, bookings: rows } : rows);
  } catch (error) {
    if (!isBookingTableIssue(error)) {
      return res.status(500).json({ error: error.message });
    }

    try {
      const [rows] = await db.query(
        `SELECT b.booking_id AS id, b.client_id AS clientId, b.provider_id AS providerId,
                b.booking_date AS bookingDate, b.booking_time AS bookingTime, NULL AS paymentMethod, b.status,
                provider.name AS providerName,
                client.name AS clientName,
                (SELECT profile.category FROM provider_profiles profile
                 WHERE profile.user_id = b.provider_id ORDER BY profile.id DESC LIMIT 1) AS category
         FROM Bookings b
         LEFT JOIN users provider ON provider.user_id = b.provider_id
         LEFT JOIN users client ON client.user_id = b.client_id
         WHERE b.client_id = ? OR b.provider_id = ?
         ORDER BY b.booking_date DESC, b.booking_time DESC`,
        [userId, userId]
      );
      return res.status(200).json(wrapResponse ? { success: true, bookings: rows } : rows);
    } catch (fallbackError) {
      return res.status(500).json({ error: fallbackError.message });
    }
  }
};

const getBookingsForProvider = async (req, res) => {
  const providerId = req.params.providerId;

  try {
    const [rows] = await db.query(
      `SELECT ub.id, ub.clientId, ub.providerId, ub.bookingDate, ub.bookingTime, ub.paymentMethod, ub.status,
              client.name AS clientName,
              client.email AS clientEmail,
              client.location AS clientLocation,
              (SELECT profile.category FROM provider_profiles profile
               WHERE profile.user_id = ub.providerId ORDER BY profile.id DESC LIMIT 1) AS category
       FROM user_bookings ub
       LEFT JOIN users client ON client.user_id = ub.clientId
       WHERE ub.providerId = ?
       ORDER BY ub.bookingDate ASC, ub.bookingTime ASC`,
      [providerId]
    );
    return res.status(200).json(rows);
  } catch (error) {
    if (!isBookingTableIssue(error)) {
      return res.status(500).json({ error: error.message });
    }

    try {
      const [rows] = await db.query(
        `SELECT b.booking_id AS id, b.client_id AS clientId, b.provider_id AS providerId,
                b.booking_date AS bookingDate, b.booking_time AS bookingTime, NULL AS paymentMethod, b.status,
                client.name AS clientName,
                client.email AS clientEmail,
                client.location AS clientLocation,
                (SELECT profile.category FROM provider_profiles profile
                 WHERE profile.user_id = b.provider_id ORDER BY profile.id DESC LIMIT 1) AS category
         FROM Bookings b
         LEFT JOIN users client ON client.user_id = b.client_id
         WHERE b.provider_id = ?
         ORDER BY b.booking_date ASC, b.booking_time ASC`,
        [providerId]
      );
      return res.status(200).json(rows);
    } catch (fallbackError) {
      return res.status(500).json({ error: fallbackError.message });
    }
  }
};

const getAllBookings = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ub.id, ub.clientId, ub.providerId, ub.bookingDate, ub.bookingTime, ub.paymentMethod, ub.status,
              provider.name AS providerName,
              client.name AS clientName,
              client.email AS clientEmail,
              client.location AS clientLocation,
              (SELECT profile.category FROM provider_profiles profile
               WHERE profile.user_id = ub.providerId ORDER BY profile.id DESC LIMIT 1) AS category
       FROM user_bookings ub
       LEFT JOIN users provider ON provider.user_id = ub.providerId
       LEFT JOIN users client ON client.user_id = ub.clientId
       ORDER BY ub.bookingDate ASC, ub.bookingTime ASC`
    );
    return res.status(200).json(rows);
  } catch (error) {
    if (!isBookingTableIssue(error)) {
      return res.status(500).json({ error: error.message });
    }

    try {
      const [rows] = await db.query(
        `SELECT b.booking_id AS id, b.client_id AS clientId, b.provider_id AS providerId,
                b.booking_date AS bookingDate, b.booking_time AS bookingTime, NULL AS paymentMethod, b.status,
                provider.name AS providerName,
                client.name AS clientName,
                client.email AS clientEmail,
                client.location AS clientLocation,
                (SELECT profile.category FROM provider_profiles profile
                 WHERE profile.user_id = b.provider_id ORDER BY profile.id DESC LIMIT 1) AS category
         FROM Bookings b
         LEFT JOIN users provider ON provider.user_id = b.provider_id
         LEFT JOIN users client ON client.user_id = b.client_id
         ORDER BY b.booking_date ASC, b.booking_time ASC`
      );
      return res.status(200).json(rows);
    } catch (fallbackError) {
      return res.status(500).json({ error: fallbackError.message });
    }
  }
};

const updateBookingStatus = async (req, res) => {
  const bookingId = req.params.bookingId || req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  try {
    const [result] = await db.query('UPDATE user_bookings SET status = ? WHERE id = ?', [status, bookingId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    return res.status(200).json({ success: true, message: 'Status updated successfully.' });
  } catch (error) {
    if (!isBookingTableIssue(error)) {
      return res.status(500).json({ error: error.message });
    }

    try {
      const [result] = await db.query('UPDATE Bookings SET status = ? WHERE booking_id = ?', [
        normalizeStatusForLegacyTable(status),
        bookingId
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Booking not found.' });
      }

      return res.status(200).json({ success: true, message: 'Status updated successfully.' });
    } catch (fallbackError) {
      return res.status(500).json({ error: fallbackError.message });
    }
  }
};

router.post('/', createBooking);
router.post('/add', createBooking);
router.get('/availability', async (req, res) => {
  const providerId = Number(req.query.providerId);
  const bookingDate = req.query.date;
  const bookingTime = req.query.time;

  if (!Number.isInteger(providerId) || providerId <= 0 || !bookingDate || !bookingTime) {
    return res.status(400).json({ error: 'Provider, date, and time are required.' });
  }

  try {
    const isBooked = await hasActiveBookingForSlot(providerId, bookingDate, bookingTime);
    return res.status(200).json({ available: !isBooked });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
router.get('/provider/:providerId', getBookingsForProvider);
router.get('/all', getAllBookings);
router.get('/my-bookings/:userId', (req, res) => getBookingsForUser(req, res));
router.get('/user-history/:userId', (req, res) => getBookingsForUser(req, res));
router.get('/user-details/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id AS id, name, email, role, location FROM users WHERE user_id = ? LIMIT 1',
      [req.params.userId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
router.get('/:userId', (req, res) => getBookingsForUser(req, res, true));
router.put('/status/:bookingId', updateBookingStatus);
router.put('/:id', updateBookingStatus);
router.delete('/:bookingId', (req, res) => {
  req.body.status = 'Cancelled';
  return updateBookingStatus(req, res);
});

module.exports = router;
