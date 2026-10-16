import { useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { mockBooks } from '../../data/mockData';
import { getAllBooks, saveAdminBook, updateBook } from '../../data/bookStore';
import { LuArrowLeft, LuBookPlus, LuSave, LuUpload, LuImage } from 'react-icons/lu';
import './Books.css';

const BOOK_TYPES = ['Book', 'Research Paper', 'Digital Media'];
const CATEGORIES = [
  'Computer Science', 'Machine Learning', 'Mathematics', 'Physics & Computing',
  'Chemistry', 'Biology', 'Economics', 'Finance & Economics',
  'Art & Design', 'Literature & History', 'Public Health', 'Audio Engineering', 'Other'
];

export default function BookForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const isEdit = !!id;
  const fileInputRef = useRef(null);

  // Pre-load existing book data for edit mode
  const existingBook = isEdit
    ? getAllBooks(mockBooks).find(b => b.book_id === parseInt(id))
    : null;

  const [form, setForm] = useState({
    title:            existingBook?.title      || '',
    author:           existingBook?.author     || '',
    isbn:             existingBook?.isbn       || '',
    publisher:        existingBook?.publisher  || '',
    category:         existingBook?.category   || 'Computer Science',
    type:             existingBook?.type       || 'Book',
    description:      existingBook?.description|| '',
    available_copies: existingBook?.available_copies ?? 1,
    total_copies:     existingBook?.total_copies     ?? 1,
    year:             existingBook?.year       || new Date().getFullYear(),
  });

  const [coverPreview, setCoverPreview] = useState(existingBook?.cover || '');
  const [coverBase64, setCoverBase64]   = useState('');
  const [coverMode, setCoverMode]       = useState('upload');
  const [coverUrl, setCoverUrl]         = useState(
    existingBook?.cover && existingBook.cover.startsWith('http') ? existingBook.cover : ''
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  // If editing and book has an http cover, default to URL mode
  const [initDone] = useState(() => {
    if (isEdit && existingBook?.cover?.startsWith('http')) {
      setCoverMode('url');
    }
    return true;
  });
  void initDone;

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverBase64(reader.result);
      setCoverPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim())  newErrors.title  = 'Book title is required.';
    if (!form.author.trim()) newErrors.author = 'Author is required.';
    if (!form.isbn.trim())   newErrors.isbn   = 'ISBN is required.';
    if (parseInt(form.available_copies) > parseInt(form.total_copies))
      newErrors.available_copies = 'Available copies cannot exceed total copies.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const cover = coverMode === 'upload'
      ? (coverBase64 || existingBook?.cover || null)
      : (coverUrl || null);

    const bookData = {
      ...form,
      cover,
      available_copies: parseInt(form.available_copies),
      total_copies:     parseInt(form.total_copies),
      year:             parseInt(form.year),
    };

    setLoading(true);
    setTimeout(() => {
      if (isEdit) {
        updateBook(id, bookData);
        toast.success(`"${form.title}" has been updated successfully!`);
      } else {
        saveAdminBook(bookData);
        toast.success(`"${form.title}" has been added to the catalog!`);
      }
      setLoading(false);
      navigate('/books');
    }, 600);
  };

  const finalCover = coverMode === 'upload'
    ? (coverPreview || existingBook?.cover || '')
    : coverUrl;

  // If editing a non-existent book
  if (isEdit && !existingBook) {
    return (
      <div className="book-form-page">
        <Link to="/books" className="back-link"><LuArrowLeft /> Back to Catalog</Link>
        <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '14px' }}>
          <p style={{ color: '#ef4444' }}>Book not found.</p>
          <Link to="/books" className="btn-reserve" style={{ marginTop: '16px', display: 'inline-flex' }}>
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="book-form-page">
      <Link to="/books" className="back-link">
        <LuArrowLeft /> Back to Catalog
      </Link>

      <div className="add-book-layout">
        {/* Left — Cover Preview */}
        <div className="add-book-preview-col">
          <h3 className="preview-title">Book Cover Preview</h3>
          <div className="cover-preview-box">
            {finalCover ? (
              <img src={finalCover} alt="Cover Preview" className="cover-preview-img" />
            ) : (
              <div className="cover-preview-placeholder">
                <LuImage size={48} color="#cbd5e1" />
                <p>No cover image yet</p>
              </div>
            )}
          </div>

          {/* Toggle upload / url */}
          <div className="cover-mode-toggle">
            <button type="button" className={`cover-mode-btn ${coverMode === 'upload' ? 'active' : ''}`} onClick={() => setCoverMode('upload')}>
              Upload File
            </button>
            <button type="button" className={`cover-mode-btn ${coverMode === 'url' ? 'active' : ''}`} onClick={() => setCoverMode('url')}>
              Image URL
            </button>
          </div>

          {coverMode === 'upload' ? (
            <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
              <LuUpload size={20} color="#94a3b8" />
              <p>Click to upload a book cover image</p>
              <span>JPG, PNG, WEBP supported</span>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>
          ) : (
            <div className="add-book-field">
              <label className="add-book-label">IMAGE URL</label>
              <input
                type="url"
                className="add-book-input"
                placeholder="https://example.com/cover.jpg"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Right — Form */}
        <div className="add-book-form-col">
          <div className="add-book-header">
            {isEdit ? <LuSave size={22} color="#C9A84C" /> : <LuBookPlus size={22} color="#C9A84C" />}
            <div>
              <h2 className="add-book-title font-serif">
                {isEdit ? 'Edit Book' : 'Add New Book'}
              </h2>
              <p className="add-book-subtitle">
                {isEdit ? 'Update the book details below' : 'Fill in the details to add a book to the catalog'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="add-book-form">
            {/* Title */}
            <div className="add-book-field">
              <label className="add-book-label">BOOK TITLE <span className="required">*</span></label>
              <input className={`add-book-input ${errors.title ? 'input-error' : ''}`} placeholder="e.g., Introduction to Algorithms" value={form.title} onChange={e => handleChange('title', e.target.value)} />
              {errors.title && <p className="field-error">{errors.title}</p>}
            </div>

            {/* Author */}
            <div className="add-book-field">
              <label className="add-book-label">AUTHOR <span className="required">*</span></label>
              <input className={`add-book-input ${errors.author ? 'input-error' : ''}`} placeholder="e.g., Thomas H. Cormen" value={form.author} onChange={e => handleChange('author', e.target.value)} />
              {errors.author && <p className="field-error">{errors.author}</p>}
            </div>

            {/* ISBN + Publisher */}
            <div className="add-book-row">
              <div className="add-book-field">
                <label className="add-book-label">ISBN <span className="required">*</span></label>
                <input className={`add-book-input ${errors.isbn ? 'input-error' : ''}`} placeholder="e.g., 978-0262046305" value={form.isbn} onChange={e => handleChange('isbn', e.target.value)} />
                {errors.isbn && <p className="field-error">{errors.isbn}</p>}
              </div>
              <div className="add-book-field">
                <label className="add-book-label">PUBLISHER</label>
                <input className="add-book-input" placeholder="e.g., MIT Press" value={form.publisher} onChange={e => handleChange('publisher', e.target.value)} />
              </div>
            </div>

            {/* Category + Type */}
            <div className="add-book-row">
              <div className="add-book-field">
                <label className="add-book-label">CATEGORY</label>
                <select className="add-book-input" value={form.category} onChange={e => handleChange('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="add-book-field">
                <label className="add-book-label">TYPE</label>
                <select className="add-book-input" value={form.type} onChange={e => handleChange('type', e.target.value)}>
                  {BOOK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Year + Available + Total */}
            <div className="add-book-row add-book-row-3">
              <div className="add-book-field">
                <label className="add-book-label">YEAR</label>
                <input type="number" className="add-book-input" value={form.year} onChange={e => handleChange('year', e.target.value)} min="1900" max="2030" />
              </div>
              <div className="add-book-field">
                <label className="add-book-label">AVAILABLE COPIES <span className="required">*</span></label>
                <input type="number" className={`add-book-input ${errors.available_copies ? 'input-error' : ''}`} value={form.available_copies} onChange={e => handleChange('available_copies', e.target.value)} min="0" />
                {errors.available_copies && <p className="field-error">{errors.available_copies}</p>}
              </div>
              <div className="add-book-field">
                <label className="add-book-label">TOTAL COPIES</label>
                <input type="number" className="add-book-input" value={form.total_copies} onChange={e => handleChange('total_copies', e.target.value)} min="1" />
              </div>
            </div>

            {/* Description */}
            <div className="add-book-field">
              <label className="add-book-label">DESCRIPTION</label>
              <textarea className="add-book-input add-book-textarea" placeholder="Brief description of the book..." rows={3} value={form.description} onChange={e => handleChange('description', e.target.value)} />
            </div>

            {/* Actions */}
            <div className="add-book-actions">
              <button type="button" className="btn-add-cancel" onClick={() => navigate('/books')}>Cancel</button>
              <button type="submit" className="btn-add-submit" disabled={loading}>
                {loading ? 'Saving...' : isEdit
                  ? <><LuSave size={16} /> Save Changes</>
                  : <><LuBookPlus size={16} /> Add to Catalog</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
