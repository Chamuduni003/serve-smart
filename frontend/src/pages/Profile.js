import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Profile() {
  const [bookingHistory, setBookingHistory] = useState([]);
  const [userDetails, setUserDetails] = useState(null); // 👤 User විස්තර තබා ගැනීමට
  
  // 📑 දැනට ලොග් වෙලා ඉන්න User ගේ ID එක localStorage එකෙන් ගැනීම
  const rawClientId = localStorage.getItem('userId');
  const clientId = rawClientId ? parseInt(rawClientId) : 1;

  useEffect(() => {
    // 1️⃣ User ගේ පෞද්ගලික විස්තර Backend එකෙන් ලබාගැනීම
    const fetchUserDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/bookings/user-details/${clientId}`);
        setUserDetails(res.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };

    // 2️⃣ User ගේ බුකින් හිස්ට්‍රිය ලබාගැනීම
    const fetchBookingHistory = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/bookings/user-history/${clientId}`);
        setBookingHistory(res.data);
      } catch (err) {
        console.error("Error fetching booking history:", err);
      }
    };

    fetchUserDetails();
    fetchBookingHistory();
  }, [clientId]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '30px 20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* 👤 My Profile Section (User Details) */}
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
            👤 My Profile
          </h3>
          
          {userDetails ? (
            // 📑 ඩේටාබේස් එකෙන් දත්ත ආවම පේන ලස්සන Layout එක
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', backgroundColor: '#fdfdfd', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
              <div>📌 <b>Full Name:</b> <span style={{ color: '#555', marginLeft: '5px' }}>{userDetails.name}</span></div>
              <div>📧 <b>Email Address:</b> <span style={{ color: '#555', marginLeft: '5px' }}>{userDetails.email}</span></div>
              <div>📞 <b>Phone Number:</b> <span style={{ color: '#555', marginLeft: '5px' }}>{userDetails.phone || 'Not Provided'}</span></div>
              <div>🏷️ <b>Account Role:</b> <span style={{ color: '#007bff', fontWeight: 'bold', marginLeft: '5px', textTransform: 'uppercase', fontSize: '13px' }}>{userDetails.role || 'User'}</span></div>
            </div>
          ) : (
            <p style={{ color: '#888', fontStyle: 'italic' }}>Loading profile details...</p>
          )}
        </div>

        {/* 📜 Booking History Section */}
        <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h4 style={{ margin: '0 0 20px 0', color: '#333' }}>📜 My Booking History</h4>

          {bookingHistory.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', margin: '20px 0' }}>You haven't booked any services yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '12px', color: '#495057', fontWeight: 'bold' }}>Provider ID</th>
                    <th style={{ padding: '12px', color: '#495057', fontWeight: 'bold' }}>Date</th>
                    <th style={{ padding: '12px', color: '#495057', fontWeight: 'bold' }}>Time</th>
                    <th style={{ padding: '12px', color: '#495057', fontWeight: 'bold' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingHistory.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontWeight: '500' }}>Provider #{b.providerId}</td>
                      <td style={{ padding: '12px', color: '#555' }}>{b.bookingDate}</td>
                      <td style={{ padding: '12px', color: '#555' }}>{b.bookingTime}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '15px', 
                          fontSize: '12px',
                          fontWeight: 'bold',
                          display: 'inline-block',
                          backgroundColor: b.status === 'Pending' ? '#fff3cd' : b.status === 'Accepted' ? '#d1e7dd' : '#f8d7da',
                          color: b.status === 'Pending' ? '#856404' : b.status === 'Accepted' ? '#0f5132' : '#842029'
                        }}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}