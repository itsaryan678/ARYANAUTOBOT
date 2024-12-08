const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "waifu",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  usage: "waifu",
  description: "Get random waifu images",
  credits: "Aryan Chauhan",
  cooldown: 5,
};

module.exports.run = async function ({ api, event }) {
  const imagesDir = path.join(__dirname, "images");
  const imagePath = path.join(imagesDir, `waifu_${Date.now()}.jpg`);

  try {
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const response = await axios.get(`https://aryanchauhanapi.onrender.com/api/waifu`);
    if (!response.data || !response.data.url) {
      throw new Error("No valid URL found in the API response.");
    }

    const imageUrl = response.data.url;

    const imageResponse = await axios.get(imageUrl, { responseType: "stream" });
    const writer = fs.createWriteStream(imagePath);
    imageResponse.data.pipe(writer);

    writer.on("finish", async () => {
      try {
        await api.sendMessage(
          { attachment: fs.createReadStream(imagePath) },
          event.threadID,
          event.messageID
        );
        console.log(`✅ | Sent image to user and saved locally as ${imagePath}`);
      } finally {
        fs.unlinkSync(imagePath);
      }
    });

    writer.on("error", (error) => {
      console.error(`❌ | Failed to save the image locally: ${error.message}`);
      api.sendMessage("❌ | An error occurred while saving the image. Please try again.", event.threadID, event.messageID);
    });
  } catch (error) {
    console.error(`❌ | Failed to fetch or process the image: ${error.message}`);
    api.sendMessage("❌ | An error occurred while generating the image. Please try again.", event.threadID, event.messageID);
  }
};
