import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/login', formData);
      const user = response.data;
      const userId = user.user_id || user.id;

      if (!userId) {
        throw new Error('The login response did not include a user ID.');
      }

      localStorage.setItem('userId', String(userId));
      localStorage.setItem('userRole', user.role || 'client');
      localStorage.setItem('userName', user.name || '');

      if (String(user.role).toLowerCase() === 'provider') {
        localStorage.setItem('loggedInProvider', JSON.stringify(user));
        navigate('/provider-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } catch (loginError) {
      console.error('Login failed:', loginError);
      setError(loginError.response?.data || loginError.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center min-vh-100">
  <div className="login-card shadow rounded-4 bg-white p-4" style={{ maxWidth: '420px', width: '100%' }}>
    <h2 className="mb-4 text-center">Login to Account</h2>
    
    <form onSubmit={handleSubmit}>
      {/* Email Input */}
      <div className="input-group mb-3 d-flex align-items-center border rounded">
        <span className="px-3 text-secondary">Email</span>
        <input
          type="email"
          className="form-control border-0"
          placeholder="example@gmail.com"
          required
          value={formData.email}
          onChange={(event) => setFormData({ ...formData, email: event.target.value })}
        />
      </div>

      {/* Password Input */}
      <div className="input-group mb-4 d-flex align-items-center border rounded">
        <span className="px-3 text-secondary">Password</span>
        <input
          type="password"
          className="form-control border-0"
          placeholder="Password"
          required
          value={formData.password}
          onChange={(event) => setFormData({ ...formData, password: event.target.value })}
        />
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      
      <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
        {loading ? 'Signing in...' : 'Login'}
      </button>
    </form>
  </div>
</div>
  );
}

export default Login;
