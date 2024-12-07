const axios = require('axios');
const fs = require('fs');

module.exports.config = {
  name: "pinterest",
  version: "1.0.0",
  aliases: ['pin'],
  description: "Send random Pinterest images all at once.",
  usage: "pinterest <query>",
  cooldown: 5
};

module.exports.run = async ({ api, event, args }) => {
  try {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage("❌ Please provide a valid query.", event.threadID, event.messageID);
    }

    const response = await axios.get(`https://aryanchauhanapi.onrender.com/api/pin?query=${query}&count=10`);
    const imageUrls = response.data;

    if (imageUrls.length > 0) {
      const imagePaths = await Promise.all(imageUrls.map(async (imageUrl, i) => {
        const currentTime = Date.now();
        const imagePath = `./script/cache/pinterest_${currentTime}_${i + 1}.jpg`;

        const writer = fs.createWriteStream(imagePath);
        const { data } = await axios.get(imageUrl, { responseType: 'stream' });
        data.pipe(writer);

        return new Promise((resolve, reject) => {
          writer.on('finish', () => resolve(imagePath));
          writer.on('error', reject);
        });
      }));

      if (imagePaths.length > 0) {
        api.sendMessage({ attachment: imagePaths.map(fs.createReadStream) }, event.threadID, () => {
          imagePaths.forEach(path => fs.unlinkSync(path));
        });
      }
    } else {
      api.sendMessage("❌ No images found for the given query.", event.threadID, event.messageID);
    }
  } catch (error) {
    console.error('Error fetching Pinterest images:', error.message);
    api.sendMessage("❌ An error occurred while fetching the Pinterest images. Please try again later.", event.threadID, event.messageID);
  }
};
