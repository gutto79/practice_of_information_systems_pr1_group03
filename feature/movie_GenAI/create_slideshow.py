import os
import cv2
import numpy as np
from moviepy.editor import ImageClip, concatenate_videoclips

def create_slideshow():
    """生成された画像からスライドショー動画を作成"""
    # 画像ディレクトリのパス
    image_dir = "generated_images"
    
    # 画像ファイルの取得とソート
    image_files = sorted([f for f in os.listdir(image_dir) if f.endswith('.png')])
    
    if not image_files:
        print("No images found in the directory")
        return
    
    # 各画像の表示時間を計算（30秒を画像数で割る）
    duration = 30.0 / len(image_files)
    
    # 画像クリップのリストを作成
    clips = []
    for image_file in image_files:
        image_path = os.path.join(image_dir, image_file)
        clip = ImageClip(image_path).set_duration(duration)
        clips.append(clip)
    
    # クリップを連結
    final_clip = concatenate_videoclips(clips)
    
    # 動画の保存
    output_path = "monthly_review.mp4"
    final_clip.write_videofile(output_path, fps=24)
    
    print(f"Slideshow video created: {output_path}")

if __name__ == "__main__":
    create_slideshow() 