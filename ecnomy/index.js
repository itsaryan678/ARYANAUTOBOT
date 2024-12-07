const fs = require('fs');
const path = require('path');

const economyFile = path.join(__dirname, 'economy.json');

// Ensure file exists
if (!fs.existsSync(economyFile)) {
  fs.writeFileSync(economyFile, JSON.stringify({}));
}

const getEconomyData = () => {
  const data = fs.readFileSync(economyFile);
  return JSON.parse(data);
};

const saveEconomyData = (data) => {
  fs.writeFileSync(economyFile, JSON.stringify(data, null, 2));
};

const getUserBalance = (userId) => {
  const economyData = getEconomyData();
  return economyData[userId]?.balance || 0;
};

const updateUserBalance = (userId, amount) => {
  const economyData = getEconomyData();
  if (!economyData[userId]) economyData[userId] = { balance: 0 };
  economyData[userId].balance += amount;
  saveEconomyData(economyData);
};
