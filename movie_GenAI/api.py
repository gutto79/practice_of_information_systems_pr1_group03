from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import sys
from typing import Literal, Optional, Dict
from pathlib import Path
from enum import Enum

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

class GenerationStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

# 動画生成の状態を管理するためのグローバル変数
movie_generation_status = {
    "status": GenerationStatus.PENDING,
    "message": "待機中",
    "video_url": None,
    "current_uid": None
}

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
    status: Optional[GenerationStatus] = None

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
        # 状態を更新
        movie_generation_status.update({
            "status": GenerationStatus.PROCESSING,
            "message": "動画生成中です",
            "video_url": None,
            "current_uid": uid
        })
        
        main(uid, days)  # uidは必要なので維持
        
        # 生成完了時の状態を更新
        movie_generation_status.update({
            "status": GenerationStatus.COMPLETED,
            "message": "動画生成が完了しました",
            "video_url": "/api/video",
            "current_uid": uid
        })
        print(f"Movie generation completed for user {uid} with days={days}")
    except Exception as e:
        # エラー時の状態を更新
        movie_generation_status.update({
            "status": GenerationStatus.FAILED,
            "message": f"動画生成中にエラーが発生しました: {str(e)}",
            "video_url": None,
            "current_uid": uid
        })
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
async def generate_movie(request: MovieGenerationRequest):
    # 環境変数のチェック
    missing_env_vars = check_environment_variables()
    if missing_env_vars:
        print(f"Missing environment variables: {', '.join(missing_env_vars)}. Using dummy data for development.")
        video_path = Path(__file__).parent / "monthly_review.mp4"
        if not video_path.exists():
            raise HTTPException(status_code=404, detail="Dummy video file not found")
        return FileResponse(
            video_path,
            media_type="video/mp4",
            filename="monthly_review.mp4"
        )
    
    try:
        # 既に生成済みの動画がある場合はそれを返す
        video_path = Path("monthly_review.mp4")
        if video_path.exists() and movie_generation_status["status"] == GenerationStatus.COMPLETED:
            return FileResponse(
                video_path,
                media_type="video/mp4",
                filename="monthly_review.mp4"
            )
        # 初期状態を設定
        movie_generation_status.update({
            "status": GenerationStatus.PROCESSING,
            "message": "動画生成中です",
            "video_url": None,
            "current_uid": request.uid
        })
        
        try:
            # 同期的に動画生成を実行
            main(request.uid, request.days)
            
            # 生成完了時の状態を更新
            movie_generation_status.update({
                "status": GenerationStatus.COMPLETED,
                "message": "動画生成が完了しました",
                "video_url": "/api/video",
                "current_uid": request.uid
            })
            
            # 生成された動画を返す
            if video_path.exists():
                return FileResponse(
                    video_path,
                    media_type="video/mp4",
                    filename="monthly_review.mp4"
                )
            else:
                raise HTTPException(status_code=500, detail="動画ファイルが見つかりません")
                
        except Exception as e:
            # エラー時の状態を更新
            movie_generation_status.update({
                "status": GenerationStatus.FAILED,
                "message": f"動画生成中にエラーが発生しました: {str(e)}",
                "video_url": None,
                "current_uid": request.uid
            })
            raise HTTPException(status_code=500, detail=str(e))
            
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
