import { useState } from "react";
import * as movieService from "../services/movieService";
import type { MovieStatusResponse } from "../services/movieService";
import type { TimeRange } from "../types/types";
import { useHomeData } from "./useHomeData";

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
  const { user } = useHomeData();
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

  // トースト表示関数
  const showToastMessage = (message: string) => {
    // トーストの表示は親コンポーネントで管理するため、
    // この関数は親コンポーネントから渡されることを想定
    console.log("Toast message:", message);
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
    if (!user?.id) {
      const errorMessage = "ユーザーIDが見つかりません";
      updateState({
        error: errorMessage,
        status: {
          status: "failed",
          message: errorMessage,
        },
      });
      showToastMessage(errorMessage);
      return;
    }

    try {
      updateState({
        loading: true,
        error: null,
        status: {
          status: "pending",
          message: "動画生成を開始します...",
        },
      });
      showToastMessage("動画生成を開始します...");

      // 選択された時間範囲に基づいて日数を計算
      const days =
        state.selectedTimeRange === "1週間"
          ? 7
          : state.selectedTimeRange === "1ヶ月"
          ? 30
          : 1;

      // 動画生成を開始し、完了を待機
      const videoUrl = await movieService.generateMovieAndWait(
        user.id, // 実際のユーザーIDを使用
        days,
        (status) => {
          // 進捗状態を更新
          updateState({ status });

          // 状態に応じてトーストメッセージを表示
          switch (status.status) {
            case "processing":
              showToastMessage("動画生成中...");
              break;
            case "completed":
              showToastMessage("動画生成が完了しました！");
              break;
            case "failed":
              showToastMessage(status.message || "動画生成に失敗しました");
              break;
          }
        }
      );

      // 動画URLを設定
      updateState({
        videoUrl,
        status: {
          status: "completed",
          message: "動画生成が完了しました",
          video_url: videoUrl,
        },
      });
    } catch (error) {
      console.error("動画生成エラー:", error);
      const errorMessage =
        error instanceof Error ? error.message : "動画生成に失敗しました";

      updateState({
        error: errorMessage,
        status: {
          status: "failed",
          message: errorMessage,
        },
      });

      showToastMessage(errorMessage);
    } finally {
      updateState({ loading: false });
    }
  };

  // 動画取得（開発用）
  const handleGetMovie = async () => {
    try {
      updateState({ loading: true, error: null });
      const response = await movieService.getMovie();

      if (response.video_url) {
        updateState({
          videoUrl: response.video_url,
          status: {
            status: "completed",
            message: "動画を取得しました",
            video_url: response.video_url,
          },
        });
        showToastMessage("動画を取得しました！");
      } else {
        throw new Error("動画のURLを取得できませんでした");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "動画の取得に失敗しました";

      updateState({
        error: errorMessage,
        status: {
          status: "failed",
          message: errorMessage,
        },
      });

      showToastMessage(errorMessage);
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
