import { useState, useCallback, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { mockBooks } from '../../data/mockData';
import { getAllBooks, deleteBook } from '../../data/bookStore';
import { getBookReviews, calculateRatingSummary } from '../../data/reviewStore';
import { addRecentlyViewed } from '../../data/recentlyViewedStore';
import BookReviews from './BookReviews';
import {
  LuArrowLeft,
  LuBookOpen,
  LuCalendar,
  LuBuilding,
  LuHash,
  LuBookMarked,
  LuCircleCheck,
  LuFileText,
  LuVideo,
  LuClock,
  LuUsers,
  LuPencil,
  LuTrash2,
  LuStar
} from 'react-icons/lu';
import './Books.css';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isAdmin = localStorage.getItem('archivalia_role') === 'admin';
  const [reserved, setReserved] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const book = getAllBooks(mockBooks).find((b) => b.book_id === parseInt(id));

  const [reviewStats, setReviewStats] = useState(() => {
    if (book?.book_id) {
      const initial = getBookReviews(book.book_id);
      return calculateRatingSummary(initial);
    }
    return { average: 0, total: 0 };
  });

  const handleReviewsChange = useCallback((currentReviews) => {
    setReviewStats(calculateRatingSummary(currentReviews));
  }, []);

  // Track as recently viewed in localStorage
  useEffect(() => {
    if (book) {
      addRecentlyViewed(book);
    }
  }, [book]);

  if (!book) {
    return (
      <div className="book-detail-page">
        <Link to="/books" className="back-link">
          <LuArrowLeft /> Back to Catalog
        </Link>
        <div className="detail-not-found">
          <div style={{ fontSize: '3rem' }}>📚</div>
          <h3>Book Not Found</h3>
          <p>The book you&apos;re looking for doesn&apos;t exist in our catalog.</p>
          <Link to="/books" className="btn-reserve" style={{ display: 'inline-block', marginTop: '16px', textAlign: 'center' }}>
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isAvailable = book.available_copies > 0;

  const handleReserve = () => {
    if (!localStorage.getItem('archivalia_role')) {
      toast.info('Please sign in to reserve library resources.');
      navigate('/login');
      return;
    }
    setReserving(true);
    setTimeout(() => {
      setReserving(false);
      setReserved(true);
      setShowModal(false);
      toast.success(`"${book.title}" reserved! Collect from the library counter within 24 hours.`);
    }, 800);
  };

  const TypeIcon = book.type === 'Book'
    ? LuBookOpen
    : book.type === 'Research Paper'
    ? LuFileText
    : LuVideo;

  return (
    <div className="book-detail-page">
      {/* Back Link */}
      <Link to="/books" className="back-link">
        <LuArrowLeft /> Back to Catalog
      </Link>

      <div className="book-detail-layout">
        {/* Left — Cover */}
        <div className="detail-cover-col">
          {book.coverTextOnly ? (
            <div className="detail-cover-text-panel">
              <h3 className="detail-cover-text font-serif">{book.title}</h3>
            </div>
          ) : (
            <img src={book.cover} alt={book.title} className="detail-cover-img" />
          )}

          {/* Availability Badge */}
          <div className={`detail-avail-badge ${isAvailable ? 'avail-green' : 'avail-red'}`}>
            {isAvailable ? <LuCircleCheck size={15} /> : <LuBookMarked size={15} />}
            <span>{isAvailable ? 'Available for Reservation' : 'Currently Unavailable'}</span>
          </div>

          {/* Copies Bar */}
          <div className="detail-copies-section">
            <div className="copies-bar-track">
              <div
                className="copies-bar-fill"
                style={{ width: `${(book.available_copies / book.total_copies) * 100}%` }}
              />
            </div>
            <span className="copies-bar-label">
              {book.available_copies} of {book.total_copies} copies available
            </span>
          </div>
        </div>

        {/* Right — Info */}
        <div className="detail-info-col">
          {/* Type pill */}
          <div className="detail-type-pill">
            <TypeIcon size={14} />
            <span>{book.type}</span>
          </div>

          <span className="detail-category-label">{book.category}</span>
          <h1 className="detail-book-title font-serif">{book.title}</h1>
          <p className="detail-book-author">by {book.author}</p>

          {/* Quick Rating Badge with anchor jump */}
          <div className="detail-rating-quick">
            <div className="detail-stars-preview" aria-label={`Rated ${reviewStats.average} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <LuStar
                  key={star}
                  size={15}
                  className={`detail-star-icon ${star <= Math.round(reviewStats.average) && reviewStats.total > 0 ? 'star-filled' : 'star-empty'}`}
                />
              ))}
            </div>
            <span className="detail-rating-number">
              {reviewStats.total > 0 ? reviewStats.average : 'Unrated'}
            </span>
            <span className="detail-rating-bullet">·</span>
            <a href="#book-reviews" className="detail-rating-count-link">
              {reviewStats.total > 0
                ? `${reviewStats.total} ${reviewStats.total === 1 ? 'review' : 'reviews'}`
                : 'Write the first review'}
            </a>
          </div>

          <p className="detail-book-description">{book.description}</p>

          {/* Meta Grid */}
          <div className="detail-meta-grid">
            <div className="detail-meta-item">
              <LuHash className="detail-meta-icon" size={16} />
              <div>
                <span className="detail-meta-label">ISBN</span>
                <span className="detail-meta-value">{book.isbn}</span>
              </div>
            </div>
            <div className="detail-meta-item">
              <LuCalendar className="detail-meta-icon" size={16} />
              <div>
                <span className="detail-meta-label">Published</span>
                <span className="detail-meta-value">{book.year}</span>
              </div>
            </div>
            <div className="detail-meta-item">
              <LuBuilding className="detail-meta-icon" size={16} />
              <div>
                <span className="detail-meta-label">Publisher</span>
                <span className="detail-meta-value">{book.publisher}</span>
              </div>
            </div>
            <div className="detail-meta-item">
              <LuUsers className="detail-meta-icon" size={16} />
              <div>
                <span className="detail-meta-label">Copies</span>
                <span className="detail-meta-value">{book.available_copies} / {book.total_copies}</span>
              </div>
            </div>
          </div>

          {/* Borrowing Rules — hidden for admin */}
          {!isAdmin && (
            <div className="detail-rules-box">
              <h4 className="detail-rules-title">📋 Borrowing Rules</h4>
              <ul className="detail-rules-list">
                <li><LuClock size={13} /> Loan period: <strong>14 days</strong></li>
                <li><span>₹</span> Late fee: <strong>₹5 per day</strong></li>
                <li><LuBookOpen size={13} /> Max per user: <strong>5 books</strong></li>
                <li><LuBuilding size={13} /> Collect from: <strong>Library Counter</strong></li>
              </ul>
            </div>
          )}

          {/* Action Row */}
          <div className="detail-action-row">
            {isAdmin ? (
              /* Admin: Edit + Delete */
              <>
                <Link to={`/books/edit/${book.book_id}`} className="btn-reserve" style={{ textDecoration: 'none' }}>
                  <LuPencil size={16} /> Edit Book
                </Link>
                <button
                  className="btn-reserve"
                  style={{ background: '#ef4444' }}
                  onClick={() => setShowDeleteModal(true)}
                >
                  <LuTrash2 size={16} /> Delete
                </button>
              </>
            ) : (
              /* User: Reserve */
              reserved ? (
                <div className="detail-reserved-msg">
                  <LuCircleCheck size={18} color="#15803d" />
                  <span>Reserved! Collect from the library counter within <strong>24 hours</strong> or your reservation will be cancelled.</span>
                </div>
              ) : (
                <button
                  className="btn-reserve"
                  onClick={() => setShowModal(true)}
                  disabled={!isAvailable}
                >
                  {isAvailable ? (
                    <><LuBookMarked size={16} /> Reserve This Book</>
                  ) : (
                    'Not Available'
                  )}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Book Reviews and Academic Ratings Section */}
      <BookReviews book={book} onReviewsChange={handleReviewsChange} />

      {/* Reserve Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box white-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title font-serif">Confirm Reservation</h3>
            <p className="modal-body">
              Reserve <strong>{book.title}</strong>?<br />
              <span style={{ fontSize: '0.82rem', color: '#64748B', display: 'block', marginTop: '6px' }}>
                Visit the library counter with your username to collect the book. Loan period: 14 days.
              </span>
            </p>

            {/* 24-hour warning */}
            <div className="modal-warning-box">
              ⚠️ <span>You must collect the book within <strong>24 hours</strong> of reservation, otherwise your reservation will be <strong>automatically cancelled</strong>.</span>
            </div>

            <div className="modal-button-row">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-navy btn-sm"
                onClick={handleReserve}
                disabled={reserving}
              >
                {reserving ? 'Reserving...' : 'Confirm Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-box white-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title font-serif">Delete Book</h3>
            <p className="modal-body">
              Are you sure you want to delete <strong>{book.title}</strong> from the catalog?
              <span style={{ fontSize: '0.82rem', color: '#ef4444', display: 'block', marginTop: '6px' }}>
                This action cannot be undone.
              </span>
            </p>
            <div className="modal-button-row">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#ef4444', color: '#fff' }}
                onClick={() => {
                  deleteBook(book.book_id);
                  toast.success(`"${book.title}" has been deleted.`);
                  setShowDeleteModal(false);
                  navigate('/books');
                }}
              >
                <LuTrash2 size={14} /> Delete Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
