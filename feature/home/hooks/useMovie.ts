import { useState } from "react";
import * as movieService from "../services/movieService";
import type { MovieStatusResponse } from "../services/movieService";
import type { TimeRange } from "../types/types";
import { useAuth } from "@/hooks/useAuth";
import { useMovieContext } from "@/hooks/useMovieContext";

interface MovieState {
  videoUrl: string | null;
  loading: boolean;
  selectedTimeRange: TimeRange;
  showTimeModal: boolean;
  status: MovieStatusResponse | null;
  error: string | null;
}

interface UseMovieReturn extends MovieState {
  handleGenerateMovie: () => Promise<void>;
  handleGetMovie: () => Promise<void>;
  setShowTimeModal: (show: boolean) => void;
  handleSelectTimeRange: (range: TimeRange) => void;
  setVideoUrl: (url: string | null) => void;
  showToastMessage: (message: string) => void;
  clearError: () => void;
}

/**
 * 動画関連の機能を管理するカスタムフック
 */
export const useMovie = (): UseMovieReturn => {
  const { uid } = useAuth();
  const {
    setStatus: setGlobalStatus,
    setVideoUrl: setGlobalVideoUrl,
    showToastMessage: showGlobalToastMessage,
    setShouldShowCompletionToast,
  } = useMovieContext();
  const [state, setState] = useState<MovieState>({
    videoUrl: null,
    loading: false,
    selectedTimeRange: "1日",
    showTimeModal: false,
    status: null,
    error: null,
  });

  // 状態を更新する関数
  const updateState = (newState: Partial<MovieState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  // トースト表示関数 - グローバルなトースト通知を使用
  const showToastMessage = (message: string) => {
    showGlobalToastMessage(message);
  };

  // 時間範囲選択
  const handleSelectTimeRange = (range: TimeRange) => {
    updateState({ selectedTimeRange: range });
  };

  // エラーをクリア
  const clearError = () => {
    updateState({ error: null });
  };

  // 動画生成
  const handleGenerateMovie = async () => {
    if (!uid) {
      const errorMessage = "ユーザーIDが見つかりません";
      const failedStatus = {
        status: "failed" as const,
        message: errorMessage,
      };

      updateState({
        error: errorMessage,
        status: failedStatus,
      });

      // グローバル状態も更新
      setGlobalStatus(failedStatus);
      showToastMessage(errorMessage);
      return;
    }

    try {
      const processingStatus = {
        status: "processing" as const,
        message: "動画生成中...",
      };

      updateState({
        loading: true,
        error: null,
        status: processingStatus,
      });

      // グローバル状態も更新
      setGlobalStatus(processingStatus);
      showToastMessage("動画生成を開始します...");

      // 選択された時間範囲に基づいて日数を計算
      const days =
        state.selectedTimeRange === "1週間"
          ? 7
          : state.selectedTimeRange === "1ヶ月"
          ? 30
          : 1;

      // 動画生成を実行
      const response = await movieService.generateMovie(uid, days);

      // 動画URLを設定
      const newStatus = {
        status: "completed" as const,
        message: "動画生成が完了しました",
        video_url: response.video_url,
      };

      updateState({
        videoUrl: response.video_url,
        status: newStatus,
      });

      // グローバル状態も更新
      setGlobalStatus(newStatus);
      setGlobalVideoUrl(response.video_url || null);
      // 生成完了時のトースト表示フラグをセット
      setShouldShowCompletionToast(true);
      showToastMessage("動画生成が完了しました！");
    } catch (error) {
      console.error("動画生成エラー:", error);
      const errorMessage =
        error instanceof Error ? error.message : "動画生成に失敗しました";

      const failedStatus = {
        status: "failed" as const,
        message: errorMessage,
      };

      updateState({
        error: errorMessage,
        status: failedStatus,
      });

      // グローバル状態も更新
      setGlobalStatus(failedStatus);

      showToastMessage(errorMessage);
    } finally {
      updateState({ loading: false });
    }
  };

  // 動画取得（開発用）
  const handleGetMovie = async () => {
    try {
      const processingStatus = {
        status: "processing" as const,
        message: "動画取得中...",
      };

      updateState({
        loading: true,
        error: null,
        status: processingStatus,
      });

      // グローバル状態も更新
      setGlobalStatus(processingStatus);

      const response = await movieService.getMovie();

      if (response.video_url) {
        const completedStatus = {
          status: "completed" as const,
          message: "動画を取得しました",
          video_url: response.video_url,
        };

        updateState({
          videoUrl: response.video_url,
          status: completedStatus,
        });

        // グローバル状態も更新
        setGlobalStatus(completedStatus);
        setGlobalVideoUrl(response.video_url || null);
      } else {
        throw new Error("動画のURLを取得できませんでした");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "動画の取得に失敗しました";

      const failedStatus = {
        status: "failed" as const,
        message: errorMessage,
      };

      updateState({
        error: errorMessage,
        status: failedStatus,
      });

      // グローバル状態も更新
      setGlobalStatus(failedStatus);

      // SilentErrorの場合はトースト通知をスキップ
      if (error instanceof movieService.SilentError) {
        console.log("Silent error occurred:", errorMessage);
      } else {
        showToastMessage(errorMessage);
      }
    } finally {
      updateState({ loading: false });
    }
  };

  return {
    ...state,
    handleGenerateMovie,
    handleGetMovie,
    setShowTimeModal: (show: boolean) => updateState({ showTimeModal: show }),
    handleSelectTimeRange,
    setVideoUrl: (url: string | null) => updateState({ videoUrl: url }),
    showToastMessage,
    clearError,
  };
};
