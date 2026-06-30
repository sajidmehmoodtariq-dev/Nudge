/* eslint-disable @typescript-eslint/no-var-requires */
const Jimp = require('jimp');

async function crop() {
  const image = await Jimp.read('src/assets/logo.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;

  // Original SVG has viewBox="0 0 680 680"
  // The central icon is x=190, y=60, width=300, height=300
  // Let's crop it proportionally.
  const cropX = Math.floor((190 / 680) * w);
  const cropY = Math.floor((60 / 680) * h);
  const cropW = Math.ceil((300 / 680) * w);
  const cropH = Math.ceil((300 / 680) * h);

  image.crop(cropX, cropY, cropW, cropH);
  await image.writeAsync('src/assets/logo_cropped.png');
  console.log(`Cropped from ${w}x${h} to ${cropW}x${cropH} at (${cropX}, ${cropY})`);
}

crop().catch(console.error);
