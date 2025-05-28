import React from "react";
import LoadingSpinner from "./loading-spinner";

/**
 * 画面中央に大きく表示される白色のローディングスピナー
 */
const CenteredLoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <LoadingSpinner size="lg" color="white" />
    </div>
  );
};

export default CenteredLoadingSpinner;
