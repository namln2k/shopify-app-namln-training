import { useNotificationContext } from "~/contexts/notification";
import {
  CircleTickMajor,
  CircleAlertMajor,
  QuestionMarkMinor,
  CircleCancelMajor,
  MobileCancelMajor,
} from "@shopify/polaris-icons";
import { NOTIFICATION_TYPES } from "~/constants";
import { useEffect, useState } from "react";

export default function Notification() {
  const [notification, setNotification] = useNotificationContext();

  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);

    const notificationTimeout = setTimeout(() => {
      setShow(false);
    }, 5000);

    return () => {
      clearTimeout(notificationTimeout);
    };
  }, [notification]);

  const icon = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.ERROR:
        return (
          <CircleCancelMajor
            className="h-5 w-5 text-red-400"
            aria-hidden="true"
          />
        );
      case NOTIFICATION_TYPES.INFO:
        return (
          <QuestionMarkMinor
            className="h-5 w-5 text-blue-400"
            aria-hidden="true"
          />
        );
      case NOTIFICATION_TYPES.SUCCESS:
        return (
          <CircleTickMajor
            className="h-5 w-5 text-green-400"
            aria-hidden="true"
          />
        );
      case NOTIFICATION_TYPES.WARNING:
        return (
          <CircleAlertMajor
            className="h-5 w-5 text-yellow-400"
            aria-hidden="true"
          />
        );
    }
  };

  const boxColor = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.ERROR:
        return "border-red-400 bg-red-50";
      case NOTIFICATION_TYPES.INFO:
        return "border-blue-400 bg-blue-50";
      case NOTIFICATION_TYPES.SUCCESS:
        return "border-green-400 bg-green-50";
      case NOTIFICATION_TYPES.WARNING:
        return "border-yellow-400 bg-yellow-50";
    }
  };

  const message = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.ERROR:
        return (
          <div className={`text-sm font-medium text-red-700`}>
            {notification.message}
          </div>
        );
      case NOTIFICATION_TYPES.INFO:
        return (
          <div className={`text-sm font-medium  text-blue-700`}>
            {notification.message}
          </div>
        );
      case NOTIFICATION_TYPES.SUCCESS:
        return (
          <div className={`text-sm font-medium  text-green-700`}>
            {notification.message}
          </div>
        );
      case NOTIFICATION_TYPES.WARNING:
        return (
          <div className={`text-sm font-medium  text-yellow-700`}>
            {notification.message}
          </div>
        );
    }
  };

  const textColor = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.ERROR:
        return "text-red-700";
      case NOTIFICATION_TYPES.INFO:
        return "text-blue-700";
      case NOTIFICATION_TYPES.SUCCESS:
        return "text-green-700";
      case NOTIFICATION_TYPES.WARNING:
        return "text-yellow-700";
    }
  };

  const dismissButton = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.ERROR:
        return (
          <button
            type="button"
            onClick={() => {
              setShow(false);
            }}
            className="inline-flex rounded-md p-1.5 bg-red-50 hover:bg-red-200 text-red-500"
          >
            <span className="sr-only">Dismiss</span>
            <MobileCancelMajor
              className={`h-5 w-5 ${textColor}`}
              aria-hidden="true"
            />
          </button>
        );
      case NOTIFICATION_TYPES.INFO:
        return (
          <button
            type="button"
            onClick={() => {
              setShow(false);
            }}
            className="inline-flex rounded-md p-1.5 bg-blue-50 hover:bg-blue-200 text-blue-500"
          >
            <span className="sr-only">Dismiss</span>
            <MobileCancelMajor
              className={`h-5 w-5 ${textColor}`}
              aria-hidden="true"
            />
          </button>
        );
      case NOTIFICATION_TYPES.SUCCESS:
        return (
          <button
            type="button"
            onClick={() => {
              setShow(false);
            }}
            className="inline-flex rounded-md p-1.5 bg-green-50 hover:bg-green-200 text-green-500"
          >
            <span className="sr-only">Dismiss</span>
            <MobileCancelMajor
              className={`h-5 w-5 ${textColor}`}
              aria-hidden="true"
            />
          </button>
        );
      case NOTIFICATION_TYPES.WARNING:
        return (
          <button
            type="button"
            onClick={() => {
              setShow(false);
            }}
            className="inline-flex rounded-md p-1.5 bg-yellow-50 hover:bg-yellow-200 text-yellow-500"
          >
            <span className="sr-only">Dismiss</span>
            <MobileCancelMajor
              className={`h-5 w-5 ${textColor}`}
              aria-hidden="true"
            />
          </button>
        );
    }
  };

  return (
    <>
      {notification?.type && notification?.message && (
        <div
          className={`absolute w-screen z-40 ${
            show ? "visible opacity-100" : "invisible opacity-0"
          } transition-opacity duration-300`}
        >
          <div
            className={`border-l-4 rounded-md ${boxColor()} p-4 max-w-fit mx-auto`}
          >
            <div className="flex">
              <div className="flex-shrink-0">{icon()}</div>
              <div className="ml-3">{message()}</div>
              <div className="ml-12 pl-3">
                <div className="-mx-1.5 -my-1.5">{dismissButton()}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
