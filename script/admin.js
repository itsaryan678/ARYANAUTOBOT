const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "admin",
  version: "1.0.0",
  role: 1, // Only admins can use this command
  hasPrefix: true,
  aliases: ["admin", "manageadmin"],
  usage: "<add|remove|list> <userID>",
  description: 'Manage bot administrators (add/remove/view).',
  credits: 'Aryan Chauhan',
  cooldown: 5
};

module.exports.run = async function({ api, event, args, admin, database }) {
  const action = args[0];
  const userID = args[1];

  // Check if the action and userID are provided
  if (!action || !userID) {
    return api.sendMessage('Invalid command usage. Correct usage: <add|remove|list> <userID>', event.threadID, event.messageID);
  }

  try {
    const configFile = './data/history.json';
    const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    let userConfig = config.find(c => c.userid === userID);

    if (action === 'add') {
      if (userConfig) {
        return api.sendMessage(`User ${userID} is already an admin.`, event.threadID, event.messageID);
      }

      // Add user as an admin
      config.push({
        userid: userID,
        admin: true
      });
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
      return api.sendMessage(`User ${userID} has been added as an admin.`, event.threadID, event.messageID);

    } else if (action === 'remove') {
      if (!userConfig) {
        return api.sendMessage(`User ${userID} is not an admin.`, event.threadID, event.messageID);
      }

      // Remove user as an admin
      config = config.filter(c => c.userid !== userID);
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
      return api.sendMessage(`User ${userID} has been removed as an admin.`, event.threadID, event.messageID);

    } else if (action === 'list') {
      const adminList = config.filter(c => c.admin).map(c => `- UserID: ${c.userid}`).join('\n');
      return api.sendMessage(`List of administrators:\n${adminList}`, event.threadID, event.messageID);
    } else {
      return api.sendMessage('Invalid action. Correct usage: <add|remove|list> <userID>', event.threadID, event.messageID);
    }

  } catch (error) {
    console.error(error);
    return api.sendMessage('An error occurred while managing administrators.', event.threadID, event.messageID);
  }
};
