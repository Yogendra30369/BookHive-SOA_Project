// Utility to manage admin-added books in localStorage
const STORAGE_KEY   = 'archivalia_added_books';
const OVERRIDE_KEY  = 'archivalia_book_overrides';
const DELETED_KEY   = 'archivalia_deleted_book_ids'; // tracks deleted mock AND admin books

// ── Helpers ────────────────────────────────────────────────────────────────

export function getAdminBooks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function getBookOverrides() {
  try {
    const stored = localStorage.getItem(OVERRIDE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}

function getDeletedIds() {
  try {
    const stored = localStorage.getItem(DELETED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveDeletedIds(ids) {
  localStorage.setItem(DELETED_KEY, JSON.stringify(ids));
}

/**
 * Fires a synthetic StorageEvent so same-tab listeners (e.g. BookCatalog)
 * react immediately — native 'storage' only fires in OTHER tabs.
 */
function notifyBookChange(key) {
  try {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key,
        newValue: localStorage.getItem(key),
        storageArea: localStorage,
      })
    );
  } catch {
    // StorageEvent constructor not supported — silent fail
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

/** Add a brand-new book (admin only) */
export function saveAdminBook(book) {
  const books = getAdminBooks();
  const newBook = {
    ...book,
    book_id: Date.now(),
    type: book.type || 'Book',
    status: book.available_copies > 0 ? 'Available' : 'Unavailable',
    isAdminAdded: true,
  };
  books.push(newBook);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  notifyBookChange(STORAGE_KEY);
  return newBook;
}

/** Update any book (admin-added or mock override) */
export function updateBook(book_id, updates) {
  const id = parseInt(book_id);

  // Admin-added book → update in-place
  const adminBooks = getAdminBooks();
  const idx = adminBooks.findIndex(b => b.book_id === id);
  if (idx !== -1) {
    adminBooks[idx] = {
      ...adminBooks[idx],
      ...updates,
      status: updates.available_copies > 0 ? 'Available' : 'Unavailable',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(adminBooks));
    notifyBookChange(STORAGE_KEY);
    return;
  }

  // mockBook → store as override
  const overrides = getBookOverrides();
  overrides[id] = { ...overrides[id], ...updates };
  localStorage.setItem(OVERRIDE_KEY, JSON.stringify(overrides));
  notifyBookChange(OVERRIDE_KEY);
}

/** Delete any book by ID — works for both admin-added and mockBooks */
export function deleteBook(book_id) {
  const id = parseInt(book_id);

  // 1. Remove from admin-added list (if it's there)
  const adminBooks = getAdminBooks().filter(b => b.book_id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(adminBooks));
  notifyBookChange(STORAGE_KEY);

  // 2. Remove any override
  const overrides = getBookOverrides();
  delete overrides[id];
  localStorage.setItem(OVERRIDE_KEY, JSON.stringify(overrides));
  notifyBookChange(OVERRIDE_KEY);

  // 3. Record as deleted so getAllBooks filters it out (covers mockBooks too)
  const deleted = getDeletedIds();
  if (!deleted.includes(id)) {
    deleted.push(id);
    saveDeletedIds(deleted);
    notifyBookChange(DELETED_KEY);
  }
}

/** Returns all books: mockBooks (minus deleted, with overrides) + admin-added (minus deleted) */
export function getAllBooks(mockBooks) {
  const overrides  = getBookOverrides();
  const deletedIds = getDeletedIds();

  // Apply overrides to mockBooks, then filter deleted
  const merged = mockBooks
    .filter(b => !deletedIds.includes(b.book_id))
    .map(b => {
      if (overrides[b.book_id]) {
        const upd = overrides[b.book_id];
        return {
          ...b,
          ...upd,
          status: upd.available_copies !== undefined
            ? (upd.available_copies > 0 ? 'Available' : 'Unavailable')
            : b.status,
        };
      }
      return b;
    });

  // Admin-added books, also filtered
  const adminBooks = getAdminBooks().filter(b => !deletedIds.includes(b.book_id));

  return [...merged, ...adminBooks];
}
