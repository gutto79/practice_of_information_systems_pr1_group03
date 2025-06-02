import os
from moviepy.editor import (
    ImageClip, concatenate_videoclips, TextClip, CompositeVideoClip, vfx
)
import supabase
from dotenv import load_dotenv
from datetime import datetime
import math

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

    # 各クリップの基本時間を設定
    base_duration = min(3, 30.0 / len(image_files))
    # クロスフェードの時間を設定（基本時間の40%に増加）
    crossfade_duration = base_duration * 0.4
    clips = []

    for i, image_file in enumerate(image_files):
        image_path = os.path.join(image_dir, image_file)
        
        # ファイル名からaction_nameとhappiness_changeを抽出
        name_parts = image_file.split('_')
        
        # ファイル名の2番目の部分が幸福度の変化
        happiness_change = int(name_parts[1])
        
        animation_speed = 1
        # 幸福度の絶対値が大きいほど、アニメーションが速くなる
        if abs(happiness_change) >= 80:
            animation_speed = 6
        elif abs(happiness_change) >= 50:
            animation_speed = 2
        else:
            animation_speed = 0.5
        print(animation_speed)
        
        # ズームイン効果を模擬する：resize + position + set_duration
        def triangle_wave(t, frequency=1.0):
            return 1 - 2 * abs(2 * ((t * frequency) % 1) - 1)
        

        image_clip = (
            ImageClip(image_path)
            .set_duration(base_duration + crossfade_duration)
            .resize(height=1080)
            .fx(vfx.resize, lambda t, s=animation_speed: 1.1 + 0.01 * triangle_wave(t, frequency=s))
            .set_position(("center", "center"))
        )

        if happiness_change > 0:
            happiness_change_str = "+" + str(happiness_change)
        else:
            happiness_change_str = str(happiness_change)

        # 幸福度変化のテキストクリップ（右上）
        happiness_txt_clip = (
            TextClip(
                happiness_change_str,
                fontsize=200,
                color='red' if happiness_change < 0 else 'blue',
                stroke_width=2,
                font="Rounded M+ 1c"
            )
            .set_position(("right", "top"))
            .set_duration(base_duration + crossfade_duration)
        )

        # 3つのクリップを合成
        video_clip = CompositeVideoClip([
            image_clip,
            happiness_txt_clip.set_opacity(0.5)
        ])

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





