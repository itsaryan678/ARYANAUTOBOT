module.exports.config = {
  name: "daily",
  version: "1.0.0",
  description: "Claim your daily reward and gain experience."
};

module.exports.run = async ({ api, event }) => {
  const userId = event.senderID;
  const userData = await Currencies.getData(userId);

  if (!userData) {
    return api.sendMessage("User data not found.", event.threadID, event.messageID);
  }

  const dailyReward = 100;
  const newMoney = userData.money + dailyReward;
  const newExp = userData.exp + 10;

  userData.money = newMoney;
  userData.exp = newExp;

  await fs.writeFileSync('./data/database.json', JSON.stringify(database, null, 2), 'utf-8');

  return api.sendMessage(`🎉 You've claimed your daily reward! You've received **${dailyReward}** money and **10** experience points.`, event.threadID, event.messageID);
};
