import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaUserTag } from 'react-icons/fa';
import './Register.css'; // උඩින් සැකසූ CSS ගොනුව import කරන්න
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Client', location: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert("Registration Successful!");
      //navigate('/login');
      navigate('/Login');
      

    } catch (error) {
      alert("Registration Failed!");
    }
    
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <h3 className="mb-4 text-center fw-bold text-primary">Create an Account</h3>
        <form onSubmit={handleSubmit}>
          
          <div className="input-group mb-3">
            <span className="input-group-text"><FaUser /></span>
            <input name="name" className="form-control" placeholder="Full Name" onChange={handleChange} required />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text"><FaEnvelope /></span>
            <input name="email" type="email" className="form-control" placeholder="Email Address" onChange={handleChange} required />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text"><FaLock /></span>
            <input name="password" type="password" className="form-control" placeholder="Password" onChange={handleChange} required />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text"><FaUserTag /></span>
            <select name="role" className="form-select" onChange={handleChange}>
              <option value="Client">Client</option>
              <option value="Provider">Provider</option>
            </select>
          </div>

          <div className="input-group mb-4">
            <span className="input-group-text"><FaMapMarkerAlt /></span>
            <input name="location" className="form-control" placeholder="Location" onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold">Register Now</button>

        </form>
      </div>
    </div>
  );
};

export default Register;