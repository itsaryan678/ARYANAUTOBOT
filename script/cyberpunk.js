const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "cyberpunk",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  usage: 'cyberpunk [prompt]',
  description: 'Generate images',
  credits: 'Aryan Chauhan',
  cooldown: 5
};

module.exports.run = async function({
  api,
  event,
  args
}) {
  try {
    const prompt = args.join(" ");
    if (!prompt) {
      await api.sendMessage(`Please provide a prompt for the image generation.`, event.threadID, event.messageID);
    } else {
      const response = await axios.get(`https://aryanchauhanapi.onrender.com/v1/xi?prompt=${encodeURIComponent(prompt)}`);

      if (response.data && Array.isArray(response.data)) {
        const images = response.data;
        const imagesDir = path.join(__dirname, 'images');
        
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
        }

        for (let i = 0; i < images.length; i++) {
          const imageUrl = images[i];
          const imagePath = path.join(imagesDir, `${prompt.replace(/ /g, '_')}_${i + 1}.jpg`);
          const writer = fs.createWriteStream(imagePath);

          const responseStream = await axios.get(imageUrl, { responseType: 'stream' });
          responseStream.data.pipe(writer);

          writer.on('finish', async () => {
            console.log(`Saved image ${i + 1} as ${imagePath}`);
          });

          writer.on('error', (error) => {
            console.error(`❌ | Failed to save image ${i + 1}: ${error.message}`);
          });
        }

        const imageFiles = fs.readdirSync(imagesDir);
        const attachments = imageFiles.map(file => fs.createReadStream(path.join(imagesDir, file)));
        await api.sendMessage({ attachment: attachments }, event.threadID, event.messageID);
      } else {
        throw new Error(`Invalid or missing response from image API`);
      }
    }
  } catch (error) {
    console.error(`❌ | Failed to get image API response: ${error.message}`);
    api.sendMessage(`❌ | An error occurred while generating the images. Please try again.`, event.threadID);
  }
};
