import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getUserReservations,
  RESERVATION_KEY,
} from '../../data/reservationStore';
import {
  LuBookOpen,
  LuFileText,
  LuVideo,
  LuCircleCheck,
  LuClock,
  LuTriangleAlert,
  LuBanknote,
  LuHourglass,
  LuCalendar,
} from 'react-icons/lu';
import './Borrows.css';

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return d; }
}

function computeTimeLeft(dueDateStr) {
  if (!dueDateStr) return null;
  const due  = new Date(dueDateStr);
  const now  = new Date();
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return { label: `${Math.abs(diff)} days overdue`, overdue: true,  urgent: false };
  if (diff === 0) return { label: 'Due today!',                     overdue: false, urgent: true  };
  if (diff <= 3)  return { label: `${diff} day${diff > 1 ? 's' : ''} left`,  overdue: false, urgent: true  };
  return           { label: `${diff} days left`,                    overdue: false, urgent: false };
}

// ─────────────────────────────────────────────────────────────────────────────
export default function MyBorrows() {
  // Login.jsx bypasses AuthContext and writes directly to localStorage,
  // so fall back to reading the stored user object directly.
  const { user: ctxUser } = useAuth();
  const user = ctxUser || (() => {
    try {
      const s = localStorage.getItem('archivalia_user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  })();

  const [activeTab, setActiveTab] = useState('active');

  // Reactive re-load from localStorage
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === RESERVATION_KEY) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loans = useMemo(
    () => (user ? getUserReservations(user) : []),
    [user, version]
  );

  const pendingLoans  = useMemo(() => loans.filter((l) => l.status === 'PENDING'),  [loans]);
  const activeLoans   = useMemo(() => loans.filter((l) => l.status === 'ACTIVE'),   [loans]);
  const overdueLoans  = useMemo(() => loans.filter((l) => l.status === 'OVERDUE'),  [loans]);
  const returnedLoans = useMemo(() => loans.filter((l) => l.status === 'RETURNED'), [loans]);

  const displayedLoans = useMemo(() => {
    if (activeTab === 'pending')  return pendingLoans;
    if (activeTab === 'active')   return activeLoans;
    if (activeTab === 'overdue')  return overdueLoans;
    if (activeTab === 'returned') return returnedLoans;
    return [];
  }, [activeTab, pendingLoans, activeLoans, overdueLoans, returnedLoans]);

  // Live outstanding fines
  const outstandingFines = useMemo(() => {
    try {
      const s = localStorage.getItem('archivalia_user_fines');
      if (s) {
        const fines = JSON.parse(s);
        return fines.filter((f) => f.status === 'UNPAID').reduce((sum, f) => sum + f.amount, 0);
      }
    } catch { /* ignore */ }
    return 0;
  }, []);

  const typeIcon = (type) => {
    if (type === 'Research Paper') return <LuFileText size={12} />;
    if (type === 'Digital Media')  return <LuVideo size={12} />;
    return <LuBookOpen size={12} />;
  };

  const typeBadgeClass = (type) => {
    if (type === 'Research Paper') return 'type-paper';
    if (type === 'Digital Media')  return 'type-media';
    return 'type-book';
  };

  return (
    <div className="loans-wrapper">

      {/* ── 1. Header ──────────────────────────────────────────────── */}
      <div className="loans-header-card white-card">
        <div>
          <span className="loans-eyebrow">CIRCULATION MANAGEMENT</span>
          <h1 className="loans-main-title font-serif">My Loans &amp; Reservations</h1>
          <p className="loans-subheading">
            Track pending reservations, active loans, overdue items, and return history.
          </p>
        </div>

        <div className="loans-header-action-col">
          {outstandingFines > 0 ? (
            <div className="loans-fines-badge warning">
              <div className="fines-badge-icon"><LuTriangleAlert size={18} /></div>
              <div className="fines-badge-text">
                <span className="fines-badge-lbl">OUTSTANDING FINES</span>
                <strong className="fines-badge-val">₹{outstandingFines.toFixed(2)}</strong>
              </div>
              <Link to="/my-fines" className="btn-settle-fines">Pay Fines</Link>
            </div>
          ) : (
            <div className="loans-fines-badge good">
              <div className="fines-badge-icon"><LuCircleCheck size={18} /></div>
              <div className="fines-badge-text">
                <span className="fines-badge-lbl">ACCOUNT STANDING</span>
                <strong className="fines-badge-val" style={{ color: '#059669' }}>Good Standing</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Tabs ─────────────────────────────────────────────────── */}
      <div className="loans-tabs-row">
        <div className="loans-pill-tabs">

          <button
            type="button"
            className={`loan-pill-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <span>Awaiting Issue</span>
            <span className={`tab-count-badge ${pendingLoans.length > 0 ? 'badge-amber' : ''}`}>
              {pendingLoans.length}
            </span>
          </button>

          <button
            type="button"
            className={`loan-pill-tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            <span>Active Loans</span>
            <span className="tab-count-badge">{activeLoans.length}</span>
          </button>

          <button
            type="button"
            className={`loan-pill-tab ${activeTab === 'overdue' ? 'active' : ''}`}
            onClick={() => setActiveTab('overdue')}
          >
            <span>Overdue</span>
            <span className={`tab-count-badge ${overdueLoans.length > 0 ? 'badge-warn' : ''}`}>
              {overdueLoans.length}
            </span>
          </button>

          <button
            type="button"
            className={`loan-pill-tab ${activeTab === 'returned' ? 'active' : ''}`}
            onClick={() => setActiveTab('returned')}
          >
            <span>Returned History</span>
            <span className="tab-count-badge">{returnedLoans.length}</span>
          </button>

        </div>
      </div>

      {/* ── 3. Loans Cards ──────────────────────────────────────────── */}
      <div className="loans-list">
        {displayedLoans.length === 0 ? (
          <div className="loans-empty-card white-card">
            <span className="empty-emoji">
              {activeTab === 'pending' ? '⏳' : activeTab === 'returned' ? '📦' : '📚'}
            </span>
            <h3 className="font-serif">
              {activeTab === 'pending'  && 'No pending reservations'}
              {activeTab === 'active'   && 'No active loans'}
              {activeTab === 'overdue'  && 'No overdue items'}
              {activeTab === 'returned' && 'No returned items yet'}
            </h3>
            <p>
              {activeTab === 'pending'
                ? 'You have no reservations waiting for library issue.'
                : activeTab === 'active'
                ? 'You have no currently checked-out books.'
                : activeTab === 'overdue'
                ? 'Great — no overdue items!'
                : 'Your return history will appear here.'}
            </p>
            {activeTab !== 'returned' && (
              <Link to="/books" className="btn btn-navy btn-sm" style={{ marginTop: '14px' }}>
                Browse Resource Catalog
              </Link>
            )}
          </div>
        ) : (
          displayedLoans.map((item) => {
            const timeInfo = item.due_date ? computeTimeLeft(item.due_date) : null;
            const isOverdue = item.status === 'OVERDUE' || timeInfo?.overdue;
            const isUrgent  = timeInfo?.urgent && !isOverdue;

            return (
              <div
                key={item.id}
                className={`loan-card white-card ${isOverdue ? 'card-overdue' : ''} ${item.status === 'PENDING' ? 'card-pending' : ''}`}
              >
                {/* Cover */}
                <div className="loan-cover-box">
                  {item.book_cover ? (
                    <img
                      src={item.book_cover}
                      alt={item.book_title}
                      className="loan-cover-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop';
                      }}
                    />
                  ) : (
                    <div className="loan-cover-placeholder">
                      <LuBookOpen size={32} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="loan-content-box">
                  <div className="loan-header-row-item">
                    <div className="loan-type-tags">
                      <span className={`loan-type-badge ${typeBadgeClass(item.book_type)}`}>
                        {typeIcon(item.book_type)}
                        <span>{item.book_type}</span>
                      </span>

                      {item.status === 'PENDING' && (
                        <span className="loan-alert-badge pending">
                          <LuHourglass size={12} /> Awaiting Library Issue
                        </span>
                      )}

                      {isOverdue && (
                        <span className="loan-alert-badge overdue">
                          <LuTriangleAlert size={12} /> Overdue
                        </span>
                      )}

                      {!isOverdue && isUrgent && (
                        <span className="loan-alert-badge urgent">
                          <LuClock size={12} /> Expiring Soon
                        </span>
                      )}

                      {item.status === 'RETURNED' && (
                        <span className="loan-alert-badge returned">
                          <LuCircleCheck size={12} /> Returned &amp; Archived
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="loan-item-title font-serif">{item.book_title}</h3>
                  <p className="loan-item-author">{item.book_author}</p>

                  <div className="loan-meta-grid">
                    <div className="loan-meta-item">
                      <span className="meta-item-label">RESERVED ON</span>
                      <span className="meta-item-val">
                        <LuCalendar size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        {formatDate(item.reserved_at)}
                      </span>
                    </div>

                    {item.status === 'PENDING' && (
                      <div className="loan-meta-item">
                        <span className="meta-item-label">STATUS</span>
                        <span className="meta-item-val" style={{ color: '#B45309' }}>
                          Visit the library counter to collect your book once issued.
                        </span>
                      </div>
                    )}

                    {item.issue_date && (
                      <div className="loan-meta-item">
                        <span className="meta-item-label">ISSUED ON</span>
                        <span className="meta-item-val">{formatDate(item.issue_date)}</span>
                      </div>
                    )}

                    {item.due_date && item.status !== 'RETURNED' && (
                      <div className="loan-meta-item">
                        <span className="meta-item-label">
                          {isOverdue ? 'OVERDUE SINCE' : 'DUE DATE'}
                        </span>
                        <span
                          className={`meta-item-val ${
                            isOverdue ? 'time-overdue' : isUrgent ? 'time-urgent' : 'time-normal'
                          }`}
                        >
                          {formatDate(item.due_date)}
                          {timeInfo && ` · ${timeInfo.label}`}
                        </span>
                      </div>
                    )}

                    {item.status === 'RETURNED' && (
                      <div className="loan-meta-item">
                        <span className="meta-item-label">RETURNED ON</span>
                        <span className="meta-item-val">{formatDate(item.actual_return)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {isOverdue && (
                  <div className="loan-actions-col">
                    <Link to="/my-fines" className="btn-pay-fine-pill">
                      <LuBanknote size={14} /> View Fines
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
