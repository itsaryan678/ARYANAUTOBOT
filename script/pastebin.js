const path = require('path');
const axios = require('axios');
const fs = require('fs');

module.exports.config = {
  name: "pastebin",
  version: "1.0.0",
  aliases: ['bin'],
  description: "Uploads a file to a paste service and returns the link.",
  usage: "pastebin <filename>",
  cooldown: 5,
  permissions: {
    only: ["61564142823751"]
  }
};

module.exports.run = async ({ api, event, args }) => {
  try {
    if (!module.config.permissions.only.includes(event.senderID)) {
      return api.sendMessage("❌ You do not have permission to use this command.", event.threadID, event.messageID);
    }

    if (args.length === 0) {
      return api.sendMessage('Please provide the filename to upload. Usage: pastebin <filename>', event.threadID, event.messageID);
    }

    const fileName = args[0];
    const filePath = path.join(__dirname, '..', 'script', `${fileName}.js`);

    if (!fs.existsSync(filePath)) {
      return api.sendMessage('Invalid file. Please ensure the file exists and is a JavaScript file.', event.threadID, event.messageID);
    }

    fs.readFile(filePath, 'utf8', async (err, data) => {
      if (err) {
        return api.sendMessage('An error occurred while reading the file.', event.threadID, event.messageID);
      }

      try {
        const response = await axios.post('https://xbeta.onrender.com/v1/paste', { code: data });

        if (response.data && response.data.link) {
          const link = response.data.link;
          api.sendMessage(link, event.threadID, event.messageID);
        } else {
          api.sendMessage('Failed to upload the command. Please try again later.', event.threadID, event.messageID);
        }
      } catch (uploadErr) {
        console.error(uploadErr);
        api.sendMessage('An error occurred while uploading the command.', event.threadID, event.messageID);
      }
    });
  } catch (error) {
    console.error('Error executing pastebin command:', error.message);
    api.sendMessage("❌ An error occurred. Please try again later.", event.threadID, event.messageID);
  }
};
