const axios = require('axios');

module.exports.config = {
  name: "imgur",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  usage: 'imgur [reply]',
  description: 'Images, mp3, mp4 to link',
  credits: 'Aryan Chauhan',
  cooldown: 5
};

module.exports.run = async function({
  api,
  event,
  args
}) {
  try {
    const attachments = event.messageReply?.attachments;
    const baseApiUrl = "https://xbeta.onrender.com/v1";

    if (!attachments || attachments.length === 0) {
      return api.sendMessage(
        "Please reply to media to upload using this command.",
        event.threadID,
        event.messageID
      );
    }

    const mediaLinks = [];

    for (const attachment of attachments) {
      if (attachment.url) {
        const response = await axios.post(`${baseApiUrl}/upload`, { url: attachment.url });
        if (response.data && response.data.link) {
          mediaLinks.push(response.data.link);
        } else {
          throw new Error(`Failed to fetch link for media: ${attachment.url}`);
        }
      }
    }

    if (mediaLinks.length > 0) {
      await api.sendMessage(
        `Uploaded media:\n${mediaLinks.join("\n")}`,
        event.threadID,
        event.messageID
      );
      console.log(`Uploaded media links sent to the user.`);
    } else {
      throw new Error("No media links available.");
    }
  } catch (error) {
    console.error(`❌ | Error: ${error.message}`);
    api.sendMessage(`❌ | Error: ${error.message}`, event.threadID, event.messageID);
  }
};
