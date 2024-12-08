const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "groupupdates",
  version: "1.2.6",
};

module.exports.handleEvent = async ({ event, api }) => {
  if (event.logMessageType === "log:thread-name") {
    const newName = event.logMessageData?.threadName || "this group";
    const oldName = event.logMessageData?.oldName || "this group";
    api.sendMessage(
      `🔄 The group name has been changed from "${oldName}" to "${newName}".`,
      event.threadID
    );
  }

  if (event.logMessageType === "log:thread-description") {
    const newDescription = event.logMessageData?.threadDescription || "No description";
    const oldDescription = event.logMessageData?.oldDescription || "No description";
    api.sendMessage(
      `🔄 The group description has been updated from "${oldDescription}" to "${newDescription}".`,
      event.threadID
    );
  }

  if (event.logMessageType === "log:thread-icon") {
    const iconUrl = event.logMessageData?.iconUrl || "No icon";
    api.sendMessage(
      `🔄 The group icon has been updated. New icon URL: ${iconUrl}`,
      event.threadID
    );
  }

  if (event.logMessageType === "log:group-settings") {
    const settings = event.logMessageData?.settings || {};
    let settingsMessage = "🔄 Group settings have been updated:\n";
    for (const [key, value] of Object.entries(settings)) {
      settingsMessage += `- ${key}: ${value}\n`;
    }
    api.sendMessage(settingsMessage, event.threadID);
  }
};
