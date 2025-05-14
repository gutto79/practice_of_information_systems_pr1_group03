from generate_images import generate_images
from create_slideshow import create_slideshow
import os

def main():
    """メイン実行関数"""
    print("Starting monthly review video generation...")
    
    # 画像の生成
    print("Generating images from events...")
    generate_images()
    
    # スライドショーの作成
    print("Creating slideshow video...")
    create_slideshow()
    
    print("Process completed successfully!")

if __name__ == "__main__":
    main() 