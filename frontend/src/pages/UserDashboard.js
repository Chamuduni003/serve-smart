import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBriefcase, FaDollarSign, FaTools, FaMapMarkerAlt } from 'react-icons/fa';
import './UserDashboard.css';

function UserDashboard() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  
  // 📅 එක් එක් Provider සඳහා තෝරාගන්නා Date සහ Time වෙන වෙනම තබා ගැනීමට State එකක්
  const [bookingInputs, setBookingInputs] = useState({});

  const customerName = localStorage.getItem('customerName') || 'Guest User';

  const fetchProviders = async (service = '') => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/provider/search', {
        params: { service }
      });
      setProviders(res.data || []);
    } catch (err) {
      console.error('Error fetching providers:', err);
      setProviders([]);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearching(true);
    fetchProviders(searchTerm);
  };

  // 🔄 Input fields වෙනස් වන විට අදාළ Provider ගේ ID එකට අගයන් තැන්පත් කිරීම
  const handleInputChange = (providerId, field, value) => {
    setBookingInputs(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        [field]: value
      }
    }));
  };

  const handleBookProvider = async (providerId, providerCategory) => {
    // 🚨 පරිශීලකයා තෝරාගත් Date සහ Time ලබා ගැනීම
    const selectedDate = bookingInputs[providerId]?.date;
    const selectedTime = bookingInputs[providerId]?.time;

    // Validation: Date සහ Time තෝරා නොමැති නම් Alert එකක් පෙන්වීම
    if (!selectedDate || !selectedTime) {
      alert('Please select both Date and Time before booking!');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/provider/bookings/create', {
        provider_id: providerId,
        client_name: customerName,
        service_category: providerCategory,
        booking_date: selectedDate, // Dynamic Date
        booking_time: selectedTime  // Dynamic Time
      });
      alert('Booking request sent successfully!');
      
      // බුකින් එක සාර්ථක වූ පසු Inputs හිස් කිරීම
      setBookingInputs(prev => ({
        ...prev,
        [providerId]: { date: '', time: '' }
      }));
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Failed to send booking request.');
    }
  };

  return (
    <div className="user-dashboard" style={{ padding: '20px' }}>
      <h2>Find Available Service Providers</h2>

      <form onSubmit={handleSearch} style={{ marginTop: '16px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by service, provider name, or category"
          style={{ flex: '1', minWidth: '260px', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#007bff', color: '#fff', cursor: 'pointer' }}
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {loading ? (
        <p>Loading providers...</p>
      ) : providers.length === 0 ? (
        <p>No providers found for this search.</p>
      ) : (
        /* 🚨 Grid වෙනුවට Flex Direction Row වන පරිදි Landscape Cards Container එක සකස් කිරීම */
        <div className="providers-landscape-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {providers.map((provider) => (
            <div key={provider.id} className="provider-landscape-card">
              
              {/* 1. වම් කෙළවර: Profile Image */}
              <div className="card-avatar-section">
                <img
                  src={provider.profile_image || 'https://via.placeholder.com/150'}
                  alt={provider.name}
                  className="provider-avatar"
                />
              </div>

              {/* 2. මැද කොටස: Provider Details */}
              <div className="card-details-section">
                <h3 className="provider-name">{provider.name}</h3>
                <div className="details-row">
                  <p><FaBriefcase /> <b>Experience:</b> {provider.experience_years} Years</p>
                  <p><FaDollarSign /> <b>Rate:</b> LKR {provider.hourly_rate}/hr</p>
                </div>
                <div className="details-row">
                  <p><FaTools /> <b>Category:</b> {provider.category}</p>
                  <p><FaMapMarkerAlt /> <b>Location:</b> {provider.location}</p>
                </div>
              </div>

              {/* 3. මැද දකුණු කොටස: Date & Time Scheduler */}
              <div className="card-scheduler-section">
                <div className="input-group">
                  <label>Select Date:</label>
                  <input
                    type="date"
                    className="scheduler-input"
                    value={bookingInputs[provider.id]?.date || ''}
                    onChange={(e) => handleInputChange(provider.id, 'date', e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Select Time:</label>
                  <input
                    type="time"
                    className="scheduler-input"
                    value={bookingInputs[provider.id]?.time || ''}
                    onChange={(e) => handleInputChange(provider.id, 'time', e.target.value)}
                  />
                </div>
              </div>

              {/* 4. දකුණු කෙළවර: Action Button */}
              <div className="card-action-section">
                <button
                  onClick={() => handleBookProvider(provider.id, provider.category)}
                  className="book-now-btn"
                >
                  Book Now
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserDashboard;