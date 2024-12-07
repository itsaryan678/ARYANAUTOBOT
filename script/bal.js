const Currencies = require('../auto.js');

module.exports.config = {
  name: "balance",
  version: "1.0.0",
  description: "Check your current balance.",
  usage: "balance",
};

module.exports.run = async ({ api, event }) => {
  const userId = event.senderID;
  const userData = await Currencies.getData(userId);

  if (!userData) {
    return api.sendMessage("❌ You don't have an account in the system. Try participating in activities!", event.threadID, event.messageID);
  }

  api.sendMessage(
    `💰 **Balance**\n\nUser: ${userData.name}\nBalance: $${userData.money}`,
    event.threadID,
    event.messageID
  );
};
