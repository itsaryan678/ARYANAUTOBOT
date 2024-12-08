module.exports.config = {
  name: "kick",
  version: "1.1.0",
  role: 1, 
  hasPrefix: true,
  usage: "kick <@mention, userID, or reply>",
  description: "Remove a user from the group.",
  credits: "Aryan Chauhan",
  cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    let userId;

    if (event.messageReply && event.messageReply.userId) {
      userId = event.messageReply.userId;
    }
    else if (event.mentions && Object.keys(event.mentions).length > 0) {
      userId = Object.keys(event.mentions)[0];
    }
    else if (args[0]) {
      userId = args[0];
    } else {
      return api.sendMessage(
        "❌ | Please mention a user, reply to a user's message, or provide a user ID to remove from the group.",
        event.threadID,
        event.messageID
      );
    }

    await api.removeUserFromGroup(userId, event.threadID);

    const userName = event.mentions?.[userId] || `User with ID ${userId}`;
    return api.sendMessage(
      `✅ | Successfully removed ${userName} from the group.`,
      event.threadID,
      event.messageID
    );
  } catch (error) {
    console.error(`❌ | Error while removing user: ${error.message}`);
    api.sendMessage(
      `❌ | Unable to remove the user. Make sure the bot has admin privileges.`,
      event.threadID,
      event.messageID
    );
  }
};
