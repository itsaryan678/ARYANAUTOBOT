const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "welcome",
  version: "1.2.4",
};

module.exports.handleEvent = async ({ event, api }) => {
  if (event.logMessageType === "log:subscribe") {
    const addedParticipants = event.logMessageData?.addedParticipants;

    if (!addedParticipants || addedParticipants.length === 0) return;

    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const groupName = threadInfo.threadName || "this group";

      const hours = new Date().getHours();
      let greeting;
      if (hours >= 5 && hours < 12) greeting = "Good morning";
      else if (hours >= 12 && hours < 18) greeting = "Good afternoon";
      else if (hours >= 18 && hours < 22) greeting = "Good evening";
      else greeting = "Good night";

      const folderPath = path.join(__dirname, "cache");
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const gifUrl = "http://xbeta.onrender.com/iak7YFnLr.gif";
      const gifPath = path.join(folderPath, "welcome.gif");
      const gifResponse = await axios.get(gifUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(gifPath, gifResponse.data);

      for (const participant of addedParticipants) {
        const userID = participant.userFbId;
        const userName = participant.fullName || "User";

        await api.sendMessage(
          {
            body: `👑| 𝗪𝗲𝗹𝗰𝗼𝗺𝗲\n━━━━━━━━\n\n𝖧𝖾𝗅𝗅𝗈! ${userName}, 𝖶𝖾𝗅𝖼𝗈𝗆𝖾 𝗍𝗈 𝗍𝗁𝖾 𝗀𝗋𝗈𝗎𝗉 ${groupName}, 𝖧𝖺𝗏𝖾 𝗁𝖺𝗏𝖾 𝖺 𝗇𝗂𝖼𝖾 ${greeting} 😊, 𝖥𝖾𝖾𝗅 𝖿𝗋𝖾𝖾 𝗍𝗈 𝗂𝗇𝗍𝗋𝗈𝖽𝗎𝖼𝖾 𝗒𝗈𝗎𝗋𝗌𝖾𝗅𝖿 𝖺𝗇𝖽 𝖿𝗈𝗅𝗅𝗈𝗐 𝗍𝗁𝖾 𝗀𝗋𝗈𝗎𝗉 𝗋𝗎𝗅𝖾𝗌 💜`,
            mentions: [{ tag: userName, id: userID }],
            attachment: fs.createReadStream(gifPath),
          },
          event.threadID
        );
      }

      fs.unlinkSync(gifPath);
    } catch (error) {
      console.error(`❌ | Failed to send welcome message or GIF: ${error.message}`);
    }
  }
};
