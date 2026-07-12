import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BookingModal = ({ show, onClose, provider, bookingDate, bookingTime }) => {
  const navigate = useNavigate();

  if (!show || !provider) return null;
  
  const handleConfirmBooking = async () => {
    // 📑 LocalStorage එකෙන් දැනට ලොග් වෙලා ඉන්න User ගේ ID එක ගැනීම
    const rawClientId = localStorage.getItem('userId');
    const clientId = rawClientId ? parseInt(rawClientId) : 1; 

    // Provider ගේ ID එක නිවැරදිව තෝරා ගැනීම
    const providerId = provider.id || provider.providerid || provider.user_id;

    // Backend එක බලාපොරොත්තු වන පිරිසිදු දත්ත ව්‍යුහය
    const bookingPayload = {
      clientId: clientId,
      providerId: parseInt(providerId),
      bookingDate: bookingDate,
      bookingTime: bookingTime,
      status: 'Pending'
    };

    // 🔍 DEBUG: යැවෙන data එක console එකේ පැහැදිලිව බලාගැනීමට
    console.log("📦 Sending booking payload:", bookingPayload);

    try {
      const response = await axios.post('http://localhost:5000/bookings', bookingPayload);
      
      if (response.data.success || response.status === 201) {
        alert("🎉 Booking request sent successfully!");
        
        // 🌟 අලුත් වෙනස්කම: My Bookings පිටුවේ Card එකක් විදිහට පෙන්වන්න දත්ත සකස් කර සේව් කිරීම
        const newBookingObj = {
          id: response.data.bookingId || Date.now(), // ID එකක් Backend එකෙන් ආවේ නැත්නම් timestamp එකක් ගන්නවා
          providerName: provider.name || "Service Provider",
          bookingDate: bookingDate,
          bookingTime: bookingTime,
          status: 'Pending'
        };

        // 💾 මේ බුකින් දත්ත ටික තාවකාලිකව බ්‍රවුසර් එකේ සේව් කරනවා
        localStorage.setItem('active_booking', JSON.stringify(newBookingObj));

        // 🚀 My Bookings පිටුවට User ව දක්කනවා
        navigate('/my-bookings');
        onClose();
      }
    } catch (error) {
      console.error("Booking Error:", error);
      alert("Booking Failed! Please check backend console.");
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 9999
    }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '400px' }}>
        <h4 style={{ textAlign: 'center' }}>Confirm Booking</h4>
        <hr />
        <p><strong>Provider:</strong> {provider.name}</p>
        <p><strong>Category:</strong> {provider.category}</p>
        <p><strong>Date:</strong> {bookingDate}</p>
        <p><strong>Time:</strong> {bookingTime}</p>
        <hr />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary w-50" onClick={onClose}>Cancel</button>
          <button className="btn btn-success w-50" onClick={handleConfirmBooking}>Confirm & Book Now</button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;