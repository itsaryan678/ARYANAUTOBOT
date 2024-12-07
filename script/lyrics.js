const axios = require('axios');
const fs = require('fs');
const path = require('path');

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
    
    if (!songName) {
      throw new Error(`No song name provided. Please specify the song name.`);
    }

    const response = await axios.get(`https://aryanchauhanapi.onrender.com/api/lyrics?songName=${encodeURIComponent(songName)}`);

    if (response.data && response.data.lyrics) {
      const { lyrics, title, artist, image } = response.data;

      const imageStream = fs.createReadStream(image);

      await api.sendMessage({
        body: `📚 𝗧𝗶𝘁𝗹𝗲: ${title}\n🔎 𝗔𝗿𝘁𝗶𝘀𝘁: ${artist}\n\n📝 𝗟𝘆𝗿𝗶𝗰𝘀\n${lyrics}`,
        attachment: imageStream
      }, event.threadID, event.messageID);

      console.log(`Sent lyrics for "${title}" by ${artist} to the user.`);
    } else {
      throw new Error(`Invalid or missing response from lyrics API.`);
    }
  } catch (error) {
    console.error(`❌ | Failed to get lyrics API response: ${error.message}`);
    api.sendMessage(`❌ | ${error.message}`, event.threadID);
  }
};
