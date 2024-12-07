const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "waifu",
  version: "1.0.0",
  description: "Send a random waifu image.",
  usage: "waifu",
  cooldown: 5
};

module.exports.run = async ({ api, event }) => {
  try {
    const response = await axios.get('https://aryanchauhanapi.onrender.com/api/waifu', { responseType: 'stream' });
    const imageUrl = response.data.url;

    const currentTime = new Date().toISOString().replace(/[:.-]/g, '_'); // Generate a timestamp string
    const cacheDir = './script/cache';
    const imagePath = path.join(cacheDir, `waifu_${currentTime}.png`);

    // Ensure the cache folder exists
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const writer = fs.createWriteStream(imagePath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage({ attachment: fs.createReadStream(imagePath) }, event.threadID, event.messageID, (error) => {
        if (error) {
          console.error('Error sending waifu image:', error.message);
        }
        // Clean up the cached file after sending
        fs.unlink(imagePath, (err) => {
          if (err) console.error('Error removing cached image:', err.message);
        });
      });
    });

    writer.on('error', (error) => {
      console.error('Error downloading waifu image:', error.message);
      api.sendMessage("❌ An error occurred while downloading the waifu image. Please try again later.", event.threadID, event.messageID);
    });
  } catch (error) {
    console.error('Error fetching waifu image:', error.message);
    api.sendMessage("❌ An error occurred while fetching the waifu image. Please try again later.", event.threadID, event.messageID);
  }
};
