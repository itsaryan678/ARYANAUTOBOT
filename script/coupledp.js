const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "cdp",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  usage: 'cdp',
  description: 'Fetch a coupled image pair (male and female) and send them to the user',
  credits: 'Aryan Chauhan',
  cooldown: 5
};

module.exports.run = async function({
  api,
  event,
  args
}) {
  try {
    const response = await axios.get('https://aryanchauhanapi.onrender.com/v1/cdp/get');

    if (response.data) {
      const { number, male, female } = response.data;

      const imagesDir = path.join(__dirname, 'coupledp');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      const maleImagePath = path.join(imagesDir, `male_${number}.jpg`);
      const femaleImagePath = path.join(imagesDir, `female_${number}.jpg`);

      const maleWriter = fs.createWriteStream(maleImagePath);
      const femaleWriter = fs.createWriteStream(femaleImagePath);

      const maleResponse = await axios.get(male, { responseType: 'stream' });
      const femaleResponse = await axios.get(female, { responseType: 'stream' });

      maleResponse.data.pipe(maleWriter);
      femaleResponse.data.pipe(femaleWriter);

      maleWriter.on('finish', async () => {
        femaleWriter.on('finish', async () => {
          const attachments = [
            fs.createReadStream(maleImagePath),
            fs.createReadStream(femaleImagePath)
          ];

          await api.sendMessage({
            body: `Coupled Number: ${number}`,
            attachment: attachments
          }, event.threadID, event.messageID);

          console.log(`Sent coupled image pair to the user`);
        });

        femaleWriter.on('error', (error) => {
          console.error(`❌ | Failed to save the female image locally: ${error.message}`);
          api.sendMessage(`❌ | An error occurred while saving the female image. Please try again.`, event.threadID);
        });
      });

      maleWriter.on('error', (error) => {
        console.error(`❌ | Failed to save the male image locally: ${error.message}`);
        api.sendMessage(`❌ | An error occurred while saving the male image. Please try again.`, event.threadID);
      });
    } else {
      throw new Error(`Invalid or missing response from coupled image API`);
    }
  } catch (error) {
    console.error(`❌ | Failed to get coupled image API response: ${error.message}`);
    api.sendMessage(`❌ | An error occurred while fetching the coupled images. Please try again.`, event.threadID);
  }
};
