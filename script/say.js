const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "say",
  version: "1.0.0",
  aliases: ['texttospeech', 'tts'],
  description: "Converts text to speech using a TTS API.",
  usage: "say <text>",
  cooldown: 5
};

module.exports.run = async ({ api, event, args }) => {
  try {
    const text = args.join(" ");
    if (!text) {
      return api.sendMessage("❌ Please provide text to convert to speech.", event.threadID, event.messageID);
    }

    const response = await axios.get(`https://aryanchauhanapi.onrender.com/tts?text=${encodeURIComponent(text)}&lang=en`, { responseType: 'stream' });

    const cacheDir = './script/cache';
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const audioPath = path.join(cacheDir, 'tts_audio.mp3');

    const writer = fs.createWriteStream(audioPath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage(
        { attachment: fs.createReadStream(audioPath) },
        event.threadID,
        event.messageID,
        () => fs.unlinkSync(audioPath) // Cleanup the cached file after sending
      );
    });

    writer.on('error', (error) => {
      console.error('Error downloading TTS audio:', error.message);
      api.sendMessage("❌ An error occurred while fetching the TTS audio. Please try again later.", event.threadID, event.messageID);
    });

  } catch (error) {
    console.error('Error fetching TTS audio:', error.message);
    api.sendMessage("❌ An error occurred while converting the text to speech. Please try again later.", event.threadID, event.messageID);
  }
};
