import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (String(password).length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setBusy(true);
      await signup({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Signup failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Sign up</h2>

        <form onSubmit={onSubmit} className="form">
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" />
          </label>

          <label>
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
            />
          </label>

          {error ? <div className="error">{error}</div> : null}

          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <div className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
