# Complete Booking System Setup Guide

## Issue: 404 Error on POST /api/bookings

### Root Causes & Fixes:
1. ✅ **Server.js** - Middleware order must be correct
2. ✅ **Routes** - Must export router with proper endpoints
3. ✅ **Frontend** - Must send correct field names matching MySQL columns

---

## File Structure Overview

```
backend/
├── server.js                    # ✅ Already correct - middleware in right order
├── db.js                        # ✅ MySQL connection
├── routes/
│   ├── bookings.js             # ✅ Already correct - 3 endpoints ready
│   └── (other routes)
└── ...

frontend/src/
├── pages/
│   └── UserDashboard.js        # ⚠️ NEEDS FIX - booking function
└── components/
    └── ProviderDashboard.js    # ⚠️ NEEDS FIX - fetch & display pending requests
```

---

## Database Schema

```sql
CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  clientId INT NOT NULL,
  providerId INT NOT NULL,
  bookingDate DATE NOT NULL,
  bookingTime TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE bookings ADD INDEX idx_provider (providerId, status);
ALTER TABLE bookings ADD INDEX idx_client (clientId);
```

---

## Implementation Steps

### Step 1: Verify Backend Server Setup (server.js)
The server.js already has correct middleware order. Verify:
- `app.use(express.json())` - BEFORE routes
- `app.use('/api/bookings', bookingRoutes)` - Routes registered

### Step 2: Update Frontend Files
- Update UserDashboard.js booking function
- Update ProviderDashboard.js to fetch & display requests

---

## API Endpoints Ready

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/bookings` | Create booking request |
| GET | `/api/bookings/provider/:providerId` | Fetch pending requests |
| PUT | `/api/bookings/:id` | Approve/Reject request |

---

## Test the Workflow

1. **Frontend**: User books service → UserDashboard.js POST to `/api/bookings`
2. **Database**: Booking saved with status='Pending'
3. **Provider**: ProviderDashboard.js fetches pending requests
4. **Action**: Provider clicks Accept/Reject → PUT `/api/bookings/:id`
5. **Update**: Status changes, UI updates instantly

