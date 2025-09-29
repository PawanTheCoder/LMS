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

  // Define the main categories we want to track
  const mainCategories = ['fiction', 'non-fiction', 'manga'];

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

        // Calculate category statistics with proper grouping
        const categoryCounts = {};
        let otherCount = 0;

        books.forEach(book => {
          const category = book.category?.trim().toLowerCase() || 'uncategorized';

          // Check if this is one of our main categories
          if (mainCategories.includes(category)) {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          } else {
            // Group all other categories
            otherCount++;
          }
        });

        // Convert to array format for the chart with proper labels
        const categoryArray = mainCategories.map(category => ({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          count: categoryCounts[category] || 0,
          percentage: books.length > 0 ? ((categoryCounts[category] || 0) / books.length * 100).toFixed(1) : '0'
        }));

        // Add "Other" category if there are any books in other categories
        if (otherCount > 0) {
          categoryArray.push({
            category: 'Other',
            count: otherCount,
            percentage: books.length > 0 ? (otherCount / books.length * 100).toFixed(1) : '0'
          });
        }

        // Filter out categories with 0 books
        const filteredCategoryArray = categoryArray.filter(item => item.count > 0);
        setCategoryData(filteredCategoryArray);

        // Set stats - handle cases where data might be missing
        const activeBorrowings = Array.isArray(borrowings) ?
          borrowings.filter(b => b.status === 'BORROWED' || b.returnDate === null) : [];

        setStats({
          totalBooks: books.length || 0,
          totalUsers: users.length || 0,
          booksBorrowed: activeBorrowings.length,
          overdueBooks: Array.isArray(overdueBorrowings) ? overdueBorrowings.length : 0
        });

        // Create REAL recent activity from borrowings data
        let recentActivities = [];
        if (Array.isArray(borrowings)) {
          // Sort borrowings by most recent first (assuming there's a borrowDate field)
          const sortedBorrowings = [...borrowings]
            .sort((a, b) => new Date(b.borrowDate || b.createdAt) - new Date(a.borrowDate || a.createdAt))
            .slice(0, 6); // Get 6 most recent

          recentActivities = sortedBorrowings.map((borrowing, index) => {
            const isReturned = borrowing.status === 'RETURNED' || borrowing.returnDate !== null;
            const isOverdue = borrowing.dueDate && new Date(borrowing.dueDate) < new Date() && !isReturned;

            let action, type, timeText;

            if (isReturned) {
              action = 'Book returned';
              type = 'return';
              timeText = `Returned on ${new Date(borrowing.returnDate).toLocaleDateString()}`;
            } else if (isOverdue) {
              action = 'Book overdue';
              type = 'overdue';
              const daysOverdue = Math.ceil((new Date() - new Date(borrowing.dueDate)) / (1000 * 60 * 60 * 24));
              timeText = `${daysOverdue} days overdue`;
            } else {
              action = 'Book borrowed';
              type = 'borrow';
              timeText = `Due on ${new Date(borrowing.dueDate).toLocaleDateString()}`;
            }

            return {
              id: borrowing.id || index,
              action,
              book: borrowing.book?.title || 'Unknown Book',
              user: borrowing.user ? `${borrowing.user.firstName} ${borrowing.user.lastName}` : 'Unknown User',
              time: timeText,
              type
            };
          });
        }

        setRecentActivity(recentActivities);

        console.log('Dashboard data loaded successfully:', {
          booksCount: books.length,
          usersCount: users.length,
          borrowingsCount: borrowings.length,
          categories: filteredCategoryArray,
          recentActivities: recentActivities.length
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

  // Function to generate vibrant colors for categories
  const getCategoryColor = (category) => {
    const colorMap = {
      'Fiction': '#FF6B6B',     // Vibrant Red
      'Non-fiction': '#4ECDC4',  // Vibrant Teal
      'Manga': '#45B7D1',       // Vibrant Blue
      'Other': '#FFA07A'        // Vibrant Light Salmon
    };

    return colorMap[category] || '#96CEB4'; // Fallback color
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

    // Calculate conic gradient for pie chart
    let currentAngle = 0;
    const gradientStops = categoryData.map(item => {
      const percentage = parseFloat(item.percentage);
      const startAngle = currentAngle;
      const endAngle = startAngle + (percentage * 3.6); // Convert percentage to degrees
      currentAngle = endAngle;

      return `${getCategoryColor(item.category)} ${startAngle}deg ${endAngle}deg`;
    }).join(', ');

    return (
      <div className={styles.chartContent}>
        <div
          className={styles.pieChart}
          style={{
            background: `conic-gradient(${gradientStops})`
          }}
        >
          <div className={styles.pieCenter}></div>
        </div>
        <div className={styles.chartLegend}>
          {categoryData.map((item, index) => (
            <div key={item.category} className={styles.legendItem}>
              <span
                className={styles.legendColor}
                style={{ backgroundColor: getCategoryColor(item.category) }}
              ></span>
              <span className={styles.legendText}>
                {item.category} ({item.percentage}%) - {item.count} books
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'borrow': return <BookOpen size={16} />;
      case 'return': return <TrendingUp size={16} />;
      case 'overdue': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'borrow': return '#3B82F6'; // Blue
      case 'return': return '#10B981'; // Green
      case 'overdue': return '#EF4444'; // Red
      default: return '#6B7280'; // Gray
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
          <div className={styles.chartContainer}>
            {Chart()}
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Monthly Activity</h3>
          <div className={styles.chartContainer}>
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
              <p>No recent activity found</p>
            </div>
          ) : (
            recentActivity.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div
                  className={styles.activityIcon}
                  style={{ backgroundColor: `${getActivityColor(activity.type)}20`, color: getActivityColor(activity.type) }}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>
                    <strong>{activity.user}</strong> - {activity.action}: "{activity.book}"
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