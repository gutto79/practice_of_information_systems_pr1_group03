import React from "react";
import LoadingSpinner from "./loading-spinner";

interface LoadingOverlayProps {
  fullScreen?: boolean;
  transparent?: boolean;
  text?: string;
  spinnerSize?: "sm" | "md" | "lg";
  spinnerColor?: "primary" | "secondary" | "white";
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  fullScreen = false,
  transparent = false,
  text = "読み込み中...",
  spinnerSize = "md",
  spinnerColor = "primary",
}) => {
  const baseClasses = "flex items-center justify-center";
  const positionClasses = fullScreen
    ? "fixed inset-0 z-50"
    : "absolute inset-0 z-10";
  const bgClasses = transparent ? "bg-white/50" : "bg-white/80";

  return (
    <div className={`${baseClasses} ${positionClasses} ${bgClasses}`}>
      <LoadingSpinner size={spinnerSize} color={spinnerColor} text={text} />
    </div>
  );
};

export default LoadingOverlay;
