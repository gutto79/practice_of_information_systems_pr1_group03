import os
from moviepy.editor import (
    ImageClip, concatenate_videoclips, TextClip, CompositeVideoClip, vfx
)
from moviepy.video.fx.all import fadein, fadeout

def create_slideshow():
    image_dir = "generated_images"
    image_files = sorted([f for f in os.listdir(image_dir) if f.endswith('.png')])
    
    if not image_files:
        print("No images found in the directory")
        return
    
    duration = min(3, 30.0 / len(image_files))
    fade_duration = 1.0  # フェードの持続時間（秒）
    clips = []

    for i, image_file in enumerate(image_files):
        image_path = os.path.join(image_dir, image_file)

        # ズームイン効果を模擬する：resize + position + set_duration
        image_clip = (
            ImageClip(image_path)
            .set_duration(duration)
            .resize(height=1080)  # 高さを統一（幅は自動調整）
            .fx(vfx.resize, lambda t: 1 + 0.01 * t)  # 時間とともに拡大
        )
        

        # テキスト（イベント名）を表示
        event_name = image_file.split('_')[1:-1]
        event_text = f"Event: {' '.join(event_name)}"
        txt_clip = (
            TextClip(event_text, fontsize=50, color='white', stroke_color='black', stroke_width=2)
            .set_position(("center", "top"))
            .set_duration(duration)
        )

        video_clip = CompositeVideoClip([image_clip, txt_clip])

        # フェード効果の適用
        if i == 0:  # 最初のクリップ
            video_clip = video_clip.fx(fadeout, fade_duration)
        elif i == len(image_files) - 1:  # 最後のクリップ
            video_clip = video_clip.fx(fadein, fade_duration)
        else:  # 中間のクリップ
            video_clip = video_clip.fx(fadein, fade_duration).fx(fadeout, fade_duration)

        clips.append(video_clip)

    final_clip = concatenate_videoclips(clips, method="compose")
    output_path = "monthly_review.mp4"
    final_clip.write_videofile(output_path, fps=24)
    print(f"Slideshow video created: {output_path}")

if __name__ == "__main__":
    create_slideshow()
