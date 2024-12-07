const path = require('path');
const fs = require('fs');
const axios = require('axios');
const yts = require('yt-search');

module.exports.config = {
  name: "music",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ['play'],
  usage: 'music [prompt]',
  description: 'Search music on YouTube',
  credits: 'Developer',
  cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
  const musicName = args.join(' ');
  if (!musicName) {
    api.sendMessage(
      'To get started, type "music" followed by the title of the song you want.',
      event.threadID,
      event.messageID
    );
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

    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}_music.mp3`;
    const filePath = path.join(cacheDir, fileName);

    api.sendMessage(`Downloading "${music.title}"...`, event.threadID, event.messageID);

    // API call to get download link
    const downloadResponse = await axios.get(`https://aryanchauhanapi.onrender.com/youtube/audio?url=${musicUrl}`);
    console.log("API Response:", downloadResponse.data); // Debug log

    const downloadLink = downloadResponse.data?.result?.link;
    const title = downloadResponse.data?.result?.title;
    const filesize = downloadResponse.data?.result?.filesize;

    if (!downloadLink) {
      return api.sendMessage("Unable to retrieve the download link.", event.threadID, event.messageID);
    }

    console.log(`Download Link: ${downloadLink}`);
    console.log(`File Size: ${filesize}`);
    console.log(`Title: ${title}`);

    // Encode URL to handle special characters
    const encodedUrl = encodeURI(downloadLink);

    // Download the file
    const fileResponse = await axios({
      url: encodedUrl,
      method: 'GET',
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(filePath);
    fileResponse.data.pipe(writer);

    writer.on('finish', () => {
      if (fs.statSync(filePath).size > 26214400) { // 25MB limit
        fs.unlinkSync(filePath);
        return api.sendMessage('The file size exceeds 25MB and cannot be sent.', event.threadID, event.messageID);
      }

      const message = {
        body: `${title}\nFile Size: ${(filesize / (1024 * 1024)).toFixed(2)} MB`,
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
    console.error("Error:", error); // Debug log
    api.sendMessage(`An unexpected error occurred: ${error.message}`, event.threadID, event.messageID);
  }
};
