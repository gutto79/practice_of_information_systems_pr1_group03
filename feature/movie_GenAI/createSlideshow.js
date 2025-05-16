const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs').promises;
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

async function createSlideshow() {
  const inputDir = path.join(__dirname, 'generated_images');
  const outputPath = path.join(__dirname, 'output', 'slideshow.mp4');

  // 出力ディレクトリの作成
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  // 画像ファイルの一覧を取得
  const files = await fs.readdir(inputDir);
  const imageFiles = files.filter(file => file.endsWith('.png'));

  if (imageFiles.length === 0) {
    console.error('No image files found in the input directory');
    return;
  }

  // 画像ファイルのパスを配列に格納
  const imagePaths = imageFiles.map(file => path.join(inputDir, file));

  // スライドショーの作成
  ffmpeg()
    .input(imagePaths[0])
    .inputOptions(['-loop 1'])
    .inputOptions(['-t 5'])
    .input(imagePaths[1])
    .inputOptions(['-loop 1'])
    .inputOptions(['-t 5'])
    .input(imagePaths[2])
    .inputOptions(['-loop 1'])
    .inputOptions(['-t 5'])
    .input(imagePaths[3])
    .inputOptions(['-loop 1'])
    .inputOptions(['-t 5'])
    .input(imagePaths[4])
    .inputOptions(['-loop 1'])
    .inputOptions(['-t 5'])
    .complexFilter([
      '[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fade=t=out:st=4:d=1[v0]',
      '[1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fade=t=in:st=0:d=1,fade=t=out:st=4:d=1[v1]',
      '[2:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fade=t=in:st=0:d=1,fade=t=out:st=4:d=1[v2]',
      '[3:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fade=t=in:st=0:d=1,fade=t=out:st=4:d=1[v3]',
      '[4:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fade=t=in:st=0:d=1[v4]',
      '[v0][v1][v2][v3][v4]concat=n=5:v=1:a=0[outv]'
    ])
    .map('[outv]')
    .outputOptions(['-c:v libx264', '-pix_fmt yuv420p'])
    .output(outputPath)
    .on('end', () => {
      console.log('Slideshow creation completed');
    })
    .on('error', (err) => {
      console.error('Error creating slideshow:', err);
    })
    .run();
}

module.exports = { createSlideshow }; 