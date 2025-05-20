import os
from moviepy.editor import (
    ImageClip, concatenate_videoclips, TextClip, CompositeVideoClip, vfx
)

def create_slideshow():
    image_dir = "generated_images"
    image_files = sorted([f for f in os.listdir(image_dir) if f.endswith('.png')])
    
    if not image_files:
        print("No images found in the directory")
        return
    
    # 各クリップの基本時間を設定
    base_duration = min(5, 30.0 / len(image_files))
    # クロスフェードの時間を設定（基本時間の40%に増加）
    crossfade_duration = base_duration * 0.4
    
    clips = []

    for i, image_file in enumerate(image_files):
        image_path = os.path.join(image_dir, image_file)

        # ズームイン効果を模擬する：resize + position + set_duration
        image_clip = (
            ImageClip(image_path)
            .set_duration(base_duration + crossfade_duration)  # クロスフェード時間を考慮
            .resize(height=1080)                               # 高さを統一（幅は自動調整）
            .fx(vfx.resize, lambda t: 1 + 0.005 * t)           # ズーム効果を緩やかに
        )

        # アクション名を表示
        action_name = image_file.split('_')[1:-1]              # ファイル名からアクション名を抽出
        action_text = ' '.join(action_name)                    # アンダースコアをスペースに変換
        txt_clip = (
            TextClip(
                action_text,
                fontsize=50,
                color='white',
                stroke_color='black',
                stroke_width=2
            )
            .set_position(("center", "top"))
            .set_duration(base_duration + crossfade_duration)
        )

        video_clip = CompositeVideoClip([image_clip, txt_clip])
        
        # 最初のクリップ以外にクロスフェード効果を適用
        if i > 0:
            video_clip = video_clip.crossfadein(crossfade_duration)
        
        clips.append(video_clip)

    final_clip = concatenate_videoclips(clips, method="compose")
    output_path = "monthly_review.mp4"
    final_clip.write_videofile(output_path, fps=24)
    print(f"Slideshow video created: {output_path}")

if __name__ == "__main__":
    create_slideshow()
