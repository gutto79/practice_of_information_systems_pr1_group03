"use client";

import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onHide: () => void;
  duration?: number;
}

/**
 * トースト通知コンポーネント
 * 右上に表示される紫色の通知
 */
const Toast: React.FC<ToastProps> = ({
  message,
  isVisible,
  onHide,
  duration = 5000,
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
    <div className="fixed top-4 right-4 z-50 pointer-events-none animate-fade-in-out">
      <div className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg max-w-md whitespace-pre-line">
        {message}
      </div>
    </div>
  );
};

export default Toast;
