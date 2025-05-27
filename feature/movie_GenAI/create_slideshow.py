import os
from moviepy.editor import (
    ImageClip, concatenate_videoclips, TextClip, CompositeVideoClip, vfx
)
import supabase
from dotenv import load_dotenv
from datetime import datetime
from moviepy.video.fx.all import fadein, fadeout

# 環境変数の読み込み
load_dotenv()

# Supabaseの設定
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase_client = supabase.create_client(supabase_url, supabase_key)

def get_action_name(timestamp_str):
    # タイムスタンプをdatetimeオブジェクトに変換
    timestamp = datetime.strptime(timestamp_str, "%Y%m%d_%H%M")
    
    # Supabaseからアクションを取得
    response = supabase_client.table('Action').select(
        'action_name, Calendar(timestamp)'
    ).eq('Calendar.timestamp', timestamp.isoformat()).execute()
    
    if response.data and len(response.data) > 0:
        return response.data[0]['action_name']
    return ""

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
            .set_duration(base_duration + crossfade_duration)  # クロスフェード時間を考慮
            .resize(height=1080)                               # 高さを統一（幅は自動調整）
            .fx(vfx.resize, lambda t: 1 + 0.005 * t)           # ズーム効果を緩やかに
        )
        

        # ファイル名からaction_nameとhappiness_changeを抽出
        name_parts = image_file.split('_')
        action_name = name_parts[0]
        happiness_change = name_parts[1]
        display_text = f"{action_name} ({happiness_change})"
        txt_clip = (
            TextClip(
                display_text,
                fontsize=50,
                color='white',
                stroke_color='black',
                stroke_width=2
            )
            .set_position(("center", "top"))
            .set_duration(base_duration + crossfade_duration)
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
