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

# Supabaseの設定
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase_client = supabase.create_client(supabase_url, supabase_key)

# 画像生成のAPIエンドポイント
url = "https://api.openai.com/v1/images/generations"

# 認証用のヘッダー
headers = {
    "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
    "Content-Type": "application/json"
}

# 過去1ヶ月分のイベントを取得
# 現状uid固定
def get_monthly_events(uid,days):
    end_date = datetime.now()
    start_date = end_date - timedelta(days)
    
    response = supabase_client.table('Action').select(
        'action_name, happiness_change, Calendar(timestamp), User!Action_uid_fkey(gender)'
    ).eq('uid', uid).gte('Calendar.timestamp', start_date.isoformat()).lte('Calendar.timestamp', end_date.isoformat()).execute()
    print(response.data)
    return response.data

# イベントから画像生成用のプロンプトを作成
def generate_prompt(event):
    prompt = "あなたはカップルのスライドショーの一部となる画像を生成するアシスタントです。"
    happiness = "嬉しい" if event['happiness_change'] > 0 else "悲しい"
    happiness_change = event['happiness_change']
    gender = "男性" if event['User']['gender'] == 'male' else "女性"
    prompt += f"性別：{gender}\n"
    prompt += f"{happiness}度合い： {happiness_change}\n"
    prompt += f"されたこと：{event['action_name']}\n"
    prompt += "以上の出来事を表現した画像を生成してください。アニメ調でお願いします。"
    return prompt

def generate_image_with_gpt(prompt):
    # GPT-4 Vision APIを使用して画像を生成
    try:
        # ペイロードを定義する
        payload = {
            "model": "gpt-image-1",
            "prompt": prompt,
            "n": 1,  # 生成する画像の枚数
            "size": "1024x1024",  # 画像の解像度
        }

        # リクエストを送信
        response = requests.post(url, headers=headers, json=payload)

        # レスポンスを確認
        if response.status_code == 200:
            data = response.json()
            # 画像をダウンロード
            image_b64 = data['data'][0]['b64_json']
            image_bytes = base64.b64decode(image_b64)
            image = Image.open(io.BytesIO(image_bytes))
            return image
    except Exception as e:
        print(f"Error generating image: {e}")
        return None

# イベントから画像を生成
def generate_images(uid, days):
    print(f"Generating images for user {uid} with days={days}")
    
    # 出力ディレクトリの作成
    output_dir = "feature/movie_GenAI/generated_images"
    os.makedirs(output_dir, exist_ok=True)
    
    # イベントの取得
    events = get_monthly_events(uid, days)
    
    # 各イベントに対して画像を生成
    for i, event in enumerate(events):
        prompt = generate_prompt(event)
        image = generate_image_with_gpt(prompt)
        
        if image:
            # 画像の保存
            action_name = event['action_name'].replace(' ', '').replace('/', '')
            happiness_change = event['happiness_change']
            timestamp = event['Calendar'][0]['timestamp']
            date_str = datetime.fromisoformat(timestamp).strftime("%Y%m%d_%H%M")
            image_path = os.path.join(output_dir, f"{action_name}_{happiness_change}_{date_str}_{i}.png")
            image.save(image_path)
            
            print(f"Generated image for event: {event['action_name']}")
        else:
            print(f"Failed to generate image for event: {event['action_name']}")

if __name__ == "__main__":
    # テスト用
    import sys
    if len(sys.argv) > 2:
        uid = sys.argv[1]
        days = int(sys.argv[2])
        generate_images(uid, days)
    else:
        print("Usage: python generate_images.py <uid> <days>")
