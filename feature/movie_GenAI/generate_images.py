import os
import openai
from datetime import datetime, timedelta
import supabase
from dotenv import load_dotenv
import base64
import requests
from PIL import Image
import io

# 環境変数の読み込み
load_dotenv()

# APIキーの設定
openai.api_key = os.getenv("OPENAI_API_KEY")

# Supabaseの設定
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase_client = supabase.create_client(supabase_url, supabase_key)

def get_monthly_events():
    """過去1ヶ月分のイベントを取得"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    response = supabase_client.table('Action').select(
        'action_name, happiness_change, Calendar(timestamp)'
    ).gte('Calendar.timestamp', start_date.isoformat()).lte('Calendar.timestamp', end_date.isoformat()).execute()
    
    return response.data

def generate_prompt(event):
    prompt = "あなたはカップルのスライドショーの一部となる画像を生成するアシスタントです。"
    """イベントから画像生成用のプロンプトを作成"""
    happiness = "幸せな" if event['happiness_change'] > 0 else "悲しい"
    return f"{happiness} {event['action_name']}の様子を表現した画像を生成してください。高品質で写実的な画像を生成してください。"

def generate_image_with_gpt(prompt):
    """GPT-4 Vision APIを使用して画像を生成"""
    try:
        response = openai.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        
        # 生成された画像のURLを取得
        image_url = response.data[0].url
        
        # 画像をダウンロード
        image_response = requests.get(image_url)
        image = Image.open(io.BytesIO(image_response.content))
        
        return image
    except Exception as e:
        print(f"Error generating image: {e}")
        return None

def generate_images():
    """イベントから画像を生成"""
    # 出力ディレクトリの作成
    output_dir = "generated_images"
    os.makedirs(output_dir, exist_ok=True)
    
    # イベントの取得
    events = get_monthly_events()
    
    # 各イベントに対して画像を生成
    for i, event in enumerate(events):
        prompt = generate_prompt(event)
        image = generate_image_with_gpt(prompt)
        
        if image:
            # 画像の保存
            timestamp = event['Calendar'][0]['timestamp']
            date_str = datetime.fromisoformat(timestamp).strftime("%Y%m%d_%H%M")
            image_path = os.path.join(output_dir, f"event_{date_str}_{i}.png")
            image.save(image_path)
            
            print(f"Generated image for event: {event['action_name']}")
        else:
            print(f"Failed to generate image for event: {event['action_name']}")

if __name__ == "__main__":
    generate_images() 