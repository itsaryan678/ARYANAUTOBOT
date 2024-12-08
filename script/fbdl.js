const axios = require("axios");

module.exports.config = {
  name: "fbdl",
  version: "1.0.0",
  description: "Fetches the Facebook video download link for manual download.",
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
        `Failed to fetch the Facebook video details. Please check the link and try again.`,
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

    // Construct the response message
    const message = `
⚙️ 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 𝗩𝗶𝗱𝗲𝗼 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝗟𝗶𝗻𝗸

📝| 𝗧𝗶𝘁𝗹𝗲: ${data.title || "N/A"}
👀| 𝗩𝗶𝗲𝘄𝘀: ${data.views || 0}
👍| 𝗟𝗶𝗸𝗲𝘀: ${data.like || 0}
🔗| 𝗦𝗵𝗮𝗿𝗲𝘀: ${data.shares || 0}

📥| 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝗛𝗗: ${data.hd ? data.hd : "Not available"}
📥| 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝗦𝗗: ${data.sd ? data.sd : "Not available"}
    `;

    return api.sendMessage(message, event.threadID, event.messageID);
  } catch (error) {
    console.error(error);
    return api.sendMessage(
      `An error occurred while processing the Facebook video: ${error.message}`,
      event.threadID,
      event.messageID
    );
  }
};
