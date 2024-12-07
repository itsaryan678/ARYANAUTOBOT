const axios = require('axios');
const fs = require('fs');
const moment = require('moment');

module.exports.config = {
  name: "waifu",
  version: "1.0.0",
  description: "Send a random waifu image.",
  usage: "waifu",
  cooldown: 5
};

module.exports.run = async ({ api, event }) => {
  try {
    const response = await axios.get('https://aryanchauhanapi.onrender.com/api/waifu');
    const imageUrl = response.data.url; 

    const currentTime = moment().format('YYYY-MM-DD_HH-mm-ss');
    const imagePath = `./script/cache/waifu_${currentTime}.png`;

    if (!fs.existsSync('./script/cache')) {
      fs.mkdirSync('./script/cache', { recursive: true });
    }

    const writer = fs.createWriteStream(imagePath);
    const { data } = await axios.get(imageUrl, { responseType: 'stream' });
    data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage({ attachment: fs.createReadStream(imagePath) }, event.threadID, event.messageID, () => {
        fs.unlinkSync(imagePath);
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
