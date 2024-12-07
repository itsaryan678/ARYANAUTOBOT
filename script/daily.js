const { getUserData, updateUserBalance } = require("../economy/index");

module.exports.config = {
  name: "daily",
  version: "1.0.0",
  usage: "daily",
  description: "Claim your daily reward.",
};

module.exports.run = async ({ api, event }) => {
  const { senderID } = event;
  const senderName = event.userInfo?.name || "Unknown User";
  const reward = Math.floor(Math.random() * 500) + 100; // Random reward between $100 and $500

  updateUserBalance(senderID, senderName, reward, "Daily reward");

  api.sendMessage(
    `🌟 **Daily Reward**\n\nYou claimed $${reward} as your daily reward!`,
    event.threadID,
    event.messageID
  );
};
