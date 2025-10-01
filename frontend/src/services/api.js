const API_BASE_URL = 'http://localhost:8080';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get headers with auth token
  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'API request failed');
    }
    return response.json();
  }

  // Get current user from token
  getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  // Auth endpoints
  async login(username, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Login failed');
    }

    const result = await response.json();

    // Store token and user data in localStorage
    if (result.token) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('userData', JSON.stringify(result.user));
    }

    return result;
  }

  async register(userData) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Registration failed');
    }

    return response.json();
  }

  // Book endpoints
  async getBooks() {
    const response = await fetch(`${this.baseURL}/books`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getAvailableBooks() {
    const response = await fetch(`${this.baseURL}/books/available`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async searchBooks(query) {
    const response = await fetch(`${this.baseURL}/books/search?q=${encodeURIComponent(query)}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getBookById(id) {
    const response = await fetch(`${this.baseURL}/books/${id}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async addBook(bookData) {
    const response = await fetch(`${this.baseURL}/books`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(bookData)
    });
    return this.handleResponse(response);
  }

  async createBook(bookData) {
    return this.addBook(bookData);
  }

  async updateBook(id, bookData) {
    const response = await fetch(`${this.baseURL}/books/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(bookData)
    });
    return this.handleResponse(response);
  }

  async deleteBook(id) {
    const response = await fetch(`${this.baseURL}/books/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  // User endpoints
  async getUsers() {
    const response = await fetch(`${this.baseURL}/users`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getUserById(id) {
    const response = await fetch(`${this.baseURL}/users/${id}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async updateUser(id, userData) {
    const response = await fetch(`${this.baseURL}/users/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse(response);
  }

  async deleteUser(id) {
    const response = await fetch(`${this.baseURL}/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  // Borrowing endpoints - UPDATED AND ENHANCED
  async getBorrowings() {
    const response = await fetch(`${this.baseURL}/borrowings`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getUserBorrowings(userId) {
    const response = await fetch(`${this.baseURL}/borrowings/user/${userId}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getUserActiveBorrowings(userId) {
    const response = await fetch(`${this.baseURL}/borrowings/user/${userId}/active`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  // ENHANCED: Borrow book with current user context
  // In your api.js - make sure it looks like this:
  // Borrowing endpoints - FIXED
  // ENHANCED: Borrow book with proper error handling and validation
  async borrowBook(bookId) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${this.baseURL}/borrowings/borrow?userId=${currentUser.id}&bookId=${bookId}`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to borrow book');
    }

    return response.json();
  }

  // NEW: Check if user can borrow more books
  async canUserBorrow(userId) {
    const response = await fetch(`${this.baseURL}/borrowings/user/${userId}/can-borrow`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to check borrowing eligibility');
    }

    return response.json();
  }

  // ENHANCED: Return book
  async returnBook(borrowingId) {
    const response = await fetch(`${this.baseURL}/borrowings/return/${borrowingId}`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  // NEW: Get current user's borrowings
  async getMyBorrowings() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return this.getUserBorrowings(currentUser.id);
  }

  // In your api.js - Add these methods if missing

  // Get user's active borrowings
  async getUserActiveBorrowings(userId) {
    const response = await fetch(`${this.baseURL}/borrowings/user/${userId}/active`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  // Check if user can borrow
  async canUserBorrow(userId) {
    const response = await fetch(`${this.baseURL}/borrowings/user/${userId}/can-borrow`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  // Borrow book
  async borrowBook(bookId) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${this.baseURL}/borrowings/borrow?userId=${currentUser.id}&bookId=${bookId}`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to borrow book');
    }

    return response.json();
  }

  // Return book
  async returnBook(borrowingId) {
    const response = await fetch(`${this.baseURL}/borrowings/return/${borrowingId}`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to return book');
    }

    return response.json();
  }

  // NEW: Get current user's active borrowings
  async getMyActiveBorrowings() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return this.getUserActiveBorrowings(currentUser.id);
  }

  async getOverdueBorrowings() {
    const response = await fetch(`${this.baseURL}/borrowings/overdue`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  // NEW: Get borrowing by ID
  async getBorrowingById(id) {
    const response = await fetch(`${this.baseURL}/borrowings/${id}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }
}

export default new ApiService();