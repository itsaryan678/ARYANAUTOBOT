const os = require("os");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const startTime = new Date(); 

module.exports.config = {
  name: "uptime",
  version: "1.0.1",
  aliases: ['up'],
  description: "Displays server uptime, system details, and performance metrics.",
  usage: "uptime",
  cooldown: 1
};

module.exports.run = async ({ api, event }) => {
  try {
    const uptimeInSeconds = (new Date() - startTime) / 1000;

    const seconds = uptimeInSeconds;
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsLeft = Math.floor(seconds % 60);
    const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${secondsLeft}s`;

    const loadAverage = os.loadavg();
    const cpuUsage =
      os
        .cpus()
        .map((cpu) => cpu.times.user)
        .reduce((acc, curr) => acc + curr) / os.cpus().length;

    const totalMemoryGB = os.totalmem() / 1024 ** 3;
    const freeMemoryGB = os.freemem() / 1024 ** 3;
    const usedMemoryGB = totalMemoryGB - freeMemoryGB;

    const currentDate = new Date();
    const options = { year: "numeric", month: "numeric", day: "numeric" };
    const date = currentDate.toLocaleDateString("en-US", options);
    const time = currentDate.toLocaleTimeString("en-US", {
      timeZone: "Asia/Kolkata",
      hour12: true,
    });

    const timeStart = Date.now();
    await api.sendMessage({
      body: "🔎 Processing your request...",
    }, event.threadID);

    const ping = Date.now() - timeStart;

    let pingStatus = "⛔| 𝖡𝖺𝖽 𝖲𝗒𝗌𝗍𝖾𝗆";
    if (ping < 1000) {
      pingStatus = "✅| 𝖲𝗆𝗈𝗈𝗍𝗁 𝖲𝗒𝗌𝗍𝖾𝗆";
    }
    
    const systemInfo = `♡   ∩_∩
     （„• ֊ •„)♡
    ╭─∪∪────────────⟡
    │ 𝗨𝗽𝘁𝗶𝗺𝗲 𝗜𝗻𝗳𝗼
    ├───────────────⟡
    ├───────────────⟡
    │ ⏰ 𝗥𝚞𝚗𝚝𝚒𝚖𝗲
    │  ${uptimeFormatted}
    ├───────────────⟡
    │ 👑 𝗦𝘆𝘀𝘁𝗲𝗺 𝗜𝗻𝗳𝗼
    │𝙾𝚂: ${os.type()} ${os.arch()}
    │𝙻𝙰𝙽𝙶 𝚅𝙴𝚁: ${process.version}
    │𝙲𝙿𝚄 𝙼𝙾𝙳𝙴𝙻: ${os.cpus()[0].model}
    │𝚂𝚃𝙾𝚁𝙰𝙶𝙴: ${usedMemoryGB.toFixed(2)} GB / ${totalMemoryGB.toFixed(2)} GB
    │𝙲𝙿𝚄 𝚄𝚂𝙰𝙶𝙴: ${cpuUsage.toFixed(1)}%
    │𝚁𝙰𝙼 𝚄𝚂𝙶𝙴: ${process.memoryUsage().heapUsed / 1024 / 1024} MB;
    ├───────────────⟡
    │ ✅ 𝗢𝘁𝗵𝗲𝗿 𝗜𝗻𝗳𝗼
    │𝙳𝙰𝚃𝙴: ${date}
    │𝚃𝙸𝙼𝙴: ${time}
    │𝙿𝙸𝙽𝙶: ${ping}𝚖𝚜
    │𝚂𝚃𝙰𝚃𝚄𝚂: ${pingStatus}
    ╰───────────────⟡
    `;

    await api.sendMessage({
      body: systemInfo,
    }, event.threadID);
  } catch (error) {
    console.error("Error retrieving system information:", error);
    api.sendMessage(
      "Unable to retrieve system information.",
      event.threadID,
      event.messageID,
    );
  }
};
