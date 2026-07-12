const express = require('express');
const cors = require('cors');
const app = express();
const providerRoutes = require('./routes/providerRoutes');
const bookingRoutes = require('./routes/bookings');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require('./db'); // db.js path

app.use('/api/provider', providerRoutes);
// Keep one public bookings API.  The frontend and the other API routes all use
// the `/api/...` prefix, so mounting this as `/apibookings` caused every booking
// action to return 404.
app.use('/api/bookings', bookingRoutes);

// Temporary compatibility alias for any older saved frontend build.
app.use('/apibookings', bookingRoutes);


// ==========================================
// LOGIN API
// ==========================================
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(401).send("Invalid credentials");
    res.json(results[0]);
  });
});

// ==========================================
// USER REGISTER API
// ==========================================
app.post('/api/auth/register', (req, res) => {
    console.log("ලැබුණු දත්ත (Request Body):", req.body); 
    
    const { name, email, password, role, location } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please fill in the required fields.' });
    }

    const normalizedRole = (role || 'client').toString().toLowerCase();

    // 1. මුලින්ම මෙම Email එක දැනටමත් තිබේදැයි බලන්න
    const checkSql = 'SELECT * FROM users WHERE email = ?';
    db.query(checkSql, [email], (checkErr, existingUsers) => {
        if (checkErr) {
            console.error("SQL Error (Check):", checkErr);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }

        if (existingUsers.length > 0) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        }

        // 2. Email එක නැත්නම් පමණක් Insert කරන්න
        const insertSql = 'INSERT INTO users (name, email, password, role, location) VALUES (?, ?, ?, ?, ?)';
        db.query(insertSql, [name, email, password, normalizedRole, location || ''], (insertErr, result) => {
            if (insertErr) {
                console.error("SQL Error (Insert):", insertErr);
                return res.status(500).json({ success: false, message: 'Registration failed.', error: insertErr.sqlMessage });
            }
            return res.status(201).json({ success: true, message: 'User registered successfully!' });
        });
    });
});

// ==========================================
// PROVIDER SEARCH API
// ==========================================
app.get('/api/providers', (req, res) => {
  const { category, date, time } = req.query;

  const categoryAliases = {
    plumber: ['plumbing'],
    plumbing: ['plumbing'],
    electrician: ['electrical'],
    electrical: ['electrical'],
    cleaner: ['cleaning'],
    cleaning: ['cleaning'],
    mechanic: ['automobile', 'mechanic'],
    automobile: ['automobile'],
    repair: ['repair'],
    handyman: ['repair', 'maintenance']
  };

  // Core provider query: join provider_profiles with users, return available providers.
  // If date/time are supplied, we currently ignore those filters here and rely on is_available.
  // This avoids returning an empty set when there is no bookings table or booking schema mismatch.
  let sql = `
    SELECT pp.id, pp.user_id,
           COALESCE(u.name, pp.name, CONCAT('Provider ', pp.user_id)) AS name,
           COALESCE(u.email, '') AS email,
           pp.experience_years, pp.hourly_rate, pp.bio, pp.category, pp.location, pp.is_available
    FROM provider_profiles pp
    LEFT JOIN users u ON u.user_id = pp.user_id
    WHERE pp.is_available = 1
  `;

  const values = [];

  if (category && String(category).trim()) {
    const inputCategory = String(category).trim().toLowerCase();
    const mappedCategories = categoryAliases[inputCategory] || [inputCategory];

    const likeClauses = mappedCategories.map(() => `LOWER(pp.category) LIKE ?`).join(' OR ');
    sql += ` AND (${likeClauses})`;
    values.push(...mappedCategories.map((value) => `%${value}%`));
  }

  // If date and time are provided, exclude providers who already have a booking
  // at that exact date/time. This requires a `bookings` table with `provider_id`,
  // `booking_date` (DATE) and `booking_time` (TIME).
  if (date && time) {
    sql += ` AND pp.user_id NOT IN (
      SELECT provider_id FROM Bookings
      WHERE booking_date = ? AND booking_time = ?
    )`;
    values.push(date, time);
  }

  sql += ` ORDER BY pp.id DESC`;

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error fetching providers:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }

    // Return rows as-is; frontend will map fields to the UI
    return res.status(200).json(results);
  });
});

// ==========================================
// 🚨 PROVIDER PROFILE DETAILS ලබාගැනීමේ API එක
// ==========================================
app.get('/api/provider/profile/:userId', (req, res) => {
  const userId = req.params.userId;

  const sql = `SELECT * FROM provider_profiles WHERE user_id = ? LIMIT 1`;
  
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("MySQL Error:", err);
      return res.status(500).json({ success: false, error: "Error occurred while fetching profile." });
    }
    
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "Profile is not found." });
    }
    
    return res.status(200).json(result[0]);
  });
});


// ==========================================
// 🔍 PROVIDER SEARCH API (සේවා සපයන්නන් සෙවීම)
// ==========================================
app.get('/api/providers/search', (req, res) => {
  const { category, location } = req.query;

  // කාණ්ඩය සහ ස්ථානය අනුව, දැනට වැඩ කිරීමට සූදානම් (is_available = 1) අය පමණක් සෙවීම
  const sql = `SELECT * FROM provider_profiles WHERE category = ? AND location LIKE ? AND is_available = 1`;
  
  // % සලකුණ යෙදීමෙන් පරිශීලකයා ලොකේෂන් එක හරියටම නැතුව Colombo කියා ගැහුවත් Colombo 03 වැනි දත්තද අසුවේ (LIKE Query)
  db.query(sql, [category, `%${location}%`], (err, results) => {
    if (err) {
      console.error("Search Error:", err);
      return res.status(500).json({ success: false, error: "සෙවීම අසාර්ථකයි." });
    }
    return res.status(200).json({ success: true, data: results });
  });
});


// Database එකේ තියෙන Categories ලැයිස්තුව Unique විදියට ලබා දෙන API එක
app.get('/api/categories', (req, res) => {
  const sql = "SELECT DISTINCT category FROM provider_profiles WHERE category IS NOT NULL AND category != ''";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching categories:", err);
      return res.status(500).json({ error: "Database error occurred" });
    }
    // ලැබෙන results array එකක් නිසා ඒක කෙළින්ම frontend එකට යවනවා
    // උදා: ["Plumbing", "Painting", "Electrical"]
    const categories = results.map(row => row.category);
    res.json(categories);
  });
});



app.listen(5000, () => console.log("Server running on port 5000"));
