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

    // Store token in localStorage
    if (result.token) {
      localStorage.setItem('token', result.token);
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

  // Book endpoints - UPDATED METHOD NAMES
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

  // CHANGED: createBook → addBook (to match component)
  async addBook(bookData) {
    const response = await fetch(`${this.baseURL}/books`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(bookData)
    });
    return this.handleResponse(response);
  }

  // ADDED: createBook alias for backward compatibility
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

  // Borrowing endpoints
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

  async borrowBook(userId, bookId) {
    const response = await fetch(`${this.baseURL}/borrowings/borrow?userId=${userId}&bookId=${bookId}`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to borrow book');
    }

    return response.json();
  }

  async returnBook(borrowingId) {
    const response = await fetch(`${this.baseURL}/borrowings/return/${borrowingId}`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getOverdueBorrowings() {
    const response = await fetch(`${this.baseURL}/borrowings/overdue`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }
}

export default new ApiService();