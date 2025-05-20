from generate_images import generate_images
from create_slideshow import create_slideshow
import os

import sys

def main(uid, days):
    """メイン実行関数"""
    print("Starting monthly review video generation...")
    
    # 画像の生成
    print(f"Generating images from events for user {uid} with days={days}...")
    generate_images(uid, days)
    
    # スライドショーの作成
    print("Creating slideshow video...")
    create_slideshow()
    
    print("Process completed successfully!")

if __name__ == "__main__":
    # コマンドライン引数を取得
    if len(sys.argv) != 3:
        print("Usage: python main.py <uid> <days>")
        sys.exit(1)
    
    uid = sys.argv[1]
    days = int(sys.argv[2])
    
    # 引数の検証
    if days not in [1, 7, 30]:
        print("Error: days must be either 1, 7, or 30")
        sys.exit(1)
    
    main(uid, days)
