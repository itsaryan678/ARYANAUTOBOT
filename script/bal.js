const Currencies = require('../auto.js');

module.exports.config = {
  name: "balance",
  version: "1.0.0",
  description: "Check your current balance.",
  usage: "balance",
  cooldown: 5
};

module.exports.run = async ({ api, event }) => {
  try {
    const userId = event.senderID;
    const database = await Currencies.getData(userId);

    if (!database) {
      return api.sendMessage(
        "❌ You don't have an account in the system. Please join or participate to create one.",
        event.threadID,
        event.messageID
      );
    }

    const balance = database.money || 0;
    return api.sendMessage(
      `💸 Your current balance is: $${balance}`,
      event.threadID,
      event.messageID
    );
  } catch (error) {
    console.error(`Balance Command Error: ${error.message}`);
    return api.sendMessage(
      "❌ An error occurred while fetching your balance. Please try again later.",
      event.threadID,
      event.messageID
    );
  }
};
