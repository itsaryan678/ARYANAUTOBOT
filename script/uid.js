module.exports.config = {
  name: "uid",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  usage: 'uid',
  description: 'Fetch the unique user ID of the sender',
  credits: 'Aryan Chauhan',
  cooldown: 5
};

module.exports.run = async function({
  api,
  event
}) {
  try {
    const userID = event.senderID;

    await api.sendMessage(
      `${userID}`,
      event.threadID,
      event.messageID
    );
    console.log(`Sent user ID to the user.`);
  } catch (error) {
    console.error(`❌ | Failed to fetch user ID: ${error.message}`);
    api.sendMessage(`❌ | An error occurred while fetching the user ID.`, event.threadID, event.messageID);
  }
};
