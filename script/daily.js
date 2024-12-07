const Currencies = require('../auto.js');

module.exports.config = {
  name: "daily",
  version: "1.0.0",
  description: "Claim your daily rewards.",
  usage: "daily",
  cooldown: 86400, // Cooldown in seconds (1 day)
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

    const currentDate = new Date();
    const lastClaimed = new Date(database.lastClaimed);

    // If user already claimed today, show cooldown message
    if (lastClaimed.toDateString() === currentDate.toDateString()) {
      const timeLeft = (86400 - (currentDate - lastClaimed) / 1000).toFixed(0); // seconds left until next claim
      return api.sendMessage(
        `⏱ You've already claimed your daily reward today. Please try again in ${timeLeft} seconds.`,
        event.threadID,
        event.messageID
      );
    }

    // Grant daily reward
    const dailyReward = 100; // Example reward
    await Currencies.increaseMoney(userId, dailyReward);

    // Update lastClaimed date
    database.lastClaimed = currentDate.toISOString();
    await Currencies.saveEconomyData(database);

    return api.sendMessage(
      `🎉 You have successfully claimed your daily reward of $${dailyReward}.`,
      event.threadID,
      event.messageID
    );
  } catch (error) {
    console.error(`Daily Command Error: ${error.message}`);
    return api.sendMessage(
      "❌ An error occurred while claiming the daily reward. Please try again later.",
      event.threadID,
      event.messageID
    );
  }
};
