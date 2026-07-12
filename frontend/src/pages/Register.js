import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaUserTag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // ඔබ කලින් හදාගත් CSS ගොනුව මෙතන import කරන්න

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', role: 'Client', location: '' 
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);
      alert("Registration Successful!");
      const data = response.data; 
      const registeredId = data.userId || data.id || data.user?.id;
      if (registeredId) {
        localStorage.setItem('temp_user_id', registeredId);
      }
      if (formData.role === 'Provider') {
        navigate('/provider-register');
      } else {
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
        <h3>Create an Account</h3>
        <form onSubmit={handleSubmit}>
          
          <div className="input-group">
            <span className="input-group-text"><FaUser /></span>
            <input name="name" className="form-control" placeholder="Full Name" onChange={handleChange} required />
          </div>

          <div className="input-group">
            <span className="input-group-text"><FaEnvelope /></span>
            <input name="email" type="email" className="form-control" placeholder="Email Address" onChange={handleChange} required />
          </div>

          <div className="input-group">
            <span className="input-group-text"><FaLock /></span>
            <input name="password" type="password" className="form-control" placeholder="Password" onChange={handleChange} required />
          </div>

          <div className="input-group">
            <span className="input-group-text"><FaUserTag /></span>
            <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
              <option value="Client">Client</option>
              <option value="Provider">Provider</option>
            </select>
          </div>

          <div className="input-group">
            <span className="input-group-text"><FaMapMarkerAlt /></span>
            <input name="location" className="form-control" placeholder="Location" onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary">
            Register Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;