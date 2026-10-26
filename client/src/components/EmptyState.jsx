import React from 'react';

/**
 * Empty State Component
 * Guidelines Section 7.3: "Empty: A friendly message and a next step when there is no data yet."
 */
const EmptyState = ({
  icon = '📚',
  title = 'No items found',
  message = 'There is currently no data to display.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="empty-state-card" role="region" aria-label="Empty state">
      <div className="empty-icon" aria-hidden="true">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-message">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
