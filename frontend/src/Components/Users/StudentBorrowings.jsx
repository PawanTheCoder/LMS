import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../App';
import { BookOpen, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import apiService from '../../services/api';
import styles from './StudentBorrowings.module.css';

const StudentBorrowings = () => {
    const { user } = useContext(AuthContext);
    const [borrowings, setBorrowings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadMyBorrowings();
    }, []);

    const loadMyBorrowings = async () => {
        try {
            setIsLoading(true);
            const data = await apiService.getMyBorrowings();
            setBorrowings(data);
        } catch (err) {
            setError('Failed to load your borrowings');
            console.error('Error loading borrowings:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReturnBook = async (borrowingId) => {
        try {
            await apiService.returnBook(borrowingId);
            // Reload the borrowings list
            loadMyBorrowings();
        } catch (err) {
            setError('Failed to return book');
            console.error('Error returning book:', err);
        }
    };

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date();
    };

    const getStatusBadge = (borrowing) => {
        if (borrowing.returnDate) {
            return { text: 'Returned', class: styles.returned, icon: <CheckCircle size={14} /> };
        } else if (isOverdue(borrowing.dueDate)) {
            return { text: 'Overdue', class: styles.overdue, icon: <XCircle size={14} /> };
        } else {
            return { text: 'Borrowed', class: styles.borrowed, icon: <BookOpen size={14} /> };
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading your borrowings...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>My Borrowed Books</h1>
                <p>Manage your current and past book borrowings</p>
            </div>

            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}

            {borrowings.length === 0 ? (
                <div className={styles.empty}>
                    <BookOpen size={48} />
                    <h3>No books borrowed yet</h3>
                    <p>Start exploring our library collection!</p>
                </div>
            ) : (
                <div className={styles.borrowingsList}>
                    {borrowings.map((borrowing) => {
                        const status = getStatusBadge(borrowing);
                        return (
                            <div key={borrowing.id} className={styles.borrowingCard}>
                                <div className={styles.bookInfo}>
                                    <h3>{borrowing.book?.title || 'Unknown Book'}</h3>
                                    <p className={styles.author}>
                                        by {borrowing.book?.author || 'Unknown Author'}
                                    </p>
                                    <p className={styles.category}>{borrowing.book?.category}</p>
                                </div>

                                <div className={styles.borrowingInfo}>
                                    <div className={styles.dateInfo}>
                                        <div className={styles.dateItem}>
                                            <Calendar size={16} />
                                            <span>Borrowed: {new Date(borrowing.borrowDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className={styles.dateItem}>
                                            <Clock size={16} />
                                            <span>Due: {new Date(borrowing.dueDate).toLocaleDateString()}</span>
                                        </div>
                                        {borrowing.returnDate && (
                                            <div className={styles.dateItem}>
                                                <CheckCircle size={16} />
                                                <span>Returned: {new Date(borrowing.returnDate).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.statusSection}>
                                        <div className={`${styles.statusBadge} ${status.class}`}>
                                            {status.icon}
                                            {status.text}
                                        </div>

                                        {!borrowing.returnDate && !isOverdue(borrowing.dueDate) && (
                                            <button
                                                onClick={() => handleReturnBook(borrowing.id)}
                                                className={styles.returnButton}
                                            >
                                                Return Book
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudentBorrowings;