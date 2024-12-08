const axios = require("axios");
const path = require("path");
const fs = require("fs");

module.exports.config = {
  name: "fbdl",
  version: "1.0.0",
  hasPrefix: false,
  description: "Automatically download media when a valid Facebook video link is detected.",
  cooldown: 5,
};

module.exports.run = async ({ api, event }) => {
  const cacheDir = path.join(__dirname, "cache");

  try {
    const { body } = event;

    if (!body || !body.startsWith("https://www.facebook.com/")) {
      return api.sendMessage(
        "No valid Facebook video link detected in your message. Please provide a valid link.",
        event.threadID,
        event.messageID
      );
    }

    const fbUrl = body.trim();

    const apiUrl = `https://aryanchauhanapi.onrender.com/api/fbdl?url=${encodeURIComponent(fbUrl)}`;
    const res = await axios.get(apiUrl);
    const data = res.data.result;

    if (!data || data.msg !== "success") {
      return api.sendMessage(
        `Failed to download the Facebook video. Please check the link and try again.`,
        event.threadID,
        event.messageID
      );
    }

    const videoUrl = data.hd || data.sd; 
    if (!videoUrl) {
      return api.sendMessage(
        `No downloadable video found for the provided link.`,
        event.threadID,
        event.messageID
      );
    }

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    // Download and save video
    const videoPath = path.join(cacheDir, "video.mp4");
    const videoResponse = await axios.get(videoUrl, { responseType: "arraybuffer" });
    await fs.promises.writeFile(videoPath, videoResponse.data);
    const videoStream = fs.createReadStream(videoPath);

    // Construct message
    const message = `
⚙️ 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 𝗔𝘂𝘁𝗼𝗱𝗹

📝| 𝗧𝗶𝘁𝗹𝗲: ${data.title || "N/A"}
👀| 𝗩𝗶𝗲𝘄𝘀: ${data.views || 0}
👍| 𝗟𝗶𝗸𝗲𝘀: ${data.like || 0}
🔗| 𝗦𝗵𝗮𝗿𝗲𝘀: ${data.shares || 0}
    `;

    await api.sendMessage(
      {
        body: message,
        attachment: videoStream,
      },
      event.threadID,
      event.messageID
    );
  } catch (error) {
    console.error(error);
    return api.sendMessage(
      `An error occurred while processing the Facebook video: ${error.message}`,
      event.threadID,
      event.messageID
    );
  } finally {
    if (fs.existsSync(cacheDir)) {
      await fs.promises.rm(cacheDir, { recursive: true, force: true });
    }
  }
};
