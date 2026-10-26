import React from 'react';

/**
 * Alert / Error Notification Component
 * Guidelines Section 7.3: "Error: A clear, non-technical message and a way to retry."
 */
const Alert = ({
  type = 'error', // 'error' | 'success' | 'info'
  message,
  onRetry
}) => {
  if (!message) return null;

  return (
    <div
      className={`alert alert-${type}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="alert-content">
        <span className="alert-icon" aria-hidden="true">
          {type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️'}
        </span>
        <span className="alert-message">{message}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default Alert;
