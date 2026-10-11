import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-card">
      <h2>Create a new account</h2>
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="btn-primary">
          Register
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default Register;
