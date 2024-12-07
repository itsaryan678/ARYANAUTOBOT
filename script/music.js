const path = require('path');
module.exports.config = {
  name: "sing",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ['play'],
  usage: 'Music [promt]',
  description: 'Search music in youtube',
  credits: 'Aryan Chauhan',
  cooldown: 5
};
module.exports.run = async function({
  api,
  event,
  args
}) {
  const fs = require("fs-extra");
  const yts = require("yt-search");   
   const query = args.join(" ");
    if (!query) {
      return message.reply("Please provide a song name.");
    }

    message.reaction('⏳', event.messageID);

    let searchResults = await yts(query);
    if (searchResults.videos.length === 0) {
      return message.reply("No songs found for your query.");
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
        message.reply({
          body: sanitizedTitle,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => {
          fs.unlinkSync(filePath);
        }, event.messageID);
      });

      writeStream.on('error', (error) => {
        console.error("Error writing file:", error);
        message.reply("Failed to save the audio file.");
      });

      await message.reaction('✅', event.messageID);
    } catch (error) {
      console.error("Error downloading or sending audio:", error);
      message.reaction('❌', event.messageID);
      message.reply("An error occurred while processing your request. Please try again.");
    }
  }
};
