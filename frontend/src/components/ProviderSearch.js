import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBriefcase, FaDollarSign, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';
import './ProviderSearch.css';

function ProviderSearch() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // URL එකෙන් category එක වෙන් කර ගැනීම (උදා: ?category=Plumber -> 'Plumber')
  const queryParams = new URLSearchParams(location.search);
  const selectedCategory = queryParams.get('category');

  useEffect(() => {
    if (selectedCategory) {
      setLoading(true);
      // Backend filter API එකට කතා කිරීම
      axios.get(`http://localhost:5000/api/providers/filter?category=${selectedCategory}`)
        .then(res => {
          setProviders(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error filtering providers:", err);
          setLoading(false);
        });
    }
  }, [selectedCategory]);

  return (
    <div className="search-page-container">
      <div className="search-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back to Dashboard
        </button>
        <h2>Available {selectedCategory}s</h2>
      </div>

      {loading ? (
        <div className="loading-text">Searching for providers...</div>
      ) : (
        <div className="providers-grid">
          {providers.length === 0 ? (
            <div className="no-providers">
              😢 Sorry, no available {selectedCategory}s found at the moment.
            </div>
          ) : (
            providers.map(provider => (
              <div key={provider.user_id} className="provider-result-card">
                <div className="provider-avatar">👤</div>
                <h3>{provider.name || `Provider #${provider.user_id}`}</h3>
                <span className="category-badge">{provider.category}</span>
                
                <div className="provider-details">
                  <p><FaBriefcase /> <b>Experience:</b> {provider.experience} Years</p>
                  <p><FaDollarSign /> <b>Rate:</b> LKR {provider.hourly_rate}.00 / hr</p>
                  <p><FaMapMarkerAlt /> <b>Location:</b> {provider.location}</p>
                </div>

                <button className="book-now-btn" onClick={() => navigate(`/booking?providerId=${provider.user_id}`)}>
                  Book Service
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default ProviderSearch;