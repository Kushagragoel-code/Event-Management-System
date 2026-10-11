import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Register() {
  const [form, setform] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User'
  });
  const nav = useNavigate();

  function set(e) {
    setform({ ...form, [e.target.name]: e.target.value });
  }

  async function sub(e) {
    e.preventDefault();
    const res = await fetch(`${url}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      nav('/login');
    }
  }

  return (
    <div className="auth-card">
      <h2>Register</h2>
      <form onSubmit={sub}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={set}
            required
          />
        </div>
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
        <div className="form-group">
          <label>Role</label>
          <select name="role" value={form.role} onChange={set}>
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="btn-primary">
          Register
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;
