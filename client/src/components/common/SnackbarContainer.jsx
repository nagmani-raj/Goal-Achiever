import { useNotifications } from '../../context/NotificationContext';
import './SnackbarContainer.css';

const iconMap = {
  success: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.55 16.6 5.4 12.45l1.4-1.4 2.75 2.75 7.65-7.65 1.4 1.4Z" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m13.41 12 4.3-4.29-1.42-1.42L12 10.59 7.71 6.29 6.29 7.71 10.59 12l-4.3 4.29 1.42 1.42L12 13.41l4.29 4.3 1.42-1.42Z" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 7h2v7h-2zm0 9h2v2h-2z" />
    </svg>
  ),
};

const SnackbarContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="snackbar-stack" aria-live="polite" aria-atomic="true">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`snackbar-card snackbar-${notification.type}`}
          role="status"
        >
          <div className="snackbar-icon">
            {iconMap[notification.type]}
          </div>
          <p className="snackbar-message">{notification.message}</p>
          <button
            type="button"
            className="snackbar-close"
            onClick={() => removeNotification(notification.id)}
            aria-label="Close notification"
          >
            x
          </button>
          <span
            className="snackbar-progress"
            style={{ animationDuration: `${notification.duration}ms` }}
          />
        </div>
      ))}
    </div>
  );
};

export default SnackbarContainer;
