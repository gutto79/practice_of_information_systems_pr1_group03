"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { MovieStatusResponse } from "@/feature/home/services/movieService";
import { useModal } from "./useModal";

interface MovieContextType {
  status: MovieStatusResponse | null;
  videoUrl: string | null;
  setStatus: (status: MovieStatusResponse | null) => void;
  setVideoUrl: (url: string | null) => void;
  videoPlayerModal: {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
  };
  // トースト通知関連
  toastMessage: string;
  showToast: boolean;
  showToastMessage: (message: string) => void;
  // 完了トースト表示フラグ
  setShouldShowCompletionToast: (show: boolean) => void;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [status, setStatus] = useState<MovieStatusResponse | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoPlayerModal = useModal();

  // トースト通知関連の状態
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showToast, setShowToast] = useState<boolean>(false);

  // トースト表示関数
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    // 5秒後に非表示にする
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  // 動画URLが設定されてもモーダルは自動的に開かない
  // モーダルは「スライドショーを表示！」ボタンを押したときだけ開く

  // 状態が変わった時にトースト通知を表示
  // ただし、初期ロード時（handleGetMovie）では表示しない
  // このフラグはuseMovie.tsで設定される
  const [shouldShowCompletionToast, setShouldShowCompletionToast] =
    useState<boolean>(false);

  useEffect(() => {
    if (status?.status === "completed" && shouldShowCompletionToast) {
      showToastMessage("動画生成が完了しました！");
      // 一度表示したらリセット
      setShouldShowCompletionToast(false);
    } else if (
      status?.status === "failed" &&
      !status.message?.includes("Failed to fetch video")
    ) {
      showToastMessage(status.message || "エラーが発生しました");
    }
  }, [status, shouldShowCompletionToast]);

  return (
    <MovieContext.Provider
      value={{
        status,
        videoUrl,
        setStatus,
        setVideoUrl,
        videoPlayerModal,
        toastMessage,
        showToast,
        showToastMessage,
        setShouldShowCompletionToast,
      }}
    >
      {children}
      {/* グローバルなトースト通知 */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 pointer-events-none animate-fade-in-out">
          <div className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg max-w-md whitespace-pre-line">
            {toastMessage}
          </div>
        </div>
      )}
    </MovieContext.Provider>
  );
};

export const useMovieContext = (): MovieContextType => {
  const context = useContext(MovieContext);
  if (context === undefined) {
    throw new Error("useMovieContext must be used within a MovieProvider");
  }
  return context;
};
