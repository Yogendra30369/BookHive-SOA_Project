// Utility to manage recently viewed books in localStorage
// Keeps the last 5-10 viewed books, avoiding duplicates, with the newest viewed book first.

export const RECENTLY_VIEWED_KEY = 'archivalia_recently_viewed';
const MAX_RECENTLY_VIEWED = 10;

/**
 * Get the list of recently viewed books from localStorage.
 * Returns up to 10 books.
 */
export function getRecentlyViewed() {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error reading recently viewed books from localStorage', e);
    return [];
  }
}

/**
 * Save a book to the recently viewed list.
 * Deduplicates by book_id and prepends to the front.
 */
export function addRecentlyViewed(book) {
  if (!book || !book.book_id) return;

  try {
    const current = getRecentlyViewed();

    // Prepare clean summary object
    const bookEntry = {
      book_id: book.book_id,
      title: book.title,
      author: book.author,
      category: book.category,
      type: book.type,
      isbn: book.isbn,
      publisher: book.publisher,
      year: book.year,
      cover: book.cover,
      coverTextOnly: !!book.coverTextOnly,
      available_copies: book.available_copies,
      total_copies: book.total_copies,
      viewedAt: new Date().toISOString()
    };

    // Remove existing entry if already in list to avoid duplicates
    const filtered = current.filter(item => item.book_id !== book.book_id);

    // Prepend newest viewed book at the beginning and cap at MAX_RECENTLY_VIEWED
    const updated = [bookEntry, ...filtered].slice(0, MAX_RECENTLY_VIEWED);

    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving recently viewed book to localStorage', e);
  }
}

/**
 * Clear all recently viewed books from localStorage.
 */
export function clearRecentlyViewed() {
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
    return [];
  } catch (e) {
    console.error('Error clearing recently viewed books from localStorage', e);
    return [];
  }
}
