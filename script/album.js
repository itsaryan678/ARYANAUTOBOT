const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "album",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  usage: 'album [category|list|category1,category2,...]',
  description: 'Fetch a random video from a specified album category or manually provided list of categories',
  credits: 'Aryan Chauhan',
  cooldown: 5
};

module.exports.run = async function({
  api,
  event,
  args
}) {
  try {
    if (args[0] === 'list') {
      const categories = ['freefire', 'anime', 'hindi', 'english', 'football'];
      const categoriesStr = categories.join(', ');

      await api.sendMessage({
        body: `Available album categories: ${categoriesStr}`
      }, event.threadID, event.messageID);
      console.log(`Sent manually provided album categories to the user`);
    } else {
      const category = args[0];

      if (!category || !['freefire', 'anime', 'hindi', 'english', 'football'].includes(category)) {
        throw new Error(`Invalid category. Please provide a valid category: freefire, anime, hindi, english, or football.`);
      }

      const response = await axios.get(`https://aryanchauhanapi.onrender.com/api/album?category=${category}`);

      if (response.data && response.data.url) {
        const videoUrl = response.data.url;

        const videosDir = path.join(__dirname, 'albumVideos');
        if (!fs.existsSync(videosDir)) {
          fs.mkdirSync(videosDir, { recursive: true });
        }

        const videoPath = path.join(videosDir, `${Date.now()}.mp4`);
        const writer = fs.createWriteStream(videoPath);

        const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
        videoResponse.data.pipe(writer);

        writer.on('finish', async () => {
          await api.sendMessage({
            body: `Here's a video from the category: ${category}.`,
            attachment: fs.createReadStream(videoPath)
          }, event.threadID, event.messageID);
          console.log(`Sent video from album to the user`);
        });

        writer.on('error', (error) => {
          console.error(`❌ | Failed to save the video locally: ${error.message}`);
          api.sendMessage(`❌ | An error occurred while saving the video. Please try again.`, event.threadID);
        });
      } else {
        throw new Error(`Invalid or missing response from album video API`);
      }
    }
  } catch (error) {
    console.error(`❌ | Failed to get album API response: ${error.message}`);
    api.sendMessage(`❌ | ${error.message}`, event.threadID);
  }
};
