import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { mockBooks } from '../../data/mockData';
import { getAllBooks } from '../../data/bookStore';
import { getBookReviews, calculateRatingSummary } from '../../data/reviewStore';
import { addReservation } from '../../data/reservationStore';
import {
  LuSearch,
  LuBookOpen,
  LuFileText,
  LuVideo,
  LuCheck,
  LuCircleHelp,
  LuCircleCheck,
  LuX,
  LuRotateCcw
} from 'react-icons/lu';
import './Books.css';

export default function BookCatalog() {
  const toast = useToast();
  const navigate = useNavigate();

  // Login.jsx writes directly to localStorage (not via AuthContext.login),
  // so we read both sources and merge — whichever is available.
  const { user: ctxUser } = useAuth();
  const localUser = (() => {
    try {
      const s = localStorage.getItem('archivalia_user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  })();
  const user    = ctxUser || localUser;
  const role    = localStorage.getItem('archivalia_role');
  const isAdmin = role === 'admin' || user?.role === 'ADMIN';
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('title-asc');
  const [borrowModalBook, setBorrowModalBook] = useState(null);
  const [borrowSuccess, setBorrowSuccess] = useState(false);

  // Reactive book list — re-reads from localStorage whenever admin adds/edits/deletes
  const [bookListVersion, setBookListVersion] = useState(0);
  const refreshBooks = useCallback(() => setBookListVersion(v => v + 1), []);

  useEffect(() => {
    // Listen for localStorage changes from OTHER tabs (admin tab -> user tab)
    const onStorage = (e) => {
      if (
        e.key === 'archivalia_added_books' ||
        e.key === 'archivalia_book_overrides' ||
        e.key === 'archivalia_deleted_book_ids'
      ) {
        refreshBooks();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refreshBooks]);

  // All books currently in catalog (re-computed on every version bump or navigation)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allBooks = useMemo(() => getAllBooks(mockBooks), [bookListVersion]);

  // Compute map of book_id -> average review rating for sort
  const bookRatingsMap = useMemo(() => {
    const map = {};
    allBooks.forEach((b) => {
      const revs = getBookReviews(b.book_id);
      const summary = calculateRatingSummary(revs);
      map[b.book_id] = summary.average || 0;
    });
    return map;
  }, [allBooks]);

  // Filtered & Sorted list (includes admin-added books from localStorage)
  const filtered = useMemo(() => {
    let result = [...allBooks];

    // Text search (Title, Author, ISBN, Category)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (b) =>
          (b.title && b.title.toLowerCase().includes(q)) ||
          (b.author && b.author.toLowerCase().includes(q)) ||
          (b.isbn && b.isbn.toLowerCase().includes(q)) ||
          (b.category && b.category.toLowerCase().includes(q))
      );
    }

    // Type filter
    if (selectedType !== 'All') {
      if (selectedType === 'Book') {
        result = result.filter((b) => b.type === 'Book');
      } else if (selectedType === 'Research Paper') {
        result = result.filter((b) => b.type === 'Research Paper');
      } else if (selectedType === 'Digital Media') {
        result = result.filter((b) => b.type === 'Digital Media');
      }
    }

    // Available only toggle
    if (availableOnly) {
      result = result.filter((b) => b.available_copies > 0);
    }

    // Sorting options: Title A-Z, Title Z-A, Highest Rating, Newest, Most Popular
    result.sort((a, b) => {
      if (sortBy === 'title-asc' || sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'title-desc') {
        return b.title.localeCompare(a.title);
      }
      if (sortBy === 'rating-desc') {
        const ratingA = bookRatingsMap[a.book_id] || 0;
        const ratingB = bookRatingsMap[b.book_id] || 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'newest' || sortBy === 'year') {
        const yearDiff = (b.year || 0) - (a.year || 0);
        if (yearDiff !== 0) return yearDiff;
        return b.book_id - a.book_id;
      }
      if (sortBy === 'popular') {
        // More copies checked out = higher circulation popularity
        const borrowedA = Math.max(0, (a.total_copies || 0) - (a.available_copies || 0));
        const borrowedB = Math.max(0, (b.total_copies || 0) - (b.available_copies || 0));
        if (borrowedB !== borrowedA) return borrowedB - borrowedA;
        const ratingA = bookRatingsMap[a.book_id] || 0;
        const ratingB = bookRatingsMap[b.book_id] || 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [allBooks, search, selectedType, availableOnly, sortBy, bookRatingsMap]);

  const handleBorrowClick = (book) => {
    if (!user) {
      toast.info('Please sign in to reserve library resources.');
      navigate('/login');
      return;
    }
    setBorrowModalBook(book);
    setBorrowSuccess(false);
  };

  const confirmBorrow = () => {
    if (!user || !borrowModalBook) return;
    const result = addReservation(borrowModalBook, user);
    if (result === null) {
      // Duplicate — already has a pending/active reservation for this book
      toast.info(`You already have an active or pending reservation for "${borrowModalBook.title}".`);
      setBorrowModalBook(null);
      return;
    }
    setBorrowSuccess(true);
    toast.success(`"${borrowModalBook.title}" reserved! Visit the library counter after admin issues it.`);
    setTimeout(() => {
      setBorrowModalBook(null);
      setBorrowSuccess(false);
    }, 1500);
  };

  return (
    <div className="catalog-wrapper">
      {/* 1. Header Banner */}
      <div className="catalog-hero-banner">
        <h1 className="catalog-main-title font-serif">Resource Catalog</h1>
        <p className="catalog-subheading">
          Discover and borrow from our curated digital library
        </p>
      </div>

      {/* 2. Search and Filter Control Card */}
      <div className="catalog-filter-card white-card">
        {/* Top: Search Input & Sort Dropdown */}
        <div className="filter-card-top-row">
          <div className="search-pill-wrapper">
            <LuSearch className="search-pill-icon" size={17} />
            <input
              type="text"
              placeholder="Search by title, author, ISBN, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-pill-input"
              aria-label="Search by title, author, ISBN, or category"
            />
            {search.trim() && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearch('')}
                title="Clear search"
                aria-label="Clear search text"
              >
                <LuX size={15} />
              </button>
            )}
          </div>

          <div className="sort-pill-wrapper">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-pill-select"
              aria-label="Sort catalog resources"
            >
              <option value="title-asc">Sort: Title A–Z</option>
              <option value="title-desc">Sort: Title Z–A</option>
              <option value="rating-desc">Sort: Highest Rating</option>
              <option value="newest">Sort: Newest</option>
              <option value="popular">Sort: Most Popular</option>
            </select>
          </div>
        </div>

        {/* Bottom: Filter Badges */}
        <div className="filter-chips-row">
          <button
            type="button"
            className={`filter-chip ${selectedType === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedType('All')}
          >
            All Resources
          </button>

          <button
            type="button"
            className={`filter-chip ${selectedType === 'Book' ? 'active' : ''}`}
            onClick={() => setSelectedType('Book')}
          >
            <LuBookOpen size={14} /> Books
          </button>

          <button
            type="button"
            className={`filter-chip ${selectedType === 'Research Paper' ? 'active' : ''}`}
            onClick={() => setSelectedType('Research Paper')}
          >
            <LuFileText size={14} /> Research Papers
          </button>

          <button
            type="button"
            className={`filter-chip ${selectedType === 'Digital Media' ? 'active' : ''}`}
            onClick={() => setSelectedType('Digital Media')}
          >
            <LuVideo size={14} /> Digital Media
          </button>

          <button
            type="button"
            className={`filter-chip ${availableOnly ? 'active' : ''}`}
            onClick={() => setAvailableOnly(!availableOnly)}
          >
            <LuCheck size={14} /> Available Only
          </button>
        </div>
      </div>

      {/* 3. Resources Count Indicator & Active Filter Summary */}
      <div className="catalog-count-row">
        <div className="catalog-count-left">
          <span>
            <strong>{filtered.length}</strong> {filtered.length === 1 ? 'resource' : 'resources'} found
            {allBooks.length > 0 && filtered.length !== allBooks.length && (
              <span className="catalog-count-total"> (out of {allBooks.length} total)</span>
            )}
          </span>

          {search.trim() && (
            <span className="search-match-chip">
              matching &ldquo;{search.trim()}&rdquo;
              <button
                type="button"
                className="btn-chip-clear"
                onClick={() => setSearch('')}
                title="Clear search keyword"
                aria-label="Clear search"
              >
                <LuX size={12} />
              </button>
            </span>
          )}
        </div>

        {(search.trim() || selectedType !== 'All' || availableOnly) && (
          <button
            type="button"
            className="btn-clear-filters-link"
            onClick={() => {
              setSearch('');
              setSelectedType('All');
              setAvailableOnly(false);
            }}
          >
            <LuRotateCcw size={13} />
            <span>Clear search &amp; filters</span>
          </button>
        )}
      </div>

      {/* 4. Four-Column Resource Cards Grid */}
      {filtered.length === 0 ? (
        <div className="catalog-empty-card white-card">
          <div className="empty-icon-circle">
            <LuSearch size={32} />
          </div>
          <h3 className="empty-title font-serif">
            {search.trim()
              ? `No resources found for "${search.trim()}"`
              : 'No resources matched your filter criteria'}
          </h3>
          <p className="empty-text">
            {search.trim()
              ? 'We searched across title, author, ISBN, and category, but found no matching records in the collection.'
              : 'There are no catalog resources matching your selected type filter and availability settings.'}
          </p>
          <div className="empty-suggestions-box">
            <span className="suggestions-title">Search suggestions:</span>
            <ul className="suggestions-list">
              <li>Check your spelling for author names or book titles.</li>
              <li>Search by standard ISBN format (e.g. <em>978-0205259489</em> or <em>1706.03762</em>).</li>
              <li>Try broader terms such as <em>Economics</em>, <em>Art</em>, or <em>Learning</em>.</li>
              <li>Switch to &ldquo;All Resources&rdquo; or uncheck &ldquo;Available Only&rdquo;.</li>
            </ul>
          </div>
          <div className="empty-actions-row">
            {search.trim() && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setSearch('')}
              >
                Clear Search
              </button>
            )}
            <button
              type="button"
              className="btn btn-navy btn-sm"
              onClick={() => {
                setSearch('');
                setSelectedType('All');
                setAvailableOnly(false);
              }}
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="resource-grid">
          {filtered.map((book) => {
            const isAvailable = book.available_copies > 0;
            const isStatusWarning = book.status.includes('left');

            return (
              <div key={book.book_id} className="resource-card white-card">
                {/* Visual Cover Header with Badges */}
                <div className="resource-cover-area">
                  {book.coverTextOnly ? (
                    <div className="cover-text-panel">
                      <div className="cover-text-inner">
                        <h4 className="cover-book-title font-serif">{book.title}</h4>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="resource-cover-image"
                    />
                  )}

                  {/* Floating Badges */}
                  <div className="badge-type-pill">
                    {book.type === 'Book' && <LuBookOpen size={13} />}
                    {book.type === 'Research Paper' && <LuFileText size={13} />}
                    {book.type === 'Digital Media' && <LuVideo size={13} />}
                    <span>{book.type}</span>
                  </div>

                  <div
                    className={`badge-status-pill ${
                      !isAvailable
                        ? 'status-unavailable'
                        : isStatusWarning
                        ? 'status-warning'
                        : 'status-available'
                    }`}
                  >
                    {book.status}
                  </div>
                </div>

                {/* Card Info Body */}
                <div className="resource-card-body">
                  <div className="resource-meta-label">
                    {book.category} • {book.year}
                  </div>
                  <h3 className="resource-card-title font-serif" title={book.title}>
                    {book.title}
                  </h3>
                  <p className="resource-card-author" title={book.author}>
                    {book.author}
                  </p>

                  {/* Action Buttons Row */}
                  <div className="resource-btn-row">
                    <Link
                      to={`/books/${book.book_id}`}
                      className="btn-card-action btn-card-details"
                    >
                      View Details
                    </Link>

                    {/* Reserve button — hidden for admin */}
                    {!isAdmin && (
                      isAvailable ? (
                        <button
                          type="button"
                          className="btn-card-action btn-card-borrow"
                          onClick={() => handleBorrowClick(book)}
                        >
                          Reserve
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-card-action btn-card-waitlist"
                          disabled
                        >
                          Waitlist
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Help Circle Button */}
      <button
        type="button"
        className="floating-help-btn"
        title="Library Help & Assistance"
        aria-label="Library Help"
      >
        <LuCircleHelp size={22} />
      </button>

      {/* Reserve Confirmation Modal */}
      {borrowModalBook && (
        <div className="modal-overlay" onClick={() => setBorrowModalBook(null)}>
          <div className="modal-box white-card" onClick={(e) => e.stopPropagation()}>
            {borrowSuccess ? (
              <div className="borrow-modal-success">
                <LuCircleCheck size={48} color="#10B981" />
                <h3 className="modal-title font-serif" style={{ marginTop: '12px' }}>
                  Reservation Submitted!
                </h3>
                <p className="modal-body">
                  <strong>{borrowModalBook.title}</strong> reservation is now <strong>pending admin approval</strong>.
                  Visit the library counter to collect the book once the librarian issues it.
                  You can track status in <em>My Loans</em>.
                </p>
              </div>
            ) : (
              <>
                <h3 className="modal-title font-serif">Confirm Reservation</h3>
                <p className="modal-body">
                  Reserve <strong>{borrowModalBook.title}</strong>?<br />
                  <span style={{ fontSize: '0.82rem', color: '#64748B', display: 'block', marginTop: '6px' }}>
                    Visit the library counter with your username to collect the book. Loan period: 14 days.
                  </span>
                </p>

                {/* 24-hour warning */}
                <div className="modal-warning-box">
                  ⚠️ <span>You must collect the book within <strong>24 hours</strong> of reservation, otherwise your reservation will be <strong>automatically cancelled</strong>.</span>
                </div>

                {/* Borrowing Rules */}
                <div className="modal-rules-box">
                  <h4 className="modal-rules-title">📋 Borrowing Rules</h4>
                  <ul className="modal-rules-list">
                    <li>🕐 Loan period: <strong>14 days</strong></li>
                    <li>₹ Late fee: <strong>₹5 per day</strong></li>
                    <li>📚 Max per user: <strong>5 books</strong></li>
                    <li>🏛️ Collect from: <strong>Library Counter</strong></li>
                  </ul>
                </div>

                <div className="modal-button-row">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setBorrowModalBook(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-navy btn-sm"
                    onClick={confirmBorrow}
                  >
                    Confirm Reservation
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
