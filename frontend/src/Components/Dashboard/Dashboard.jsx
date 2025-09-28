import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../App';
import { BookOpen, Users, Calendar, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import apiService from '../../services/api';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    booksBorrowed: 0,
    overdueBooks: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  const [error, setError] = useState(null);

  // Main categories to show individually
  const mainCategories = ['fiction', 'fantasy', 'programming'];

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Starting to load dashboard data...');

        // Fetch all data in parallel with error handling for each request
        const [booksResponse, usersResponse, borrowingsResponse, overdueResponse] = await Promise.allSettled([
          apiService.getBooks(),
          apiService.getUsers(),
          apiService.getBorrowings(),
          apiService.getOverdueBorrowings()
        ]);

        console.log('API Responses:', {
          books: booksResponse,
          users: usersResponse,
          borrowings: borrowingsResponse,
          overdue: overdueResponse
        });

        // Handle each response
        const books = booksResponse.status === 'fulfilled' ? booksResponse.value : [];
        const users = usersResponse.status === 'fulfilled' ? usersResponse.value : [];
        const borrowings = borrowingsResponse.status === 'fulfilled' ? borrowingsResponse.value : [];
        const overdueBorrowings = overdueResponse.status === 'fulfilled' ? overdueResponse.value : [];

        // Log any failed requests
        if (booksResponse.status === 'rejected') console.error('Books API failed:', booksResponse.reason);
        if (usersResponse.status === 'rejected') console.error('Users API failed:', usersResponse.reason);
        if (borrowingsResponse.status === 'rejected') console.error('Borrowings API failed:', borrowingsResponse.reason);
        if (overdueResponse.status === 'rejected') console.error('Overdue API failed:', overdueResponse.reason);

        // Calculate category statistics with grouping
        const categoryCounts = {};
        let otherCount = 0;

        books.forEach(book => {
          const category = book.category?.trim().toLowerCase() || 'uncategorized';

          // Check if this is a main category
          if (mainCategories.includes(category)) {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          } else {
            // Group all other categories
            otherCount++;
          }
        });

        // Convert main categories to array
        const categoryArray = mainCategories
          .filter(category => categoryCounts[category] > 0)
          .map(category => ({
            category: category.charAt(0).toUpperCase() + category.slice(1),
            count: categoryCounts[category],
            percentage: books.length > 0 ? ((categoryCounts[category] / books.length) * 100).toFixed(1) : '0'
          }));

        // Add "Other" category if there are any books in other categories
        if (otherCount > 0) {
          categoryArray.push({
            category: 'Other',
            count: otherCount,
            percentage: books.length > 0 ? ((otherCount / books.length) * 100).toFixed(1) : '0'
          });
        }

        setCategoryData(categoryArray);

        // Set stats - handle cases where data might be missing
        setStats({
          totalBooks: books.length || 0,
          totalUsers: users.length || 0,
          booksBorrowed: Array.isArray(borrowings) ? borrowings.filter(b => b.status === 'BORROWED').length : 0,
          overdueBooks: Array.isArray(overdueBorrowings) ? overdueBorrowings.length : 0
        });

        // Create recent activity from borrowings data
        let recentBorrowings = [];
        if (Array.isArray(borrowings)) {
          recentBorrowings = borrowings
            .slice(0, 5)
            .map((borrowing, index) => ({
              id: borrowing.id || index,
              action: borrowing.status === 'BORROWED' ? 'Book borrowed' : 'Book returned',
              book: borrowing.book?.title || 'Unknown Book',
              user: borrowing.user ? `${borrowing.user.firstName} ${borrowing.user.lastName}` : 'Unknown User',
              time: `${index + 1} hours ago`,
              type: borrowing.status === 'BORROWED' ? 'borrow' : 'return'
            }));
        }

        setRecentActivity(recentBorrowings);

        console.log('Dashboard data loaded successfully:', {
          booksCount: books.length,
          usersCount: users.length,
          borrowingsCount: borrowings.length,
          categories: categoryArray
        });

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data. Please check your connection and try again.');
        // Fallback to empty data if API fails
        setStats({
          totalBooks: 0,
          totalUsers: 0,
          booksBorrowed: 0,
          overdueBooks: 0
        });
        setCategoryData([]);
        setRecentActivity([]);
      }

      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  // Function to generate colors for categories
  const getCategoryColor = (category, index) => {
    const colorMap = {
      'fiction': 'var(--color-blue)',
      'fantasy': 'var(--color-green)',
      'programming': 'lime',
      'other': 'var(--color-text-secondary)'
    };

    return colorMap[category.toLowerCase()] ||
      colorMap[Object.keys(colorMap)[index % Object.keys(colorMap).length]];
  };

  // Function to render the pie chart with real data
  const Chart = () => {
    if (categoryData.length === 0) {
      return (
        <div className={styles.noData}>
          <BookOpen size={32} />
          <p>No category data available</p>
        </div>
      );
    }

    return (
      <div className={styles.chartContent}>
        <div className={styles.pieChart}>
          {categoryData.map((item, index) => (
            <div
              key={item.category}
              className={styles.pieSlice}
              style={{
                '--percentage': `${item.percentage}%`,
                '--color': getCategoryColor(item.category, index)
              }}
              title={`${item.category}: ${item.percentage}%`}
            ></div>
          ))}
        </div>
        <div className={styles.chartLegend}>
          {categoryData.map((item, index) => (
            <div key={item.category} className={styles.legendItem}>
              <span
                className={styles.legendColor}
                style={{ backgroundColor: getCategoryColor(item.category, index) }}
              ></span>
              <span>{item.category} ({item.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'book': return <BookOpen size={16} />;
      case 'user': return <Users size={16} />;
      case 'borrow': return <TrendingUp size={16} />;
      case 'return': return <Clock size={16} />;
      case 'overdue': return <AlertCircle size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'book': return 'var(--color-green)';
      case 'user': return 'var(--color-blue)';
      case 'borrow': return 'var(--color-accent)';
      case 'return': return 'var(--color-green)';
      case 'overdue': return '#dc3545';
      default: return 'var(--color-text-secondary)';
    }
  };

  if (isLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.errorContainer}>
          <AlertCircle size={48} />
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>Dashboard</h1>
          <p className={styles.dashboardSubtitle}>
            Welcome back, {user?.username || 'User'}! Here's what's happening in your library.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <BookOpen size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.totalBooks.toLocaleString()}</h3>
            <p className={styles.statLabel}>Total Books</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.totalUsers.toLocaleString()}</h3>
            <p className={styles.statLabel}>Total Users</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.booksBorrowed.toLocaleString()}</h3>
            <p className={styles.statLabel}>Books Borrowed</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <AlertCircle size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.overdueBooks.toLocaleString()}</h3>
            <p className={styles.statLabel}>Overdue Books</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsSection}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Book Categories</h3>
          <div className={styles.chartPlaceholder}>
            {Chart()}
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Monthly Activity</h3>
          <div className={styles.chartPlaceholder}>
            <div className={styles.barChart}>
              {[65, 80, 45, 90, 70, 85, 95, 60, 75, 88, 92, 78].map((height, index) => (
                <div
                  key={index}
                  className={styles.bar}
                  style={{ height: `${height}%` }}
                  title={`Month ${index + 1}: ${height} books`}
                ></div>
              ))}
            </div>
            <p className={styles.chartDescription}>Books borrowed per month</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.activitySection}>
        <h3 className={styles.activityTitle}>Recent Activity</h3>
        <div className={styles.activityList}>
          {recentActivity.length === 0 ? (
            <div className={styles.noData}>
              <Clock size={32} />
              <p>No recent activity</p>
            </div>
          ) : (
            recentActivity.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div
                  className={styles.activityIcon}
                  style={{ color: getActivityColor(activity.type) }}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>
                    <strong>{activity.action}</strong>
                    {activity.book && ` - ${activity.book}`}
                    {activity.user && ` by ${activity.user}`}
                  </p>
                  <span className={styles.activityTime}>{activity.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;