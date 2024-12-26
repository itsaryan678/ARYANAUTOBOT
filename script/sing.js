+cmd install sing.js const axios = require("axios");
const fs = require("fs");
const yts = require("yt-search");
const path = require("path");
const fsPromises = require("fs").promises;

const cacheDir = path.join(__dirname, "/cache");

module.exports = {
  config: {
    name: "sing",
    version: "1.2",
    aliases: ["song"],
    author: "Aryan Chauhan",
    countDown: 5,
    role: 0,
    description: {
      en: "Search and download the top audio from YouTube",
    },
    category: "media",
    guide: {
      en: "{pn} <search term>: search YouTube and download the top audio result",
    },
  },

  run: async ({ api, args, event }) => {
    if (args.length < 1) {
      return api.sendMessage("❌ Please use the format '{pn}sing <search term>'.", event.threadID, event.messageID);
    }

    const searchTerm = args.join(" ");
    try {
      if (!fs.existsSync(cacheDir)) {
        await fsPromises.mkdir(cacheDir, { recursive: true });
      }

      const searchResults = await yts(searchTerm);
      const topVideo = searchResults.videos[0];

      if (!topVideo) {
        return api.sendMessage(`⭕ No results found for: ${searchTerm}`, event.threadID, event.messageID);
      }

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const videoUrl = topVideo.url;
      const downloadUrlEndpoint = `https://aryanchauhanapi.onrender.com/youtube/audio?url=${encodeURIComponent(videoUrl)}`;
      const respo = await axios.get(downloadUrlEndpoint);
      const downloadUrl = respo.data.result.link;

      if (!downloadUrl) {
        return api.sendMessage("❌ Could not retrieve an MP3 file. Please try again with a different search.", event.threadID, event.messageID);
      }

      const totalSize = await getTotalSize(downloadUrl);
      const audioPath = path.join(cacheDir, `ytb_audio_${topVideo.videoId}.mp3`);
      await downloadFileParallel(downloadUrl, audioPath, totalSize, 5);

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      await api.sendMessage(
        {
          body: `• Title: ${topVideo.title}\n• Channel: ${topVideo.author.name}`,
          attachment: fs.createReadStream(audioPath),
        },
        event.threadID,
        () => fs.unlinkSync(audioPath),
        event.messageID
      );
    } catch (error) {
      console.error(error);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage("❌ Failed to download.", event.threadID, event.messageID);
    }
  },
};

async function getTotalSize(url) {
  try {
    const response = await axios.head(url);
    return parseInt(response.headers["content-length"], 10);
  } catch (error) {
    throw new Error("Unable to retrieve file size.");
  }
}

async function downloadFileParallel(url, filePath, totalSize, numChunks) {
  const chunkSize = Math.ceil(totalSize / numChunks);
  const chunks = [];
  const progress = Array(numChunks).fill(0);

  async function downloadChunk(url, start, end, index) {
    try {
      const response = await axios.get(url, {
        headers: { Range: `bytes=${start}-${end}` },
        responseType: "arraybuffer",
        timeout: 15000,
      });

      progress[index] = response.data.byteLength;
      return response.data;
    } catch (error) {
      throw new Error(`Failed to download chunk ${index + 1}: ${error.message}`);
    }
  }

  for (let i = 0; i < numChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize - 1, totalSize - 1);
    chunks.push(downloadChunk(url, start, end, i));
  }

  try {
    const buffers = await Promise.all(chunks);

    const fileStream = fs.createWriteStream(filePath);
    for (const buffer of buffers) {
      fileStream.write(Buffer.from(buffer));
    }

    await new Promise((resolve, reject) => {
      fileStream.on("finish", resolve);
      fileStream.on("error", reject);
      fileStream.end();
    });
  } catch (error) {
    console.error("Error downloading or writing the file:", error);
    throw error;
  }
}
