const axios = require('axios');

module.exports.config = {
  name: "dogfact",
  version: "1.0.0",
  description: "Sends a random dogfacts",
  usage: "dogfact",
  cooldown: 0
};

module.exports.run = async ({ api, event }) => {
  try {
    const response = await axios.get('https://aryanchauhanapi.onrender.com/api/dogfact');
    const { category, fact } = response.data;

    const message = `Here is your dogfact\n\n${fact}`;

    api.sendMessage(message, event.threadID, event.messageID);
  } catch (error) {
    console.error('Error fetching dogfact', error.message);
    api.sendMessage("❌ An error occurred while fetching a dogfact. Please try again later.", event.threadID, event.messageID);
  }
};
