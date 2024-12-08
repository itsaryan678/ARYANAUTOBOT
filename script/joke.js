const axios = require('axios');

module.exports.config = {
  name: "joke",
  version: "1.0.0",
  description: "Sends a random joke's.",
  usage: "joke",
  cooldown: 0
};

module.exports.run = async ({ api, event }) => {
  try {
    const response = await axios.get('https://aryanchauhanapi.onrender.com/api/joke');
    const { category, joke } = response.data;

    const message = `Here is your joke\n\n${joke}`;

    api.sendMessage(message, event.threadID, event.messageID);
  } catch (error) {
    console.error('Error fetching joke:', error.message);
    api.sendMessage("❌ An error occurred while fetching a joke. Please try again later.", event.threadID, event.messageID);
  }
};
