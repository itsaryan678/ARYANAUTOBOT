const axios = require("axios");
const path = require("path");
const fs = require("fs");

module.exports.config = {
  name: "tikstalk",
  version: "1.0.0",
  aliases: ['ttstalk'],
  description: "Fetches TikTok user details using the TikTok username.",
  cooldown: 5,
};

module.exports.run = async ({ api, event, args }) => {
  const cacheDir = path.join(__dirname, "cache");

  try {
    const username = args[0];
    if (!username) {
      return api.sendMessage(
        "Please provide a TikTok username.",
        event.threadID,
        event.messageID
      );
    }

    const apiUrl = `https://aryanchauhanapi.onrender.com/tikstalk?username=${encodeURIComponent(username)}`;
    const res = await axios.get(apiUrl);
    const data = res.data;

    if (!data || data.error) {
      return api.sendMessage(
        `No user found for the username "${username}". Please try again with a valid username.`,
        event.threadID,
        event.messageID
      );
    }

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    const avatarPath = path.join(cacheDir, "avatar.jpg");
    const imgResponse = await axios.get(data.avatarLarger, {
      responseType: "arraybuffer",
    });

    await fs.promises.writeFile(avatarPath, imgResponse.data);

    const imgStream = fs.createReadStream(avatarPath);

    const message = `
📚 𝗧𝗶𝗸𝘁𝗼𝗸 𝗦𝘁𝗮𝗹𝗸

🔎| 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲 ${data.nickname}
🌟| 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲 ${data.username}
👑| 𝗙𝗼𝗹𝗹𝗼𝘄𝗲𝗿𝘀 ${data.followerCount}
📦| 𝗙𝗼𝗹𝗹𝗼𝘄𝗶𝗻𝗴 ${data.followingCount}
📽️| 𝗩𝗶𝗱𝗲𝗼𝘀 ${data.videoCount}
💜| 𝗛𝗲𝗮𝗿𝘁𝘀${data.heartCount}
🔗| 𝗦𝗶𝗴𝗻𝗮𝘁𝘂𝗿𝗲 ${data.signature || "N/A"}
    `;

    await api.sendMessage({
      body: message,
      attachment: imgStream,
    }, event.threadID, event.messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage(
      `An error occurred while fetching TikTok user details: ${error.message}`,
      event.threadID,
      event.messageID
    );
  } finally {
    if (fs.existsSync(cacheDir)) {
      await fs.promises.rm(cacheDir, { recursive: true, force: true });
    }
  }
};
