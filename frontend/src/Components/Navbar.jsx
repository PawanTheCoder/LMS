import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { LogOut, Menu, X, User } from 'lucide-react';
import styles from './Navbar.module.css';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const isActive = (path) => location.pathname === path;

  // Generate nav items based on role
  const getNavItems = () => {
    if (!user?.role) return [];
    if (user.role === 'admin' || user.role === 'librarian') {
      return [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/books', label: 'Books' },
        { path: '/users', label: 'Users' },
        { path: '/manage-books', label: 'Manage Books' },
        { path: '/about', label: 'About' }
      ];
    }
    return [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/student', label: 'My Books' },
      { path: '/about', label: 'About' }
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className={styles.navbar} role="navigation" aria-label="Main navigation">
      <div className={styles.navContainer}>
        <div className={styles.navBrand}>
          <Link to="/dashboard" className={styles.brandLink}>
            <span className={styles.logo}><img src={logo} alt="" width="80" /></span>
            <span className={styles.brandText}>Library Management</span>
          </Link>
        </div>

        <div className={styles.navLinks}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
              onClick={closeMobileMenu}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className={styles.userMenu}>
          <div className={styles.userInfo}>
            <User size={20} />
            <span className={styles.userName}>{user?.username || 'User'}</span>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>

        <button
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuContent}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.mobileNavLink} ${isActive(item.path) ? styles.active : ''}`}
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            ))}
            <div className={styles.mobileUserSection}>
              <div className={styles.mobileUserInfo}>
                <User size={20} />
                <span>{user?.username || 'User'}</span>
              </div>
              <button className={styles.mobileLogoutButton} onClick={handleLogout}>
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
