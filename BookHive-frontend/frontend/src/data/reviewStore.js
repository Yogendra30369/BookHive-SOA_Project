// Utility to manage book reviews and ratings in localStorage
// Supports 1-5 star ratings, persistent storage, ownership tracking, and review updates/deletions.

export const REVIEWS_STORAGE_KEY = 'archivalia_book_reviews';
export const MY_REVIEWS_KEY = 'archivalia_my_reviews';

const SEED_REVIEWS = [
  {
    id: 'rev-seed-1',
    bookId: 1,
    userId: 1,
    userName: 'Sarah Jenkins',
    userEmail: 's.jenkins@oxford.ac.uk',
    rating: 5,
    comment: 'An extraordinary survey of modern art history. The analysis of cubism and abstract expressionism is remarkably clear and engaging. Used it extensively for my coursework!',
    createdAt: '2026-02-14T10:30:00.000Z',
    updatedAt: null
  },
  {
    id: 'rev-seed-2',
    bookId: 1,
    userId: 2,
    userName: 'Marcus Vance',
    userEmail: 'm.vance@cambridge.ac.uk',
    rating: 4,
    comment: 'Extremely thorough with rich photographic references. A bit heavy to carry around the library, but an indispensable reference for any design scholar.',
    createdAt: '2026-01-28T14:15:00.000Z',
    updatedAt: null
  },
  {
    id: 'rev-seed-3',
    bookId: 1,
    userId: 3,
    userName: 'Dr. Elena Rostova',
    userEmail: 'e.rostova@sorbonne.fr',
    rating: 5,
    comment: 'The definitive textbook for modern art historiography. Curated with academic rigor and accessible prose. Highly recommended for seminar reading.',
    createdAt: '2025-12-19T09:00:00.000Z',
    updatedAt: null
  },
  {
    id: 'rev-seed-4',
    bookId: 2,
    userId: 5,
    userName: 'David Chen',
    userEmail: 'd.chen@mit.edu',
    rating: 5,
    comment: 'The foundational paper of modern generative AI. The mathematical clarity behind self-attention mechanisms and query-key-value projections is unmatched.',
    createdAt: '2026-02-02T16:45:00.000Z',
    updatedAt: null
  },
  {
    id: 'rev-seed-5',
    bookId: 2,
    userId: 1,
    userName: 'Sarah Jenkins',
    userEmail: 's.jenkins@oxford.ac.uk',
    rating: 5,
    comment: 'Required reading for our Machine Learning research group. Completely revolutionized how we think about sequence modeling without recurrence.',
    createdAt: '2026-01-20T11:20:00.000Z',
    updatedAt: null
  },
  {
    id: 'rev-seed-6',
    bookId: 3,
    userId: 7,
    userName: 'Prof. Arthur Pendelton',
    userEmail: 'a.pendelton@lse.ac.uk',
    rating: 4,
    comment: 'Compelling empirical analysis on tax salience and behavioral nudges in public welfare. Excellent synthesis of theory and field experiments.',
    createdAt: '2026-02-10T12:00:00.000Z',
    updatedAt: null
  }
];

export function getMyReviewIds() {
  try {
    const raw = localStorage.getItem(MY_REVIEWS_KEY);
    if (!raw) {
      // Initialize with Sarah Jenkins' seed review ids if this is default user
      const initial = ['rev-seed-1', 'rev-seed-5'];
      localStorage.setItem(MY_REVIEWS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return ['rev-seed-1', 'rev-seed-5'];
  }
}

export function trackMyReviewId(id) {
  try {
    const current = getMyReviewIds();
    if (!current.includes(id)) {
      const updated = [...current, id];
      localStorage.setItem(MY_REVIEWS_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Error tracking review ownership', e);
  }
}

export function untrackMyReviewId(id) {
  try {
    const current = getMyReviewIds();
    const updated = current.filter(item => item !== id);
    localStorage.setItem(MY_REVIEWS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error untracking review ownership', e);
  }
}

export function getAllReviews() {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(SEED_REVIEWS));
      return SEED_REVIEWS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading reviews from localStorage', e);
    return SEED_REVIEWS;
  }
}

export function getBookReviews(bookId) {
  const all = getAllReviews();
  const numericId = parseInt(bookId, 10);
  return all
    .filter(r => r.bookId === numericId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function saveReview(reviewData) {
  const all = getAllReviews();
  const now = new Date().toISOString();

  if (reviewData.id) {
    // Update existing review
    const index = all.findIndex(r => r.id === reviewData.id);
    if (index !== -1) {
      const existing = all[index];
      const updatedReview = {
        ...existing,
        ...reviewData,
        updatedAt: now
      };
      all[index] = updatedReview;
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(all));
      return updatedReview;
    }
  }

  // Create new review
  const newReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    bookId: parseInt(reviewData.bookId, 10),
    userId: reviewData.userId || 1,
    userName: reviewData.userName?.trim() || 'Anonymous Reader',
    userEmail: reviewData.userEmail || 'user@bookhive.org',
    rating: Number(reviewData.rating) || 5,
    comment: reviewData.comment?.trim() || '',
    createdAt: now,
    updatedAt: null
  };

  all.unshift(newReview);
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(all));
  trackMyReviewId(newReview.id);
  return newReview;
}

export function deleteReview(reviewId) {
  const all = getAllReviews();
  const filtered = all.filter(r => r.id !== reviewId);
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(filtered));
  untrackMyReviewId(reviewId);
  return true;
}

export function isReviewOwner(review, currentUser) {
  if (!review) return false;

  // Admins can manage any review
  const role = localStorage.getItem('archivalia_role');
  if (role === 'admin') return true;

  // Check browser-tracked created review IDs
  const myReviewIds = getMyReviewIds();
  if (myReviewIds.includes(review.id)) return true;

  // Check logged-in user profile match
  if (currentUser) {
    if (currentUser.user_id && review.userId && currentUser.user_id === review.userId) return true;
    if (currentUser.email && review.userEmail && currentUser.email.toLowerCase() === review.userEmail.toLowerCase()) return true;
    if (currentUser.name && review.userName && currentUser.name.toLowerCase() === review.userName.toLowerCase()) return true;
  }

  return false;
}

export function calculateRatingSummary(reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      average: 0,
      total: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  const total = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  const average = +(sum / total).toFixed(1);

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const star = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
    distribution[star] = (distribution[star] || 0) + 1;
  });

  const percentages = {
    5: Math.round((distribution[5] / total) * 100),
    4: Math.round((distribution[4] / total) * 100),
    3: Math.round((distribution[3] / total) * 100),
    2: Math.round((distribution[2] / total) * 100),
    1: Math.round((distribution[1] / total) * 100)
  };

  return { average, total, distribution, percentages };
}
