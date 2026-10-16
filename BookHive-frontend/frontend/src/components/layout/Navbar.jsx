import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import {
  LuSettings, LuShieldCheck, LuSave,
  LuSlidersHorizontal, LuBell,
  LuUser, LuLogOut, LuTrash2, LuChevronDown,
  LuBookOpen, LuCircleAlert,
} from 'react-icons/lu';
import './Navbar.css';

// ── Helper: get current logged-in user ───────────────────────────────────────
function getCurrentUser() {
  try {
    const s = localStorage.getItem('archivalia_user');
    if (s) return JSON.parse(s);
  } catch { /* ignore */ }
  return null;
}

export default function Navbar() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('archivalia_role') || 'user';
  const isAdmin = role === 'admin';
  const user = getCurrentUser();

  // Derive display name & initials
  const displayName = user?.name || (isAdmin ? 'Administrator' : 'Reader');
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // ── Profile Dropdown ──────────────────────────────────────────────────────
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on route change
  useEffect(() => setDropdownOpen(false), [location.pathname]);

  // ── Settings Modal ────────────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('policies');

  const [loanPeriod, setLoanPeriod] = useState(
    () => localStorage.getItem('archivalia_loan_period') || '14'
  );
  const [fineRate, setFineRate] = useState(
    () => localStorage.getItem('archivalia_fine_rate') || '5'
  );
  const [maxQuota, setMaxQuota] = useState(
    () => localStorage.getItem('archivalia_max_quota') || '5'
  );
  const [gracePeriod, setGracePeriod] = useState(
    () => localStorage.getItem('archivalia_grace_period') || '1'
  );
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoFreeze, setAutoFreeze] = useState(true);
  const [userAutoRenew, setUserAutoRenew] = useState(true);
  const [userDueDateReminder, setUserDueDateReminder] = useState(true);

  // ── Delete account confirmation ───────────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (isAdmin) {
      localStorage.setItem('archivalia_loan_period', loanPeriod);
      localStorage.setItem('archivalia_fine_rate', fineRate);
      localStorage.setItem('archivalia_max_quota', maxQuota);
      localStorage.setItem('archivalia_grace_period', gracePeriod);
      toast.success('Library system settings updated successfully!');
    } else {
      toast.success('Reader preferences saved successfully!');
    }
    setShowSettings(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('archivalia_user');
    localStorage.removeItem('archivalia_token');
    localStorage.removeItem('archivalia_role');
    toast.success('Logged out successfully. See you next time!');
    setDropdownOpen(false);
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    localStorage.clear();
    toast.success('Account deleted. All data has been removed.');
    setShowDeleteConfirm(false);
    navigate('/login');
  };

  // Dynamic breadcrumb
  const getPageTitle = () => {
    const path = location.pathname;
    if (isAdmin) {
      if (path === '/dashboard') return 'Admin Dashboard';
      if (path === '/books') return 'Catalog Management';
      if (path === '/books/add') return 'Add New Book';
      if (path.startsWith('/books/edit')) return 'Edit Book Details';
      if (path.startsWith('/books/')) return 'Book Details';
      if (path === '/users') return 'Manage Users';
      if (path === '/all-borrows') return 'All Reservations';
      if (path === '/all-fines') return 'Manage Fines';
      return 'Administration';
    } else {
      if (path === '/dashboard') return 'Dashboard';
      if (path === '/books') return 'Browse Catalog';
      if (path === '/my-borrows') return 'My Current Loans';
      if (path === '/borrows-history') return 'Borrowing History';
      if (path === '/my-fines') return 'Fines & Payments';
      if (path === '/profile') return 'Academic Profile';
      return 'Student Portal';
    }
  };

  return (
    <>
      <header className="archival-navbar">
        {/* Breadcrumb */}
        <div className="navbar-breadcrumb">
          <span className="crumb-root">BookHive</span>
          <span className="crumb-separator">/</span>
          {isAdmin && (
            <>
              <span className="crumb-role-badge">Admin</span>
              <span className="crumb-separator">/</span>
            </>
          )}
          <span className="crumb-user">{getPageTitle()}</span>
        </div>

        {/* Right Controls */}
        <div className="navbar-controls">
          {/* Settings icon */}
          <button
            type="button"
            className="navbar-action-btn"
            title="Settings"
            aria-label="Settings"
            onClick={() => { setShowSettings(true); setDropdownOpen(false); }}
          >
            <LuSettings size={18} />
          </button>

          {/* ── Profile Dropdown Trigger ──────────────────────────── */}
          <div className="profile-dropdown-wrap" ref={dropdownRef}>
            <button
              type="button"
              className={`profile-trigger-btn ${dropdownOpen ? 'open' : ''}`}
              onClick={() => setDropdownOpen((v) => !v)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              {/* Avatar circle */}
              <div className={`profile-avatar ${isAdmin ? 'avatar-admin' : 'avatar-user'}`}>
                {isAdmin ? <LuShieldCheck size={15} /> : <span>{initials}</span>}
              </div>

              {/* Name + role */}
              <div className="profile-meta">
                <span className="profile-display-name">{displayName}</span>
                <span className="profile-role-tag">
                  {isAdmin ? 'Administrator' : 'Reader'}
                </span>
              </div>

              <LuChevronDown
                size={14}
                className={`profile-chevron ${dropdownOpen ? 'rotated' : ''}`}
              />
            </button>

            {/* ── Dropdown Menu ──────────────────────────────────── */}
            {dropdownOpen && (
              <div className="profile-dropdown-menu" role="menu">
                {/* User info header */}
                <div className="dropdown-user-header">
                  <div className={`dropdown-avatar-lg ${isAdmin ? 'avatar-admin' : 'avatar-user'}`}>
                    {isAdmin ? <LuShieldCheck size={20} /> : <span>{initials}</span>}
                  </div>
                  <div>
                    <div className="dropdown-user-name">{displayName}</div>
                    <div className="dropdown-user-email">{user?.email || (isAdmin ? 'admin@bookhive.com' : '')}</div>
                    <span className={`dropdown-role-pill ${isAdmin ? 'pill-admin' : 'pill-user'}`}>
                      {isAdmin ? '🛡 Administrator' : '📚 Reader'}
                    </span>
                  </div>
                </div>

                <div className="dropdown-divider" />

                {/* Menu items */}
                <div className="dropdown-menu-items">
                  {!isAdmin && (
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                      role="menuitem"
                    >
                      <div className="dropdown-item-icon icon-blue">
                        <LuUser size={15} />
                      </div>
                      <div className="dropdown-item-text">
                        <span className="item-label">My Profile</span>
                        <span className="item-desc">View &amp; edit your account</span>
                      </div>
                    </Link>
                  )}

                  {!isAdmin && (
                    <Link
                      to="/my-borrows"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                      role="menuitem"
                    >
                      <div className="dropdown-item-icon icon-navy">
                        <LuBookOpen size={15} />
                      </div>
                      <div className="dropdown-item-text">
                        <span className="item-label">My Loans</span>
                        <span className="item-desc">View borrowed books</span>
                      </div>
                    </Link>
                  )}

                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => { setShowSettings(true); setDropdownOpen(false); }}
                    role="menuitem"
                  >
                    <div className="dropdown-item-icon icon-slate">
                      <LuSettings size={15} />
                    </div>
                    <div className="dropdown-item-text">
                      <span className="item-label">Settings</span>
                      <span className="item-desc">
                        {isAdmin ? 'Circulation & system config' : 'Preferences & notifications'}
                      </span>
                    </div>
                  </button>
                </div>

                <div className="dropdown-divider" />

                {/* Danger zone */}
                <div className="dropdown-menu-items">
                  <button
                    type="button"
                    className="dropdown-item item-logout"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <div className="dropdown-item-icon icon-logout">
                      <LuLogOut size={15} />
                    </div>
                    <div className="dropdown-item-text">
                      <span className="item-label">Log Out</span>
                      <span className="item-desc">End your current session</span>
                    </div>
                  </button>

                  {!isAdmin && (
                    <button
                      type="button"
                      className="dropdown-item item-danger"
                      onClick={() => { setShowDeleteConfirm(true); setDropdownOpen(false); }}
                      role="menuitem"
                    >
                      <div className="dropdown-item-icon icon-danger">
                        <LuTrash2 size={15} />
                      </div>
                      <div className="dropdown-item-text">
                        <span className="item-label">Delete Account</span>
                        <span className="item-desc">Permanently remove your data</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Settings Modal ──────────────────────────────────────────────────── */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-box settings-modal-box white-card" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <div className="settings-header-info">
                <div className="settings-header-icon"><LuSettings size={20} /></div>
                <div>
                  <h2 className="settings-title">
                    {isAdmin ? 'Library System Settings' : 'Reader Account Settings'}
                  </h2>
                  <p className="settings-subtitle">
                    {isAdmin
                      ? 'Configure circulation rules, fine tariffs, and overdue enforcement.'
                      : 'Manage your reading notifications and renewal preferences.'}
                  </p>
                </div>
              </div>
              <button type="button" className="settings-close-btn" onClick={() => setShowSettings(false)} aria-label="Close">✕</button>
            </div>

            {isAdmin && (
              <div className="settings-tabs-bar">
                <button type="button" className={`settings-tab-btn ${settingsTab === 'policies' ? 'active' : ''}`} onClick={() => setSettingsTab('policies')}>
                  <LuSlidersHorizontal size={14} /><span>Circulation Policies</span>
                </button>
                <button type="button" className={`settings-tab-btn ${settingsTab === 'notifications' ? 'active' : ''}`} onClick={() => setSettingsTab('notifications')}>
                  <LuBell size={14} /><span>Alerts &amp; Holds</span>
                </button>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="settings-form">
              {isAdmin ? (
                <>
                  {settingsTab === 'policies' && (
                    <div className="settings-fields-group">
                      <div className="settings-field-row">
                        <div className="settings-field-desc">
                          <label className="settings-field-label">Default Loan Duration</label>
                          <span className="settings-field-hint">Standard lending period per reservation</span>
                        </div>
                        <div className="settings-input-affix">
                          <input type="number" min="1" max="90" value={loanPeriod} onChange={(e) => setLoanPeriod(e.target.value)} className="settings-field-input" required />
                          <span className="settings-unit">days</span>
                        </div>
                      </div>
                      <div className="settings-field-row">
                        <div className="settings-field-desc">
                          <label className="settings-field-label">Daily Overdue Tariff</label>
                          <span className="settings-field-hint">Automatic fine accrued per late day</span>
                        </div>
                        <div className="settings-input-affix">
                          <span className="settings-prefix">₹</span>
                          <input type="number" step="0.5" min="0" max="100" value={fineRate} onChange={(e) => setFineRate(e.target.value)} className="settings-field-input" required />
                          <span className="settings-unit">/day</span>
                        </div>
                      </div>
                      <div className="settings-field-row">
                        <div className="settings-field-desc">
                          <label className="settings-field-label">Max Reader Quota</label>
                          <span className="settings-field-hint">Maximum books a student can hold</span>
                        </div>
                        <div className="settings-input-affix">
                          <input type="number" min="1" max="20" value={maxQuota} onChange={(e) => setMaxQuota(e.target.value)} className="settings-field-input" required />
                          <span className="settings-unit">books</span>
                        </div>
                      </div>
                      <div className="settings-field-row">
                        <div className="settings-field-desc">
                          <label className="settings-field-label">Grace Period</label>
                          <span className="settings-field-hint">Days before overdue fines start</span>
                        </div>
                        <div className="settings-input-affix">
                          <input type="number" min="0" max="7" value={gracePeriod} onChange={(e) => setGracePeriod(e.target.value)} className="settings-field-input" required />
                          <span className="settings-unit">days</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {settingsTab === 'notifications' && (
                    <div className="settings-fields-group">
                      <div className="settings-toggle-row">
                        <div>
                          <label className="settings-field-label">Automated Overdue Notices</label>
                          <p className="settings-field-hint">Send daily warning emails to readers with overdue loans</p>
                        </div>
                        <label className="switch"><input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} /><span className="slider round" /></label>
                      </div>
                      <div className="settings-toggle-row">
                        <div>
                          <label className="settings-field-label">Auto-Suspend Delinquent Readers</label>
                          <p className="settings-field-hint">Freeze borrow privileges when fine exceeds ₹50 or &gt;7 days overdue</p>
                        </div>
                        <label className="switch"><input type="checkbox" checked={autoFreeze} onChange={(e) => setAutoFreeze(e.target.checked)} /><span className="slider round" /></label>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="settings-fields-group">
                  <div className="settings-toggle-row">
                    <div>
                      <label className="settings-field-label">Due Date Reminders</label>
                      <p className="settings-field-hint">Receive an email 24 hours before your loan expires</p>
                    </div>
                    <label className="switch"><input type="checkbox" checked={userDueDateReminder} onChange={(e) => setUserDueDateReminder(e.target.checked)} /><span className="slider round" /></label>
                  </div>
                  <div className="settings-toggle-row">
                    <div>
                      <label className="settings-field-label">Auto-Renew Eligible Loans</label>
                      <p className="settings-field-hint">Automatically extend your loan if no one else has requested it</p>
                    </div>
                    <label className="switch"><input type="checkbox" checked={userAutoRenew} onChange={(e) => setUserAutoRenew(e.target.checked)} /><span className="slider round" /></label>
                  </div>
                </div>
              )}
              <div className="settings-modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowSettings(false)}>Cancel</button>
                <button type="submit" className="btn btn-navy btn-sm">
                  <LuSave size={14} /><span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Account Confirmation Modal ──────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-box white-card delete-confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className="delete-confirm-icon">
              <LuCircleAlert size={36} />
            </div>
            <h3 className="delete-confirm-title font-serif">Delete Your Account?</h3>
            <p className="delete-confirm-desc">
              This will <strong>permanently remove</strong> your account, all borrowing history,
              fines, and reservations. This action <strong>cannot be undone</strong>.
            </p>
            <div className="delete-confirm-actions">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-delete-confirm btn-sm"
                onClick={handleDeleteAccount}
              >
                <LuTrash2 size={14} /> Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
