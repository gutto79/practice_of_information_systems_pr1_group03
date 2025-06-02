import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white";
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "primary",
  text,
}) => {
  // サイズに基づくクラス
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  // カラーに基づくクラス
  const colorClasses = {
    primary: "border-blue-500 border-t-transparent",
    secondary: "border-pink-500 border-t-transparent",
    white: "border-white border-t-transparent",
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
        role="status"
        aria-label="読み込み中"
      />
      {text && <p className="mt-2 text-sm font-medium text-gray-700">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
