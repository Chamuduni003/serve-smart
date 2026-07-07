import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaUserTag } from 'react-icons/fa';
import './Register.css'; 
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  
  // ඔයාගේ මුල් Form State එක (Default Role එක 'Client' විදිහටම තැන්පත් කලා)
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'Client', 
    location: '' 
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Backend එකට Register Request එක යැවීම
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);
      
      alert("Registration Successful!");

      // Backend එකෙන් ලැබෙන User Data (id/userId) එක ගන්නවා
      const data = response.data; 
      
      // 2. අලුතින් හැදුනු User ID එක දෙවැනි පේජ් එකේදී පාවිච්චි කරන්න LocalStorage දානවා
      // Backend එකෙන් එන්නේ 'userId' හෝ 'id' ද කියලා බලාගෙන මේක වැඩ කරයි
      const registeredId = data.userId || data.id || data.user?.id;
      if (registeredId) {
        localStorage.setItem('temp_user_id', registeredId);
      }

      // 3. 🔥 Auto Redirect Logic එක:
      if (formData.role === 'Provider') {
        // Role එක Provider නම් කෙලින්ම Profile Details පූරණය කරන පේජ් එකට
        navigate('/provider-register');
      } else {
        // සාමාන්‍ය Client කෙනෙක් නම් Login පේජ් එකට
        navigate('/Login');
      }

    } catch (error) {
      console.error("Registration Error:", error);
      alert("Registration Failed!");
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <h3 className="mb-4 text-center fw-bold text-primary">Create an Account</h3>
        <form onSubmit={handleSubmit}>
          
          {/* Full Name */}
          <div className="input-group mb-3">
            <span className="input-group-text"><FaUser /></span>
            <input 
              name="name" 
              className="form-control" 
              placeholder="Full Name" 
              onChange={handleChange} 
              required 
            />
          </div>

          {/* Email Address */}
          <div className="input-group mb-3">
            <span className="input-group-text"><FaEnvelope /></span>
            <input 
              name="email" 
              type="email" 
              className="form-control" 
              placeholder="Email Address" 
              onChange={handleChange} 
              required 
            />
          </div>

          {/* Password */}
          <div className="input-group mb-3">
            <span className="input-group-text"><FaLock /></span>
            <input 
              name="password" 
              type="password" 
              className="form-control" 
              placeholder="Password" 
              onChange={handleChange} 
              required 
            />
          </div>

          {/* Role Selection */}
          <div className="input-group mb-3">
            <span className="input-group-text"><FaUserTag /></span>
            <select 
              name="role" 
              className="form-select" 
              value={formData.role} 
              onChange={handleChange}
            >
              <option value="Client">Client</option>
              <option value="Provider">Provider</option>
            </select>
          </div>

          {/* Location */}
          <div className="input-group mb-4">
            <span className="input-group-text"><FaMapMarkerAlt /></span>
            <input 
              name="location" 
              className="form-control" 
              placeholder="Location" 
              onChange={handleChange} 
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold">
            Register Now
          </button>

        </form>
      </div>
    </div>
  );
};

export default Register;