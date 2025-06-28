import { createContext, useContext, useState } from 'react';

const NotificationsContext = createContext(null);

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const pushNotification = (notification) => setNotifications((prev) => [notification, ...prev]);
  const clearNotifications = () => setNotifications([]);

  return (
    <NotificationsContext.Provider value={{ notifications, pushNotification, clearNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
