# 動画生成 API サーバー

このディレクトリには、カップルのイベントから動画を生成するための API サーバーが含まれています。

## 変更点

Next.js の API ルートから FastAPI に移行しました。これにより、Vercel でのデプロイが可能になります。

## 必要条件

- Python 3.8 以上
- pip（Python パッケージマネージャー）
- Node.js と npm（フロントエンドの実行に必要）

## セットアップと実行方法

### 1. 環境変数の設定

以下の環境変数が必要です：

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase の URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase の匿名キー
- `OPENAI_API_KEY`: OpenAI API キー
- `NEXT_PUBLIC_FASTAPI_URL`: FastAPI サーバーの URL（デフォルトは http://localhost:8000）

これらは`.env`ファイルに設定されています。

### 2. 開発環境での起動方法

#### 方法 1: npm スクリプトを使用（推奨）

プロジェクトのルートディレクトリで以下のコマンドを実行します：

```bash
# 初回のみ: FastAPI サーバーの依存関係をインストール
npm run setup:api

# FastAPI サーバーのみを起動
npm run api

# Next.js と FastAPI の両方を同時に起動（開発環境）
npm run dev:all
```

#### 方法 2: 個別に起動

##### FastAPI サーバーの起動

###### Mac または linux

```bash
cd feature/movie_GenAI
./start_server.sh
```

###### Windows

```bash
cd feature/movie_GenAI
start_server.bat
```

または、手動で以下のコマンドを実行することもできます：

```bash
cd feature/movie_GenAI
pip install -r requirements.txt
python api.py
```

FastAPI サーバーは`http://localhost:8000`で起動します。

##### Next.js サーバーの起動

別のターミナルで以下のコマンドを実行します：

```bash
npm run dev
```

Next.js サーバーは`http://localhost:3000`で起動します。

## API エンドポイント

### 動画生成

- **URL**: `/api/generate-movie`
- **メソッド**: POST
- **リクエストボディ**:
  ```json
  {
    "uid": "ユーザーID",
    "days": 1 | 7 | 30
  }
  ```
- **レスポンス**:
  ```json
  {
    "success": true,
    "message": "動画生成タスクが開始されました",
    "note": "開発モードの場合のみ表示",
    "video_url": "/api/dummy-video" // 開発モードの場合のみ含まれる
  }
  ```

## 動画取得

### ダミービデオ取得（開発モード用）

- **URL**: `/api/dummy-video`
- **メソッド**: GET
- **レスポンス**: MP4 形式の動画ファイル
- **Content-Type**: `video/mp4`
- **説明**: 開発モード時に使用されるダミービデオファイルを返します。環境変数が設定されていない場合、`/api/generate-movie`エンドポイントはこのダミービデオの URL を返します。

### ヘルスチェック

- **URL**: `/health`
- **メソッド**: GET
- **レスポンス**:
  ```json
  {
    "status": "healthy"
  }
  ```

## フロントエンドからの接続

フロントエンドは環境変数`NEXT_PUBLIC_FASTAPI_URL`を使用して API サーバーに接続します。この変数が設定されていない場合は、デフォルトで`http://localhost:8000`が使用されます。

### 動画の取得と表示方法

フロントエンドで動画を表示する方法は以下の 2 つがあります：

#### 1. 直接 video タグで表示する場合

```tsx
// 開発モードの場合（video_urlが含まれる）
const { data } = await fetch("/api/generate-movie", {
  method: "POST",
  body: JSON.stringify({ uid: "user123", days: 7 }),
}).then((res) => res.json());

if (data.video_url) {
  return (
    <video
      src={`${process.env.NEXT_PUBLIC_FASTAPI_URL}${data.video_url}`}
      controls
      className="w-full"
    />
  );
}
```

#### 2. Blob として取得して表示する場合

```tsx
"use client";

import { useState, useEffect } from "react";

export function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_FASTAPI_URL}${videoUrl}`
        );
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoBlobUrl(url);
      } finally {
        setIsLoading(false);
      }
    };

    if (videoUrl) {
      fetchVideo();
    }

    // メモリリーク防止のためのクリーンアップ
    return () => {
      if (videoBlobUrl) {
        URL.revokeObjectURL(videoBlobUrl);
      }
    };
  }, [videoUrl]);

  if (isLoading) return <div>読み込み中...</div>;

  return <video src={videoBlobUrl || ""} controls className="w-full" />;
}
```

使用例：

```tsx
// ページコンポーネント内
const { data } = await fetch("/api/generate-movie", {
  method: "POST",
  body: JSON.stringify({ uid: "user123", days: 7 }),
}).then((res) => res.json());

if (data.video_url) {
  return <VideoPlayer videoUrl={data.video_url} />;
}
```

### 注意事項

- 動画ファイルは`video/mp4`形式で配信されます
- 大きなファイルの場合は、ストリーミング再生を検討してください
- クロスオリジンの問題が発生する場合は、CORS の設定を確認してください
- 開発モードでは`video_url`が含まれ、本番モードでは含まれません

## 注意事項

- 開発環境では、必要な環境変数が設定されていない場合でもエラーを返さず、ダミーデータを使用します。
- 本番環境では、適切な CORS 設定を行ってください。
