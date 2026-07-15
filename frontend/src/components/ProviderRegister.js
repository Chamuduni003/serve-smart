import React, { useState } from 'react';
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
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('Profile details saved successfully! Redirecting...');

        
        localStorage.setItem('userId', '2'); 
        localStorage.setItem('userRole', 'provider');
        localStorage.setItem('userName', 'Service Provider');

        
        setTimeout(() => {
            setLoading(false);
            navigate('/provider-dashboard'); 
        }, 1000);
    };

    
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
                        <input 
                            type="text" 
                            name="category" 
                            placeholder="e.g., Plumbing, Web Design, Electrician" 
                            value={formData.category}
                            onChange={handleChange}
                            required
                        />
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
                    {loading ? 'Redirecting...' : 'Complete Registration'}
                </button>
            </form>
        </div>
    );
};

export default ProviderRegister;