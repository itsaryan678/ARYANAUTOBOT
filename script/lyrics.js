const axios = require('axios');

module.exports.config = {
  name: "lyrics",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  usage: 'lyrics [songName]',
  description: 'Fetch lyrics for a specified song',
  credits: 'Aryan Chauhan',
  cooldown: 5
};

module.exports.run = async function({
  api,
  event,
  args
}) {
  try {
    const songName = args.join(" ");
    const baseApiUrl = "https://aryanchauhanapi.onrender.com";

    if (!songName) {
      return api.sendMessage("❌ Please provide a song name.", event.threadID, event.messageID);
    }

    const response = await axios.get(`${baseApiUrl}/api/lyrics?songName=${encodeURIComponent(songName)}`);

    if (response.data && response.data.lyrics) {
      const { lyrics, title, artist, image } = response.data;

      const imageResponse = await axios.get(image, { responseType: 'stream' });

      return api.sendMessage({
        body: `📚 𝗧𝗶𝘁𝗹𝗲: ${title}\n🔎 𝗔𝗿𝘁𝗶𝘀𝘁: ${artist}\n\n📝 𝗟𝘆𝗿𝗶𝗰𝘀\n${lyrics}`,
        attachment: imageResponse.data
      }, event.threadID, event.messageID);
    } else {
      throw new Error("No lyrics found for the specified song.");
    }
  } catch (error) {
    console.error(`❌ | Failed to fetch lyrics: ${error.message}`);
    return api.sendMessage(`❌ An error occurred: ${error.message}`, event.threadID, event.messageID);
  }
};
