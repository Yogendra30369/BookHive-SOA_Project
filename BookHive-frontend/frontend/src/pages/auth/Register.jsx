import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LuBookOpen, LuEye, LuEyeOff, LuCheck, LuX } from 'react-icons/lu';
import './Login.css';

const passwordRules = [
  { id: 'length',    label: 'At least 6 characters',        test: (p) => p.length >= 6 },
  { id: 'uppercase', label: 'One uppercase letter (A–Z)',    test: (p) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'One lowercase letter (a–z)',    test: (p) => /[a-z]/.test(p) },
  { id: 'digit',     label: 'One digit (0–9)',               test: (p) => /[0-9]/.test(p) },
  { id: 'special',   label: 'One special character (!@#…)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);

  const allRulesPassed = passwordRules.every((r) => r.test(password));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name || !username || !email || !studentId || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!allRulesPassed) {
      return; // inline message handles this
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      navigate('/login');
    }, 500);
  };

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
              &ldquo;A library is not a luxury but one of the necessities of life.&rdquo;
            </h2>
            <div className="gold-rule"></div>
            <span className="quote-caption">HENRY WARD BEECHER</span>
          </div>

          <p className="visual-footnote">
            Join the university library and get access to thousands of books, journals, and academic resources.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="login-form-panel">
        <div className="login-card">
          <div className="card-header">
            <h1 className="login-title">Create Account</h1>
            <p className="login-subtitle">
              Register to reserve books and manage your library account.
            </p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">FULL NAME</label>
              <input
                id="fullName"
                type="text"
                className="form-input"
                placeholder="e.g., John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Username */}
            <div className="form-group">
              <label className="form-label" htmlFor="username">USERNAME</label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="e.g., john_smith24"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* University Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="regEmail">UNIVERSITY EMAIL</label>
              <input
                id="regEmail"
                type="email"
                className="form-input"
                placeholder="e.g., student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Student / Faculty ID — required */}
            <div className="form-group">
              <label className="form-label" htmlFor="studentId">STUDENT / FACULTY ID</label>
              <input
                id="studentId"
                type="text"
                className="form-input"
                placeholder="e.g., STU-2024-001"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="regPassword">PASSWORD</label>
              <div className="input-with-icon">
                <input
                  id="regPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
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

              {/* Password strength checklist */}
              {(passwordFocused || password.length > 0) && (
                <div className="password-rules">
                  {passwordRules.map((rule) => {
                    const passed = rule.test(password);
                    return (
                      <div key={rule.id} className={`pw-rule ${passed ? 'pw-rule--pass' : 'pw-rule--fail'}`}>
                        {passed ? <LuCheck size={12} /> : <LuX size={12} />}
                        <span>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Inline password criteria warning — shown on submit attempt */}
              {password.length > 0 && !allRulesPassed && (
                <p className="pw-mismatch" style={{ marginTop: '8px' }}>
                  Password does not meet the required criteria.
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">CONFIRM PASSWORD</label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="pw-mismatch">Passwords do not match.</p>
              )}
            </div>

            <button type="submit" className="btn-authenticate" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="login-footer">
            <span>Already have an account? </span>
            <Link to="/login" className="registrar-link">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
