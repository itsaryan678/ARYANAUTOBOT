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
  try {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage("Please provide a song name.", event.threadID, event.messageID);
    }

    let searchResults = await yts(query);
    if (searchResults.videos.length === 0) {
      return api.sendMessage("No songs found for your query.", event.threadID, event.messageID);
    }

    const videoUrl = searchResults.videos[0].url;
    const downloadUrl = `https://aryanchauhanapi.onrender.com/youtube/audio?url=${encodeURIComponent(videoUrl)}`;

    const res = await axios.get(downloadUrl);
    if (res.status !== 200) {
      throw new Error(`Request failed with status code ${res.status}`);
    }

    const { link, title } = res.data.result;

    let sanitizedTitle = title.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
    const fileName = `${sanitizedTitle}.mp3`;
    const filePath = path.join(__dirname, "cache", fileName);

    // Ensure the cache directory exists
    if (!fs.existsSync(path.join(__dirname, "cache"))) {
      fs.mkdirSync(path.join(__dirname, "cache"));
    }

    const response = await axios({
      method: 'GET',
      url: link,
      responseType: 'stream'
    });

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

  } catch (error) {
    console.error("Error processing request:", error);

    let errorMessage = "An error occurred while processing your request. Please try again.";
    
    if (error.response) {
      // Server responded with a status code other than 2xx
      errorMessage += ` Server responded with status code ${error.response.status}.`;
    } else if (error.request) {
      // Request was made but no response was received
      errorMessage += " No response received from the server.";
    } else {
      // Other errors
      errorMessage += ` Error: ${error.message}`;
    }

    api.sendMessage(errorMessage, event.threadID, event.messageID);
  }
};
