const os = require('os');
const { execSync } = require('child_process');

module.exports.config = {
  name: "uptime",
  version: "1.0.0",
  aliases: ['up'],
  description: "Displays server uptime, system details, and performance metrics.",
  usage: "uptime",
  cooldown: 1
};

module.exports.run = async ({ api, event }) => {
  try {
    const uptimeSeconds = os.uptime();
    const startTime = new Date(uptimeSeconds * 1000).toISOString().substr(11, 8);

    const systemInfo = {
      platform: os.platform(),
      architecture: os.arch(),
      osVersion: os.release(),
      hostname: os.hostname(),
      totalMemory: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + " GB",
      freeMemory: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + " GB",
      cpus: os.cpus().length,
      cpuModel: os.cpus()[0].model,
      loadAverage: os.loadavg().map(avg => avg.toFixed(2)).join(', '), 
      diskUsage: getDiskUsage('/'),
      networkInterfaces: os.networkInterfaces()
    };

    function getDiskUsage(path) {
      try {
        const { stdout } = execSync(`df -h ${path}`);
        const lines = stdout.split('\n');
        const stats = lines[1].split(/\s+/);
        return `${stats[1]} used of ${stats[0]} (${stats[4]}%)`;
      } catch (error) {
        return "Unable to retrieve disk usage";
      }
    }

    const message = `
📚 𝗨𝗽𝘁𝗶𝗺𝗲 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻𝘀 

⏰| 𝗨𝗽𝘁𝗶𝗺𝗲: ${startTime} (HH:MM:SS)
🌐| 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺: ${systemInfo.platform}
⚙️| 𝗔𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲: ${systemInfo.architecture}
⚙️| 𝗢𝗦 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: ${systemInfo.osVersion}
🔎| 𝗛𝗼𝘀𝘁𝗻𝗮𝗺𝗲: ${systemInfo.hostname}
📂| 𝗧𝗼𝘁𝗮𝗹 𝗠𝗼𝗺𝗲𝗿𝘆: ${systemInfo.totalMemory}
🆓| 𝗙𝗿𝗲𝗲 𝗠𝗲𝗺𝗼𝗿𝘆: ${systemInfo.freeMemory}
🖥️| 𝗖𝗣𝗨𝘀: ${systemInfo.cpus}
📀| 𝗖𝗣𝗨 𝗠𝗼𝗱𝗲𝗹: ${systemInfo.cpuModel}`;

    return api.sendMessage(message, event.threadID, event.messageID);
  } catch (error) {
    console.error('Error executing uptime command:', error.message);
    return api.sendMessage("❌ An error occurred while fetching server details. Please try again later.", event.threadID, event.messageID);
  }
};
