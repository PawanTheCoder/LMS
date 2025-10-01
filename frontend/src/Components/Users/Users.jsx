import React, { useState, useEffect } from 'react';
import { Search, Filter, Users as UsersIcon, Mail, Calendar, Shield, MoreVertical, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import apiService from '../../services/api';
import styles from './Users.module.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userHasBorrowed, setUserHasBorrowed] = useState({}); // Track which users have borrowed books
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const roles = ['all', 'ADMIN', 'LIBRARIAN', 'STUDENT'];

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Loading users from API...');
        const usersData = await apiService.getUsers();
        console.log('Users data received:', usersData);

        setUsers(usersData);
        setFilteredUsers(usersData);

        // Check which users have active borrowings
        const borrowedMap = {};
        for (const user of usersData) {
          try {
            const borrowings = await apiService.getUserActiveBorrowings(user.id);
            // If user has any active borrowings, mark as borrowed
            borrowedMap[user.id] = (borrowings && borrowings.length > 0);
          } catch (error) {
            console.error(`Error checking borrowings for user ${user.id}:`, error);
            borrowedMap[user.id] = false;
          }
        }
        setUserHasBorrowed(borrowedMap);

      } catch (error) {
        console.error('Error loading users:', error);
        setError('Failed to load users. Please check your connection.');
        setUsers([]);
        setFilteredUsers([]);
      }

      setIsLoading(false);
    };

    loadUsers();
  }, []);

  useEffect(() => {
    // Filter and sort users
    let filtered = users.filter(user => {
      const matchesSearch =
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = selectedRole === 'all' || user.role === selectedRole;

      return matchesSearch && matchesRole;
    });

    // Sort users
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.username || '').localeCompare(b.username || '');
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'role':
          return (a.role || '').localeCompare(b.role || '');
        case 'joinDate':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole, sortBy]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return '#dc3545';
      case 'LIBRARIAN': return '#007bff';
      case 'STUDENT': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? '#28a745' : '#dc3545';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getUserInitials = (user) => {
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <div className={styles.usersContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.usersContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Users</h1>
          <p className={styles.subtitle}>Manage library users and their access</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.errorMessage}>
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className={styles.controlsSection}>
        <div className={styles.searchContainer}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search users by name, email, or username..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filtersContainer}>
          <div className={styles.filterGroup}>
            <Filter size={16} />
            <select
              value={selectedRole}
              onChange={handleRoleChange}
              className={styles.filterSelect}
            >
              <option value="all">All Roles</option>
              {roles.slice(1).map(role => (
                <option key={role} value={role}>
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className={styles.filterSelect}
            >
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="role">Sort by Role</option>
              <option value="joinDate">Sort by Join Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className={styles.resultsInfo}>
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* Users Table */}
      <div className={styles.usersSection}>
        {filteredUsers.length === 0 ? (
          <div className={styles.noResults}>
            <UsersIcon size={48} />
            <h3>No users found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className={styles.usersTable}>
            <div className={styles.tableHeader}>
              <span>User</span>
              <span>Role</span>
              <span>Status</span>
              <span>Books Info</span>
              <span>Last Active</span>
              <span>Actions</span>
            </div>

            {filteredUsers.map(user => {
              const hasBorrowed = userHasBorrowed[user.id] || false;

              return (
                <div key={user.id} className={styles.userRow}>
                  <div className={styles.userCell}>
                    <div className={styles.userAvatar}>
                      {getUserInitials(user)}
                    </div>
                    <div className={styles.userInfo}>
                      <h4 className={styles.userName}>
                        {user.firstName} {user.lastName}
                      </h4>
                      <p className={styles.userEmail}>{user.email}</p>
                      <p className={styles.userUsername}>@{user.username}</p>
                    </div>
                  </div>

                  <div className={styles.roleCell}>
                    <span
                      className={styles.roleBadge}
                      style={{ backgroundColor: getRoleColor(user.role) }}
                    >
                      {user.role}
                    </span>
                  </div>

                  <div className={styles.statusCell}>
                    <div className={styles.statusIndicator}>
                      <div
                        className={`${styles.statusDot} ${user.isActive ? styles.active : styles.inactive}`}
                      ></div>
                      <span className={styles.statusText}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.booksCell}>
                    <div className={styles.booksInfo}>
                      <span className={styles.currentBooks}>
                        {hasBorrowed ? '1 borrowed' : '0 borrowed'}
                      </span>
                      <span className={styles.totalBooks}>
                        {hasBorrowed ? '1 total' : '0 total'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.dateCell}>
                    <span className={styles.lastActive}>
                      {formatDate(user.updatedAt)}
                    </span>
                  </div>

                  <div className={styles.actionsCell}>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.actionButton}
                        title="Edit user"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className={styles.actionButton}
                        title={user.isActive ? "Deactivate user" : "Activate user"}
                      >
                        {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.dangerButton}`}
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;