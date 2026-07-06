import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css'

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  return (
    <div className="login-page d-flex align-items-center justify-content-center min-vh-100">
      <div className="login-card shadow rounded-4 bg-white p-4" style={{ maxWidth: '420px', width: '100%' }}>
        <h2 className="mb-4 text-center">Login to Account</h2>
        <form onSubmit={(e) => { e.preventDefault(); navigate('/user-dashboard'); }}>
          <div className="input-group mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="example@gmail.com" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="input-group mb-4">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="••••••••" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary w-100 py-2">Login</button>
        </form>
      </div>
    </div>
  );
}
export default Login;