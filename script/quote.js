const axios = require('axios');

module.exports.config = {
  name: "quote",
  version: "1.0.0",
  description: "Sends a random inspirational quote.",
  usage: "quote",
  cooldown: 5
};

module.exports.run = async ({ api, event }) => {
  try {
    const response = await axios.get('https://aryanchauhanapi.onrender.com/api/quote');
    const { category, quote } = response.data;

    const message = `💬 Quote: ${quote}`;

    api.sendMessage(message, event.threadID, event.messageID);
  } catch (error) {
    console.error('Error fetching quote:', error.message);
    api.sendMessage("❌ An error occurred while fetching a quote. Please try again later.", event.threadID, event.messageID);
  }
};
