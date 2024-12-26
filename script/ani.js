const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "ani",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  usage: 'flux [prompt]',
  description: 'Flux Dev',
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
      await api.sendMessage(`Please provide a prompt for the image generation.\nExample: flux cat`, event.threadID, event.messageID);
    } else {
      const response = await axios.get(`https://aryanchauhanapi.onrender.com/api/ani?prompt=${encodeURIComponent(prompt)}`, { responseType: 'stream' });

      if (response.data) {
        const imagesDir = path.join(__dirname, 'images');
        const imagePath = path.join(imagesDir, `${prompt.replace(/ /g, '_')}.jpg`);

        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
        }

        const writer = fs.createWriteStream(imagePath);

        response.data.pipe(writer);

        writer.on('finish', async () => {
          await api.sendMessage({ attachment: fs.createReadStream(imagePath) }, event.threadID, event.messageID);
          console.log(`Sent generated image to the user and saved locally as ${imagePath}`);
        });

        writer.on('error', (error) => {
          console.error(`❌ | Failed to save the image locally: ${error.message}`);
          api.sendMessage(`❌ | An error occurred while saving the image. Please try again.`, event.threadID);
        });
      } else {
        throw new Error(`Invalid or missing response from image API`);
      }
    }
  } catch (error) {
    console.error(`❌ | Failed to get image API response: ${error.message}`);
    api.sendMessage(`❌ | An error occurred while generating the image. Please try again.`, event.threadID);
  }
};
