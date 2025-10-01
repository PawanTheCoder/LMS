import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../App';
import { Search, Filter, BookOpen, Clock, CheckCircle, AlertCircle, User, Calendar, Star, Eye, EyeOff } from 'lucide-react';
import apiService from '../../services/api';
import styles from './StudentPanel.module.css';

const StudentPanel = () => {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [borrowingHistory, setBorrowingHistory] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('browse');
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [canBorrowMore, setCanBorrowMore] = useState(true);

  const categories = ['all', 'fiction', 'fantasy', 'programming', 'non-fiction', 'reference', 'textbook', 'biography', 'science', 'history', 'other'];

  const loadStudentData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Loading student data for user:', user?.id);

      // Fetch all data in parallel
      const [booksData, activeBorrowingsData, historyBorrowingsData, canBorrowData] = await Promise.all([
        apiService.getAvailableBooks().catch(err => {
          console.error('Error fetching available books:', err);
          return [];
        }),
        user?.id ? apiService.getUserActiveBorrowings(user.id).catch(err => {
          console.error('Error fetching active borrowings:', err);
          return [];
        }) : Promise.resolve([]),
        user?.id ? apiService.getUserBorrowings(user.id).catch(err => {
          console.error('Error fetching user borrowings:', err);
          return [];
        }) : Promise.resolve([]),
        user?.id ? apiService.canUserBorrow(user.id).catch(err => {
          console.error('Error checking borrowing eligibility:', err);
          return { canBorrow: true };
        }) : Promise.resolve({ canBorrow: true })
      ]);

      console.log('Books data:', booksData);
      console.log('Active borrowings:', activeBorrowingsData);
      console.log('All borrowings:', historyBorrowingsData);
      console.log('Can borrow data:', canBorrowData);

      setBooks(booksData || []);
      setFilteredBooks(booksData || []);
      setCanBorrowMore(canBorrowData.canBorrow);

      // Separate active borrowings and history from all borrowings
      const activeBorrowings = (historyBorrowingsData || []).filter(b =>
        b.status === 'BORROWED' || b.status === 'ACTIVE' || b.status === 'PENDING'
      );
      const history = (historyBorrowingsData || []).filter(b =>
        b.status === 'RETURNED' || b.status === 'COMPLETED' || b.status === 'OVERDUE'
      );

      // Use active borrowings from dedicated endpoint if available, otherwise use filtered data
      setBorrowedBooks(activeBorrowingsData.length > 0 ? activeBorrowingsData : activeBorrowings);
      setBorrowingHistory(history);

    } catch (error) {
      console.error('Error loading student data:', error);
      setError('Failed to load data. Please try again.');
      setBooks([]);
      setFilteredBooks([]);
      setBorrowedBooks([]);
      setBorrowingHistory([]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (user?.id) {
      loadStudentData();
    } else {
      setIsLoading(false);
      setError('User not found. Please log in again.');
    }
  }, [user?.id]);

  // Reload data when switching to "My Books" tab to ensure fresh data
  useEffect(() => {
    if (activeTab === 'borrowed' && user?.id) {
      loadBorrowedBooks();
    }
  }, [activeTab]);

  const loadBorrowedBooks = async () => {
    try {
      const activeBorrowings = await apiService.getUserActiveBorrowings(user.id);
      console.log('Reloaded active borrowings:', activeBorrowings);
      setBorrowedBooks(activeBorrowings || []);
    } catch (error) {
      console.error('Error reloading borrowed books:', error);
    }
  };

  useEffect(() => {
    const loadStudentData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Loading student data for user:', user?.id);

        // Fetch all data in parallel
        const [booksData, borrowingsData, canBorrowData] = await Promise.all([
          apiService.getAvailableBooks().catch(err => {
            console.error('Error fetching available books:', err);
            return [];
          }),
          user?.id ? apiService.getUserBorrowings(user.id).catch(err => {
            console.error('Error fetching user borrowings:', err);
            return [];
          }) : Promise.resolve([]),
          user?.id ? apiService.canUserBorrow(user.id).catch(err => {
            console.error('Error checking borrowing eligibility:', err);
            return { canBorrow: true }; // Default to true if check fails
          }) : Promise.resolve({ canBorrow: true })
        ]);

        console.log('Books data:', booksData);
        console.log('Borrowings data:', borrowingsData);
        console.log('Can borrow data:', canBorrowData);

        setBooks(booksData || []);
        setFilteredBooks(booksData || []);
        setCanBorrowMore(canBorrowData.canBorrow);

        // Separate active borrowings and history
        const activeBorrowings = (borrowingsData || []).filter(b =>
          b.status === 'BORROWED' || b.status === 'ACTIVE' || b.status === 'PENDING'
        );
        const history = (borrowingsData || []).filter(b =>
          b.status === 'RETURNED' || b.status === 'COMPLETED' || b.status === 'OVERDUE'
        );

        setBorrowedBooks(activeBorrowings);
        setBorrowingHistory(history);

      } catch (error) {
        console.error('Error loading student data:', error);
        setError('Failed to load data. Please try again.');
        setBooks([]);
        setFilteredBooks([]);
        setBorrowedBooks([]);
        setBorrowingHistory([]);
      }

      setIsLoading(false);
    };

    if (user?.id) {
      loadStudentData();
    } else {
      setIsLoading(false);
      setError('User not found. Please log in again.');
    }
  }, [user?.id]);

  useEffect(() => {
    // Filter and sort books based on current filters
    let filtered = [...books];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          return (a.title || '').localeCompare(b.title || '');
        case 'author':
          return (a.author || '').localeCompare(b.author || '');
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

  const handleBorrowBook = async (bookId) => {
    if (!user?.id) {
      setError('Please log in to borrow books');
      return;
    }

    if (!canBorrowMore) {
      setError('You cannot borrow more books. Please return your current books first.');
      return;
    }

    setActionLoading(`borrow-${bookId}`);
    setError(null);

    try {
      console.log('🔍 Borrow attempt for book:', bookId);

      // Borrow the book
      const result = await apiService.borrowBook(bookId);
      console.log('✅ Borrow successful:', result);

      // Reload all data to ensure consistency
      await loadStudentData();

      // Show success message
      setError({ type: 'success', text: 'Book borrowed successfully!' });

    } catch (error) {
      console.error('❌ Borrow failed:', error);
      const errorMessage = error.message || 'Failed to borrow book. Please try again.';

      if (errorMessage.includes('already borrowed') || errorMessage.includes('cannot borrow')) {
        setCanBorrowMore(false);
      }

      setError(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturnBook = async (borrowingId) => {
    setActionLoading(`return-${borrowingId}`);
    setError(null);

    try {
      console.log('Returning borrowing:', borrowingId);
      const result = await apiService.returnBook(borrowingId);
      console.log('✅ Return successful:', result);

      // Reload all data after successful return
      await loadStudentData();

      // Show success message
      setError({ type: 'success', text: 'Book returned successfully!' });

    } catch (error) {
      console.error('Error returning book:', error);
      setError(error.message || 'Failed to return book. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const renderStars = (rating) => {
    if (!rating || rating === 0) return null;

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const isBookBorrowed = (bookId) => {
    return borrowedBooks.some(borrowing => borrowing.book?.id === bookId);
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  // Fix the "My Books" tab rendering
  const renderBorrowedBooks = () => {
    if (borrowedBooks.length === 0) {
      return (
        <div className={styles.noBooks}>
          <Clock size={48} />
          <h3>No borrowed books</h3>
          <p>You haven't borrowed any books yet</p>
          <button
            className={styles.browseButton}
            onClick={() => setActiveTab('browse')}
          >
            Browse Books
          </button>
        </div>
      );
    }

    return borrowedBooks.map(borrowing => {
      const isReturning = actionLoading === `return-${borrowing.id}`;
      const overdue = isOverdue(borrowing.dueDate);

      return (
        <div key={borrowing.id} className={`${styles.borrowedCard} ${overdue ? styles.overdue : ''}`}>
          <div className={styles.bookInfo}>
            <h3 className={styles.bookTitle}>{borrowing.book?.title || 'Unknown Book'}</h3>
            <p className={styles.bookAuthor}>by {borrowing.book?.author || 'Unknown Author'}</p>
            <div className={styles.borrowingDetails}>
              <p><strong>Borrowed:</strong> {formatDate(borrowing.borrowDate)}</p>
              <p><strong>Due:</strong> {formatDate(borrowing.dueDate)}</p>
              <p><strong>Status:</strong>
                <span className={borrowing.status === 'OVERDUE' ? styles.overdueText : styles.statusText}>
                  {borrowing.status}
                </span>
              </p>
              {overdue && (
                <p className={styles.overdueWarning}>
                  <AlertCircle size={14} />
                  Overdue - Please return immediately
                </p>
              )}
            </div>
          </div>
          <div className={styles.borrowingActions}>
            <button
              className={styles.returnButton}
              onClick={() => handleReturnBook(borrowing.id)}
              disabled={isReturning}
            >
              {isReturning ? (
                <div className={styles.smallSpinner}></div>
              ) : (
                <CheckCircle size={16} />
              )}
              {isReturning ? 'Returning...' : 'Return Book'}
            </button>
          </div>
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className={styles.studentContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.studentContainer}>
      <div className={styles.studentHeader}>
        <div>
          <h1 className={styles.studentTitle}>Mayur's Library</h1>
          <p className={styles.studentSubtitle}>
            Welcome back, {user?.firstName || user?.username || 'Student'}!
            {!canBorrowMore && borrowedBooks.length > 0 && (
              <span className={styles.borrowingWarning}>
                You have {borrowedBooks.length} book(s) borrowed. Return them to borrow more.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`${styles.errorMessage} ${error.type === 'success' ? styles.successMessage : ''}`}>
          <AlertCircle size={16} />
          <span>{error.text || error}</span>
          <button
            onClick={() => setError(null)}
            className={styles.dismissError}
          >
            ×
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tabButton} ${activeTab === 'browse' ? styles.active : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          <BookOpen size={16} />
          Browse Books
          <span className={styles.tabCount}>({filteredBooks.length})</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'borrowed' ? styles.active : ''}`}
          onClick={() => setActiveTab('borrowed')}
        >
          <Clock size={16} />
          My Books
          <span className={styles.tabCount}>({borrowedBooks.length})</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'history' ? styles.active : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Calendar size={16} />
          History
          <span className={styles.tabCount}>({borrowingHistory.length})</span>
        </button>
      </div>

      {/* Browse Books Tab */}
      {activeTab === 'browse' && (
        <div className={styles.tabContent}>
          {/* Search and Filter Controls */}
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
                      {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
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

          {/* Borrowing Status Alert */}
          {!canBorrowMore && (
            <div className={styles.borrowingAlert}>
              <AlertCircle size={16} />
              <span>You cannot borrow more books until you return your current books.</span>
            </div>
          )}

          {/* Books Grid/List */}
          <div className={`${styles.booksGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
            {filteredBooks.length === 0 ? (
              <div className={styles.noBooks}>
                <BookOpen size={48} />
                <h3>No books found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredBooks.map(book => {
                const isAlreadyBorrowed = isBookBorrowed(book.id);
                const isBorrowing = actionLoading === `borrow-${book.id}`;
                const canBorrow = canBorrowMore && book.availableCopies > 0 && !isAlreadyBorrowed;

                return (
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
                          <span className={styles.ratingText}>({book.rating?.toFixed(1)})</span>
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
                        {isAlreadyBorrowed ? (
                          <button className={styles.borrowedButton} disabled>
                            <CheckCircle size={16} />
                            Already Borrowed
                          </button>
                        ) : !canBorrowMore ? (
                          <button className={styles.cannotBorrowButton} disabled>
                            <AlertCircle size={16} />
                            Return Books to Borrow
                          </button>
                        ) : book.availableCopies > 0 ? (
                          <button
                            className={styles.borrowButton}
                            onClick={() => handleBorrowBook(book.id)}
                            disabled={isBorrowing}
                          >
                            {isBorrowing ? (
                              <div className={styles.smallSpinner}></div>
                            ) : (
                              <BookOpen size={16} />
                            )}
                            {isBorrowing ? 'Borrowing...' : 'Borrow Book'}
                          </button>
                        ) : (
                          <button className={styles.unavailableButton} disabled>
                            Not Available
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Borrowed Books Tab */}
      {activeTab === 'borrowed' && (
        <div className={styles.tabContent}>
          <div className={styles.borrowedHeader}>
            <h2>My Borrowed Books</h2>
            <p>Books you currently have borrowed</p>
            <button
              className={styles.refreshButton}
              onClick={loadBorrowedBooks}
              disabled={actionLoading}
            >
              Refresh
            </button>
          </div>

          <div className={styles.borrowedBooks}>
            {renderBorrowedBooks()}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className={styles.tabContent}>
          <div className={styles.historyList}>
            {borrowingHistory.length === 0 ? (
              <div className={styles.noBooks}>
                <Calendar size={48} />
                <h3>No borrowing history</h3>
                <p>Your borrowing history will appear here</p>
              </div>
            ) : (
              borrowingHistory.map(borrowing => (
                <div key={borrowing.id} className={styles.historyCard}>
                  <div className={styles.bookInfo}>
                    <h3 className={styles.bookTitle}>{borrowing.book?.title}</h3>
                    <p className={styles.bookAuthor}>by {borrowing.book?.author}</p>
                    <div className={styles.historyDetails}>
                      <p><strong>Borrowed:</strong> {formatDate(borrowing.borrowDate)}</p>
                      <p><strong>Returned:</strong> {formatDate(borrowing.returnDate)}</p>
                    </div>
                  </div>
                  <div className={styles.statusBadge}>
                    <CheckCircle size={16} />
                    Returned
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPanel;