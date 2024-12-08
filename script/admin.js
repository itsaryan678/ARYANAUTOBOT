const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "admin",
  version: "1.0.0",
  role: 1, // Only admins can use this command
  hasPrefix: true,
  aliases: ["admin", "manageadmin"],
  usage: "<add|remove|fetch> <userID>",
  description: 'Manage bot administrators (add/remove/view/fetch).',
  credits: 'Aryan Chauhan',
  cooldown: 5
};

module.exports.run = async function({ api, event, args, admin, database }) {
  const action = args[0];
  const userID = args[1];

  // Check if the action and userID are provided
  if (!action || (action !== 'ck' && !userID)) {
    return api.sendMessage('Invalid command usage. Correct usage: <add|remove|fetch> <userID>', event.threadID, event.messageID);
  }

  try {
    const configFile = './data/history.json';
    let config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

    if (action === 'add') {
      // Check if user is already an admin
      if (config.some(c => c.userid === userID)) {
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
      // Remove user as an admin if they exist
      if (!config.some(c => c.userid === userID)) {
        return api.sendMessage(`User ${userID} is not an admin.`, event.threadID, event.messageID);
      }

      // Filter out the user from the admin list
      config = config.filter(c => c.userid !== userID);
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
      return api.sendMessage(`User ${userID} has been removed as an admin.`, event.threadID, event.messageID);

    } else if (action === 'list') {
      // Fetch the admin list from the history.json file
      const adminList = config.filter(c => c.admin).map(c => `- UserID: ${c.userid}`).join('\n');
      return api.sendMessage(`List of administrators:\n${adminList}`, event.threadID, event.messageID);

    } else {
      return api.sendMessage('Invalid action. Correct usage: <add|remove|fetch> <userID>', event.threadID, event.messageID);
    }

  } catch (error) {
    console.error(error);
    return api.sendMessage('An error occurred while managing administrators.', event.threadID, event.messageID);
  }
};
