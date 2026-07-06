const express = require('express');
const router = express.Router();
const db = require('../db'); // ඔබේ db.js ෆයිල් එකේ path එක නිවැරදිදැයි බලන්න

// Register Route
router.post('/register', (req, res) => {
    const { name, email, password, role, location } = req.body;
    const normalizedRole = (role || 'client').toString().toLowerCase();

    // පෝරමය හරහා එන දත්ත හිස්දැයි පරීක්ෂා කිරීම
    if (!name || !email || !password) {
        return res.status(400).json({ message: "කරුණාකර සියලුම අනිවාර්ය විස්තර පුරවන්න." });
    }

    // SQL Query එක
    // සටහන: user_id (Auto Increment) සහ created_at (Default Timestamp) 
    // මගින් ස්වයංක්‍රීයව පිරවෙන බැවින් මෙහි ඇතුළත් නොකරයි.
    const sql = "INSERT INTO users (name, email, password, role, location) VALUES (?, ?, ?, ?, ?)";

    db.query(sql, [name, email, password, normalizedRole, location || ''], (err, result) => {
        if (err) {
            // දෝෂයක් සිදුවුවහොත් Terminal එකේ පෙන්වන්න
            console.error("Database Query Error:", err);
            return res.status(500).json({ message: "Database error.", error: err.message });
        }
        
        // සාර්ථක වූ පසු ප්‍රතිචාරය
        res.status(201).json({ message: "Registration successful!", userId: result.insertId });
    });
});

module.exports = router;