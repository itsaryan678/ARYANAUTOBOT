const fs = require("fs");
const path = require("path");

const economyFile = path.join(__dirname, "economy.json");

// Ensure the economy file exists
if (!fs.existsSync(economyFile)) {
  fs.writeFileSync(economyFile, JSON.stringify({}));
}

// Helper functions to manage economy data
const getEconomyData = () => JSON.parse(fs.readFileSync(economyFile));

const saveEconomyData = (data) => {
  fs.writeFileSync(economyFile, JSON.stringify(data, null, 2));
};

const getUserData = (userId, userName = "Unknown User") => {
  const economyData = getEconomyData();
  if (!economyData[userId]) {
    economyData[userId] = {
      uid: userId,
      name: userName,
      balance: 0,
      transactions: [],
    };
    saveEconomyData(economyData);
  } else if (userName && economyData[userId].name !== userName) {
    economyData[userId].name = userName; // Update name if changed
    saveEconomyData(economyData);
  }
  return economyData[userId];
};

const updateUserBalance = (userId, userName, amount, description = "No description") => {
  const economyData = getEconomyData();
  if (!economyData[userId]) getUserData(userId, userName);
  economyData[userId].balance += amount;

  economyData[userId].transactions.push({
    amount,
    description,
    timestamp: new Date().toISOString(),
  });

  saveEconomyData(economyData);
};

const getRichestUsers = (limit = 10) => {
  const economyData = getEconomyData();
  return Object.values(economyData)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, limit);
};

module.exports = {
  getEconomyData,
  saveEconomyData,
  getUserData,
  updateUserBalance,
  getRichestUsers,
};
