const axios = require('axios');

module.exports.config = {
  name: "gemini",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ['g', 'gem'],
  usage: 'gemini [promt]',
  description: 'Ask questions to Gemini flash 1.5',
  credits: 'Aryan Chauhan',
  cooldown: 5
};

module.exports.run = async function({
  api,
  event,
  args
}) {
  try {
    const query = args.join(" ");
    if (!query) {
      await api.sendMessage(`Type something!`, event.threadID, event.messageID);
    } else {
      const response = await axios.get(`https://aryanchauhanapi.onrender.com/gemini?prompt=${encodeURIComponent(query)}`);

      if (response.data && response.data.answer) {
        await api.sendMessage(response.data.answer, event.threadID, event.messageID);
        console.log(`Sent Ai response to the user`);
      } else {
        throw new Error(`Invalid or missing response from Ai API`);
      }
    }
  } catch (error) {
    console.error(`❌ | Failed to get Ai API response: ${error.message}`);
    api.sendMessage(`❌ | An error occurred. You can try typing your query again or resending it. There might be an issue with the server that's causing the problem, and it might resolve on retrying.`, event.threadID);
  }
};
