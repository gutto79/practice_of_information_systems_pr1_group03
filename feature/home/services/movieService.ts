export interface MovieResponse {
  success: boolean;
  message: string;
  note?: string;
  video_url?: string;
  status?: "pending" | "processing" | "completed" | "failed";
}

export interface MovieStatusResponse {
  status: "pending" | "processing" | "completed" | "failed";
  message: string;
  video_url?: string;
}

export const generateMovie = async (
  userId: string,
  days: number
): Promise<MovieResponse> => {
  // FastAPIサーバーのURLを環境変数から取得
  const fastApiUrl =
    process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

  try {
    // 動画生成リクエストを送信
    const response = await fetch(`${fastApiUrl}/api/generate-movie`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: userId,
        days: days,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.detail || errorData?.error || "動画生成に失敗しました"
      );
    }

    // 動画データを取得
    const blob = await response.blob();
    const videoUrl = URL.createObjectURL(
      new Blob([blob], { type: "video/mp4" })
    );

    return {
      success: true,
      message: "動画を生成しました",
      video_url: videoUrl,
    };
  } catch (error) {
    console.error("FastAPIサーバーへの接続エラー:", error);
    throw new Error(
      "動画生成サーバーに接続できませんでした。サーバーが起動しているか確認してください。"
    );
  }
};

// トースト通知をスキップするためのエラー型
export class SilentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SilentError";
  }
}

/**
 * 動画を取得する（開発用）
 * @returns 動画のURLを含むレスポンス
 */
export const getMovie = async (): Promise<MovieResponse> => {
  const fastApiUrl =
    process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";
  const response = await fetch(`${fastApiUrl}/api/dummy-video`);

  if (!response.ok) {
    throw new SilentError("Failed to fetch video");
  }

  // 检查响应类型
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("video/mp4")) {
    throw new Error("Invalid video format");
  }

  // 获取视频数据
  const blob = await response.blob();

  // 创建视频 URL
  const videoUrl = URL.createObjectURL(new Blob([blob], { type: "video/mp4" }));

  return {
    success: true,
    message: "動画を取得しました",
    video_url: videoUrl,
  };
};
