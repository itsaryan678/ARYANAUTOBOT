module.exports.config = {
  name: "ping",
  version: "1.0.0",
  aliases: ['p'],
  description: "Shows the bot's response time (ping).",
  usage: "ping",
  cooldown: 1
};

module.exports.run = async ({ api, event }) => {
  try {
    const startTime = Date.now();

    const response = await api.sendMessage("Ping?", event.threadID, event.messageID);

    const ping = Date.now() - startTime;

    api.sendMessage(`🏓 Pong! ${ping} ms.`, event.threadID, response.messageID);
  } catch (error) {
    console.error('Error calculating ping:', error.message);
    api.sendMessage("❌ An error occurred while calculating the ping. Please try again later.", event.threadID, event.messageID);
  }
};
