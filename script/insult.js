const axios = require('axios');

module.exports.config = {
  name: "insult",
  version: "1.0.0",
  description: "Sends a random insult lines",
  usage: "insult",
  cooldown: 0
};

module.exports.run = async ({ api, event }) => {
  try {
    const response = await axios.get('https://aryanchauhanapi.onrender.com/api/insult');
    const { category, insult } = response.data;

    const message = `Here is your request\n\n${insult}`;

    api.sendMessage(message, event.threadID, event.messageID);
  } catch (error) {
    console.error('Error fetching insult:', error.message);
    api.sendMessage("❌ An error occurred while fetching a insult, Please try again later.", event.threadID, event.messageID);
  }
};
