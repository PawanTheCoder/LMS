import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, BookOpen, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import apiService from '../../services/api'; // Make sure this path is correct
import styles from './ManageBooks.module.css';

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'fiction',
    publishedYear: new Date().getFullYear(),
    description: '',
    totalCopies: 1,
    availableCopies: 1
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['fiction', 'fantasy', 'programming', 'non-fiction', 'reference', 'textbook', 'biography', 'science', 'history', 'other'];

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const booksData = await apiService.getBooks();
      setBooks(booksData);
      setFilteredBooks(booksData);
    } catch (error) {
      console.error('Error loading books:', error);
      showMessage('error', 'Failed to load books');
      setBooks([]);
      setFilteredBooks([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Filter books
    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (book.isbn && book.isbn.includes(searchTerm))
    );
    setFilteredBooks(filtered);
  }, [books, searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalCopies' || name === 'publishedYear' ? parseInt(value) || 0 : value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category: 'fiction',
      publishedYear: new Date().getFullYear(),
      description: '',
      totalCopies: 1,
      availableCopies: 1
    });
    setEditingBook(null);
    setShowAddForm(false);
    setIsSubmitting(false);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.title.trim() || !formData.author.trim()) {
      showMessage('error', 'Title and author are required');
      setIsSubmitting(false);
      return;
    }

    try {
      // Calculate available copies based on total copies
      const bookData = {
        ...formData,
        availableCopies: formData.totalCopies, // When adding, all copies are available
        rating: 0 // Default rating
      };

      const newBook = await apiService.addBook(bookData);

      // Update local state with the new book from backend
      setBooks(prev => [...prev, newBook]);
      showMessage('success', 'Book added successfully');
      resetForm();
    } catch (error) {
      console.error('Error adding book:', error);
      showMessage('error', 'Failed to add book. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      category: book.category || 'fiction',
      publishedYear: book.publishedYear || new Date().getFullYear(),
      description: book.description || '',
      totalCopies: book.totalCopies || 1,
      availableCopies: book.availableCopies || 1
    });
    setShowAddForm(true);
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.title.trim() || !formData.author.trim()) {
      showMessage('error', 'Title and author are required');
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedBookData = {
        ...formData,
        id: editingBook.id
      };

      const updatedBook = await apiService.updateBook(editingBook.id, updatedBookData);

      // Update local state
      setBooks(prev => prev.map(book =>
        book.id === editingBook.id ? updatedBook : book
      ));

      showMessage('success', 'Book updated successfully');
      resetForm();
    } catch (error) {
      console.error('Error updating book:', error);
      showMessage('error', 'Failed to update book. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteBook(bookId);

      // Update local state
      setBooks(prev => prev.filter(book => book.id !== bookId));
      showMessage('success', 'Book deleted successfully');
    } catch (error) {
      console.error('Error deleting book:', error);
      showMessage('error', 'Failed to delete book. Please try again.');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  if (isLoading) {
    return (
      <div className={styles.manageBooksContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.manageBooksContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Books</h1>
        <p className={styles.subtitle}>Add, edit, and remove books from the library</p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Search and Add Button */}
      <div className={styles.controlsSection}>
        <div className={styles.searchContainer}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search books by title, author, or ISBN..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className={styles.addButton}
          disabled={isSubmitting}
        >
          <Plus size={18} />
          Add New Book
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className={styles.formSection}>
          <div className={styles.formHeader}>
            <h3>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
            <button
              onClick={resetForm}
              className={styles.closeButton}
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={editingBook ? handleUpdateBook : handleAddBook} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="author">Author *</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="isbn">ISBN</label>
                <input
                  type="text"
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={styles.select}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="publishedYear">Published Year</label>
                <input
                  type="number"
                  id="publishedYear"
                  name="publishedYear"
                  value={formData.publishedYear}
                  onChange={handleInputChange}
                  min="1000"
                  max={new Date().getFullYear()}
                  disabled={isSubmitting}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="totalCopies">Total Copies</label>
                <input
                  type="number"
                  id="totalCopies"
                  name="totalCopies"
                  value={formData.totalCopies}
                  onChange={handleInputChange}
                  min="1"
                  disabled={isSubmitting}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                disabled={isSubmitting}
                className={styles.textarea}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={resetForm}
                className={styles.cancelButton}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className={styles.loadingSpinnerSmall}></div>
                ) : (
                  <Save size={16} />
                )}
                {editingBook ? 'Update Book' : 'Add Book'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Books List */}
      <div className={styles.booksSection}>
        <h3 className={styles.sectionTitle}>
          Books ({filteredBooks.length})
        </h3>

        {filteredBooks.length === 0 ? (
          <div className={styles.noResults}>
            <BookOpen size={48} />
            <h4>No books found</h4>
            <p>Try adjusting your search terms or add a new book</p>
          </div>
        ) : (
          <div className={styles.booksList}>
            {filteredBooks.map(book => (
              <div key={book.id} className={styles.bookCard}>
                <div className={styles.bookInfo}>
                  <h4 className={styles.bookTitle}>{book.title}</h4>
                  <p className={styles.bookAuthor}>by {book.author}</p>
                  <div className={styles.bookDetails}>
                    <span className={styles.bookCategory}>{book.category}</span>
                    <span className={styles.bookYear}>{book.publishedYear}</span>
                    {book.isbn && <span className={styles.bookIsbn}>ISBN: {book.isbn}</span>}
                  </div>
                  <div className={styles.availability}>
                    <span className={book.availableCopies > 0 ? styles.available : styles.unavailable}>
                      {book.availableCopies} of {book.totalCopies} available
                    </span>
                  </div>
                  {book.description && (
                    <p className={styles.bookDescription}>{book.description}</p>
                  )}
                </div>

                <div className={styles.bookActions}>
                  <button
                    onClick={() => handleEditBook(book)}
                    className={styles.editButton}
                    title="Edit book"
                    disabled={isSubmitting}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    className={styles.deleteButton}
                    title="Delete book"
                    disabled={isSubmitting}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBooks;