const { getUserData } = require("../economy/index");

module.exports.config = {
  name: "balance",
  version: "1.0.0",
  usage: "balance",
  description: "Check your current balance.",
};

module.exports.run = async ({ api, event }) => {
  const { senderID } = event;
  const senderName = event.userInfo?.name || "Unknown User";

  const userData = getUserData(senderID, senderName);

  api.sendMessage(
    `💰 **Balance**\n\nName: ${userData.name}\nUID: ${userData.uid}\nBalance: $${userData.balance}`,
    event.threadID,
    event.messageID
  );
};
