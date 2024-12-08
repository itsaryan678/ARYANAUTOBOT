const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "antispam",
  version: "1.2.7",
};

module.exports.handleEvent = async ({ event, api, Users }) => {
  if (event.logMessageType === "log:addedToGroup") return;

  const senderID = event.senderID;
  const spamLimit = 10; // Define the spam limit (number of messages)

  if (!global.messageCounts) {
    global.messageCounts = {};
  }

  if (!global.messageCounts[senderID]) {
    global.messageCounts[senderID] = { count: 1, timestamp: event.timestamp };
  } else {
    const currentTimestamp = event.timestamp;
    const timeDifference = currentTimestamp - global.messageCounts[senderID].timestamp;

    if (timeDifference > 60000) {
      global.messageCounts[senderID] = { count: 1, timestamp: currentTimestamp };
    } else {
      global.messageCounts[senderID].count += 1;
    }

    if (global.messageCounts[senderID].count >= spamLimit) {
      try {
        await api.removeUserFromGroup(senderID, event.threadID);
        api.sendMessage(
          `🚫 ${Users.getName(senderID)} was kicked for spamming. Please avoid spamming the group!`,
          event.threadID
        );
      } catch (error) {
        console.error(`❌ | Failed to kick spammer: ${error.message}`);
      } finally {
        delete global.messageCounts[senderID];
      }
    }
  }
};
