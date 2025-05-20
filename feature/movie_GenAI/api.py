from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import sys
from typing import Literal, Optional
from pathlib import Path

# 自作モジュールのインポート
from main import main

app = FastAPI(title="Movie Generation API", description="動画生成APIサーバー")

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切なオリジンに制限してください
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# リクエストモデルの定義
class MovieGenerationRequest(BaseModel):
    uid: str
    days: Literal[1, 7, 30]

# レスポンスモデルの定義
class MovieGenerationResponse(BaseModel):
    success: bool
    message: str
    note: Optional[str] = None
    video_url: Optional[str] = None

# 環境変数のチェック
def check_environment_variables():
    required_env_vars = [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "OPENAI_API_KEY",
    ]
    
    missing_env_vars = [var for var in required_env_vars if not os.getenv(var)]
    return missing_env_vars

# バックグラウンドタスクとして動画生成を実行
def generate_movie_task(uid: str, days: int):
    try:
        main(uid, days)
        print(f"Movie generation completed for user {uid} with days={days}")
    except Exception as e:
        print(f"Error in movie generation task: {e}")

@app.get("/api/dummy-video")
async def get_dummy_video():
    """開発モード用のダミービデオを返すエンドポイント"""
    video_path = Path(__file__).parent / "monthly_review.mp4"
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Dummy video file not found")
    return FileResponse(
        video_path,
        media_type="video/mp4",
        filename="monthly_review.mp4"
    )

@app.post("/api/generate-movie", response_model=MovieGenerationResponse)
async def generate_movie(request: MovieGenerationRequest, background_tasks: BackgroundTasks):
    # 環境変数のチェック
    missing_env_vars = check_environment_variables()
    if missing_env_vars:
        print(f"Missing environment variables: {', '.join(missing_env_vars)}. Using dummy data for development.")
        # 開発環境では環境変数がなくてもエラーを返さない
        return MovieGenerationResponse(
            success=True,
            message="開発モード：ダミーデータで動画が生成されました",
            note="実際の動画は生成されていません。環境変数を設定してください。",
            video_url="/api/dummy-video"  # ダミービデオのURLを返す
        )
    
    try:
        # バックグラウンドタスクとして動画生成を実行
        background_tasks.add_task(generate_movie_task, request.uid, request.days)
        
        return MovieGenerationResponse(
            success=True,
            message="動画生成タスクが開始されました"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"動画生成中にエラーが発生しました: {str(e)}"
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    # ポート番号は環境変数から取得するか、デフォルト値を使用
    port = int(os.getenv("PORT", 8000))
    # 開発環境では reload=True にすると便利
    uvicorn.run("api:app", host="0.0.0.0", port=port, reload=True)
