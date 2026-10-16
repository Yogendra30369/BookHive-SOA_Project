import { useState, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import { mockFines } from '../../data/mockData';
import {
  LuSearch, LuFilter, LuShieldOff, LuBanknote,
  LuCircleCheck, LuTriangleAlert, LuDownload, LuCalendar,
  LuBookOpen, LuShieldCheck, LuX, LuCheck, LuCoins, LuUsers
} from 'react-icons/lu';
import './Fines.css';

export default function AllFines() {
  const toast = useToast();
  const [finesList, setFinesList] = useState([...mockFines]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [waiveModal, setWaiveModal] = useState(null);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const filtered = useMemo(() => {
    let result = [...finesList];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(f =>
        f.user_name.toLowerCase().includes(q) ||
        f.book_title.toLowerCase().includes(q) ||
        String(f.fine_id).includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(f => f.status === statusFilter);
    }
    return result;
  }, [finesList, search, statusFilter]);

  const totalCollected = finesList
    .filter(f => f.status === 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalPending = finesList
    .filter(f => f.status === 'UNPAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalAssessed = totalCollected + totalPending;
  const unpaidAccounts = new Set(finesList.filter(f => f.status === 'UNPAID').map(f => f.user_id)).size;

  const handleConfirmWaive = () => {
    if (!waiveModal) return;
    setFinesList(prev => prev.map(f =>
      f.fine_id === waiveModal.fine_id
        ? { ...f, status: 'PAID', waived: true }
        : f
    ));
    toast.success(`Fine #${waiveModal.fine_id} of ₹${waiveModal.amount.toFixed(2)} waived for ${waiveModal.user_name}`);
    setWaiveModal(null);
  };

  const handleMarkPaid = (fine) => {
    setFinesList(prev => prev.map(f =>
      f.fine_id === fine.fine_id
        ? { ...f, status: 'PAID' }
        : f
    ));
    toast.success(`Fine #${fine.fine_id} (₹${fine.amount.toFixed(2)}) recorded as paid!`);
  };

  const handleExportCSV = () => {
    const headers = ['Fine ID', 'Reader Name', 'Book Title', 'Days Late', 'Amount (INR)', 'Status', 'Date'];
    const rows = filtered.map(f => [
      f.fine_id,
      `"${f.user_name}"`,
      `"${f.book_title}"`,
      f.days_late,
      f.amount,
      f.status,
      f.created_at
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bookhive_fines_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Fines report exported to CSV successfully!');
  };

  return (
    <div className="admin-fines-page">
      {/* 1. Header Banner */}
      <div className="fines-welcome-banner white-card">
        <div className="welcome-content">
          <span className="welcome-date">{today.toUpperCase()}</span>
          <h1 className="welcome-heading">Fines &amp; Penalties Management</h1>
          <p className="welcome-subtext">
            Audit overdue charges, collect desk payments, issue authorized fee waivers, and resolve account holds.
          </p>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="fines-stats-grid">
        <div className="fine-stat-card white-card">
          <div className="fine-stat-icon icon-navy">
            <LuBanknote size={20} />
          </div>
          <span className="stat-header">TOTAL ASSESSED</span>
          <div className="stat-number">₹{totalAssessed.toFixed(2)}</div>
          <span className="stat-footnote">All recorded fines</span>
        </div>

        <div className="fine-stat-card white-card">
          <div className="fine-stat-icon icon-red">
            <LuTriangleAlert size={20} />
          </div>
          <span className="stat-header">PENDING / UNPAID</span>
          <div className="stat-number" style={{ color: totalPending > 0 ? '#DC2626' : '#15803D' }}>
            ₹{totalPending.toFixed(2)}
          </div>
          <span className="stat-footnote">Awaiting settlement</span>
        </div>

        <div className="fine-stat-card white-card">
          <div className="fine-stat-icon icon-green">
            <LuCircleCheck size={20} />
          </div>
          <span className="stat-header">TOTAL COLLECTED</span>
          <div className="stat-number" style={{ color: '#15803D' }}>
            ₹{totalCollected.toFixed(2)}
          </div>
          <span className="stat-footnote">Paid or cleared</span>
        </div>

        <div className="fine-stat-card white-card">
          <div className="fine-stat-icon icon-gold">
            <LuUsers size={20} />
          </div>
          <span className="stat-header">OVERDUE READERS</span>
          <div className="stat-number" style={{ color: '#B88B4A' }}>
            {unpaidAccounts}
          </div>
          <span className="stat-footnote">Accounts with balance</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="fines-controls-bar white-card">
        <div className="fines-search-box">
          <LuSearch className="fines-search-icon" size={17} />
          <input
            type="text"
            placeholder="Search by reader name, book title, or fine ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="fines-search-input"
          />
          {search && (
            <button className="fines-clear-btn" onClick={() => setSearch('')} title="Clear search">
              <LuX size={14} />
            </button>
          )}
        </div>

        <div className="fines-filter-actions">
          <div className="fines-select-wrapper">
            <LuFilter size={14} className="fines-filter-glyph" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="fines-select-field"
            >
              <option value="all">All Statuses</option>
              <option value="UNPAID">Unpaid Only</option>
              <option value="PAID">Paid Only</option>
            </select>
          </div>

          <button type="button" className="fines-btn-export" onClick={handleExportCSV}>
            <LuDownload size={14} />
            <span>Export CSV</span>
          </button>

          <div className="fines-count-tag">
            Showing {filtered.length} of {finesList.length}
          </div>
        </div>
      </div>

      {/* 4. Fines Table */}
      <div className="fines-table-card white-card">
        <div className="table-responsive">
          <table className="fines-data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Fine ID</th>
                <th>Reader</th>
                <th>Book Title</th>
                <th>Days Late</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Assessed Date</th>
                <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(fine => (
                <tr key={fine.fine_id} className="fines-table-row">
                  {/* ID */}
                  <td>
                    <span className="fine-id-pill">#{fine.fine_id}</span>
                  </td>

                  {/* Reader */}
                  <td>
                    <div className="fine-user-cell">
                      <div className="fine-user-avatar">
                        {fine.user_name.charAt(0)}
                      </div>
                      <div className="fine-user-details">
                        <span className="fine-user-name">{fine.user_name}</span>
                        <span className="fine-user-meta">Reader #{fine.user_id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Book */}
                  <td>
                    <div className="fine-book-cell">
                      <LuBookOpen size={16} className="fine-book-icon" />
                      <span className="fine-book-title" title={fine.book_title}>
                        {fine.book_title}
                      </span>
                    </div>
                  </td>

                  {/* Days Late */}
                  <td>
                    <span className="fine-days-tag">
                      {fine.days_late} {fine.days_late === 1 ? 'day' : 'days'}
                    </span>
                  </td>

                  {/* Amount */}
                  <td>
                    <span className={`fine-amount-tag ${fine.status === 'UNPAID' ? 'amount-unpaid' : 'amount-paid'}`}>
                      ₹{fine.amount.toFixed(2)}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`fine-status-pill status-${fine.status.toLowerCase()}`}>
                      <span className="status-dot" />
                      {fine.status === 'UNPAID' ? 'Unpaid' : fine.waived ? 'Waived' : 'Paid'}
                    </span>
                  </td>

                  {/* Date */}
                  <td>
                    <span className="fine-date-cell">
                      <LuCalendar size={13} />
                      {fine.created_at}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                    {fine.status === 'UNPAID' ? (
                      <div className="fine-action-buttons">
                        <button
                          type="button"
                          className="fine-btn-pay"
                          onClick={() => handleMarkPaid(fine)}
                          title="Record payment collected at desk"
                        >
                          <LuCoins size={13} />
                          <span>Mark Paid</span>
                        </button>
                        <button
                          type="button"
                          className="fine-btn-waive"
                          onClick={() => setWaiveModal(fine)}
                          title="Authorize fine waiver"
                        >
                          <LuShieldOff size={13} />
                          <span>Waive</span>
                        </button>
                      </div>
                    ) : (
                      <span className="fine-settled-tag">
                        <LuCheck size={13} />
                        {fine.waived ? 'Waived by Admin' : 'Settled / Paid'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="fines-empty-state">
            <div className="fines-empty-icon">🪙</div>
            <h3 className="fines-empty-title">No fines found</h3>
            <p className="fines-empty-sub">
              No fine records matched your search or status filter.
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

      {/* 5. Waive Fine Modal */}
      {waiveModal && (
        <div className="modal-overlay" onClick={() => setWaiveModal(null)}>
          <div className="modal-box fines-modal-box white-card" onClick={e => e.stopPropagation()}>
            <div className="fines-modal-header">
              <h3 className="fines-modal-title">Authorize Fine Waiver</h3>
              <button
                type="button"
                className="fines-modal-close"
                onClick={() => setWaiveModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="fines-modal-body">
              <p className="fines-modal-desc">
                You are about to waive the late fine for this circulation record. This will clear the reader&apos;s pending balance.
              </p>
              <div className="fines-modal-summary">
                <div className="fines-summary-row">
                  <span className="summary-label">Reader:</span>
                  <span className="summary-val">{waiveModal.user_name}</span>
                </div>
                <div className="fines-summary-row">
                  <span className="summary-label">Book:</span>
                  <span className="summary-val">{waiveModal.book_title}</span>
                </div>
                <div className="fines-summary-row">
                  <span className="summary-label">Overdue:</span>
                  <span className="summary-val">{waiveModal.days_late} days late</span>
                </div>
                <div className="fines-summary-row">
                  <span className="summary-label">Waiver Amount:</span>
                  <span className="summary-val" style={{ color: '#DC2626', fontSize: '1.05rem', fontWeight: 700 }}>
                    ₹{waiveModal.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="fines-modal-footer">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setWaiveModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleConfirmWaive}
              >
                Authorize Waiver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
