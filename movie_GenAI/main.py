from generate_images import generate_images
from create_slideshow import create_slideshow
import os
import asyncio

async def main(uid, days):
    """メイン実行関数"""
    print("Starting monthly review video generation...")
    
    # 画像の生成（非同期で並列実行）
    print(f"Generating images from events for user {uid} with days={days}...")
    await generate_images(uid, days)
    
    # スライドショーの作成（同期的に実行）
    print("Creating slideshow video...")
    create_slideshow()
    
    print("Process completed successfully!")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 2:
        uid = sys.argv[1]
        days = int(sys.argv[2])
        asyncio.run(main(uid, days))
    else:
        print("Usage: python main.py <uid> <days>")
