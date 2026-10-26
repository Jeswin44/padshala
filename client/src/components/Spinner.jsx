import React from 'react';

/**
 * Loading Spinner Component
 * Guidelines Section 7.3: "Loading: A spinner or skeleton while data is being fetched."
 */
const Spinner = ({ message = 'Loading...' }) => {
  return (
    <div className="spinner-container" role="status" aria-live="polite">
      <div className="spinner"></div>
      <span className="spinner-text">{message}</span>
    </div>
  );
};

export default Spinner;
