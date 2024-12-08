const axios = require('axios');

module.exports.config = {
  name: "catfact",
  version: "1.0.0",
  description: "Sends a random catfacts",
  usage: "catfact",
  cooldown: 0
};

module.exports.run = async ({ api, event }) => {
  try {
    const response = await axios.get('https://aryanchauhanapi.onrender.com/api/catfact');
    const { category, fact } = response.data;

    const message = `Here is your catfact\n\n${fact}`;

    api.sendMessage(message, event.threadID, event.messageID);
  } catch (error) {
    console.error('Error fetching catfact', error.message);
    api.sendMessage("❌ An error occurred while fetching a catfact. Please try again later.", event.threadID, event.messageID);
  }
};
