const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "leaveNotification",
  version: "1.2.5",
};

module.exports.handleEvent = async ({ event, api }) => {
  if (event.logMessageType === "log:unsubscribe") {
    const leftParticipantFbId = event.logMessageData?.leftParticipantFbId;

    if (!leftParticipantFbId) return;

    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const groupName = threadInfo.threadName || "this group";

      const info = await api.getUserInfo(leftParticipantFbId);
      const { name } = info[leftParticipantFbId] || { name: "A member" };

      await api.sendMessage(
        `😢 ${name} has left ${groupName}. We wish them all the best! 😊`,
        event.threadID
      );
    } catch (error) {
      console.error(`❌ | Failed to send goodbye message: ${error.message}`);
    }
  }
};
