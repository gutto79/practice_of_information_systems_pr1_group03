import os
from diffusers import StableDiffusionPipeline
import torch
from datetime import datetime, timedelta
import supabase
from dotenv import load_dotenv

# 環境変数の読み込み
load_dotenv()

# Supabaseの設定
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
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
    """イベントから画像生成用のプロンプトを作成"""
    happiness = "幸せな" if event['happiness_change'] > 0 else "悲しい"
    return f"{happiness} {event['action_name']}の様子、高品質、4K、写実的"

def generate_images():
    """イベントから画像を生成"""
    # Stable Diffusionモデルの読み込み
    model_id = "runwayml/stable-diffusion-v1-5"
    pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
    pipe = pipe.to("cuda" if torch.cuda.is_available() else "cpu")
    
    # 出力ディレクトリの作成
    output_dir = "generated_images"
    os.makedirs(output_dir, exist_ok=True)
    
    # イベントの取得
    events = get_monthly_events()
    
    # 各イベントに対して画像を生成
    for i, event in enumerate(events):
        prompt = generate_prompt(event)
        image = pipe(prompt).images[0]
        
        # 画像の保存
        timestamp = event['Calendar'][0]['timestamp']
        date_str = datetime.fromisoformat(timestamp).strftime("%Y%m%d_%H%M")
        image_path = os.path.join(output_dir, f"event_{date_str}_{i}.png")
        image.save(image_path)
        
        print(f"Generated image for event: {event['action_name']}")

if __name__ == "__main__":
    generate_images() 