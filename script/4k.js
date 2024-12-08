const axios = require('axios');
const fs = require('fs');

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

    const validImageTypes = ['image/jpeg', 'image/png'];
    if (!validImageTypes.includes(attachment.type)) {
      return api.sendMessage("❌ Please reply with a valid image (jpg or png).", event.threadID, event.messageID);
    }

    imageUrl = attachment.url;

    const response = await axios.get(`https://aryanchauhanapi.onrender.com/api/4k?url=${encodeURIComponent(imageUrl)}`, { responseType: 'stream' });

    const currentTime = Date.now();
    const imagePath = `./script/cache/4k_${currentTime}.jpg`;

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
