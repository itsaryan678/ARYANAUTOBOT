const path = require('path');
module.exports.config = {
  name: "music",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ['play'],
  usage: 'Music [prompt]',
  description: 'Search music on YouTube',
  credits: 'Developer',
  cooldown: 5
};
module.exports.run = async function({ api, event, args }) {
  const fs = require("fs-extra");
  const axios = require("axios");
  const yts = require("yt-search");

  const musicName = args.join(' ');
  if (!musicName) {
    api.sendMessage('To get started, type "music" followed by the title of the song you want.', event.threadID, event.messageID);
    return;
  }

  try {
    api.sendMessage(`Searching for "${musicName}"...`, event.threadID, event.messageID);
    const searchResults = await yts(musicName);

    if (!searchResults.videos.length) {
      return api.sendMessage("No results found for your search.", event.threadID, event.messageID);
    }

    const music = searchResults.videos[0];
    const musicUrl = music.url;

    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const time = new Date();
    const timestamp = time.toISOString().replace(/[:.]/g, "-");
    const filePath = path.join(cacheDir, `${timestamp}_music.mp3`);

    api.sendMessage(`Downloading "${music.title}"...`, event.threadID, event.messageID);

    // Request to your API
    const downloadResponse = await axios.get(`https://aryanchauhanapi.onrender.com/youtube/audio?url=${musicUrl}`);
    const downloadLink = downloadResponse.data.result.link;

    if (!downloadLink) {
      return api.sendMessage("Unable to retrieve the download link.", event.threadID, event.messageID);
    }

    // Download the file
    const fileResponse = await axios({
      url: downloadLink,
      method: 'GET',
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(filePath);
    fileResponse.data.pipe(writer);

    writer.on('finish', () => {
      if (fs.statSync(filePath).size > 26214400) {
        fs.unlinkSync(filePath);
        return api.sendMessage('The file size exceeds 25MB and cannot be sent.', event.threadID, event.messageID);
      }

      const message = {
        body: `${music.title}\n${music.description}`,
        attachment: fs.createReadStream(filePath)
      };

      api.sendMessage(message, event.threadID, () => {
        fs.unlinkSync(filePath);
      }, event.messageID);
    });

    writer.on('error', (err) => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      api.sendMessage(`An error occurred while saving the file: ${err.message}`, event.threadID, event.messageID);
    });
  } catch (error) {
    api.sendMessage(`An unexpected error occurred: ${error.message}`, event.threadID, event.messageID);
  }
};
