/**
 * 動画生成・取得に関するサービスの実装
 */

/**
 * 動画生成APIのレスポンス型定義
 */
export interface MovieResponse {
  success: boolean;
  message: string;
  note?: string;
  video_url?: string;
}

/**
 * 動画生成APIを呼び出す
 * @param userId ユーザーID
 * @param days 日数
 * @returns APIレスポンス
 */
export const generateMovie = async (userId: string, days: number) => {
  // FastAPIサーバーのURLを環境変数から取得
  const fastApiUrl =
    process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

  try {
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

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        responseData.detail || responseData.error || "動画生成に失敗しました"
      );
    }

    return responseData;
  } catch (error) {
    console.error("FastAPIサーバーへの接続エラー:", error);
    throw new Error(
      "動画生成サーバーに接続できませんでした。サーバーが起動しているか確認してください。"
    );
  }
};

/**
 * 動画を取得する
 * @returns 動画のURLを含むレスポンス
 */
export const getMovie = async (): Promise<MovieResponse> => {
  const fastApiUrl =
    process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";
  const response = await fetch(`${fastApiUrl}/api/dummy-video`);

  if (!response.ok) {
    throw new Error("Failed to fetch video");
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
