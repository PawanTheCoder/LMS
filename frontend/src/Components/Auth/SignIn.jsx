import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import apiService from '../../services/api';
import styles from './SignIn.module.css';
import logo from '../../assets/logo.png';

const SignIn = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await apiService.login(formData.username, formData.password);

      const userData = {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role
      };

      login(userData, result.token);

      if (result.role === 'ADMIN' || result.role === 'LIBRARIAN') {
        navigate('/dashboard');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.authBg}>
      <div className={styles.authContainer}>
        <div className={styles.logoSection}>
          <span className={styles.logo}><img src={logo} alt="" width="60" /></span>
          <h1 className={styles.title}>Library Management</h1>
        </div>

        <h2 className={styles.heading}>Sign In</h2>

        {error && (
          <div className={styles.errorMessage} role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.inputGroup}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              autoFocus
              autoComplete="username"
              className={error && !formData.username ? styles.inputError : ''}
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className={error && !formData.password ? styles.inputError : ''}
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.switchAuth}>
          <span>Don't have an account?</span>
          <Link to="/signup" className={styles.link}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
