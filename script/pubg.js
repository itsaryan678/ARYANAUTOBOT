const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "pubg",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  usage: 'pubg text',
  description: 'Generate a PUBG logo with specified text',
  credits: 'Aryan Chauhan',
  cooldown: 5
};

module.exports.run = async function({
  api,
  event,
  args
}) {
  try {
    if (args.length === 0) {
      return api.sendMessage(
        "Please specify the text for the PUBG logo using: `pubg text`.",
        event.threadID,
        event.messageID
      );
    }

    const text = args.join(" "); 
    const response = await axios.get(`https://aryanchauhanapi.onrender.com/api/ephoto/coverpubg?text=${encodeURIComponent(text)}`, { responseType: 'stream' });

    const logosDir = path.join(__dirname, 'pubgLogos');
    if (!fs.existsSync(logosDir)) {
      fs.mkdirSync(logosDir, { recursive: true });
    }

    const logoPath = path.join(logosDir, `${Date.now()}.png`);
    const writer = fs.createWriteStream(logoPath);

    response.data.pipe(writer);

    writer.on('finish', async () => {
      await api.sendMessage({
        body: `Here's your PUBG logo with text: "${text}".`,
        attachment: fs.createReadStream(logoPath)
      }, event.threadID, event.messageID);
      console.log(`Sent PUBG logo to the user.`);
    });

    writer.on('error', (error) => {
      console.error(`❌ | Failed to save the logo locally: ${error.message}`);
      api.sendMessage(`❌ | An error occurred while saving the PUBG logo. Please try again.`, event.threadID);
    });
  } catch (error) {
    console.error(`❌ | Failed to generate PUBG logo: ${error.message}`);
    api.sendMessage(`❌ | An error occurred while generating the PUBG logo. Please try again.`, event.threadID, event.messageID);
  }
};
