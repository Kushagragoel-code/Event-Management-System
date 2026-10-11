import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Login() {
  const [form, setform] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const nav = useNavigate();

  function set(e) {
    setform({ ...form, [e.target.name]: e.target.value });
  }

  async function sub(e) {
    e.preventDefault();
    const res = await fetch(`${url}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (data.token) {
      login(data.user, data.token);
      nav('/dashboard');
    }
  }

  return (
    <div className="auth-card">
      <h2>Login</h2>
      <form onSubmit={sub}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={set}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={set}
            required
          />
        </div>
        <button type="submit" className="btn-primary">
          Login
        </button>
      </form>
      <p className="auth-switch">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default Login;
