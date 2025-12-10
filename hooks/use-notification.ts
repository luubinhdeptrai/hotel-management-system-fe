import { useState, useCallback } from "react";

export function useNotification() {
  const [message, setMessage] = useState("");

  const showSuccess = useCallback((msg: string, duration = 5000) => {
    setMessage(msg);
    if (duration > 0) {
      setTimeout(() => setMessage(""), duration);
    }
  }, []);

  const clearMessage = useCallback(() => {
    setMessage("");
  }, []);

  return {
    message,
    showSuccess,
    clearMessage,
  };
}
