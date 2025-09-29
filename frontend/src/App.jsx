import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar';
import ErrorBoundary from './Components/ErrorBoundary';
import LoadingSpinner from './Components/LoadingSpinner';

// Lazy load pages
const Dashboard = lazy(() => import('./Components/Dashboard/Dashboard'));
const Books = lazy(() => import('./Components/Books/Books'));
const BookDetails = lazy(() => import('./Components/Books/BookDetails'));
const EditBook = lazy(() => import('./Components/Books/EditBook'));
const Users = lazy(() => import('./Components/Users/Users'));
const ManageBooks = lazy(() => import('./Components/ManageBooks/ManageBooks'));
const StudentPanel = lazy(() => import('./Components/Student/StudentPanel'));
const AboutDev = lazy(() => import('./Components/AboutDev/AboutDev'));
const SignIn = lazy(() => import('./Components/Auth/SignIn'));
const SignUp = lazy(() => import('./Components/Auth/SignUp'));

// Auth Context
export const AuthContext = React.createContext();

const AppContent = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';

  // Check localStorage on load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = (userData, token) => {
    // Normalize role to lowercase for consistency
    const userWithRole = {
      ...userData,
      role: userData.role?.toLowerCase() || 'student'
    };
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userWithRole));
    setUser(userWithRole);
    setIsAuthenticated(true);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) return <LoadingSpinner />;

  if (!isAuthenticated && !isAuthPage) return <Navigate to="/signin" replace />;
  if (isAuthenticated && isAuthPage) return <Navigate to="/dashboard" replace />;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      <ErrorBoundary>
        {!isAuthPage && <Navbar />}
        <main className={isAuthPage ? 'auth-layout' : 'main-layout'}>
          <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Books Routes */}
              <Route path="/books" element={<Books />} />
              <Route path="/books/:id" element={<BookDetails />} />
              <Route path="/books/:id/edit" element={<EditBook />} />

              <Route path="/users" element={<Users />} />
              <Route path="/manage-books" element={<ManageBooks />} />
              <Route path="/student" element={<StudentPanel />} />
              <Route path="/about" element={<AboutDev />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Catch all route - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </main>
      </ErrorBoundary>
    </AuthContext.Provider>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;