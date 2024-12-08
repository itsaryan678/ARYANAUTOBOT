const { exec } = require('child_process');

module.exports.config = {
  name: "eval",
  version: "1.0.0",
  aliases: ['evaluate'],
  description: "Evaluates JavaScript code. Use with caution!",
  usage: "eval <code>",
  cooldown: 5
};

module.exports.run = async ({ api, event, args }) => {
  try {
    const code = args.join(" ");
    if (!code) {
      return api.sendMessage("❌ Please provide JavaScript code to evaluate.", event.threadID, event.messageID);
    }

    let result;
    try {
      result = eval(code); 
      if (typeof result === 'object') result = JSON.stringify(result, null, 2);
      api.sendMessage(`${result}`, event.threadID, event.messageID);
    } catch (error) {
      api.sendMessage(`❌ Error evaluating code: ${error.message}`, event.threadID, event.messageID);
    }

  } catch (error) {
    console.error('Error executing eval command:', error.message);
    api.sendMessage("❌ An error occurred while executing the eval command. Please try again later.", event.threadID, event.messageID);
  }
};
