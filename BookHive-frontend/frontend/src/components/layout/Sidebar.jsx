import { NavLink } from 'react-router-dom';
import {
  LuLayoutDashboard,
  LuBookOpen,
  LuLayers,
  LuHistory,
  LuBanknote,
  LuUser,
  LuLogOut,
  LuLogIn,
  LuUserPlus,
  LuBookPlus,
  LuShieldCheck
} from 'react-icons/lu';
import './Sidebar.css';

export default function Sidebar() {
  const role = localStorage.getItem('archivalia_role') || 'user';
  const isAdmin = role === 'admin';

  const userNavItems = [
    { to: '/dashboard',       label: 'Dashboard',         icon: LuLayoutDashboard },
    { to: '/books',           label: 'Browse Catalog',    icon: LuBookOpen },
    { to: '/my-borrows',      label: 'My Current Loans',  icon: LuLayers, badge: '3' },
    { to: '/borrows-history', label: 'Borrowing History', icon: LuHistory },
    { to: '/my-fines',        label: 'Fines & Payments',  icon: LuBanknote, hasDot: true },
    { to: '/profile',         label: 'Academic Profile',  icon: LuUser },
  ];

  const adminNavItems = [
    { to: '/dashboard',  label: 'Dashboard',       icon: LuLayoutDashboard },
    { to: '/books',      label: 'Browse Catalog',  icon: LuBookOpen },
    { to: '/books/add',  label: 'Add Book',        icon: LuBookPlus },
    { to: '/users',      label: 'Manage Users',    icon: LuShieldCheck },
    { to: '/all-borrows',label: 'All Reservations',icon: LuLayers },
    { to: '/all-fines',  label: 'All Fines',       icon: LuBanknote },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <aside className="archival-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand-header">
        <NavLink to="/dashboard" className="sidebar-brand-link">
          <div className="sidebar-brand-logo-container">
            <img src="/bookhive-logo.png" alt="BookHive" className="sidebar-brand-logo-img" />
          </div>
          <div className="sidebar-brand-titles">
            <span className="sidebar-brand-text">Book<span className="sidebar-brand-accent">Hive</span></span>
            <span className="sidebar-brand-sub">Read • Explore • Grow</span>
          </div>
        </NavLink>
      </div>

      {/* Role Badge */}
      {isAdmin && (
        <div className="sidebar-role-badge">
          <LuShieldCheck size={13} />
          <span>Admin Panel</span>
        </div>
      )}

      {/* Navigation List */}
      <nav className="sidebar-menu">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-menu-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-item-icon">
              <item.icon size={18} />
            </span>
            <span className="sidebar-item-label">{item.label}</span>
            {item.badge && (
              <span className="sidebar-item-badge">{item.badge}</span>
            )}
            {item.hasDot && (
              <span className="sidebar-item-dot"></span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User / Admin Info Box */}
      <div className="sidebar-institutional-card">
        <div className="institution-tag">
          {isAdmin ? 'ADMIN PANEL' : 'UNIVERSITY LIBRARY'}
        </div>
        <div className="institution-user">
          {isAdmin ? 'Library Administrator' : 'Sarah Jenkins (Graduate Reader)'}
        </div>
        <NavLink
          to="/login"
          className="sidebar-switch-btn"
          title="Sign Out"
          onClick={() => localStorage.removeItem('archivalia_role')}
        >
          <LuLogOut size={13} />
          <span>Exit / Sign Out</span>
        </NavLink>
      </div>
    </aside>
  );
}
