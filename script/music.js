const path = require('path');
const axios = require('axios');
const fs = require('fs-extra');
const yts = require('yt-search');

module.exports.config = {
  name: "sing",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ['play'],
  usage: 'Music [prompt]',
  description: 'Search music on YouTube',
  credits: 'Aryan Chauhan',
  cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
  const query = args.join(" ");
  if (!query) {
    return api.sendMessage("Please provide a song name.", event.threadID, event.messageID);
  }

  await api.sendMessage('⏳', event.messageID);

  let searchResults = await yts(query);
  if (searchResults.videos.length === 0) {
    return api.sendMessage("No songs found for your query.", event.threadID, event.messageID);
  }

  const videoUrl = searchResults.videos[0].url;
  const downloadUrl = `https://aryanchauhanapi.onrender.com/youtube/audio?url=${encodeURIComponent(videoUrl)}`;

  try {
    const res = await axios.get(downloadUrl);
    const music = res.data.result.link;

    const response = await axios({
      method: 'GET',
      url: music,
      responseType: 'stream'
    });

    let title = res.data.result.title || "song";
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
    const fileName = `${sanitizedTitle}.mp3`;
    const filePath = path.join(__dirname, "cache", fileName);

    const writeStream = fs.createWriteStream(filePath);
    response.data.pipe(writeStream);

    writeStream.on('finish', () => {
      api.sendMessage({
        body: sanitizedTitle,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        fs.unlinkSync(filePath);
      }, event.messageID);
    });

    writeStream.on('error', (error) => {
      console.error("Error writing file:", error);
      api.sendMessage("Failed to save the audio file.", event.threadID, event.messageID);
    });

    await api.sendMessage('✅', event.messageID);
  } catch (error) {
    console.error("Error downloading or sending audio:", error);
    api.sendMessage('❌', event.messageID);
    api.sendMessage("An error occurred while processing your request. Please try again.", event.threadID, event.messageID);
  }
};
