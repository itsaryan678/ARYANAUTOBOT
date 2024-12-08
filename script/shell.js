const { exec } = require('child_process');

module.exports.config = {
  name: "shell",
  version: "1.0.0",
  role: 1,
  aliases: ['cmd', 'console'],
  description: "Executes a shell command. Use with caution!",
  usage: "shell <command>",
  cooldown: 5
};

module.exports.run = async ({ api, event, args }) => {
  try {
    const command = args.join(" ");
    if (!command) {
      return api.sendMessage("❌ Please provide a shell command to execute.", event.threadID, event.messageID);
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return api.sendMessage(`❌ Error: ${error.message}`, event.threadID, event.messageID);
      }
      if (stderr) {
        return api.sendMessage(`❌ stderr: ${stderr}`, event.threadID, event.messageID);
      }
      api.sendMessage(`${stdout}`, event.threadID, event.messageID);
    });
  } catch (error) {
    console.error('Error executing shell command:', error.message);
    api.sendMessage("❌ An error occurred while executing the shell command. Please try again later.", event.threadID, event.messageID);
  }
};
