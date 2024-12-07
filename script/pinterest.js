const axios = require('axios');
const fs = require('fs');

module.exports.config = {
  name: "pinterest",
  version: "1.0.0",
  aliases: ['pin'],
  description: "Send random Pinterest images.",
  usage: "pinterest <query>",
  cooldown: 5
};

module.exports.run = async ({ api, event, args }) => {
  try {
    const query = args.join(" "); 
    if (!query) {
      return api.sendMessage("❌ Please provide a valid query.", event.threadID, event.messageID);
    }

    const response = await axios.get(`https://aryanchauhanapi.onrender.com/pinterest?query=${query}&limit=9`);
    const imageUrls = response.data; 

    if (imageUrls.length > 0) {
      for (let i = 0; i < imageUrls.length; i++) {
        const imageUrl = imageUrls[i];
        const currentTime = Date.now();
        const imagePath = `./script/cache/pinterest_${currentTime}_${i + 1}.jpg`;

        const writer = fs.createWriteStream(imagePath);
        const { data } = await axios.get(imageUrl, { responseType: 'stream' });
        data.pipe(writer);

        writer.on('finish', () => {
          api.sendMessage({ attachment: fs.createReadStream(imagePath) }, event.threadID, () => {
            fs.unlinkSync(imagePath);
          });
        });

        writer.on('error', (error) => {
          console.error('Error downloading Pinterest image:', error.message);
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
