const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// OpenAIの設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Supabaseの設定
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function getMonthlyEvents() {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 30);

  const { data, error } = await supabase
    .from('Action')
    .select(`
      action_name,
      happiness_change,
      Calendar (
        timestamp
      )
    `)
    .gte('Calendar.timestamp', startDate.toISOString())
    .lte('Calendar.timestamp', endDate.toISOString());

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return data;
}

function generatePrompt(event) {
  const happiness = event.happiness_change > 0 ? "幸せな" : "悲しい";
  return `${happiness} ${event.action_name}の様子を表現した画像を生成してください。高品質で写実的な画像を生成してください。`;
}

async function generateImageWithGPT(prompt) {
  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      size: "1024x1024",
    //   quality: "standard",
      n: 1,
    });

    const imageUrl = response.data[0].url;
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    return Buffer.from(imageBuffer);
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

async function generateImages() {
  // 出力ディレクトリの作成
  const outputDir = path.join(__dirname, 'generated_images');
  await fs.mkdir(outputDir, { recursive: true });

  // イベントの取得
  const events = await getMonthlyEvents();

  // 各イベントに対して画像を生成
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const prompt = generatePrompt(event);
    const imageBuffer = await generateImageWithGPT(prompt);

    if (imageBuffer) {
      // 画像の保存
      const timestamp = event.Calendar[0].timestamp;
      const dateStr = new Date(timestamp).toISOString().replace(/[:.]/g, '').slice(0, 15);
      const imagePath = path.join(outputDir, `event_${dateStr}_${i}.png`);

      // 画像をリサイズして保存
      await sharp(imageBuffer)
        .resize(1920, 1080, { fit: 'inside' })
        .toFile(imagePath);

      console.log(`Generated image for event: ${event.action_name}`);
    } else {
      console.log(`Failed to generate image for event: ${event.action_name}`);
    }
  }
}

module.exports = { generateImages }; 