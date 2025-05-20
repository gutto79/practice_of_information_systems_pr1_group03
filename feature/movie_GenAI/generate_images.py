import os
import openai
from datetime import datetime, timedelta
import supabase
from dotenv import load_dotenv
import base64
import requests
from PIL import Image
import io
import shutil

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

# カップルテーブルからパートナーのuidを取得
def get_partner_uid(uid):
    response = supabase_client.table('Couple').select('uid1, uid2').or_(f'uid1.eq.{uid},uid2.eq.{uid}').single().execute()
    if response.data:
        return response.data['uid2'] if response.data['uid1'] == uid else response.data['uid1']
    return None # パートナーが見つからない場合


# 過去1ヶ月分のイベントを取得
def get_monthly_events(uid, days):
    end_date = datetime.now()
    start_date = end_date - timedelta(days)
    
    response = supabase_client.table('Action').select(
        'action_name, happiness_change, Calendar(timestamp), User!Action_uid_fkey(gender)'
    ).eq('uid', uid).gte('Calendar.timestamp', start_date.isoformat()).lte('Calendar.timestamp', end_date.isoformat()).execute()
    return response.data

# イベントから画像生成用のプロンプトを作成
def generate_prompt(event, previous_event=None):
    prompt = "あなたはカップルのスライドショーの一部となる画像を生成するアシスタントです。"
    happiness = "嬉しい" if event['happiness_change'] > 0 else "悲しい"
    happiness_change = event['happiness_change']
    gender = "男性" if event['User']['gender'] == 'male' else "女性"
    
    # 前のイベントがある場合、連続性を持たせる
    if previous_event:
        prev_happiness = "嬉しい" if previous_event['happiness_change'] > 0 else "悲しい"
        prev_gender = "男性" if previous_event['User']['gender'] == 'male' else "女性"
        prompt += f"前のイベントでは{prev_gender}が{prev_happiness}気分でした。\n"
    
    prompt += f"性別：{gender}\n"
    prompt += f"{happiness}度合い(-100~100)： {happiness_change}\n"
    prompt += f"されたこと：{event['action_name']}\n"
    prompt += "以上の出来事を表現した画像を生成してください。アニメ調で大袈裟にお願いします。"
    
    # 連続性を持たせるための追加指示
    if previous_event:
        prompt += "前のイベントからの流れを意識して、自然な展開になるようにしてください。"
    
    return prompt

def generate_image_with_gpt(prompt):
    try:
        payload = {
            "model": "gpt-image-1",
            "prompt": prompt,
            "n": 1,
            "size": "1024x1024",
        }

        response = requests.post(url, headers=headers, json=payload)

        if response.status_code == 200:
            data = response.json()
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
    
    # パートナーのuidを取得
    partner_uid = get_partner_uid(uid)
    if not partner_uid:
        print("No partner found")
        return
    
    # 出力ディレクトリの作成
    output_dir = "feature/movie_GenAI/generated_images"
    
    # 既存の画像を削除
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.makedirs(output_dir)
    
    # 両方のユーザーのイベントを取得
    my_events = get_monthly_events(uid, days)
    partner_events = get_monthly_events(partner_uid, days)
    
    # イベントを時系列順に結合
    all_events = my_events + partner_events
    all_events.sort(key=lambda x: x['Calendar'][0]['timestamp'])
    
    # 各イベントに対して画像を生成
    previous_event = None
    for i, event in enumerate(all_events):
        # 前のイベントを考慮したプロンプトを生成
        prompt = generate_prompt(event, previous_event)
        image = generate_image_with_gpt(prompt)
        
        if image:
            # 画像の保存
            timestamp = event['Calendar'][0]['timestamp']
            date_str = datetime.fromisoformat(timestamp).strftime("%Y%m%d_%H%M")
            image_path = os.path.join(output_dir, f"event_{date_str}_{i}.png")
            image.save(image_path)
            
            print(f"Generated image for event: {event['action_name']}")
            # 現在のイベントを前のイベントとして保存
            previous_event = event
        else:
            print(f"Failed to generate image for event: {event['action_name']}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 2:
        uid = sys.argv[1]
        days = int(sys.argv[2])
        generate_images(uid, days)
    else:
        print("Usage: python generate_images.py <uid> <days>")
