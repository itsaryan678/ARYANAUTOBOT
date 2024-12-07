const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "shoti",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  usage: 'shoti',
  description: 'Fetch a random short video from TikTok and save it locally',
  credits: 'Aryan Chauhan',
  cooldown: 5
};

module.exports.run = async function({
  api,
  event,
  args
}) {
  try {
    const response = await axios.get('https://aryanchauhanapi.onrender.com/v1/shoti/get');

    if (response.data) {
      const { title, shotiurl, username, nickname, duration, region } = response.data;
      const videoMessage = `
        🎥 Title: ${title}
        📹 Username: ${username}
        👤 Nickname: ${nickname}
        ⏱️ Duration: ${duration}s
        🌎 Region: ${region}
      `;

      const videosDir = path.join(__dirname, 'videos');
      const videoPath = path.join(videosDir, `${nickname}_${Date.now()}.mp4`);

      if (!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir, { recursive: true });
      }

      const writer = fs.createWriteStream(videoPath);

      const videoResponse = await axios.get(shotiurl, { responseType: 'stream' });
      videoResponse.data.pipe(writer);

      writer.on('finish', async () => {
        await api.sendMessage({ 
          body: videoMessage,
          attachment: fs.createReadStream(videoPath) 
        }, event.threadID, event.messageID);
        console.log(`Sent random short video to the user and saved locally as ${videoPath}`);
      });

      writer.on('error', (error) => {
        console.error(`❌ | Failed to save the video locally: ${error.message}`);
        api.sendMessage(`❌ | An error occurred while saving the video. Please try again.`, event.threadID);
      });
    } else {
      throw new Error(`Invalid or missing response from video API`);
    }
  } catch (error) {
    console.error(`❌ | Failed to get video API response: ${error.message}`);
    api.sendMessage(`❌ | An error occurred while fetching the short video. Please try again.`, event.threadID);
  }
};
