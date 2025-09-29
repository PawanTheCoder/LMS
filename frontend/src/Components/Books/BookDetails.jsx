import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, BookOpen, Star, Copy, AlertCircle } from 'lucide-react';
import apiService from '../../services/api';
import styles from './BookDetails.module.css';

const BookDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBorrowing, setIsBorrowing] = useState(false);
    const [error, setError] = useState('');
    const [borrowError, setBorrowError] = useState(''); // Separate error for borrowing

    const handleBorrowBook = async () => {
        try {
            setIsBorrowing(true);
            setBorrowError(''); // Clear previous errors

            console.log('Attempting to borrow book:', book.id);
            console.log('Current user:', apiService.getCurrentUser());

            await apiService.borrowBook(book.id);

            // Reload book data to update availability
            const updatedBook = await apiService.getBookById(id);
            setBook(updatedBook);
            alert('Book borrowed successfully!');
        } catch (error) {
            console.error('Error borrowing book:', error);
            setBorrowError(error.message || 'Failed to borrow book. Please try again.');
        } finally {
            setIsBorrowing(false);
        }
    };

    useEffect(() => {
        const loadBook = async () => {
            try {
                setIsLoading(true);
                const bookData = await apiService.getBookById(id);
                setBook(bookData);
            } catch (err) {
                setError('Failed to load book details');
                console.error('Error loading book:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadBook();
    }, [id]);

    const handleBack = () => {
        navigate('/books');
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} size={20} className={styles.star} fill="currentColor" />);
        }

        if (hasHalfStar) {
            stars.push(<Star key="half" size={20} className={styles.star} fill="currentColor" />);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} size={20} className={styles.starEmpty} />);
        }

        return stars;
    };

    if (isLoading) {
        return (
            <div className={styles.detailsContainer}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Loading book details...</p>
                </div>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className={styles.detailsContainer}>
                <div className={styles.errorContainer}>
                    <h3>Book not found</h3>
                    <p>{error || 'The requested book could not be found.'}</p>
                    <button onClick={handleBack} className={styles.backButton}>
                        <ArrowLeft size={16} />
                        Back to Books
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.detailsContainer}>
            <button onClick={handleBack} className={styles.backButton}>
                <ArrowLeft size={16} />
                Back to Books
            </button>

            <div className={styles.bookDetails}>
                <div className={styles.bookCoverSection}>
                    {book.coverImageUrl ? (
                        <img src={book.coverImageUrl} alt={book.title} className={styles.coverImage} />
                    ) : (
                        <div className={styles.placeholderCover}>
                            <BookOpen size={48} />
                        </div>
                    )}

                    <div className={styles.availabilityBadge}>
                        {book.availableCopies > 0 ? (
                            <span className={styles.available}>Available ({book.availableCopies} copies)</span>
                        ) : (
                            <span className={styles.unavailable}>Currently Unavailable</span>
                        )}
                    </div>
                </div>

                <div className={styles.bookInfoSection}>
                    <h1 className={styles.bookTitle}>{book.title}</h1>
                    <p className={styles.bookAuthor}>
                        <User size={16} />
                        by {book.author}
                    </p>

                    <div className={styles.bookMeta}>
                        <div className={styles.metaItem}>
                            <Calendar size={16} />
                            <span>Published: {book.publishedYear}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <BookOpen size={16} />
                            <span>Category: {book.category}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <Copy size={16} />
                            <span>Total Copies: {book.totalCopies}</span>
                        </div>
                    </div>

                    {book.rating > 0 && (
                        <div className={styles.ratingSection}>
                            <div className={styles.ratingStars}>
                                {renderStars(book.rating)}
                                <span className={styles.ratingText}>({book.rating.toFixed(1)})</span>
                            </div>
                        </div>
                    )}

                    {book.description && (
                        <div className={styles.descriptionSection}>
                            <h3>Description</h3>
                            <p className={styles.bookDescription}>{book.description}</p>
                        </div>
                    )}

                    {/* Show borrow error if any */}
                    {borrowError && (
                        <div className={styles.borrowError}>
                            <AlertCircle size={16} />
                            <span>{borrowError}</span>
                        </div>
                    )}

                    <div className={styles.actionButtons}>
                        <button
                            className={styles.borrowButton}
                            onClick={handleBorrowBook}
                            disabled={book.availableCopies === 0 || isBorrowing}
                        >
                            {isBorrowing ? 'Borrowing...' : 'Borrow Book'}
                        </button>
                        <button
                            className={styles.editButton}
                            onClick={() => navigate(`/books/${book.id}/edit`)}
                        >
                            Edit Book
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetails;