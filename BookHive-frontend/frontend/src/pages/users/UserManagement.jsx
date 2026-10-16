import { useState, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import { mockUsers, mockBorrows, mockFines } from '../../data/mockData';
import {
  LuSearch, LuFilter, LuUserCheck, LuUserX, LuEye,
  LuShieldCheck, LuUsers, LuBanknote, LuBookOpen,
  LuPhone, LuCalendar, LuMail, LuCircleCheck, LuX
} from 'react-icons/lu';
import './Users.css';

export default function UserManagement() {
  const toast = useToast();
  const [usersList, setUsersList] = useState(mockUsers.filter(u => u.role !== 'ADMIN'));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const filtered = useMemo(() => {
    return usersList.filter(u => {
      const matchesSearch = !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.phone && u.phone.includes(search));

      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchesRole = roleFilter === 'all' || u.role.toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [usersList, search, statusFilter, roleFilter]);

  const toggleStatus = (targetUser) => {
    const newStatus = targetUser.status === 'active' ? 'inactive' : 'active';
    setUsersList(prev => prev.map(u =>
      u.user_id === targetUser.user_id ? { ...u, status: newStatus } : u
    ));
    if (selectedUser && selectedUser.user_id === targetUser.user_id) {
      setSelectedUser(prev => ({ ...prev, status: newStatus }));
    }
    toast.success(`${targetUser.name} is now ${newStatus === 'active' ? 'Active' : 'Deactivated'}`);
  };

  const totalUsers = usersList.length;
  const activeUsers = usersList.filter(u => u.status === 'active').length;
  const inactiveUsers = usersList.filter(u => u.status === 'inactive').length;
  const totalUnpaidAll = mockFines
    .filter(f => f.status === 'UNPAID')
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="users-page">
      {/* 1. Header Banner */}
      <div className="users-welcome-banner white-card">
        <div className="welcome-content">
          <span className="welcome-date">{today.toUpperCase()}</span>
          <h1 className="welcome-heading">User Management</h1>
          <p className="welcome-subtext">
            Oversee registered students, academic researchers, borrow privileges, and account standings.
          </p>
        </div>
        <div className="admin-badge-pill">
          <LuShieldCheck size={16} />
          <span>Admin Access</span>
        </div>
      </div>

      {/* 2. Top Stats */}
      <div className="users-stats-grid">
        <div className="user-stat-card white-card">
          <div className="user-stat-icon icon-navy">
            <LuUsers size={20} />
          </div>
          <span className="stat-header">TOTAL READERS</span>
          <div className="stat-number">{totalUsers}</div>
          <span className="stat-footnote">Registered accounts</span>
        </div>

        <div className="user-stat-card white-card">
          <div className="user-stat-icon icon-green">
            <LuUserCheck size={20} />
          </div>
          <span className="stat-header">ACTIVE READERS</span>
          <div className="stat-number" style={{ color: '#15803D' }}>{activeUsers}</div>
          <span className="stat-footnote">Full circulation access</span>
        </div>

        <div className="user-stat-card white-card">
          <div className="user-stat-icon icon-red">
            <LuUserX size={20} />
          </div>
          <span className="stat-header">INACTIVE / ON HOLD</span>
          <div className="stat-number" style={{ color: inactiveUsers > 0 ? '#DC2626' : '#64748B' }}>
            {inactiveUsers}
          </div>
          <span className="stat-footnote">Suspended privileges</span>
        </div>

        <div className="user-stat-card white-card">
          <div className="user-stat-icon icon-gold">
            <LuBanknote size={20} />
          </div>
          <span className="stat-header">OUTSTANDING FINES</span>
          <div className="stat-number" style={{ color: '#B88B4A' }}>
            ₹{totalUnpaidAll.toFixed(2)}
          </div>
          <span className="stat-footnote">Across all accounts</span>
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="users-controls-bar white-card">
        <div className="users-search-box">
          <LuSearch className="users-search-icon" size={17} />
          <input
            type="text"
            placeholder="Search readers by name, email, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="users-search-input"
          />
          {search && (
            <button className="users-clear-btn" onClick={() => setSearch('')} title="Clear search">
              <LuX size={14} />
            </button>
          )}
        </div>

        <div className="users-filter-actions">
          <div className="users-select-wrapper">
            <LuFilter size={14} className="users-filter-glyph" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="users-select-field"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <div className="users-select-wrapper">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="users-select-field"
            >
              <option value="all">All Roles</option>
              <option value="user">Student / User</option>
              <option value="researcher">Researcher</option>
            </select>
          </div>

          <div className="users-count-tag">
            Showing {filtered.length} of {totalUsers}
          </div>
        </div>
      </div>

      {/* 4. User Cards Grid */}
      <div className="users-cards-grid">
        {filtered.map(u => {
          const userBorrows = mockBorrows.filter(b => b.user_id === u.user_id);
          const userFines = mockFines.filter(f => f.user_id === u.user_id);
          const unpaidFines = userFines
            .filter(f => f.status === 'UNPAID')
            .reduce((sum, f) => sum + f.amount, 0);

          return (
            <div key={u.user_id} className={`user-item-card white-card ${u.status === 'inactive' ? 'is-inactive' : ''}`}>
              {/* Card Header */}
              <div className="user-item-header">
                <div className="user-item-avatar">
                  {u.name.charAt(0)}
                </div>
                <div className="user-item-main">
                  <div className="user-name-row">
                    <h3 className="user-item-name">{u.name}</h3>
                    <span className="user-role-badge">
                      {u.role === 'RESEARCHER' ? 'Researcher' : 'Student'}
                    </span>
                  </div>
                  <span className="user-item-email" title={u.email}>
                    <LuMail size={12} /> {u.email}
                  </span>
                </div>
                <span className={`user-status-pill status-${u.status}`}>
                  <span className="status-dot" />
                  {u.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Mini Stats Bar */}
              <div className="user-item-metrics">
                <div className="metric-box">
                  <span className="metric-val">{userBorrows.length}</span>
                  <span className="metric-lbl">Borrows</span>
                </div>
                <div className="metric-box">
                  <span className="metric-val">{userFines.length}</span>
                  <span className="metric-lbl">Fines</span>
                </div>
                <div className="metric-box">
                  <span className={`metric-val ${unpaidFines > 0 ? 'text-unpaid' : 'text-clean'}`}>
                    ₹{unpaidFines.toFixed(1)}
                  </span>
                  <span className="metric-lbl">Unpaid</span>
                </div>
              </div>

              {/* Meta Info */}
              <div className="user-item-meta">
                <div className="meta-line">
                  <LuCalendar size={13} />
                  <span>Joined: {u.joined}</span>
                </div>
                <div className="meta-line">
                  <LuPhone size={13} />
                  <span>{u.phone}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="user-item-actions">
                <button
                  type="button"
                  className="user-btn-view"
                  onClick={() => setSelectedUser(u)}
                >
                  <LuEye size={14} />
                  <span>View Details</span>
                </button>
                <button
                  type="button"
                  className={`user-btn-toggle ${u.status === 'active' ? 'toggle-deactivate' : 'toggle-activate'}`}
                  onClick={() => toggleStatus(u)}
                >
                  {u.status === 'active' ? (
                    <>
                      <LuUserX size={14} />
                      <span>Deactivate</span>
                    </>
                  ) : (
                    <>
                      <LuUserCheck size={14} />
                      <span>Activate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty Search State */}
      {filtered.length === 0 && (
        <div className="users-empty-box white-card">
          <div className="users-empty-icon">👥</div>
          <h3 className="users-empty-title">No matching readers found</h3>
          <p className="users-empty-desc">
            No accounts matched &ldquo;{search}&rdquo; with the selected filters.
          </p>
          <button
            className="btn btn-navy btn-sm"
            onClick={() => { setSearch(''); setStatusFilter('all'); setRoleFilter('all'); }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 5. User Detail Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-box user-modal-box white-card" onClick={e => e.stopPropagation()}>
            <div className="user-modal-header">
              <div className="user-modal-profile">
                <div className="user-modal-avatar">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h2 className="user-modal-name">{selectedUser.name}</h2>
                  <p className="user-modal-email">{selectedUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                className="user-modal-close"
                onClick={() => setSelectedUser(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="user-modal-body">
              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <span className="modal-info-label">Account Status</span>
                  <span className={`user-status-pill status-${selectedUser.status}`}>
                    <span className="status-dot" />
                    {selectedUser.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Reader Role</span>
                  <span className="modal-info-val">
                    {selectedUser.role === 'RESEARCHER' ? 'Academic Researcher' : 'Student Reader'}
                  </span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Contact Phone</span>
                  <span className="modal-info-val">{selectedUser.phone}</span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Member Since</span>
                  <span className="modal-info-val">{selectedUser.joined}</span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Borrow History</span>
                  <span className="modal-info-val">
                    {mockBorrows.filter(b => b.user_id === selectedUser.user_id).length} items recorded
                  </span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Outstanding Fines</span>
                  <span className="modal-info-val" style={{ color: '#B88B4A', fontWeight: 700 }}>
                    ₹{mockFines
                      .filter(f => f.user_id === selectedUser.user_id && f.status === 'UNPAID')
                      .reduce((sum, f) => sum + f.amount, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="user-modal-footer">
              <button
                type="button"
                className={`btn btn-sm ${selectedUser.status === 'active' ? 'btn-danger' : 'btn-navy'}`}
                onClick={() => toggleStatus(selectedUser)}
              >
                {selectedUser.status === 'active' ? 'Deactivate Reader' : 'Activate Reader'}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
