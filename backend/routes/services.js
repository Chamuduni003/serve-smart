const express = require('express');
const db = require('../db');
const router = express.Router();

// සියලුම සේවාවන් ලබා ගැනීම (Dropdown එකට පෙන්වීමට)
router.get('/', async (req, res) => {
    try {
        const [services] = await db.query('SELECT * FROM Services');
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = router;