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

/**
 * 動画生成の進捗を確認する
 * @param userId ユーザーID
 * @returns 動画生成の進捗状態
 */
export const checkMovieStatus = async (
  userId: string
): Promise<MovieStatusResponse> => {
  const fastApiUrl =
    process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

  try {
    const response = await fetch(`${fastApiUrl}/api/movie-status/${userId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "動画生成の進捗確認に失敗しました");
    }

    return data;
  } catch (error) {
    console.error("動画生成の進捗確認エラー:", error);
    throw new Error("動画生成の進捗確認に失敗しました");
  }
};

/**
 * 生成された動画を取得する
 * @param userId ユーザーID
 * @returns 動画のURLを含むレスポンス
 */
export const getGeneratedMovie = async (
  userId: string
): Promise<MovieResponse> => {
  const fastApiUrl =
    process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

  try {
    const response = await fetch(`${fastApiUrl}/api/video/${userId}`);

    if (!response.ok) {
      throw new Error("動画の取得に失敗しました");
    }

    // 動画データを取得
    const blob = await response.blob();
    const videoUrl = URL.createObjectURL(
      new Blob([blob], { type: "video/mp4" })
    );

    return {
      success: true,
      message: "動画を取得しました",
      video_url: videoUrl,
      status: "completed",
    };
  } catch (error) {
    console.error("動画取得エラー:", error);
    throw new Error("動画の取得に失敗しました");
  }
};

/**
 * 動画生成を開始し、完了するまで待機する
 * @param userId ユーザーID
 * @param days 期間（日数）
 * @param onProgress 進捗更新時のコールバック
 * @returns 生成された動画のURL
 */
export const generateMovieAndWait = async (
  userId: string,
  days: number,
  onProgress?: (status: MovieStatusResponse) => void
): Promise<string> => {
  // 動画生成を開始
  await generateMovie(userId, days);

  // ポーリング間隔（ミリ秒）
  const POLLING_INTERVAL = 2000;
  // 最大待機時間（ミリ秒）
  const MAX_WAIT_TIME = 5 * 60 * 1000; // 5分
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_WAIT_TIME) {
    // 進捗を確認
    const status = await checkMovieStatus(userId);

    // 進捗コールバックを呼び出し
    onProgress?.(status);

    if (status.status === "completed" && status.video_url) {
      // 動画を取得
      const movieResponse = await getGeneratedMovie(userId);
      return movieResponse.video_url!;
    }

    if (status.status === "failed") {
      throw new Error(status.message || "動画生成に失敗しました");
    }

    // 次のポーリングまで待機
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
  }

  throw new Error("動画生成がタイムアウトしました");
};
