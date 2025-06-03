import os
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
    return None
# 与えられた日数分のイベントを取得
# 現状uid固定
def get_monthly_events(uid,days):
    end_date = datetime.now()
    start_date = end_date - timedelta(days)
    
    response = supabase_client.table('Action').select(
        'action_name, happiness_change, Calendar(timestamp), User!Action_uid_fkey(gender)'
    ).eq('uid', uid).gte('Calendar.timestamp', start_date.isoformat()).lte('Calendar.timestamp', end_date.isoformat()).execute()
    
    return response.data

# イベントから画像生成用のプロンプトを作成
def generate_prompt(event):
    
    gender = "男性" if event['User']['gender'] == 'male' else "女性"
    happiness_change = event['happiness_change'] * 100
    hap_abs = abs(happiness_change)
    mood = "嬉しい" if happiness_change > 0 else "悲しい"
    prompt = "あなたはカップルの感情的な思い出を表現するスライドショー用の画像を作成するアシスタントです。\n"
    prompt += "・男の容姿:黒髪"
    prompt += "・女の容姿:黒髪"
    prompt += f"・出来事の内容: 「{event['action_name']}」\n"
    prompt += f"・出来事を受けた人物: {gender}\n"
    prompt += f"・感情の変化（-10000〜10000）: {happiness_change}（{mood}）\n"
    prompt += f"・躍動感（0〜10000） : {hap_abs}\n"
    
    prompt += (
        "\n以上の情報をもとに、出来事の雰囲気や感情を視覚的に表現した一枚のアニメ風画像を生成してください。\n"
        "画像はスライドショーの一部として使用されるため、感情が伝わりやすくしてください。\n"
        "躍動感の大きさに応じて、motion blur effectやaction linesを画像に付与してください。\n"
        "背景は家でお願いします。ただし、場所が明確な場合はその場所にしてください。\n"
        "右上に吹き出しを出すことは禁止とします。\n"
        "ズームアウトした構図で描写してください。"
    )
    
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
    
    # パートナーのuidを取得
    partner_uid = get_partner_uid(uid)
    if not partner_uid:
        print("No partner found")
        return
    
    # 出力ディレクトリの作成
    output_dir = "generated_images"
    
    # 既存の画像を削除
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.makedirs(output_dir)
    
    # 両方のユーザーのイベントを取得
    my_events = get_monthly_events(uid, days)
    partner_events = get_monthly_events(partner_uid, days)
    
    # イベントを時系列順に結合
    all_events = my_events + partner_events
    
    # Calendar配列が空でないことを確認してからソート
    all_events = [event for event in all_events if event.get('Calendar') and len(event['Calendar']) > 0]
    
    # 幸福度変化の絶対値でソート
    all_events.sort(key=lambda x: abs(x['happiness_change']), reverse=True)
    
    # 最大10件に制限(happiness_changeの絶対値が大きい順)
    all_events = all_events[:10]
    # 時系列順にソート
    all_events.sort(key=lambda x: x['Calendar'][0]['timestamp'])
    
    for i, event in enumerate(all_events):
        prompt = generate_prompt(event)
        image = generate_image_with_gpt(prompt)
        
        if image:
            # 画像の保存
            action_name = event['action_name'].replace(' ', '').replace('/', '')
            happiness_change = event['happiness_change']
            timestamp = event['Calendar'][0]['timestamp']
            # Handle timestamp with milliseconds by removing them
            timestamp = timestamp.split('.')[0]  # Remove milliseconds
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
