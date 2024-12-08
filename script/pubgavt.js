const axios = require("axios");
const path = require("path");
const fs = require("fs");

module.exports.config = {
  name: "pubgavatar",
  version: "1.0.0",
  aliases: ["pubgavt", "pgavt"],
  description: "Generate a PUBG avatar video using the provided text.",
  cooldown: 5,
};

module.exports.run = async ({ api, event, args }) => {
  const cacheDir = path.join(__dirname, "cache");

  try {
    if (!args.length) {
      return api.sendMessage(
        "Please provide the text to create your PUBG avatar video (e.g., `pubgavatar Aryan`).",
        event.threadID,
        event.messageID
      );
    }

    const text = args.join(" ").trim();
    const apiUrl = `https://aryanchauhanapi.onrender.com/api/ephoto/pubgavatar?text=${encodeURIComponent(text)}`;

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    const videoPath = path.join(cacheDir, "pubgavatar.mp4");

    const videoResponse = await axios.get(apiUrl, { responseType: "stream" });
    const videoStream = fs.createWriteStream(videoPath);

    await new Promise((resolve, reject) => {
      videoResponse.data.pipe(videoStream);
      videoStream.on("finish", resolve);
      videoStream.on("error", reject);
    });

    const videoAttachment = fs.createReadStream(videoPath);

    await api.sendMessage(
      {
        body: `Here is your PUBG avatar video for "${text}"!`,
        attachment: videoAttachment,
      },
      event.threadID,
      event.messageID
    );
  } catch (error) {
    console.error(error);
    return api.sendMessage(
      `An error occurred while generating the PUBG avatar video: ${error.message}`,
      event.threadID,
      event.messageID
    );
  } finally {
    if (fs.existsSync(cacheDir)) {
      await fs.promises.rm(cacheDir, { recursive: true, force: true });
    }
  }
};
