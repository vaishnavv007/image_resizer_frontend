import { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/AuthForm.module.css';

const MIN_PASSWORD_LENGTH = 8;

function checkPasswordStrength(password) {
  if (!password) return 0;
  
  let strength = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  
  return Math.min(Math.floor((strength / 4) * 100), 100);
}

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = useMemo(() => checkPasswordStrength(password), [password]);
  const passwordsMatch = password === confirmPassword;

  const getPasswordStrengthColor = useCallback((strength) => {
    if (strength < 25) return '#e53e3e';
    if (strength < 50) return '#dd6b20';
    if (strength < 75) return '#d69e2e';
    return '#38a169';
  }, []);

  const getPasswordStrengthText = useCallback((strength) => {
    if (strength < 25) return 'Weak';
    if (strength < 50) return 'Fair';
    if (strength < 75) return 'Good';
    return 'Strong';
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }

    try {
      setBusy(true);
      await signup({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Create an account</h2>
        <p style={{ textAlign: 'center', color: '#718096', marginBottom: '24px' }}>
          Get started with your free account
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className={styles.label} htmlFor="password">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4299e1',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: 0,
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Create a password"
              required
            />
            <div className={styles.passwordStrength}>
              <div 
                className={styles.strengthBar} 
                style={{
                  width: `${passwordStrength}%`,
                  backgroundColor: getPasswordStrengthColor(passwordStrength)
                }}
              />
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#718096',
              marginTop: '4px'
            }}>
              <span>Password strength: {password ? getPasswordStrengthText(passwordStrength) : '—'}</span>
              <span>{password.length > 0 ? `${password.length} characters` : ''}</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className={styles.label} htmlFor="confirmPassword">
                Confirm Password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4299e1',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: 0,
                  opacity: confirmPassword ? 1 : 0.5,
                  pointerEvents: confirmPassword ? 'auto' : 'none'
                }}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="confirmPassword"
              className={`${styles.input} ${confirmPassword && !passwordsMatch ? styles.error : ''}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Confirm your password"
              required
            />
            {confirmPassword && !passwordsMatch && (
              <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '4px' }}>
                Passwords do not match
              </div>
            )}
          </div>

          <div style={{ margin: '20px 0', fontSize: '14px', color: '#4a5568' }}>
            <p>Password must contain:</p>
            <ul style={{ paddingLeft: '20px', margin: '8px 0 0' }}>
              <li style={{ color: password.length >= MIN_PASSWORD_LENGTH ? '#38a169' : '#cbd5e0' }}>
                At least {MIN_PASSWORD_LENGTH} characters
              </li>
              <li style={{ color: /[A-Z]/.test(password) ? '#38a169' : '#cbd5e0' }}>
                At least one uppercase letter
              </li>
              <li style={{ color: /[0-9]/.test(password) ? '#38a169' : '#cbd5e0' }}>
                At least one number
              </li>
            </ul>
          </div>

          <button 
            className={styles.button} 
            type="submit" 
            disabled={busy || !email || !password || !confirmPassword || !passwordsMatch}
            style={{
              opacity: (!email || !password || !confirmPassword || !passwordsMatch) ? 0.7 : 1,
              cursor: (!email || !password || !confirmPassword || !passwordsMatch) ? 'not-allowed' : 'pointer'
            }}
          >
            {busy ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
