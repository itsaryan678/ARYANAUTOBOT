const { getUserData, updateUserBalance } = require("../economy/index");

module.exports.config = {
  name: "slot",
  version: "1.0.0",
  usage: "slot [bet amount]",
  description: "Play a slot game.",
};

module.exports.run = async ({ api, event, args }) => {
  const { senderID } = event;
  const senderName = event.userInfo?.name || "Unknown User";
  const betAmount = parseInt(args[0], 10);

  if (isNaN(betAmount) || betAmount <= 0) {
    return api.sendMessage("❌ Please enter a valid bet amount.", event.threadID, event.messageID);
  }

  const userData = getUserData(senderID, senderName);

  if (userData.balance < betAmount) {
    return api.sendMessage("❌ You don't have enough money to place this bet.", event.threadID, event.messageID);
  }

  const symbols = ["🍒", "🍋", "🍉", "⭐", "💎"];
  const result = Array(3)
    .fill()
    .map(() => symbols[Math.floor(Math.random() * symbols.length)]);

  const win = result.every((symbol) => symbol === result[0]);
  const payout = win ? betAmount * 3 : -betAmount;

  updateUserBalance(senderID, senderName, payout, win ? "Slot game win" : "Slot game loss");

  api.sendMessage(
    `🎰 **Slot Machine**\n\n${result.join(" | ")}\n\n${win ? `You won $${betAmount * 3}!` : `You lost $${betAmount}.`}`,
    event.threadID,
    event.messageID
  );
};
