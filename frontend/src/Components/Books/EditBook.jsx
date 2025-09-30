import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';
import apiService from '../../services/api';
import styles from './EditBook.module.css';

const EditBook = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        category: '',
        publishedYear: '',
        description: '',
        totalCopies: 1,
        coverImageUrl: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const categories = ['fiction', 'non-fiction', 'reference', 'textbook', 'biography', 'Manga', 'Horror', 'Romance', 'Mystery', 'Dystopian'];

    useEffect(() => {
        const loadBook = async () => {
            try {
                setIsLoading(true);
                const bookData = await apiService.getBookById(id);
                setBook(bookData);
                setFormData({
                    title: bookData.title || '',
                    author: bookData.author || '',
                    category: bookData.category || '',
                    publishedYear: bookData.publishedYear || '',
                    description: bookData.description || '',
                    totalCopies: bookData.totalCopies || 1,
                    coverImageUrl: bookData.coverImageUrl || ''
                });
            } catch (err) {
                setError('Failed to load book');
                console.error('Error loading book:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadBook();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        try {
            await apiService.updateBook(id, formData);
            navigate(`/books/${id}`);
        } catch (err) {
            setError('Failed to update book');
            console.error('Error updating book:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        navigate(`/books/${id}`);
    };

    if (isLoading) {
        return (
            <div className={styles.editContainer}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Loading book...</p>
                </div>
            </div>
        );
    }

    if (error && !book) {
        return (
            <div className={styles.editContainer}>
                <div className={styles.errorContainer}>
                    <h3>Book not found</h3>
                    <p>{error}</p>
                    <button onClick={() => navigate('/books')} className={styles.backButton}>
                        <ArrowLeft size={16} />
                        Back to Books
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.editContainer}>
            <div className={styles.editHeader}>
                <button onClick={handleBack} className={styles.backButton}>
                    <ArrowLeft size={16} />
                    Back to Details
                </button>
                <h1>Edit Book</h1>
                <p>Update book information</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.editForm}>
                {error && <div className={styles.errorMessage}>{error}</div>}

                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label htmlFor="title">Book Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="author">Author *</label>
                        <input
                            type="text"
                            id="author"
                            name="author"
                            value={formData.author}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="category">Category *</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="publishedYear">Published Year</label>
                        <input
                            type="number"
                            id="publishedYear"
                            name="publishedYear"
                            value={formData.publishedYear}
                            onChange={handleInputChange}
                            min="1000"
                            max="2030"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="totalCopies">Total Copies *</label>
                        <input
                            type="number"
                            id="totalCopies"
                            name="totalCopies"
                            value={formData.totalCopies}
                            onChange={handleInputChange}
                            min="1"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="coverImageUrl">Cover Image URL</label>
                        <input
                            type="url"
                            id="coverImageUrl"
                            name="coverImageUrl"
                            value={formData.coverImageUrl}
                            onChange={handleInputChange}
                            placeholder="https://example.com/cover.jpg"
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Enter book description..."
                    />
                </div>

                <div className={styles.formActions}>
                    <button
                        type="button"
                        onClick={handleBack}
                        className={styles.cancelButton}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className={styles.saveButton}
                    >
                        <Save size={16} />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditBook;