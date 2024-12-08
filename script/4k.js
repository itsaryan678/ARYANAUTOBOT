const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "4k",
  version: "1.0.0",
  aliases: ['enchant'],
  description: "Enhances an image to 4K resolution using a provided URL or a reply containing a valid image.",
  usage: "4k <image_url> | reply to an image",
  cooldown: 5
};

module.exports.run = async ({ api, event, args }) => {
  try {
    let imageUrl = args[0];

    const attachment = event.messageReply?.attachments?.[0];
    if (!attachment || !attachment.url) {
      return api.sendMessage("❌ Please reply to an image or video.", event.threadID, event.messageID);
    }

    // No specific image type check needed anymore, handle any image format
    imageUrl = attachment.url;

    // Ensure the 'id' folder exists
    const folderPath = path.join(__dirname, 'script', 'cache', 'id');
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const response = await axios.get(`https://aryanchauhanapi.onrender.com/api/4k?url=${encodeURIComponent(imageUrl)}`, { responseType: 'stream' });

    const currentTime = Date.now();
    const imagePath = path.join(folderPath, `4k_${currentTime}.jpg`); // Using '.jpg' as the file extension for consistency

    const writer = fs.createWriteStream(imagePath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage({ attachment: fs.createReadStream(imagePath) }, event.threadID, event.messageID, () => {
        fs.unlinkSync(imagePath); // Clean up the temporary file
      });
    });

    writer.on('error', (error) => {
      console.error('Error enhancing image to 4K:', error.message);
    });
  } catch (error) {
    console.error('Error fetching 4K image:', error.message);
    api.sendMessage("❌ An error occurred while enhancing the image. Please try again later.", event.threadID, event.messageID);
  }
};
