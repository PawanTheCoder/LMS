import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, BookOpen, User, Calendar, Star, Eye, EyeOff } from 'lucide-react';
import apiService from '../../services/api';
import styles from './Books.module.css';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const navigate = useNavigate();

  const categories = ['all', 'fiction', 'non-fiction', 'reference', 'textbook', 'biography'];

  useEffect(() => {
    const loadBooks = async () => {
      setIsLoading(true);

      try {
        const booksData = await apiService.getBooks();
        setBooks(booksData);
        setFilteredBooks(booksData);
      } catch (error) {
        console.error('Error loading books:', error);
        // Fallback to empty array if API fails
        setBooks([]);
        setFilteredBooks([]);
      }

      setIsLoading(false);
    };

    loadBooks();
  }, []);

  useEffect(() => {
    // Filter and sort books based on current filters
    let filtered = [...books];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(book =>
        book.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'year':
          return (b.publishedYear || 0) - (a.publishedYear || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    setFilteredBooks(filtered);
  }, [books, searchTerm, selectedCategory, sortBy]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  const handleViewDetails = (bookId) => {
    navigate(`/books/${bookId}`);
  };

  const handleEditBook = (bookId) => {
    navigate(`/books/${bookId}/edit`);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={14} className={styles.star} fill="currentColor" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={14} className={styles.star} fill="currentColor" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={14} className={styles.starEmpty} />);
    }

    return stars;
  };

  if (isLoading) {
    return (
      <div className={styles.booksContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.booksContainer}>
      <div className={styles.booksHeader}>
        <div>
          <h1 className={styles.booksTitle}>Books</h1>
          <p className={styles.booksSubtitle}>Browse and manage the library collection</p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className={styles.controlsWrapper}>
        <div className={styles.controlsSection}>
          <div className={styles.searchContainer}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search books by title, author, or category..."
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filtersContainer}>
            <div className={styles.filterGroup}>
              <Filter size={16} />
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className={styles.filterSelect}
              >
                <option value="all">All Categories</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className={styles.filterSelect}
              >
                <option value="title">Sort by Title</option>
                <option value="author">Sort by Author</option>
                <option value="year">Sort by Year</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>

            <button
              onClick={toggleViewMode}
              className={styles.viewToggle}
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Books Grid/List */}
      <div className={`${styles.booksGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
        {filteredBooks.length === 0 ? (
          <div className={styles.noBooks}>
            <BookOpen size={48} />
            <h3>No books found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredBooks.map(book => (
            <div key={book.id} className={styles.bookCard}>
              <div className={styles.bookCover}>
                {book.coverImageUrl ? (
                  <img src={book.coverImageUrl} alt={book.title} />
                ) : (
                  <div className={styles.placeholderCover}>
                    <BookOpen size={32} />
                  </div>
                )}
                <div className={styles.bookStatus}>
                  {book.availableCopies > 0 ? (
                    <span className={styles.available}>Available</span>
                  ) : (
                    <span className={styles.unavailable}>Unavailable</span>
                  )}
                </div>
              </div>

              <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>{book.title}</h3>
                <p className={styles.bookAuthor}>by {book.author}</p>
                <p className={styles.bookCategory}>{book.category}</p>
                <p className={styles.bookYear}>{book.publishedYear}</p>

                {book.rating > 0 && (
                  <div className={styles.bookRating}>
                    {renderStars(book.rating)}
                    <span className={styles.ratingText}>({book.rating.toFixed(1)})</span>
                  </div>
                )}

                <div className={styles.bookAvailability}>
                  <span className={styles.availabilityText}>
                    {book.availableCopies} of {book.totalCopies} available
                  </span>
                </div>

                {book.description && (
                  <p className={styles.bookDescription}>{book.description}</p>
                )}

                <div className={styles.bookActions}>
                  <button
                    className={styles.infoButton}
                    onClick={() => handleViewDetails(book.id)}
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditBook(book.id)}
                  >
                    <BookOpen size={16} />
                    Edit Book
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Books;