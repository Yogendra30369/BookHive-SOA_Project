import { useState, useMemo, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { mockFines } from '../../data/mockData';
import {
  LuBanknote,
  LuCreditCard,
  LuTriangleAlert,
  LuCircleCheck,
  LuReceipt,
  LuClock,
  LuBookOpen,
  LuCheck,
  LuX,
  LuPrinter,
  LuShieldCheck,
  LuCalendar,
  LuQrCode,
  LuSmartphone,
  LuCopy,
  LuLock,
  LuRotateCcw
} from 'react-icons/lu';
import './Fines.css';

function QrCodeGraphic() {
  return (
    <div className="upi-qr-box">
      <svg viewBox="0 0 100 100" className="upi-qr-svg">
        <rect width="100" height="100" fill="#ffffff" rx="4" />
        
        {/* Corner Position Markers */}
        <rect x="8" y="8" width="24" height="24" fill="#0B132B" rx="2" />
        <rect x="12" y="12" width="16" height="16" fill="#ffffff" rx="1" />
        <rect x="16" y="16" width="8" height="8" fill="#0B132B" rx="1" />
        
        <rect x="68" y="8" width="24" height="24" fill="#0B132B" rx="2" />
        <rect x="72" y="12" width="16" height="16" fill="#ffffff" rx="1" />
        <rect x="76" y="16" width="8" height="8" fill="#0B132B" rx="1" />
        
        <rect x="8" y="68" width="24" height="24" fill="#0B132B" rx="2" />
        <rect x="12" y="72" width="16" height="16" fill="#ffffff" rx="1" />
        <rect x="16" y="76" width="8" height="8" fill="#0B132B" rx="1" />

        {/* Timing Lines */}
        <rect x="36" y="18" width="4" height="4" fill="#0B132B" />
        <rect x="44" y="18" width="4" height="4" fill="#0B132B" />
        <rect x="52" y="18" width="4" height="4" fill="#0B132B" />
        <rect x="60" y="18" width="4" height="4" fill="#0B132B" />
        <rect x="18" y="36" width="4" height="4" fill="#0B132B" />
        <rect x="18" y="44" width="4" height="4" fill="#0B132B" />
        <rect x="18" y="52" width="4" height="4" fill="#0B132B" />
        <rect x="18" y="60" width="4" height="4" fill="#0B132B" />

        {/* QR Data Pattern */}
        <rect x="36" y="26" width="4" height="4" fill="#0B132B" />
        <rect x="40" y="30" width="4" height="4" fill="#0B132B" />
        <rect x="48" y="26" width="4" height="4" fill="#0B132B" />
        <rect x="56" y="30" width="4" height="4" fill="#0B132B" />
        <rect x="60" y="26" width="4" height="4" fill="#0B132B" />
        <rect x="36" y="38" width="4" height="4" fill="#0B132B" />
        <rect x="40" y="42" width="4" height="4" fill="#0B132B" />
        <rect x="56" y="38" width="4" height="4" fill="#0B132B" />
        <rect x="60" y="42" width="4" height="4" fill="#0B132B" />
        <rect x="26" y="36" width="4" height="4" fill="#0B132B" />
        <rect x="30" y="48" width="4" height="4" fill="#0B132B" />
        <rect x="26" y="56" width="4" height="4" fill="#0B132B" />
        <rect x="36" y="68" width="4" height="4" fill="#0B132B" />
        <rect x="44" y="68" width="4" height="4" fill="#0B132B" />
        <rect x="48" y="76" width="4" height="4" fill="#0B132B" />
        <rect x="56" y="68" width="4" height="4" fill="#0B132B" />
        <rect x="60" y="76" width="4" height="4" fill="#0B132B" />
        <rect x="68" y="36" width="4" height="4" fill="#0B132B" />
        <rect x="76" y="40" width="4" height="4" fill="#0B132B" />
        <rect x="84" y="36" width="4" height="4" fill="#0B132B" />
        <rect x="68" y="48" width="4" height="4" fill="#0B132B" />
        <rect x="76" y="52" width="4" height="4" fill="#0B132B" />
        <rect x="84" y="48" width="4" height="4" fill="#0B132B" />
        <rect x="68" y="60" width="4" height="4" fill="#0B132B" />
        <rect x="80" y="60" width="4" height="4" fill="#0B132B" />
        <rect x="36" y="84" width="4" height="4" fill="#0B132B" />
        <rect x="44" y="84" width="4" height="4" fill="#0B132B" />
        <rect x="52" y="84" width="4" height="4" fill="#0B132B" />
        <rect x="68" y="72" width="4" height="4" fill="#0B132B" />
        <rect x="72" y="80" width="4" height="4" fill="#0B132B" />
        <rect x="80" y="76" width="4" height="4" fill="#0B132B" />
        <rect x="84" y="84" width="4" height="4" fill="#0B132B" />

        {/* Center Logo Badge */}
        <rect x="40" y="40" width="20" height="20" rx="4" fill="#0B132B" />
        <text x="50" y="54" fill="#F4B41A" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">UPI</text>
      </svg>
    </div>
  );
}

export default function MyFines() {
  const toast = useToast();
  const [finesList, setFinesList] = useState(() => {
    const saved = localStorage.getItem('archivalia_user_fines');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return mockFines;
  });

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unpaid' | 'paid'
  const [payModalFine, setPayModalFine] = useState(null);
  const [receiptModalFine, setReceiptModalFine] = useState(null);

  // Payment method: 'upi' | 'debit_card' | 'credit_card' | 'mastercard'
  const [paymentMethod, setPaymentMethod] = useState('upi');
  // UPI sub-mode: 'qr' | 'vpa'
  const [upiMode, setUpiMode] = useState('qr');
  const [upiIdInput, setUpiIdInput] = useState('sarah.jenkins@okaxis');
  
  // Card Inputs
  const [cardNumber, setCardNumber] = useState('4532 8900 1234 5678');
  const [cardHolder, setCardHolder] = useState('Sarah Jenkins');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('382');

  const [isProcessing, setIsProcessing] = useState(false);
  const [qrTimeRemaining, setQrTimeRemaining] = useState(300); // 5 min countdown

  // QR Timer countdown
  useEffect(() => {
    let timer;
    if (payModalFine && paymentMethod === 'upi' && upiMode === 'qr') {
      setQrTimeRemaining(300);
      timer = setInterval(() => {
        setQrTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [payModalFine, paymentMethod, upiMode]);

  const unpaidFines = useMemo(() => finesList.filter((f) => f.status === 'UNPAID'), [finesList]);
  const paidFines = useMemo(() => finesList.filter((f) => f.status === 'PAID'), [finesList]);

  const totalUnpaid = unpaidFines.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = paidFines.reduce((sum, f) => sum + f.amount, 0);

  const displayedFines = useMemo(() => {
    if (activeTab === 'unpaid') return unpaidFines;
    if (activeTab === 'paid') return paidFines;
    return finesList;
  }, [activeTab, finesList, unpaidFines, paidFines]);

  // Format countdown mm:ss
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Reset demo fine if user wants to test payment again
  const handleResetSampleFine = () => {
    const reset = [
      {
        fine_id: 1,
        borrow_id: 3,
        user_id: 1,
        user_name: "Sarah Jenkins",
        book_title: "Molecular Biology of the Cell, 7th Ed.",
        author: "Bruce Alberts, Rebecca Heald",
        cover: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=300&h=400&fit=crop",
        amount: 25.00,
        status: "UNPAID",
        created_at: "14 Sept 2026",
        due_date: "09 Sept 2026",
        days_late: 5,
        rate_per_day: 5.00,
        reason: "Exceeded 14-day borrowing threshold by 5 days"
      },
      ...paidFines.filter((f) => f.fine_id !== 1)
    ];
    setFinesList(reset);
    localStorage.setItem('archivalia_user_fines', JSON.stringify(reset));
    setActiveTab('all');
    toast.success('Sample overdue fine (₹25.00) reset to Unpaid for testing payment options!');
  };

  // Handle Confirm Payment
  const handleConfirmPayment = () => {
    if (!payModalFine) return;
    setIsProcessing(true);

    let methodLabel = 'UPI (QR Code Scan)';
    if (paymentMethod === 'upi') {
      methodLabel = upiMode === 'qr' ? 'UPI (QR Code Scan — GPay/PhonePe)' : `UPI VPA (${upiIdInput})`;
    } else if (paymentMethod === 'debit_card') {
      methodLabel = `Debit Card (Visa / RuPay Ending ••${cardNumber.slice(-2)})`;
    } else if (paymentMethod === 'credit_card') {
      methodLabel = `Credit Card (Visa / Amex Ending ••${cardNumber.slice(-2)})`;
    } else if (paymentMethod === 'mastercard') {
      methodLabel = `Mastercard (Ending ••${cardNumber.slice(-2)})`;
    }

    setTimeout(() => {
      const receiptId = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const txnId = `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`;
      const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      const updated = finesList.map((f) => {
        if (f.fine_id === payModalFine.fine_id) {
          return {
            ...f,
            status: 'PAID',
            paid_at: nowStr,
            payment_method: methodLabel,
            receipt_no: receiptId,
            transaction_id: txnId
          };
        }
        return f;
      });

      setFinesList(updated);
      localStorage.setItem('archivalia_user_fines', JSON.stringify(updated));
      setIsProcessing(false);
      setPayModalFine(null);
      toast.success(`Fine of ₹${payModalFine.amount.toFixed(2)} paid via ${methodLabel}! Receipt: ${receiptId}`);
    }, 1200);
  };

  const copyUpiId = () => {
    navigator.clipboard?.writeText('bookhive.library@icici');
    toast.info('UPI ID "bookhive.library@icici" copied to clipboard!');
  };

  return (
    <div className="fines-page">
      {/* 1. Header Banner */}
      <div className="user-fines-header white-card">
        <div>
          <span className="user-fines-tagline">FINANCIAL ACCOUNT &amp; SETTLEMENTS</span>
          <h1 className="user-fines-title font-serif">Fines &amp; Payments</h1>
          <p className="user-fines-desc">
            Review your overdue circulation penalties, settle outstanding charges via UPI, Debit Card, Credit Card, or Mastercard, and access official payment receipts.
          </p>
        </div>

        <div className="header-right-badges">
          <div className={`user-standing-badge ${totalUnpaid > 0 ? 'standing-warning' : 'standing-good'}`}>
            {totalUnpaid > 0 ? (
              <>
                <LuTriangleAlert size={16} />
                <div>
                  <strong>Payment Required</strong>
                  <span>₹{totalUnpaid.toFixed(2)} overdue</span>
                </div>
              </>
            ) : (
              <>
                <LuShieldCheck size={16} />
                <div>
                  <strong>Good Standing</strong>
                  <span>No pending penalties</span>
                </div>
              </>
            )}
          </div>

          {totalUnpaid === 0 && (
            <button
              type="button"
              className="btn-reset-fine"
              onClick={handleResetSampleFine}
              title="Reset an overdue fine to test payment options"
            >
              <LuRotateCcw size={13} /> Reset Unpaid Fine for Testing
            </button>
          )}
        </div>
      </div>

      {/* 2. Summary KPI Cards */}
      <div className="user-fine-kpis">
        <div className="user-kpi-card white-card kpi-unpaid">
          <div className="kpi-icon-wrap icon-unpaid">
            <LuTriangleAlert size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">OUTSTANDING FINES</span>
            <div className="kpi-amount">₹{totalUnpaid.toFixed(2)}</div>
            <span className="kpi-subtext">
              {unpaidFines.length} {unpaidFines.length === 1 ? 'charge' : 'charges'} pending settlement
            </span>
          </div>
        </div>

        <div className="user-kpi-card white-card kpi-paid">
          <div className="kpi-icon-wrap icon-paid">
            <LuCircleCheck size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">TOTAL PAID TO DATE</span>
            <div className="kpi-amount">₹{totalPaid.toFixed(2)}</div>
            <span className="kpi-subtext">
              {paidFines.length} cleared {paidFines.length === 1 ? 'transaction' : 'transactions'}
            </span>
          </div>
        </div>

        <div className="user-kpi-card white-card kpi-policy">
          <div className="kpi-icon-wrap icon-policy">
            <LuClock size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">OVERDUE POLICY</span>
            <div className="kpi-amount" style={{ fontSize: '1.25rem' }}>₹5.00 / day</div>
            <span className="kpi-subtext">UPI, Debit, Credit &amp; Mastercard Accepted</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs */}
      <div className="user-fines-tabs-row">
        <div className="user-fines-tabs">
          <button
            type="button"
            className={`fines-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Fines &amp; Payments ({finesList.length})
          </button>
          <button
            type="button"
            className={`fines-tab-btn ${activeTab === 'unpaid' ? 'active' : ''}`}
            onClick={() => setActiveTab('unpaid')}
          >
            Unpaid Fines ({unpaidFines.length})
          </button>
          <button
            type="button"
            className={`fines-tab-btn ${activeTab === 'paid' ? 'active' : ''}`}
            onClick={() => setActiveTab('paid')}
          >
            Payment History ({paidFines.length})
          </button>
        </div>

        {totalUnpaid > 0 && (
          <button
            type="button"
            className="btn btn-navy btn-sm"
            onClick={() => setPayModalFine(unpaidFines[0])}
          >
            <LuCreditCard size={15} /> Settle Outstanding Fines (₹{totalUnpaid.toFixed(2)})
          </button>
        )}
      </div>

      {/* 4. Fines List */}
      {displayedFines.length === 0 ? (
        <div className="user-fines-empty white-card">
          <div className="empty-emoji">🎉</div>
          <h3 className="empty-title font-serif">No records found</h3>
          <p className="empty-desc">
            {activeTab === 'unpaid'
              ? 'Great news! You have no outstanding fines. Your library borrowing privileges are fully active.'
              : 'No payment transaction history found in your account.'}
          </p>
          {activeTab === 'unpaid' && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ marginTop: '16px' }}
              onClick={handleResetSampleFine}
            >
              <LuRotateCcw size={14} /> Add Overdue Fine (₹25.00) to Test Payment
            </button>
          )}
        </div>
      ) : (
        <div className="user-fines-list">
          {displayedFines.map((fine) => {
            const isPaid = fine.status === 'PAID';
            return (
              <div key={fine.fine_id} className={`user-fine-card white-card ${isPaid ? 'fine-card-paid' : 'fine-card-unpaid'}`}>
                <div className="fine-card-main">
                  {/* Book Cover Thumbnail */}
                  <div className="fine-cover-wrapper">
                    {fine.cover ? (
                      <img src={fine.cover} alt={fine.book_title} className="fine-cover-img" />
                    ) : (
                      <div className="fine-cover-placeholder">
                        <LuBookOpen size={24} />
                      </div>
                    )}
                  </div>

                  {/* Fine Details */}
                  <div className="fine-info-block">
                    <div className="fine-header-meta">
                      <span className={`fine-status-badge ${isPaid ? 'badge-paid' : 'badge-unpaid'}`}>
                        {isPaid ? <LuCircleCheck size={12} /> : <LuTriangleAlert size={12} />}
                        {isPaid ? 'PAID & CLEARED' : 'OUTSTANDING'}
                      </span>
                      <span className="fine-id-meta">Fine ID: #{fine.fine_id}</span>
                      <span className="fine-id-meta">•</span>
                      <span className="fine-id-meta">
                        <LuCalendar size={12} /> Assessed: {fine.created_at}
                      </span>
                    </div>

                    <h3 className="fine-book-title font-serif">{fine.book_title}</h3>
                    {fine.author && <p className="fine-book-author">by {fine.author}</p>}

                    <div className="fine-reason-row">
                      <span className="fine-reason-label">Reason:</span>
                      <span className="fine-reason-text">{fine.reason || `${fine.days_late} days past due date`}</span>
                    </div>

                    {isPaid && fine.receipt_no && (
                      <div className="fine-receipt-meta">
                        <span>Receipt #{fine.receipt_no}</span>
                        <span>•</span>
                        <span>Paid on {fine.paid_at}</span>
                        <span>•</span>
                        <span>via {fine.payment_method}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="fine-card-right-col">
                  <div className="fine-amount-display">
                    <span className="fine-amount-currency">₹</span>
                    <span className="fine-amount-val">{fine.amount.toFixed(2)}</span>
                  </div>

                  <div className="fine-actions-row">
                    {!isPaid ? (
                      <button
                        type="button"
                        className="btn-fine-pay"
                        onClick={() => setPayModalFine(fine)}
                      >
                        <LuCreditCard size={14} /> Pay Fine
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-fine-receipt"
                        onClick={() => setReceiptModalFine(fine)}
                      >
                        <LuReceipt size={14} /> View Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Pay Modal with UPI (QR Code & VPA), Debit Card, Credit Card, Mastercard */}
      {payModalFine && (
        <div className="fines-modal-overlay" onClick={() => !isProcessing && setPayModalFine(null)}>
          <div className="fines-modal-card white-card pay-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-header-icon-box">
                <LuCreditCard size={20} />
              </div>
              <div>
                <h3 className="modal-title font-serif">Settle Library Fine</h3>
                <p className="modal-sub">Select your preferred payment method below</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                disabled={isProcessing}
                onClick={() => setPayModalFine(null)}
              >
                <LuX size={18} />
              </button>
            </div>

            {/* Fine Summary Item */}
            <div className="modal-fine-summary-box">
              <div className="summary-item">
                <span className="summary-lbl">Resource:</span>
                <strong className="summary-val font-serif">{payModalFine.book_title}</strong>
              </div>
              <div className="summary-item">
                <span className="summary-lbl">Overdue Delay:</span>
                <span className="summary-val">{payModalFine.days_late} days past due</span>
              </div>
              <div className="summary-total-divider"></div>
              <div className="summary-item total">
                <span className="summary-lbl">Amount Due:</span>
                <span className="summary-total-val">₹{payModalFine.amount.toFixed(2)}</span>
              </div>
            </div>

            {/* 4 Payment Method Selector Tabs */}
            <div className="payment-method-tabs-wrapper">
              <span className="options-title">PAYMENT METHOD</span>
              <div className="payment-method-tabs">
                {/* 1. UPI */}
                <button
                  type="button"
                  className={`method-tab-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <div className="method-tab-icon">📱</div>
                  <div className="method-tab-label">
                    <strong>UPI</strong>
                    <span>QR &amp; VPA</span>
                  </div>
                </button>

                {/* 2. Debit Card */}
                <button
                  type="button"
                  className={`method-tab-btn ${paymentMethod === 'debit_card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('debit_card')}
                >
                  <div className="method-tab-icon">💳</div>
                  <div className="method-tab-label">
                    <strong>Debit Card</strong>
                    <span>Visa / RuPay</span>
                  </div>
                </button>

                {/* 3. Credit Card */}
                <button
                  type="button"
                  className={`method-tab-btn ${paymentMethod === 'credit_card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('credit_card')}
                >
                  <div className="method-tab-icon">💎</div>
                  <div className="method-tab-label">
                    <strong>Credit Card</strong>
                    <span>All Cards</span>
                  </div>
                </button>

                {/* 4. Mastercard */}
                <button
                  type="button"
                  className={`method-tab-btn ${paymentMethod === 'mastercard' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('mastercard')}
                >
                  <div className="method-tab-icon mastercard-icon">
                    <span className="mc-circle mc-red"></span>
                    <span className="mc-circle mc-yellow"></span>
                  </div>
                  <div className="method-tab-label">
                    <strong>Mastercard</strong>
                    <span>Mastercard</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Payment Method Details Panel */}
            <div className="payment-details-panel">
              {/* ─────────────────── A. UPI Option ─────────────────── */}
              {paymentMethod === 'upi' && (
                <div className="upi-payment-view">
                  {/* Sub-toggle: QR Code vs Enter UPI ID */}
                  <div className="upi-submode-selector">
                    <button
                      type="button"
                      className={`upi-submode-btn ${upiMode === 'qr' ? 'active' : ''}`}
                      onClick={() => setUpiMode('qr')}
                    >
                      <LuQrCode size={15} /> Scan QR Code
                    </button>
                    <button
                      type="button"
                      className={`upi-submode-btn ${upiMode === 'vpa' ? 'active' : ''}`}
                      onClick={() => setUpiMode('vpa')}
                    >
                      <LuSmartphone size={15} /> Enter UPI ID / VPA
                    </button>
                  </div>

                  {upiMode === 'qr' ? (
                    /* QR Code View */
                    <div className="upi-qr-display-section">
                      <div className="upi-qr-wrapper">
                        <QrCodeGraphic />
                        <div className="upi-qr-amount-badge">
                          Scan to Pay <strong>₹{payModalFine.amount.toFixed(2)}</strong>
                        </div>
                      </div>

                      <div className="upi-qr-instructions">
                        <p className="upi-qr-note">
                          Open your UPI App (Google Pay, PhonePe, Paytm, BHIM, Cred) and scan the QR code to complete payment.
                        </p>

                        <div className="upi-id-copy-row">
                          <span className="upi-id-lbl">Library UPI ID:</span>
                          <code className="upi-id-code">bookhive.library@icici</code>
                          <button
                            type="button"
                            className="btn-copy-upi"
                            onClick={copyUpiId}
                            title="Copy UPI ID"
                          >
                            <LuCopy size={13} />
                          </button>
                        </div>

                        <div className="upi-timer-badge">
                          <LuClock size={14} />
                          <span>QR Expires in: <strong>{formatTimer(qrTimeRemaining)}</strong></span>
                        </div>

                        <div className="upi-apps-row">
                          <span className="app-chip">GPay</span>
                          <span className="app-chip">PhonePe</span>
                          <span className="app-chip">Paytm</span>
                          <span className="app-chip">BHIM</span>
                          <span className="app-chip">Cred</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* UPI ID Input View */
                    <div className="upi-id-input-section">
                      <label className="field-label">ENTER VIRTUAL PAYMENT ADDRESS (UPI ID)</label>
                      <div className="input-with-action">
                        <input
                          type="text"
                          className="payment-text-input"
                          placeholder="e.g. yourname@okaxis, 9876543210@paytm"
                          value={upiIdInput}
                          onChange={(e) => setUpiIdInput(e.target.value)}
                        />
                      </div>
                      <span className="field-hint">
                        A payment collect request of ₹{payModalFine.amount.toFixed(2)} will be sent to your UPI application.
                      </span>

                      <div className="popular-upi-handles">
                        <span>Common handles:</span>
                        <button type="button" onClick={() => setUpiIdInput('sarah@okhdfcbank')} className="handle-btn">@okhdfcbank</button>
                        <button type="button" onClick={() => setUpiIdInput('sarah@okaxis')} className="handle-btn">@okaxis</button>
                        <button type="button" onClick={() => setUpiIdInput('sarah@ybl')} className="handle-btn">@ybl</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─────────────────── B. Debit Card ─────────────────── */}
              {paymentMethod === 'debit_card' && (
                <div className="card-payment-view">
                  <div className="card-fields-grid">
                    <div className="card-field-full">
                      <label className="field-label">DEBIT CARD NUMBER</label>
                      <input
                        type="text"
                        className="payment-text-input"
                        placeholder="4532 8900 1234 5678"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                    </div>

                    <div className="card-field-full">
                      <label className="field-label">NAME ON DEBIT CARD</label>
                      <input
                        type="text"
                        className="payment-text-input"
                        placeholder="Sarah Jenkins"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                      />
                    </div>

                    <div className="card-field-half">
                      <label className="field-label">EXPIRY DATE</label>
                      <input
                        type="text"
                        className="payment-text-input"
                        placeholder="MM / YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                    </div>

                    <div className="card-field-half">
                      <label className="field-label">CVV / CVC</label>
                      <input
                        type="password"
                        maxLength="4"
                        className="payment-text-input"
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="card-security-note">
                    <LuLock size={14} />
                    <span>Verified by Visa &amp; RuPay 3D Secure Protection</span>
                  </div>
                </div>
              )}

              {/* ─────────────────── C. Credit Card ─────────────────── */}
              {paymentMethod === 'credit_card' && (
                <div className="card-payment-view">
                  <div className="card-fields-grid">
                    <div className="card-field-full">
                      <label className="field-label">CREDIT CARD NUMBER</label>
                      <input
                        type="text"
                        className="payment-text-input"
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                    </div>

                    <div className="card-field-full">
                      <label className="field-label">CARDHOLDER NAME</label>
                      <input
                        type="text"
                        className="payment-text-input"
                        placeholder="Sarah Jenkins"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                      />
                    </div>

                    <div className="card-field-half">
                      <label className="field-label">EXPIRY DATE</label>
                      <input
                        type="text"
                        className="payment-text-input"
                        placeholder="MM / YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                    </div>

                    <div className="card-field-half">
                      <label className="field-label">CVV</label>
                      <input
                        type="password"
                        maxLength="4"
                        className="payment-text-input"
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="card-security-note">
                    <LuLock size={14} />
                    <span>256-Bit Bank Grade SSL Encryption Guaranteed</span>
                  </div>
                </div>
              )}

              {/* ─────────────────── D. Mastercard ─────────────────── */}
              {paymentMethod === 'mastercard' && (
                <div className="card-payment-view">
                  <div className="mastercard-brand-banner">
                    <div className="mastercard-logo-large">
                      <span className="mc-circle mc-red"></span>
                      <span className="mc-circle mc-yellow"></span>
                    </div>
                    <div>
                      <strong>Mastercard Identity Check™</strong>
                      <span>Official Mastercard Worldwide Academic Gateway</span>
                    </div>
                  </div>

                  <div className="card-fields-grid">
                    <div className="card-field-full">
                      <label className="field-label">MASTERCARD NUMBER</label>
                      <input
                        type="text"
                        className="payment-text-input"
                        placeholder="5241 8900 6543 2198"
                        value={cardNumber.startsWith('5') ? cardNumber : '5241 8900 6543 2198'}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                    </div>

                    <div className="card-field-full">
                      <label className="field-label">CARDHOLDER NAME</label>
                      <input
                        type="text"
                        className="payment-text-input"
                        placeholder="Sarah Jenkins"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                      />
                    </div>

                    <div className="card-field-half">
                      <label className="field-label">EXPIRY DATE</label>
                      <input
                        type="text"
                        className="payment-text-input"
                        placeholder="MM / YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                    </div>

                    <div className="card-field-half">
                      <label className="field-label">CVC CODE</label>
                      <input
                        type="password"
                        maxLength="3"
                        className="payment-text-input"
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="modal-actions-footer">
              <button
                type="button"
                className="btn btn-outline"
                disabled={isProcessing}
                onClick={() => setPayModalFine(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-navy"
                disabled={isProcessing}
                onClick={handleConfirmPayment}
              >
                {isProcessing ? (
                  'Verifying & Processing Payment...'
                ) : paymentMethod === 'upi' && upiMode === 'qr' ? (
                  `✓ I have Scanned & Paid ₹${payModalFine.amount.toFixed(2)}`
                ) : paymentMethod === 'upi' ? (
                  `Send UPI Collect Request (₹${payModalFine.amount.toFixed(2)})`
                ) : (
                  `Pay ₹${payModalFine.amount.toFixed(2)} Now`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Official Receipt Modal */}
      {receiptModalFine && (
        <div className="fines-modal-overlay" onClick={() => setReceiptModalFine(null)}>
          <div className="receipt-modal-box white-card" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-watermark">BOOKHIVE</div>
            <div className="receipt-header">
              <div className="receipt-logo">
                <img src="/bookhive-logo.png" alt="BookHive" style={{ width: 26, height: 26, objectFit: 'contain' }} />
                <span>OFFICIAL BOOKHIVE RECEIPT</span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setReceiptModalFine(null)}
              >
                <LuX size={18} />
              </button>
            </div>

            <div className="receipt-badge-status">
              <LuCircleCheck size={18} />
              <span>PAYMENT CLEARED &amp; ARCHIVED</span>
            </div>

            <div className="receipt-details-list">
              <div className="receipt-row">
                <span className="receipt-key">Receipt Number</span>
                <strong className="receipt-val">{receiptModalFine.receipt_no || 'REC-2026-0941'}</strong>
              </div>
              <div className="receipt-row">
                <span className="receipt-key">Transaction ID</span>
                <span className="receipt-val">{receiptModalFine.transaction_id || 'TXN-7729103'}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-key">Reader Name</span>
                <span className="receipt-val">{receiptModalFine.user_name || 'Sarah Jenkins'}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-key">Resource Title</span>
                <span className="receipt-val font-serif">{receiptModalFine.book_title}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-key">Payment Date</span>
                <span className="receipt-val">{receiptModalFine.paid_at || receiptModalFine.created_at}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-key">Payment Method</span>
                <span className="receipt-val">{receiptModalFine.payment_method || 'Online Card'}</span>
              </div>
              <div className="receipt-divider"></div>
              <div className="receipt-row receipt-total-row">
                <span className="receipt-total-label">Amount Cleared</span>
                <span className="receipt-total-value">₹{receiptModalFine.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="receipt-actions">
              <button
                type="button"
                className="btn btn-navy btn-sm"
                onClick={() => {
                  window.print();
                }}
              >
                <LuPrinter size={15} /> Print Receipt
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setReceiptModalFine(null)}
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
