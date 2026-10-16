// ─────────────────────────────────────────────────────────────────────────────
//  Reservation Store — single source of truth for the reservation lifecycle
//
//  Status flow:
//    PENDING  →  (admin issues)  →  ACTIVE  →  (admin confirms return)  →  RETURNED
// ─────────────────────────────────────────────────────────────────────────────

const KEY = 'archivalia_reservations';

// ── Seed data so admin already has something to manage on first load ─────────
const SEED_RESERVATIONS = [
  {
    id: 'res-seed-1',
    book_id: 5,
    book_title: 'Introduction to Algorithms, 4th Edition',
    book_author: 'Thomas H. Cormen, Charles E. Leiserson...',
    book_cover: 'https://images.unsplash.com/photo-1507842229451-9f01079ca4b5?w=300&h=400&fit=crop',
    book_type: 'Book',
    user_id: 99,
    user_name: 'Alice Johnson',
    user_email: 'alice@university.edu',
    status: 'ACTIVE',
    reserved_at: '2026-09-10T09:00:00Z',
    issue_date: '2026-09-11',
    due_date: '2026-09-25',
    actual_return: null,
  },
  {
    id: 'res-seed-2',
    book_id: 7,
    book_title: 'Molecular Biology of the Cell, 7th Ed.',
    book_author: 'Bruce Alberts, Rebecca Heald',
    book_cover: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=300&h=400&fit=crop',
    book_type: 'Book',
    user_id: 99,
    user_name: 'Alice Johnson',
    user_email: 'alice@university.edu',
    status: 'OVERDUE',
    reserved_at: '2026-08-10T10:00:00Z',
    issue_date: '2026-08-11',
    due_date: '2026-08-25',
    actual_return: null,
  },
  {
    id: 'res-seed-3',
    book_id: 4,
    book_title: 'Deep Learning for Computer Vision',
    book_author: 'Euisoon Lee, Heungsub Kim',
    book_cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=400&fit=crop',
    book_type: 'Research Paper',
    user_id: 99,
    user_name: 'Alice Johnson',
    user_email: 'alice@university.edu',
    status: 'RETURNED',
    reserved_at: '2026-08-01T08:00:00Z',
    issue_date: '2026-08-02',
    due_date: '2026-08-16',
    actual_return: '2026-08-15',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function isReservationForUser(res, userOrId) {
  if (!res || !userOrId) return false;

  if (typeof userOrId === 'object') {
    const user = userOrId;
    // Email matching takes highest precedence
    if (res.user_email && user.email) {
      return res.user_email.trim().toLowerCase() === user.email.trim().toLowerCase();
    }
    // Name matching
    if (res.user_name && user.name) {
      return res.user_name.trim().toLowerCase() === user.name.trim().toLowerCase();
    }
    return res.user_id === user.user_id;
  }

  // If numeric or string ID was passed, check current logged in user from localStorage
  try {
    const s = localStorage.getItem('archivalia_user');
    if (s) {
      const u = JSON.parse(s);
      if (u && (u.email || u.name)) {
        return isReservationForUser(res, u);
      }
    }
  } catch { /* ignore */ }

  return res.user_id === userOrId;
}

function loadReservations() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  // First visit: seed with demo data
  saveReservations(SEED_RESERVATIONS);
  return SEED_RESERVATIONS;
}

function saveReservations(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
  // Dispatch synthetic StorageEvent so same-tab listeners also react
  try {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: KEY,
        newValue: localStorage.getItem(KEY),
        storageArea: localStorage,
      })
    );
  } catch { /* silent */ }
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Return every reservation (all users, all statuses) */
export function getReservations() {
  return loadReservations();
}

/** Return reservations for a specific user (handles object or userId) */
export function getUserReservations(userOrId) {
  return loadReservations().filter((r) => isReservationForUser(r, userOrId));
}

/**
 * User calls this when they click "Reserve" on a book.
 * Creates a PENDING reservation and returns it.
 */
export function addReservation(book, user) {
  const list = loadReservations();

  // Prevent duplicate pending/active reservation for the same book+user
  const exists = list.some(
    (r) =>
      r.book_id === book.book_id &&
      r.user_id === user.user_id &&
      (r.status === 'PENDING' || r.status === 'ACTIVE')
  );
  if (exists) return null; // duplicate

  const newRes = {
    id: `res-${Date.now()}`,
    book_id: book.book_id,
    book_title: book.title,
    book_author: book.author,
    book_cover: book.cover || null,
    book_type: book.type || 'Book',
    user_id: user.user_id,
    user_name: user.name,
    user_email: user.email || '',
    status: 'PENDING',
    reserved_at: new Date().toISOString(),
    issue_date: null,
    due_date: null,
    actual_return: null,
  };

  list.unshift(newRes); // newest first
  saveReservations(list);
  return newRes;
}

/**
 * Admin calls this to hand the book to the user.
 * PENDING → ACTIVE. Sets issue_date and due_date (14 days).
 */
export function issueReservation(reservationId) {
  const list = loadReservations();
  const idx = list.findIndex((r) => r.id === reservationId);
  if (idx === -1) return false;

  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 14);

  list[idx] = {
    ...list[idx],
    status: 'ACTIVE',
    issue_date: today.toISOString().split('T')[0],
    due_date: due.toISOString().split('T')[0],
  };

  saveReservations(list);
  return true;
}

/**
 * Admin calls this when the user hands the book back.
 * ACTIVE / OVERDUE → RETURNED. Records actual_return date.
 */
export function returnReservation(reservationId) {
  const list = loadReservations();
  const idx = list.findIndex((r) => r.id === reservationId);
  if (idx === -1) return false;

  list[idx] = {
    ...list[idx],
    status: 'RETURNED',
    actual_return: new Date().toISOString().split('T')[0],
  };

  saveReservations(list);
  return true;
}

/** The localStorage key — used by components to subscribe to storage events */
export const RESERVATION_KEY = KEY;
