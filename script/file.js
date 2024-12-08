const path = require('path');
const fs = require('fs');  // Import the 'fs' module

module.exports.config = {
  name: "file",
  version: "1.0.0",
  description: "Lists and sends `.js` files from the `scripts` folder.",
  usage: "file <filename>",
  cooldown: 5,
  permissions: {
    only: ["61564142823751"]
  }
};

module.exports.run = async ({ api, event, args }) => {
  try {
    const config = module.exports.config;

    if (!config.permissions.only.includes(event.senderID)) {
      return api.sendMessage("❌ You do not have permission to use this command.", event.threadID, event.messageID);
    }

    const scriptsDir = path.join(__dirname, 'script');
    fs.readdir(scriptsDir, (err, files) => {
      if (err) {
        return api.sendMessage("❌ An error occurred while reading the scripts directory.", event.threadID, event.messageID);
      }

      const jsFiles = files.filter(file => file.endsWith('.js'));
      if (jsFiles.length === 0) {
        return api.sendMessage("❌ No `.js` files found in the scripts directory.", event.threadID, event.messageID);
      }

      if (args.length === 0) {
        return api.sendMessage({ body: "❌ Please specify a file name.", files: jsFiles }, event.threadID, event.messageID);
      }

      const requestedFile = args[0] + '.js';
      if (!jsFiles.includes(requestedFile)) {
        return api.sendMessage({ body: `❌ The file "${requestedFile}" does not exist.`, files: jsFiles }, event.threadID, event.messageID);
      }

      const filePath = path.join(scriptsDir, requestedFile);
      fs.readFile(filePath, 'utf-8', (readErr, fileContent) => {
        if (readErr) {
          return api.sendMessage("❌ An error occurred while reading the file.", event.threadID, event.messageID);
        }
        api.sendMessage({ body: fileContent }, event.threadID, event.messageID);
      });
    });
  } catch (error) {
    console.error('Error executing file command:', error.message);
    api.sendMessage("❌ An error occurred while executing the file command. Please try again later.", event.threadID, event.messageID);
  }
};
