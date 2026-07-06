import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { FaUserTie, FaMapMarkerAlt, FaDollarSign, FaBriefcase, FaCheckCircle } from 'react-icons/fa';
import './ProviderRegister.css';

const ProviderRegister = () => {
    const navigate = useNavigate();

    // පෝරමයේ දත්ත සඳහා state
    const [formData, setFormData] = useState({
        experience: '',
        rate: '',
        bio: '',
        category: '',
        location: '',
        availability: true 
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Input වෙනස් වන විට state යාවත්කාලීන කිරීම
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // පෝරමය Submit කිරීම
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const userIdFromStorage = localStorage.getItem('userId') || 1; 

        const dataToSubmit = {
            ...formData,
            user_id: userIdFromStorage
        };

        try {
            // 🚨 සෘජුවම නිවැරදි Backend URL එක ලබා දීම
            const response = await axios.post('http://localhost:5000/api/provider/register', dataToSubmit);
            
            // 🚨 Node.js සර්වර් එකෙන් එවන success flag එක පරීක්ෂා කිරීම (200 status එක සඳහා)
            if (response.data && response.data.success) {
                setSuccess('Profile details saved successfully! Redirecting...');
                
                setTimeout(() => {
                    navigate('/provider-dashboard'); 
                }, 2000);
            } else {
                setError('Failed to save profile details. Try again.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ප්‍රධාන කාණ්ඩ ලැයිස්තුව
    const categories = [
        'Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 
        'Gardening', 'Appliance Repair', 'Tutoring', 'Other'
    ];

    return (
        <div className="provider-register-container">
            <form className="provider-register-form" onSubmit={handleSubmit}>
                <div className="form-header">
                    <h2><FaUserTie /> Provider Profile Details</h2>
                    <p>Complete your profile to start offering services</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="form-grid">
                    {/* Experience & Rate Row */}
                    <div className="input-group col-md-6">
                        <label><FaBriefcase /> Experience (Years)</label>
                        <input 
                            type="number" 
                            name="experience" 
                            placeholder="e.g., 5" 
                            value={formData.experience}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>

                    <div className="input-group col-md-6">
                        <label><FaDollarSign /> Hourly Rate (LKR)</label>
                        <input 
                            type="number" 
                            name="rate" 
                            placeholder="e.g., 1500" 
                            value={formData.rate}
                            onChange={handleChange}
                            min="500"
                            step="100"
                        />
                    </div>

                    {/* Bio */}
                    <div className="input-group col-md-12">
                        <label>Bio / Professional Summary</label>
                        <textarea 
                            name="bio" 
                            placeholder="Briefly describe your skills, experience, and what services you offer..."
                            value={formData.bio}
                            onChange={handleChange}
                            rows="4"
                        />
                    </div>

                    {/* Category & Location */}
                    <div className="input-group col-md-6">
                        <label><FaUserTie /> Primary Service Category</label>
                        <select 
                            name="category" 
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group col-md-6">
                        <label><FaMapMarkerAlt /> Location (City/Area)</label>
                        <input 
                            type="text" 
                            name="location" 
                            placeholder="e.g., Colombo 03" 
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Availability Checkbox */}
                    <div className="input-group col-md-12 checkbox-group">
                        <input 
                            type="checkbox" 
                            name="availability" 
                            id="availability" 
                            checked={formData.availability}
                            onChange={handleChange}
                        />
                        <label htmlFor="availability" className="availability-label">
                            <FaCheckCircle /> Available for Immediate Work
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Saving...' : 'Complete Registration'}
                </button>
            </form>
        </div>
    );
};

export default ProviderRegister;