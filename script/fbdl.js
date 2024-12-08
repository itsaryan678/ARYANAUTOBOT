const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "fbdl",
  version: "1.1.0",
  description: "Fetches and sends a Facebook video as a file.",
  cooldown: 5,
};

module.exports.run = async ({ api, event }) => {
  try {
    let fbUrl;

    if (event.messageReply && event.messageReply.body) {
      fbUrl = event.messageReply.body.trim();
    } else if (event.body && event.body.startsWith("https://www.facebook.com/")) {
      fbUrl = event.body.trim();
    } else {
      return api.sendMessage(
        "Please provide a valid Facebook video link either in the message or by replying to a message containing the link.",
        event.threadID,
        event.messageID
      );
    }

    if (!fbUrl.startsWith("https://www.facebook.com/")) {
      return api.sendMessage(
        "The provided link is not a valid Facebook video link. Please try again.",
        event.threadID,
        event.messageID
      );
    }

    const apiUrl = `https://aryanchauhanapi.onrender.com/api/fbdl?url=${encodeURIComponent(fbUrl)}`;
    const res = await axios.get(apiUrl);
    const data = res.data.result;

    if (!data || data.msg !== "success") {
      return api.sendMessage(
        "Failed to fetch the Facebook video details. Please check the link and try again.",
        event.threadID,
        event.messageID
      );
    }

    const videoUrl = data.hd || data.sd;
    if (!videoUrl) {
      return api.sendMessage(
        "No downloadable video found for the provided link.",
        event.threadID,
        event.messageID
      );
    }

    // Download the video
    const videoPath = path.join(__dirname, "video.mp4");
    const response = await axios({
      url: videoUrl,
      method: "GET",
      responseType: "stream",
    });

    // Save the video to disk
    const writer = fs.createWriteStream(videoPath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      // Send the video file
      api.sendMessage(
        {
          body: `🎥 Facebook Video\n\nTitle: ${data.title || "N/A"}\nViews: ${data.views || 0}\nLikes: ${data.like || 0}\nShares: ${data.shares || 0}`,
          attachment: fs.createReadStream(videoPath),
        },
        event.threadID,
        () => {
          // Delete the video file after sending
          fs.unlinkSync(videoPath);
        },
        event.messageID
      );
    });

    writer.on("error", (err) => {
      console.error(err);
      api.sendMessage(
        "An error occurred while downloading the video.",
        event.threadID,
        event.messageID
      );
    });
  } catch (error) {
    console.error(error);
    return api.sendMessage(
      `An error occurred while processing the Facebook video: ${error.message}`,
      event.threadID,
      event.messageID
    );
  }
};
