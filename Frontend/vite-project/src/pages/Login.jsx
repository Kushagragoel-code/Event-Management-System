import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loginUser } from '../api/api';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // input change pe state update hogi
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // login submit karne ke liye
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(form);
      if (data.token) {
        login(data.user, data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <form className="form" onSubmit={handleSubmit}>
        <h2>Login to Account</h2>

        {error && <p className="alert">{error}</p>}

        <label>
          Email Address
          <input
            type="email"
            name="email"
            placeholder="e.g. user@gmail.com"
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
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <div className="actions">
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </div>

        <p className="form-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
