const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "screenshot",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ['ss'],
  usage: 'screenshot [url]',
  description: 'Fetch a screenshot of a website and send it to the user',
  credits: 'Aryan Chauhan',
  cooldown: 5
};

module.exports.run = async function({
  api,
  event,
  args
}) {
  try {
    const url = args[0];
    if (!url) {
      await api.sendMessage(`Please provide a URL for the screenshot. Example: \`websiteScreenshot https://www.google.com\``, event.threadID, event.messageID);
      return;
    }

    const response = await axios.get(`https://aryanchauhanapi.onrender.com/api/screenshot?url=${encodeURIComponent(url)}`, { responseType: 'stream' });

    if (response.data) {
      const screenshotsDir = path.join(__dirname, 'screenshots');
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      const screenshotPath = path.join(screenshotsDir, `${Date.now()}.png`);
      const writer = fs.createWriteStream(screenshotPath);

      response.data.pipe(writer);

      writer.on('finish', async () => {
        await api.sendMessage({
          body: `Screenshot of: ${url}`,
          attachment: fs.createReadStream(screenshotPath)
        }, event.threadID, event.messageID);
        console.log(`Sent screenshot of the website to the user`);
      });

      writer.on('error', (error) => {
        console.error(`❌ | Failed to save the screenshot locally: ${error.message}`);
        api.sendMessage(`❌ | An error occurred while saving the screenshot. Please try again.`, event.threadID);
      });
    } else {
      throw new Error(`Invalid or missing response from screenshot API`);
    }
  } catch (error) {
    console.error(`❌ | Failed to get screenshot API response: ${error.message}`);
    api.sendMessage(`❌ | An error occurred while fetching the screenshot. Please try again.`, event.threadID);
  }
};
