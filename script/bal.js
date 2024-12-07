const Currencies = require('../auto.js');

module.exports.config = {
  name: "balance",
  version: "1.0.0",
  description: "Check your current balance.",
  usage: "balance",
};

module.exports.run = async ({ api, event }) => {
  try {
    const userId = event.senderID;
    const userData = await Currencies.getData(userId);

    if (!userData) {
      return api.sendMessage(
        "❌ You don't have an account in the system. Start participating to earn money!",
        event.threadID,
        event.messageID
      );
    }

    const userName = userData.name || "Unknown User";
    const balance = userData.money || 0;

    api.sendMessage(
      `💰 **Your Balance**\n\n👤 Name: ${userName}\n💵 Balance: $${balance}`,
      event.threadID,
      event.messageID
    );
  } catch (error) {
    console.error(`Balance Command Error: ${error.message}`);
    api.sendMessage(
      "❌ An error occurred while fetching your balance. Please try again later.",
      event.threadID,
      event.messageID
    );
  }
};
