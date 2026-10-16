import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LuBookOpen, LuEye, LuEyeOff, LuUser, LuShieldCheck } from 'react-icons/lu';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('user'); // 'user' | 'admin'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    localStorage.setItem('archivalia_role', role); // save role for sidebar
    const userPayload = role === 'admin'
      ? { user_id: 4, name: 'Library Administrator', email: identifier || 'admin@bookhive.org', role: 'ADMIN' }
      : { user_id: 1, name: 'Sarah Jenkins', email: identifier || 's.jenkins@oxford.ac.uk', role: 'USER' };
    localStorage.setItem('archivalia_user', JSON.stringify(userPayload));
    setTimeout(() => {
      navigate('/dashboard');
    }, 400);
  };

  const isAdmin = role === 'admin';

  return (
    <div className="login-container">
      {/* Left Atmospheric Library Panel */}
      <div className="login-visual-panel">
        <div className="visual-overlay"></div>
        <div className="visual-content">
          <Link to="/" className="auth-brand-badge" title="BookHive">
            <div className="brand-logo-frame">
              <img src="/bookhive-logo.png" alt="BookHive Logo" className="brand-logo-img" />
            </div>
            <div className="brand-badge-text">
              <span className="brand-badge-title">Book<span className="brand-badge-accent">Hive</span></span>
              <span className="brand-badge-tagline">Read • Explore • Grow</span>
            </div>
          </Link>

          <div className="quote-block">
            <h2 className="quote-text">
              &ldquo;Your library, anytime, anywhere. Read, explore, and grow with a world of knowledge.&rdquo;
            </h2>
            <div className="gold-rule"></div>
            <span className="quote-caption">BOOKHIVE CIRCULATION PRINCIPLE</span>
          </div>

          <p className="visual-footnote">
            Your gateway to the university's academic resources, journals, and research collections.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="login-form-panel">
        <div className="login-card">

          {/* Role Toggle */}
          <div className="role-toggle">
            <button
              type="button"
              className={`role-tab ${role === 'user' ? 'role-tab--active' : ''}`}
              onClick={() => { setRole('user'); setIdentifier(''); setPassword(''); }}
            >
              <LuUser size={15} />
              <span>User</span>
            </button>
            <button
              type="button"
              className={`role-tab ${role === 'admin' ? 'role-tab--active' : ''}`}
              onClick={() => { setRole('admin'); setIdentifier(''); setPassword(''); }}
            >
              <LuShieldCheck size={15} />
              <span>Admin</span>
            </button>
          </div>

          <div className="card-header">
            <h1 className="login-title">{isAdmin ? 'Admin Sign In' : 'Sign In'}</h1>
            <p className="login-subtitle">
              {isAdmin
                ? 'Access the library administration panel.'
                : 'Access your loans, reservations and library account.'}
            </p>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="emailInput">
                {isAdmin ? 'ADMIN EMAIL' : 'EMAIL OR USERNAME'}
              </label>
              <input
                id="emailInput"
                type="text"
                className="form-input"
                placeholder={isAdmin ? 'e.g., admin@university.edu' : 'e.g., student@university.edu'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div className="password-header">
                <label className="form-label" htmlFor="passwordInput">PASSWORD</label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="forgot-link">Forgot?</a>
              </div>
              <div className="input-with-icon">
                <input
                  id="passwordInput"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className={`btn-authenticate ${isAdmin ? 'btn-authenticate--admin' : ''}`} disabled={loading}>
              {loading ? 'Signing In...' : isAdmin ? 'Sign In as Admin' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up link — only for users */}
          {!isAdmin && (
            <div className="login-footer">
              <span>Don&apos;t have an account? </span>
              <Link to="/register" className="registrar-link">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
