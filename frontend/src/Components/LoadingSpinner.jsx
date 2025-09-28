import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = React.memo(({ size = 'medium', message = 'Loading...' }) => {
  return (
    <div className={styles.container} role="status" aria-label="Loading">
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.spinnerInner}></div>
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;