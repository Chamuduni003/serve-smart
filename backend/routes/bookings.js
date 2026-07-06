const express = require('express');
const db = require('../db');
const router = express.Router();

// Booking එකක් ලබා ගැනීම
router.post('/add', async (req, res) => {
    try {
        const { client_id, provider_id, booking_date, booking_time } = req.body;

        const [result] = await db.query(
            'INSERT INTO Bookings (client_id, provider_id, booking_date, booking_time, status) VALUES (?, ?, ?, ?, "pending")',
            [client_id, provider_id, booking_date, booking_time]
        );

        res.status(201).json({ message: 'Booking requested successfully!', bookingId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// තමන්ගේ Bookings බලාගැනීම (Client ට හෝ Provider ට)
router.get('/my-bookings/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const [rows] = await db.query(
            'SELECT * FROM Bookings WHERE client_id = ? OR provider_id = ?',
            [userId, userId]
        );
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/status/:bookingId', async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required.' });
        }

        const allowedStatuses = ['pending', 'Accepted', 'Rejected'];
        const normalizedStatus = allowedStatuses.includes(status) ? status : 'pending';

                const [result] = await db.query(
                        'UPDATE Bookings SET status = ? WHERE id = ?',
                        [normalizedStatus, bookingId]
                );

                if (result.affectedRows === 0) {
                        return res.status(404).json({ error: 'Booking not found.' });
                }

                // fetch the updated booking to determine provider and adjust availability
                const [updatedRows] = await db.query('SELECT * FROM Bookings WHERE id = ?', [bookingId]);
                const booking = updatedRows[0];

                if (booking) {
                    const providerId = booking.provider_id;
                    try {
                        if (normalizedStatus === 'Accepted') {
                            // mark provider as globally unavailable
                            await db.query('UPDATE provider_profiles SET is_available = 0 WHERE user_id = ?', [providerId]);
                        } else if (normalizedStatus === 'Rejected' || normalizedStatus === 'pending') {
                            // mark provider as available again (if rejected/cancelled)
                            await db.query('UPDATE provider_profiles SET is_available = 1 WHERE user_id = ? AND user_id IS NOT NULL', [providerId]);
                        }
                    } catch (innerErr) {
                        console.error('Error updating provider availability after booking status change:', innerErr);
                    }
                }

                return res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;