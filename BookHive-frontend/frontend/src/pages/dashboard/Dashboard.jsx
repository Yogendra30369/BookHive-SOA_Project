import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { activeCirculationReserves, mockBooks } from '../../data/mockData';
import { getAllBooks } from '../../data/bookStore';
import { getRecentlyViewed, clearRecentlyViewed } from '../../data/recentlyViewedStore';
import {
  LuBookOpen, LuUsers, LuBookMarked, LuBanknote,
  LuBookPlus, LuShieldCheck, LuLayers, LuTrendingUp,
  LuClock, LuCircleCheck, LuTriangleAlert, LuUser, LuHistory
} from 'react-icons/lu';
import './Dashboard.css';

/* ─── Admin Dashboard ─────────────────────────────────────────── */
function AdminDashboard() {
  const allBooks = getAllBooks(mockBooks);
  const totalBooks = allBooks.length;
  const availableBooks = allBooks.filter(b => b.available_copies > 0).length;

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const stats = [
    { icon: LuBookOpen,    label: 'TOTAL BOOKS',         value: totalBooks,  sub: 'In catalog',             color: '#101B3B' },
    { icon: LuBookMarked,  label: 'AVAILABLE BOOKS',     value: availableBooks, sub: 'Ready for reservation', color: '#15803d' },
    { icon: LuLayers,      label: 'ACTIVE RESERVATIONS', value: 8,           sub: 'Pending collection',     color: '#b45309' },
    { icon: LuBanknote,    label: 'OUTSTANDING FINES',   value: '₹340',      sub: 'Across 5 users',         color: '#dc2626' },
  ];

  const recentReservations = [
    { user: 'Arjun Mehta',      book: 'Introduction to Algorithms',      time: '10 mins ago',  status: 'pending',   statusLabel: 'Pending Pickup' },
    { user: 'Priya Sharma',     book: 'Behavioral Economics & Policy',   time: '38 mins ago',  status: 'collected', statusLabel: 'Collected' },
    { user: 'Rohan Nair',       book: 'Deep Learning for Computer Vision', time: '2 hrs ago',  status: 'pending',   statusLabel: 'Pending Pickup' },
    { user: 'Sneha Pillai',     book: 'Socio-Economic Impact of Silk Rd', time: '3 hrs ago',   status: 'collected', statusLabel: 'Collected' },
    { user: 'Karan Verma',      book: 'Digital Audio Signal Processing',  time: '5 hrs ago',   status: 'overdue',   statusLabel: 'Overdue' },
    { user: 'Meera Krishnan',   book: 'Machine Learning Fundamentals',    time: 'Yesterday',   status: 'collected', statusLabel: 'Collected' },
  ];

  const quickActions = [
    { to: '/books/add',   icon: LuBookPlus,   label: 'Add New Book',      desc: 'Add a book to the catalog',    bg: '#101B3B' },
    { to: '/users',       icon: LuUsers,      label: 'Manage Users',      desc: 'View and manage users',        bg: '#1e40af' },
    { to: '/all-borrows', icon: LuLayers,     label: 'All Reservations',  desc: 'Review active reservations',   bg: '#0f6b4c' },
    { to: '/all-fines',   icon: LuBanknote,   label: 'Manage Fines',      desc: 'View & resolve fines',         bg: '#92400e' },
  ];

  return (
    <div className="dashboard-view">
      {/* Welcome Banner */}
      <div className="welcome-banner admin-welcome-banner white-card">
        <div className="welcome-content">
          <span className="welcome-date">{today.toUpperCase()}</span>
          <h1 className="welcome-heading">Admin Dashboard</h1>
          <p className="welcome-subtext">
            Library Management Overview — Monitor books, reservations, users and fines.
          </p>
        </div>
        <div className="admin-badge-pill">
          <LuShieldCheck size={16} />
          <span>Library Administrator</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        {stats.map((s) => (
          <div key={s.label} className="stat-card white-card">
            <div className="admin-stat-icon" style={{ background: s.color + '18', color: s.color }}>
              <s.icon size={20} />
            </div>
            <span className="stat-header">{s.label}</span>
            <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
            <span className="stat-footnote">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <section className="dashboard-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="admin-quick-actions">
          {quickActions.map((a) => (
            <Link key={a.to} to={a.to} className="admin-action-card" style={{ background: a.bg }}>
              <div className="admin-action-icon"><a.icon size={22} /></div>
              <div>
                <div className="admin-action-label">{a.label}</div>
                <div className="admin-action-desc">{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Reservations */}
      <section className="dashboard-section">
        <div className="section-title-row">
          <h2 className="section-title">Recent Reservations</h2>
          <Link to="/all-borrows" className="section-link">View All →</Link>
        </div>
        <div className="activity-card white-card">
          <div className="admin-reservations-list">
            {recentReservations.map((r, i) => (
              <div key={i} className="admin-reservation-row">
                <div className="admin-res-avatar">
                  {r.user.charAt(0)}
                </div>
                <div className="admin-res-info">
                  <span className="admin-res-user">{r.user}</span>
                  <span className="admin-res-book">📖 {r.book}</span>
                </div>
                <div className="admin-res-right">
                  <span className="admin-res-time"><LuClock size={12} /> {r.time}</span>
                  <span className={`admin-status-badge status-${r.status}`}>
                    {r.status === 'collected' && <LuCircleCheck size={11} />}
                    {r.status === 'overdue'   && <LuTriangleAlert size={11} />}
                    {r.statusLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog Overview */}
      <section className="dashboard-section">
        <div className="section-title-row">
          <h2 className="section-title">Catalog Overview</h2>
          <Link to="/books" className="section-link">Browse Catalog →</Link>
        </div>
        <div className="admin-catalog-overview white-card">
          <div className="admin-catalog-stat">
            <LuTrendingUp size={18} color="#101B3B" />
            <span className="admin-cat-num">{totalBooks}</span>
            <span className="admin-cat-label">Total Books</span>
          </div>
          <div className="admin-catalog-divider" />
          <div className="admin-catalog-stat">
            <LuBookOpen size={18} color="#15803d" />
            <span className="admin-cat-num">{availableBooks}</span>
            <span className="admin-cat-label">Available</span>
          </div>
          <div className="admin-catalog-divider" />
          <div className="admin-catalog-stat">
            <LuBookMarked size={18} color="#b45309" />
            <span className="admin-cat-num">{totalBooks - availableBooks}</span>
            <span className="admin-cat-label">Fully Borrowed</span>
          </div>
          <div className="admin-catalog-divider" />
          <div className="admin-catalog-stat">
            <LuBookPlus size={18} color="#1e40af" />
            <Link to="/books/add" className="admin-cat-action">+ Add Book</Link>
          </div>
        </div>
      </section>

      {/* Recently Viewed Resources */}
      <RecentlyViewedSection />
    </div>
  );
}

/* ─── User Dashboard ──────────────────────────────────────────── */
function UserDashboard() {
  const [reserves, setReserves] = useState(activeCirculationReserves);
  const [activeModal, setActiveModal] = useState(null);

  // Live fines check from localStorage
  const savedFines = (() => {
    try {
      const s = localStorage.getItem('archivalia_user_fines');
      if (s) return JSON.parse(s);
    } catch (e) {}
    return null;
  })();
  const outstandingFinesVal = savedFines
    ? savedFines.filter((f) => f.status === 'UNPAID').reduce((acc, f) => acc + f.amount, 0)
    : 25.00;

  const confirmReturn = () => {
    if (!activeModal) return;
    setReserves(reserves.filter((r) => r.id !== activeModal.id));
    setActiveModal(null);
  };

  const userStats = [
    {
      icon: LuBookOpen,
      label: 'ACTIVE BORROWED LOANS',
      value: reserves.length,
      sub: 'Total items checked out',
      color: '#101B3B'
    },
    {
      icon: LuClock,
      label: 'DOCUMENTS DUE SOON',
      value: reserves.filter((r) => r.daysLeft <= 3).length || 1,
      sub: 'Due within next 48 hours',
      color: '#D97706'
    },
    {
      icon: LuBanknote,
      label: 'OUTSTANDING RETURN FINES',
      value: `₹${outstandingFinesVal.toFixed(2)}`,
      sub: outstandingFinesVal > 0 ? 'Pending overdue fee' : 'All accounts settled',
      color: outstandingFinesVal > 0 ? '#DC2626' : '#059669'
    },
    {
      icon: LuLayers,
      label: 'TOTAL RESOURCES READ',
      value: 7,
      sub: 'Lifetime borrowed titles',
      color: '#7C3AED'
    }
  ];

  const quickActions = [
    { to: '/books',       icon: LuBookOpen,  label: 'Browse Catalog',    desc: 'Find books and research papers', bg: '#101B3B' },
    { to: '/my-borrows',  icon: LuLayers,    label: 'My Current Loans',  desc: 'View active loan periods',       bg: '#1E40AF' },
    { to: '/my-fines',    icon: LuBanknote,  label: 'Fines & Payments',  desc: 'Review and pay overdue charges', bg: '#0F6B4C' },
    { to: '/profile',     icon: LuUser,      label: 'My Profile',        desc: 'Academic details and credentials', bg: '#6D28D9' }
  ];

  return (
    <div className="dashboard-view">
      {/* Welcome Banner */}
      <div className="welcome-banner white-card">
        <div className="welcome-content">
          <span className="welcome-date">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
          </span>
          <h1 className="welcome-heading">Welcome back, Sarah</h1>
        </div>
      </div>

      {/* Stats Row with colored icons */}
      <div className="stats-row">
        {userStats.map((s) => (
          <div key={s.label} className="stat-card white-card">
            <div className="admin-stat-icon" style={{ background: s.color + '18', color: s.color }}>
              <s.icon size={20} />
            </div>
            <span className="stat-header">{s.label}</span>
            <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
            <span className="stat-footnote">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Quick Navigation Actions */}
      <section className="dashboard-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="admin-quick-actions">
          {quickActions.map((a) => (
            <Link key={a.to} to={a.to} className="admin-action-card" style={{ background: a.bg }}>
              <div className="admin-action-icon"><a.icon size={22} /></div>
              <div>
                <div className="admin-action-label">{a.label}</div>
                <div className="admin-action-desc">{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Active Circulation Reserves */}
      <section className="dashboard-section">
        <div className="section-title-row">
          <h2 className="section-title">Your Active Circulation Reserves</h2>
          <Link to="/my-borrows" className="section-link">View All Loans →</Link>
        </div>
        <div className="reserves-grid">
          {reserves.map((reserve) => (
            <div key={reserve.id} className="reserve-card white-card">
              <div className="reserve-cover-box">
                <img src={reserve.cover} alt={reserve.title} className="reserve-cover-img" />
              </div>
              <div className="reserve-details">
                <span className="asset-tag">{reserve.type}</span>
                <h3 className="reserve-title" title={reserve.title}>{reserve.title}</h3>
                <p className="reserve-author">{reserve.author}</p>
                <div className="circulation-progress-wrap">
                  <div className="circulation-label">
                    Circulation period: {reserve.daysLeft} of {reserve.totalDays} days left
                  </div>
                  <div className="progress-bar-track">
                    <div className={`progress-bar-fill ${reserve.daysLeft <= 1 ? 'fill-warning' : 'fill-navy'}`}
                      style={{ width: `${reserve.progressPercent}%` }} />
                  </div>
                </div>
                <div className="reserve-actions">
                  <button type="button" className="btn btn-navy btn-sm">Read Online</button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setActiveModal(reserve)}>Return Early</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Viewed Resources */}
      <RecentlyViewedSection />

      {/* Modal */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-box white-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title font-serif">Return Archival Item</h3>
            <p className="modal-body">
              Are you sure you want to return <strong>{activeModal.title}</strong> early?
            </p>
            <div className="modal-button-row">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setActiveModal(null)}>Cancel</button>
              <button type="button" className="btn btn-navy btn-sm" onClick={confirmReturn}>Confirm Return</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Recently Viewed Section ─────────────────────────────────── */
function RecentlyViewedSection() {
  const [recentBooks, setRecentBooks] = useState(() => getRecentlyViewed());

  // Listen for storage changes across tabs or window events
  useEffect(() => {
    const handleStorage = () => {
      setRecentBooks(getRecentlyViewed());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleClear = () => {
    clearRecentlyViewed();
    setRecentBooks([]);
  };

  if (!recentBooks || recentBooks.length === 0) {
    return (
      <section className="dashboard-section recently-viewed-section">
        <div className="section-title-row">
          <div className="section-title-with-icon">
            <LuHistory size={18} className="section-title-icon" />
            <h2 className="section-title">Recently Viewed</h2>
          </div>
          <Link to="/books" className="section-link">Browse Catalog →</Link>
        </div>
        <div className="recently-viewed-empty white-card">
          <div className="empty-history-icon">📚</div>
          <h3 className="empty-history-title font-serif">No Recently Viewed Books</h3>
          <p className="empty-history-desc">
            Titles you examine in the catalog will appear here automatically for quick reference.
          </p>
          <Link to="/books" className="btn-explore-catalog">
            Explore Resource Catalog
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-section recently-viewed-section">
      <div className="section-title-row">
        <div className="section-title-with-icon">
          <LuHistory size={18} className="section-title-icon" />
          <h2 className="section-title">Recently Viewed ({recentBooks.length})</h2>
          <span className="recently-viewed-badge">Last 5–10 items</span>
        </div>
        <div className="recently-viewed-actions">
          <button
            type="button"
            className="btn-clear-history"
            onClick={handleClear}
            title="Clear recently viewed history"
          >
            Clear History
          </button>
          <Link to="/books" className="section-link">View All Catalog →</Link>
        </div>
      </div>

      <div className="recently-viewed-grid">
        {recentBooks.slice(0, 10).map((b) => {
          const isAvailable = b.available_copies > 0;
          return (
            <Link
              key={b.book_id}
              to={`/books/${b.book_id}`}
              className="recent-book-card white-card"
            >
              <div className="recent-cover-wrapper">
                {b.coverTextOnly ? (
                  <div className="recent-cover-text-panel">
                    <span className="recent-cover-text font-serif">{b.title}</span>
                  </div>
                ) : (
                  <img src={b.cover} alt={b.title} className="recent-cover-img" />
                )}
                <span className={`recent-avail-badge ${isAvailable ? 'badge-avail' : 'badge-unavail'}`}>
                  {isAvailable ? 'Available' : 'Reserved'}
                </span>
              </div>
              <div className="recent-card-body">
                <span className="recent-card-type">{b.type}</span>
                <h4 className="recent-card-title font-serif" title={b.title}>{b.title}</h4>
                <p className="recent-card-author">by {b.author}</p>
                <div className="recent-card-footer">
                  <span className="recent-card-category">{b.category}</span>
                  <span className="recent-card-view-link">View Details →</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Root — role switch ──────────────────────────────────────── */
export default function Dashboard() {
  const isAdmin = localStorage.getItem('archivalia_role') === 'admin';
  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
}
