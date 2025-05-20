import React, { useEffect } from "react";
import { styles } from "../utils/utils";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onHide: () => void;
  duration?: number;
}

/**
 * トースト通知コンポーネント
 */
const Toast: React.FC<ToastProps> = ({
  message,
  isVisible,
  onHide,
  duration = 2000,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide, duration]);

  if (!isVisible) return null;

  return (
    <div className={styles.toast}>
      <div className={styles.toastContent}>{message}</div>
    </div>
  );
};

export default Toast;
