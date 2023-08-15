import { createContext, useContext, useState } from "react";
import { NOTIFICATION_TYPES } from "~/constants";

const Notification = createContext([
  {
    type: NOTIFICATION_TYPES.SUCCESS,
    message: "",
  },
]);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    type: NOTIFICATION_TYPES.SUCCESS,
    message: "",
  });

  return (
    // @ts-ignore
    <Notification.Provider value={[notification, setNotification]}>
      {children}
    </Notification.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(Notification);

  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }

  return context;
};
