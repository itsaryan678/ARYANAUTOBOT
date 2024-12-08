const { Currencies } = require('../auto.js');

module.exports.config = {
  name: "balance",
  version: "1.0.0",
  description: "Check your current balance and level."
};

module.exports.run = async ({ api, event }) => {
  const userId = event.senderID;
  const userData = await Currencies.getData(userId);

  if (!userData) {
    return api.sendMessage("User data not found.", event.threadID, event.messageID);
  }

  const message = `📊 **Balance Info**\n\n💰 Money: ${userData.money}\n📈 Level: ${userData.level}\n🔔 Experience: ${userData.exp}`;
  return api.sendMessage(message, event.threadID, event.messageID);
};
