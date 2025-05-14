const { generateImages } = require('./generateImages');
const { createSlideshow } = require('./createSlideshow');

async function main() {
  try {
    console.log('Starting image generation...');
    await generateImages();
    console.log('Image generation completed');

    console.log('Starting slideshow creation...');
    await createSlideshow();
    console.log('Slideshow creation completed');
  } catch (error) {
    console.error('Error in main process:', error);
  }
}

main(); 