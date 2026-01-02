import { useState, useCallback } from "react";

type NotificationType = "success" | "error";

export function useNotification() {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<NotificationType>("success");

  const showSuccess = useCallback((msg: string, duration = 5000) => {
    setMessage(msg);
    setType("success");
    if (duration > 0) {
      setTimeout(() => setMessage(""), duration);
    }
  }, []);

  const showError = useCallback((msg: string, duration = 5000) => {
    setMessage(msg);
    setType("error");
    if (duration > 0) {
      setTimeout(() => setMessage(""), duration);
    }
  }, []);

  const clearMessage = useCallback(() => {
    setMessage("");
  }, []);

  return {
    message,
    type,
    showSuccess,
    showError,
    clearMessage,
  };
}
