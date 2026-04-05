import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const NotificationContext = createContext(null);

const AUTO_CLOSE_MS = 3200;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const pushNotification = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const notification = {
      id,
      type,
      message,
      duration: AUTO_CLOSE_MS,
    };

    setNotifications((current) => [...current, notification]);
    window.setTimeout(() => {
      setNotifications((current) => current.filter((item) => item.id !== id));
    }, AUTO_CLOSE_MS);
  }, []);

  const value = useMemo(() => ({
    notifications,
    removeNotification,
    showSuccess: (message) => pushNotification('success', message),
    showError: (message) => pushNotification('error', message),
    showWarning: (message) => pushNotification('warning', message),
  }), [notifications, pushNotification, removeNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }

  return context;
};
