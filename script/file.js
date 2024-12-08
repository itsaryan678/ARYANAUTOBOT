const path = require('path');
const fs = require('fs');

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

    // Check if directory exists
    if (!fs.existsSync(scriptsDir)) {
      return api.sendMessage("❌ The scripts directory does not exist.", event.threadID, event.messageID);
    }

    fs.readdir(scriptsDir, (err, files) => {
      if (err) {
        console.error('Error reading directory:', err.message);
        return api.sendMessage("❌ An error occurred while reading the scripts directory. Please try again later.", event.threadID, event.messageID);
      }

      const jsFiles = files.filter(file => file.endsWith('.js'));
      if (jsFiles.length === 0) {
        return api.sendMessage("❌ No `.js` files found in the scripts directory.", event.threadID, event.messageID);
      }

      if (args.length === 0) {
        return api.sendMessage({ body: "❌ Please specify a file name.", files: jsFiles }, event.threadID, event.messageID);
      }

      const requestedFile = `${args[0]}.js`; // Use template literals to construct the file name
      const filePath = path.join(scriptsDir, requestedFile);

      if (!jsFiles.includes(requestedFile)) {
        return api.sendMessage({ body: `❌ The file "${requestedFile}" does not exist.`, files: jsFiles }, event.threadID, event.messageID);
      }

      fs.readFile(filePath, 'utf-8', (readErr, fileContent) => {
        if (readErr) {
          console.error('Error reading file:', readErr.message);
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
