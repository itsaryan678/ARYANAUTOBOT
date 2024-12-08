module.exports.config = {
  name: "welcome",
  version: "1.0.0",
};

module.exports.handleEvent = async ({ event, api }) => {
  // Only proceed if it's a "join" event
  if (event.logMessageType === "log:subscribe") {
    const addedParticipants = event.logMessageData?.addedParticipants;

    // Ensure there are participants to welcome
    if (!addedParticipants || addedParticipants.length === 0) return;

    for (const participant of addedParticipants) {
      const userID = participant.userFbId;
      const userName = participant.fullName || "User";

      // Send a welcome message
      try {
        await api.sendMessage(
          `🎉 Welcome to the group, ${userName}!\n\nFeel free to introduce yourself and follow the group rules. 😊`,
          event.threadID
        );
      } catch (error) {
        console.error(`❌ | Failed to send welcome message for ${userName}: ${error.message}`);
      }
    }
  }
};
