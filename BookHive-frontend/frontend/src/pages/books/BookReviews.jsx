import { useState, useId, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  getBookReviews,
  saveReview,
  deleteReview,
  isReviewOwner,
  calculateRatingSummary
} from '../../data/reviewStore';
import {
  LuStar,
  LuPencil,
  LuTrash2,
  LuMessageSquare,
  LuCheck,
  LuX,
  LuSparkles,
  LuShieldCheck,
  LuUser
} from 'react-icons/lu';

const RATING_LABELS = {
  1: 'Poor — Needs significant revision',
  2: 'Fair — Limited academic merit',
  3: 'Good — Informative & solid reference',
  4: 'Very Good — Highly comprehensive',
  5: 'Excellent — Seminal & essential reading'
};

export default function BookReviews({ book, onReviewsChange }) {
  const toast = useToast();
  const formId = useId();

  // Current user info initialized lazily
  const [currentUser] = useState(() => {
    try {
      const rawUser = localStorage.getItem('archivalia_user');
      return rawUser ? JSON.parse(rawUser) : null;
    } catch {
      return null;
    }
  });

  const [reviews, setReviews] = useState(() => {
    return book?.book_id ? getBookReviews(book.book_id) : [];
  });

  const [showForm, setShowForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState(() => {
    try {
      const rawUser = localStorage.getItem('archivalia_user');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        return parsed.name || 'Sarah Jenkins';
      }
    } catch {
      // Fallback
    }
    return 'Sarah Jenkins';
  });

  const refreshReviews = useCallback(() => {
    if (book?.book_id) {
      const data = getBookReviews(book.book_id);
      setReviews(data);
      onReviewsChange?.(data);
    }
  }, [book?.book_id, onReviewsChange]);

  useEffect(() => {
    if (book?.book_id) {
      const data = getBookReviews(book.book_id);
      setReviews(data);
      onReviewsChange?.(data);
    }
    setShowForm(false);
    setEditingReviewId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.book_id]);

  const summary = calculateRatingSummary(reviews);

  const resetForm = () => {
    setRating(5);
    setHoverRating(0);
    setComment('');
    setEditingReviewId(null);
    setShowForm(false);
    if (currentUser?.name) {
      setReviewerName(currentUser.name);
    }
  };

  const handleStartEdit = (review) => {
    setEditingReviewId(review.id);
    setRating(review.rating);
    setComment(review.comment);
    setReviewerName(review.userName);
    setShowForm(true);

    // Scroll to form smoothly
    const formElement = document.getElementById(`review-form-${book?.book_id}`);
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error('Please write a short review before submitting.');
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error('Please select a star rating between 1 and 5.');
      return;
    }

    const payload = {
      id: editingReviewId || undefined,
      bookId: book.book_id,
      rating,
      comment: comment.trim(),
      userName: reviewerName.trim() || (currentUser?.name || 'Anonymous Reader'),
      userId: currentUser?.user_id || 1,
      userEmail: currentUser?.email || 'user@bookhive.org'
    };

    saveReview(payload);
    refreshReviews();

    if (editingReviewId) {
      toast.success('Your review has been updated successfully!');
    } else {
      toast.success('Thank you! Your review has been published.');
    }

    resetForm();
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    deleteReview(deleteTargetId);
    refreshReviews();
    if (editingReviewId === deleteTargetId) {
      resetForm();
    }
    setDeleteTargetId(null);
    toast.success('Review deleted.');
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <section className="book-reviews-container" id="book-reviews" aria-label="Book Reviews & Ratings">
      {/* Section Header */}
      <div className="reviews-section-header">
        <div className="reviews-header-left">
          <div className="reviews-icon-box">
            <LuMessageSquare size={20} />
          </div>
          <div>
            <h2 className="reviews-section-title font-serif">Reviews & Academic Ratings</h2>
            <p className="reviews-section-subtitle">
              Peer evaluations, critical commentary, and scholar ratings for &ldquo;{book.title}&rdquo;.
            </p>
          </div>
        </div>

        {!showForm && (
          <button
            type="button"
            className="btn-write-review"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <LuPencil size={15} />
            <span>Write a Review</span>
          </button>
        )}
      </div>

      {/* Analytics / Score Breakdown Card */}
      <div className="reviews-summary-card">
        {/* Left: Score Overview */}
        <div className="summary-score-box">
          <span className="summary-average-number">{summary.total > 0 ? summary.average : '—'}</span>
          <div className="summary-stars-row" aria-label={`Rating: ${summary.average} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <LuStar
                key={star}
                size={22}
                className={`summary-star ${star <= Math.round(summary.average) && summary.total > 0 ? 'star-filled' : 'star-empty'}`}
              />
            ))}
          </div>
          <span className="summary-total-label">
            {summary.total} {summary.total === 1 ? 'community review' : 'community reviews'}
          </span>
          {summary.total > 0 && (
            <div className="summary-verified-pill">
              <LuSparkles size={13} />
              <span>Verified Campus Circulation</span>
            </div>
          )}
        </div>

        {/* Right: Distribution Bars */}
        <div className="summary-bars-box">
          <h4 className="summary-bars-title">Rating Breakdown</h4>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.distribution[star] || 0;
            const pct = summary.percentages[star] || 0;
            return (
              <div key={star} className="rating-bar-row">
                <span className="bar-star-label">{star}★</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${pct}%` }}
                    title={`${count} reviews (${pct}%)`}
                  />
                </div>
                <span className="bar-count-label">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Write / Edit Form */}
      {showForm && (
        <div className="review-form-card" id={`review-form-${book?.book_id}`}>
          <div className="review-form-header">
            <div>
              <h3 className="review-form-title font-serif">
                {editingReviewId ? 'Edit Your Review' : 'Write a Book Review'}
              </h3>
              <p className="review-form-subtitle">
                {editingReviewId
                  ? 'Update your rating or commentary below.'
                  : 'Share your assessment to help colleagues and researchers in the catalog.'}
              </p>
            </div>
            <button
              type="button"
              className="btn-close-form"
              onClick={resetForm}
              aria-label="Cancel editing"
            >
              <LuX size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="review-form-body">
            {/* Reviewer Name */}
            <div className="form-field-group">
              <label htmlFor={`${formId}-reviewerName`} className="review-field-label">
                <LuUser size={14} /> Reviewer Name
              </label>
              <input
                id={`${formId}-reviewerName`}
                type="text"
                className="review-text-input"
                placeholder="Your full name or academic role"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                required
              />
            </div>

            {/* Interactive 1-5 Star Picker */}
            <div className="form-field-group">
              <label className="review-field-label">
                <LuStar size={14} /> Select Star Rating (1 to 5)
              </label>
              <div className="star-picker-row" role="radiogroup" aria-label="1 to 5 Star Rating">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      className={`star-picker-btn ${isFilled ? 'active' : ''}`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    >
                      <LuStar size={26} />
                    </button>
                  );
                })}
                <span className="rating-desc-badge">
                  {RATING_LABELS[hoverRating || rating]}
                </span>
              </div>
            </div>

            {/* Review Commentary */}
            <div className="form-field-group">
              <label htmlFor={`${formId}-comment`} className="review-field-label">
                <LuMessageSquare size={14} /> Written Review & Commentary
              </label>
              <textarea
                id={`${formId}-comment`}
                className="review-textarea"
                rows={4}
                placeholder="Discuss the book's clarity, academic depth, key themes, or who will benefit most from reading it..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
              <span className="textarea-helper">
                Markdown-safe text. Please keep discussions professional and constructive.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="review-form-actions">
              <button
                type="button"
                className="btn-review-cancel"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-review-submit"
              >
                <LuCheck size={16} />
                <span>{editingReviewId ? 'Save Changes' : 'Publish Review'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Reviews List */}
      <div className="reviews-list-wrapper">
        <div className="reviews-list-heading-row">
          <h3 className="reviews-list-count font-serif">
            Reader Reviews ({reviews.length})
          </h3>
          {reviews.length > 0 && (
            <span className="reviews-sort-note">Sorted by most recent</span>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="reviews-empty-state">
            <div className="empty-state-icon">📖</div>
            <h4 className="empty-state-title font-serif">No Reviews Yet</h4>
            <p className="empty-state-desc">
              Be the first scholar to review &ldquo;{book.title}&rdquo; and share valuable perspectives with the library community.
            </p>
            {!showForm && (
              <button
                type="button"
                className="btn-write-review"
                style={{ marginTop: '12px' }}
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                <LuPencil size={15} />
                <span>Write the First Review</span>
              </button>
            )}
          </div>
        ) : (
          <div className="reviews-cards-stack">
            {reviews.map((rev) => {
              const isOwner = isReviewOwner(rev, currentUser);
              return (
                <article
                  key={rev.id}
                  className={`review-card ${isOwner ? 'review-card--own' : ''}`}
                >
                  <div className="review-card-header">
                    <div className="reviewer-info-left">
                      <div className="reviewer-avatar">
                        {getInitials(rev.userName)}
                      </div>
                      <div>
                        <div className="reviewer-name-row">
                          <span className="reviewer-name">{rev.userName}</span>
                          {isOwner && (
                            <span className="badge-own-review">
                              <LuShieldCheck size={12} /> Your Review
                            </span>
                          )}
                        </div>
                        <span className="review-date">
                          {formatDate(rev.createdAt)}
                          {rev.updatedAt && (
                            <span className="review-edited-tag"> · (edited)</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="reviewer-rating-stars">
                      <div className="review-stars-group" aria-label={`Rated ${rev.rating} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <LuStar
                            key={s}
                            size={16}
                            className={`review-card-star ${s <= rev.rating ? 'star-filled' : 'star-empty'}`}
                          />
                        ))}
                      </div>
                      <span className="review-rating-numeric">{rev.rating}.0</span>
                    </div>
                  </div>

                  {/* Comment Body */}
                  <p className="review-comment-text">{rev.comment}</p>

                  {/* Actions for Own Review */}
                  {isOwner && (
                    <div className="review-owner-actions">
                      <button
                        type="button"
                        className="btn-review-action btn-review-edit"
                        onClick={() => handleStartEdit(rev)}
                        title="Edit this review"
                      >
                        <LuPencil size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        className="btn-review-action btn-review-delete"
                        onClick={() => setDeleteTargetId(rev.id)}
                        title="Delete this review"
                      >
                        <LuTrash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="modal-overlay" onClick={() => setDeleteTargetId(null)}>
          <div className="modal-box white-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title font-serif">Delete Review</h3>
            <p className="modal-body">
              Are you sure you want to delete this review? This action will permanently remove it from the library catalog.
            </p>
            <div className="modal-button-row">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setDeleteTargetId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#ef4444', color: '#fff' }}
                onClick={confirmDelete}
              >
                <LuTrash2 size={14} /> Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
