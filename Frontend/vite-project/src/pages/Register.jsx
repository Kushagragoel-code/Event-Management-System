import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/api';

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User',
    adminKey: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // inputs update karne ke liye
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // naya user register karne ke liye
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await registerUser(form);
      setSuccess(data.message || 'Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <form className="form" onSubmit={handleSubmit}>
        <h2>Create an Account</h2>

        {error && <p className="alert">{error}</p>}
        {success && <p className="status success">{success}</p>}

        <label>
          Full Name
          <input
            type="text"
            name="name"
            placeholder="e.g. Rahul Sharma"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email Address
          <input
            type="email"
            name="email"
            placeholder="e.g. rahul@gmail.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Account Role
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="User">Regular User (Browse & RSVP)</option>
            <option value="Admin">Admin (Create & Manage Events)</option>
          </select>
        </label>

        {/* agar admin select kiya to secret key ka input aayega */}
        {form.role === 'Admin' && (
          <label>
            Admin Secret Key
            <input
              type="password"
              name="adminKey"
              placeholder="Enter secret key (default: admin123)"
              value={form.adminKey}
              onChange={handleChange}
              required
            />
          </label>
        )}

        <div className="actions">
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Registering…' : 'Register'}
          </button>
        </div>

        <p className="form-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
