import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import {
  getReservations,
  issueReservation,
  returnReservation,
  isReservationForUser,
  RESERVATION_KEY,
} from '../../data/reservationStore';
import {
  LuSearch, LuFilter, LuDownload, LuArrowLeftRight,
  LuLayers, LuClock, LuCircleAlert, LuCircleCheck,
  LuBookOpen, LuCalendar, LuShieldCheck, LuX, LuCheck,
  LuPackageCheck, LuHourglass,
} from 'react-icons/lu';
import './Borrows.css';

export default function AllBorrows() {
  const toast = useToast();
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [issueModal, setIssueModal]     = useState(null);   // PENDING → ACTIVE
  const [returnModal, setReturnModal]   = useState(null);   // ACTIVE  → RETURNED
  const [processing, setProcessing]     = useState(false);

  const role = localStorage.getItem('archivalia_role') || 'user';
  const isAdmin = role === 'admin';

  const currentUser = (() => {
    try {
      const s = localStorage.getItem('archivalia_user');
      if (s) return JSON.parse(s);
    } catch { /* ignore */ }
    return null;
  })();

  // ── Reactive list from localStorage ────────────────────────────────────────
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
  const rawReservations = useMemo(() => getReservations(), [version]);

  // If regular user/reader, ONLY show their own borrowings!
  const allReservations = useMemo(() => {
    if (isAdmin) return rawReservations;
    if (!currentUser) return [];
    return rawReservations.filter((r) => isReservationForUser(r, currentUser));
  }, [rawReservations, isAdmin, currentUser]);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...allReservations];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.book_title.toLowerCase().includes(q) ||
          r.user_name.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Sort: PENDING first, then OVERDUE, ACTIVE, RETURNED
    const order = { PENDING: 0, OVERDUE: 1, ACTIVE: 2, RETURNED: 3 };
    result.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
    return result;
  }, [allReservations, search, statusFilter]);

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalCount    = allReservations.length;
  const pendingCount  = allReservations.filter((r) => r.status === 'PENDING').length;
  const activeCount   = allReservations.filter((r) => r.status === 'ACTIVE').length;
  const overdueCount  = allReservations.filter((r) => r.status === 'OVERDUE').length;
  const returnedCount = allReservations.filter((r) => r.status === 'RETURNED').length;

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleConfirmIssue = async () => {
    if (!issueModal) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 500));
    issueReservation(issueModal.id);
    toast.success(`📚 "${issueModal.book_title}" has been issued to ${issueModal.user_name}.`);
    setProcessing(false);
    setIssueModal(null);
    refresh();
  };

  const handleConfirmReturn = async () => {
    if (!returnModal) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 500));
    returnReservation(returnModal.id);
    toast.success(`✅ "${returnModal.book_title}" has been marked as returned.`);
    setProcessing(false);
    setReturnModal(null);
    refresh();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Reader', 'Book Title', 'Reserved At', 'Issue Date', 'Due Date', 'Status', 'Returned Date'];
    const rows = filtered.map((r) => [
      r.id,
      `"${r.user_name}"`,
      `"${r.book_title}"`,
      r.reserved_at?.split('T')[0] || '',
      r.issue_date || 'N/A',
      r.due_date || 'N/A',
      r.status,
      r.actual_return || 'N/A',
    ]);
    const csv = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `bookhive_reservations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV export generated successfully!');
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch { return d; }
  };

  const statusLabel = (s) => {
    if (s === 'PENDING')  return 'Pending Issue';
    if (s === 'ACTIVE')   return 'Active Loan';
    if (s === 'OVERDUE')  return 'Overdue';
    if (s === 'RETURNED') return 'Returned';
    return s;
  };

  return (
    <div className="admin-reservations-page">

      {/* ── 1. Header Banner ─────────────────────────────────────────── */}
      <div className="res-welcome-banner white-card">
        <div className="welcome-content">
          <span className="welcome-date">{today.toUpperCase()}</span>
          <h1 className="welcome-heading">
            {isAdmin ? 'All Reservations & Circulation' : 'My Borrowing History'}
          </h1>
          <p className="welcome-subtext">
            {isAdmin
              ? 'Issue books to readers, monitor active loans, confirm returns, and manage overdue items.'
              : 'View all your personal borrowings, reservation dates, due dates, and return statuses.'}
          </p>
        </div>
        <div className="admin-badge-pill">
          {isAdmin ? (
            <>
              <LuShieldCheck size={16} />
              <span>Circulation Desk</span>
            </>
          ) : (
            <>
              <LuBookOpen size={16} />
              <span>My Loans</span>
            </>
          )}
        </div>
      </div>

      {/* ── 2. Stats Grid ────────────────────────────────────────────── */}
      <div className="res-stats-grid res-stats-grid-5">

        <div className="res-stat-card white-card">
          <div className="res-stat-icon icon-navy"><LuLayers size={20} /></div>
          <span className="stat-header">TOTAL</span>
          <div className="stat-number">{totalCount}</div>
          <span className="stat-footnote">All records</span>
        </div>

        <div className="res-stat-card white-card">
          <div className="res-stat-icon icon-amber"><LuHourglass size={20} /></div>
          <span className="stat-header">PENDING ISSUE</span>
          <div className="stat-number" style={{ color: '#B45309' }}>{pendingCount}</div>
          <span className="stat-footnote">Awaiting hand-off</span>
        </div>

        <div className="res-stat-card white-card">
          <div className="res-stat-icon icon-green"><LuClock size={20} /></div>
          <span className="stat-header">ACTIVE LOAN</span>
          <div className="stat-number" style={{ color: '#15803D' }}>{activeCount}</div>
          <span className="stat-footnote">Checked out</span>
        </div>

        <div className="res-stat-card white-card">
          <div className="res-stat-icon icon-red"><LuCircleAlert size={20} /></div>
          <span className="stat-header">OVERDUE</span>
          <div className="stat-number" style={{ color: overdueCount > 0 ? '#DC2626' : '#64748B' }}>
            {overdueCount}
          </div>
          <span className="stat-footnote">Late returns</span>
        </div>

        <div className="res-stat-card white-card">
          <div className="res-stat-icon icon-slate"><LuCircleCheck size={20} /></div>
          <span className="stat-header">RETURNED</span>
          <div className="stat-number" style={{ color: '#475569' }}>{returnedCount}</div>
          <span className="stat-footnote">Archived</span>
        </div>

      </div>

      {/* ── 3. Search & Filter Bar ───────────────────────────────────── */}
      <div className="res-controls-bar white-card">
        <div className="res-search-box">
          <LuSearch className="res-search-icon" size={17} />
          <input
            type="text"
            placeholder={isAdmin ? "Search by book title, reader name, or ID..." : "Search your borrowed books by title or ID..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="res-search-input"
          />
          {search && (
            <button className="res-clear-btn" onClick={() => setSearch('')} title="Clear search">
              <LuX size={14} />
            </button>
          )}
        </div>

        <div className="res-filter-actions">
          <div className="res-select-wrapper">
            <LuFilter size={14} className="res-filter-glyph" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="res-select-field"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending Issue</option>
              <option value="ACTIVE">Active Loan</option>
              <option value="OVERDUE">Overdue</option>
              <option value="RETURNED">Returned</option>
            </select>
          </div>

          <button type="button" className="res-btn-export" onClick={handleExportCSV}>
            <LuDownload size={14} />
            <span>Export CSV</span>
          </button>

          <div className="res-count-tag">
            Showing {filtered.length} of {totalCount}
          </div>
        </div>
      </div>

      {/* ── 4. Reservations Table ────────────────────────────────────── */}
      <div className="res-table-card white-card">
        <div className="table-responsive">
          <table className="res-data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>{isAdmin ? 'Reader' : 'Borrower'}</th>
                <th>Book</th>
                <th>Reserved</th>
                <th>Issue / Due</th>
                <th>Status</th>
                <th style={{ textAlign: 'right', paddingRight: '24px' }}>
                  {isAdmin ? 'Actions' : 'Details'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((res) => (
                <tr key={res.id} className="res-table-row">

                  {/* ID */}
                  <td>
                    <span className="res-id-pill">#{res.id.slice(-6)}</span>
                  </td>

                  {/* Reader */}
                  <td>
                    <div className="res-user-cell">
                      <div className="res-user-avatar">{res.user_name.charAt(0)}</div>
                      <div className="res-user-details">
                        <span className="res-user-name">{res.user_name}</span>
                        <span className="res-user-meta">{res.user_email}</span>
                      </div>
                    </div>
                  </td>

                  {/* Book */}
                  <td>
                    <div className="res-book-cell">
                      <LuBookOpen size={16} className="res-book-icon" />
                      <span className="res-book-title" title={res.book_title}>
                        {res.book_title}
                      </span>
                    </div>
                  </td>

                  {/* Reserved At */}
                  <td>
                    <span className="res-date-cell">
                      <LuCalendar size={13} />
                      {formatDate(res.reserved_at)}
                    </span>
                  </td>

                  {/* Issue / Due */}
                  <td>
                    {res.issue_date ? (
                      <div className="res-date-pair">
                        <span className="res-date-cell">
                          <LuCalendar size={13} />
                          Issued: {formatDate(res.issue_date)}
                        </span>
                        <span className={`res-date-cell ${res.status === 'OVERDUE' ? 'date-overdue' : ''}`}>
                          <LuCalendar size={13} />
                          Due: {formatDate(res.due_date)}
                        </span>
                      </div>
                    ) : (
                      <span className="res-date-cell" style={{ color: '#94A3B8' }}>Not issued yet</span>
                    )}
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`res-status-pill status-${res.status.toLowerCase()}`}>
                      <span className="status-dot" />
                      {statusLabel(res.status)}
                    </span>
                  </td>

                  {/* Actions / Details */}
                  <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                    {isAdmin ? (
                      <>
                        {res.status === 'PENDING' && (
                          <button
                            type="button"
                            className="res-btn-issue"
                            onClick={() => setIssueModal(res)}
                            title="Issue book to reader"
                          >
                            <LuPackageCheck size={13} />
                            <span>Issue Book</span>
                          </button>
                        )}

                        {(res.status === 'ACTIVE' || res.status === 'OVERDUE') && (
                          <button
                            type="button"
                            className="res-btn-return"
                            onClick={() => setReturnModal(res)}
                            title="Mark book as returned"
                          >
                            <LuArrowLeftRight size={13} />
                            <span>Return Book</span>
                          </button>
                        )}

                        {res.status === 'RETURNED' && (
                          <span className="res-returned-receipt" title="Return completed">
                            <LuCheck size={13} />
                            {res.actual_return ? formatDate(res.actual_return) : 'Completed'}
                          </span>
                        )}
                      </>
                    ) : (
                      <Link
                        to={`/books/${res.book_id}`}
                        className="btn btn-outline btn-sm"
                        style={{
                          fontSize: '0.78rem',
                          padding: '5px 12px',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 600,
                        }}
                      >
                        <LuBookOpen size={13} />
                        <span>View Book</span>
                      </Link>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="res-empty-state">
            <div className="res-empty-icon">📖</div>
            <h3 className="res-empty-title">No reservations found</h3>
            <p className="res-empty-sub">
              No records matched your current search or filter.
            </p>
            <button
              type="button"
              className="btn btn-navy btn-sm"
              onClick={() => { setSearch(''); setStatusFilter('all'); }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ── 5. Issue Book Modal ──────────────────────────────────────── */}
      {issueModal && (
        <div className="modal-overlay" onClick={() => !processing && setIssueModal(null)}>
          <div className="modal-box res-modal-box white-card" onClick={(e) => e.stopPropagation()}>
            <div className="res-modal-header">
              <div className="res-modal-icon-wrap res-modal-icon-issue">
                <LuPackageCheck size={22} />
              </div>
              <div>
                <h3 className="res-modal-title">Issue Book to Reader</h3>
                <p className="res-modal-subtitle">Confirm you are handing this book to the reader at the counter.</p>
              </div>
              <button
                type="button"
                className="res-modal-close"
                onClick={() => !processing && setIssueModal(null)}
              >✕</button>
            </div>

            <div className="res-modal-body">
              <div className="res-modal-summary">
                <div className="res-summary-row">
                  <span className="summary-label">Book:</span>
                  <span className="summary-val">{issueModal.book_title}</span>
                </div>
                <div className="res-summary-row">
                  <span className="summary-label">Reader:</span>
                  <span className="summary-val">{issueModal.user_name}</span>
                </div>
                <div className="res-summary-row">
                  <span className="summary-label">Loan Period:</span>
                  <span className="summary-val">14 days (due by {(() => {
                    const d = new Date(); d.setDate(d.getDate() + 14);
                    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                  })()})</span>
                </div>
              </div>

              <div className="res-modal-info-box res-info-issue">
                📋 Once issued, the loan period of <strong>14 days</strong> begins. A late fee of{' '}
                <strong>₹5/day</strong> applies after the due date.
              </div>
            </div>

            <div className="res-modal-footer">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => !processing && setIssueModal(null)}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-issue-confirm btn-sm"
                onClick={handleConfirmIssue}
                disabled={processing}
              >
                {processing ? 'Issuing...' : '✓ Confirm Issue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Return Book Modal ─────────────────────────────────────── */}
      {returnModal && (
        <div className="modal-overlay" onClick={() => !processing && setReturnModal(null)}>
          <div className="modal-box res-modal-box white-card" onClick={(e) => e.stopPropagation()}>
            <div className="res-modal-header">
              <div className="res-modal-icon-wrap res-modal-icon-return">
                <LuArrowLeftRight size={22} />
              </div>
              <div>
                <h3 className="res-modal-title">Confirm Book Return</h3>
                <p className="res-modal-subtitle">Mark this book as physically returned and archive the loan.</p>
              </div>
              <button
                type="button"
                className="res-modal-close"
                onClick={() => !processing && setReturnModal(null)}
              >✕</button>
            </div>

            <div className="res-modal-body">
              <div className="res-modal-summary">
                <div className="res-summary-row">
                  <span className="summary-label">Book:</span>
                  <span className="summary-val">{returnModal.book_title}</span>
                </div>
                <div className="res-summary-row">
                  <span className="summary-label">Reader:</span>
                  <span className="summary-val">{returnModal.user_name}</span>
                </div>
                <div className="res-summary-row">
                  <span className="summary-label">Status:</span>
                  <span className={`res-status-pill status-${returnModal.status.toLowerCase()}`}>
                    <span className="status-dot" />
                    {statusLabel(returnModal.status)}
                  </span>
                </div>
                {returnModal.due_date && (
                  <div className="res-summary-row">
                    <span className="summary-label">Due Date:</span>
                    <span className="summary-val">{formatDate(returnModal.due_date)}</span>
                  </div>
                )}
              </div>

              {returnModal.status === 'OVERDUE' && (
                <div className="res-modal-info-box res-info-warn">
                  ⚠️ This loan is <strong>overdue</strong>. Confirm the book has been received before marking it returned.
                </div>
              )}
            </div>

            <div className="res-modal-footer">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => !processing && setReturnModal(null)}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-navy btn-sm"
                onClick={handleConfirmReturn}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Confirm Return'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
