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
    const days = Math.floor(uptimeSeconds / (24 * 3600));
    const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;

    const startTime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const serverUptime = getServerUptime();

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

    function getServerUptime() {
      try {
        const uptime = execSync("uptime -s").toString().trim();
        const start = new Date(uptime);
        const diff = Math.floor((Date.now() - start) / 1000);
        const days = Math.floor(diff / (24 * 3600));
        const hours = Math.floor((diff % (24 * 3600)) / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
      } catch (error) {
        return "Unable to retrieve server uptime";
      }
    }

    const message = `
📚 𝗨𝗽𝘁𝗶𝗺𝗲 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻𝘀 

⏰| 𝗦𝗲𝗿𝘃𝗲𝗿 𝗨𝗽𝘁𝗶𝗺𝗲${serverUptime}
🌐| 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺 ${systemInfo.platform}
⚙️| 𝗔𝗿𝗰𝗵𝗶𝘁𝗲𝗰𝘁𝘂𝗿𝗲 ${systemInfo.architecture}
🌐| 𝗢𝗦 𝗩𝗲𝗿𝘀𝗶𝗼𝗻 ${systemInfo.osVersion}
🔎| 𝗛𝗼𝘀𝘁𝗻𝗮𝗺𝗲 ${systemInfo.hostname}
📂| 𝗧𝗼𝘁𝗮𝗹 𝗠𝗲𝗺𝗼𝗿𝘆: ${systemInfo.totalMemory}
🆓| 𝗙𝗿𝗲𝗲 𝗠𝗲𝗺𝗼𝗿𝘆 ${systemInfo.freeMemory}
🖥️| 𝗖𝗣𝗨𝘀 ${systemInfo.cpus}
📀| 𝗖𝗣𝗨 𝗠𝗼𝗱𝗲𝗹 ${systemInfo.cpuModel}
🔄| 𝗟𝗼𝗮𝗱 𝗔𝘃𝗴 ${systemInfo.loadAverage}
📂| 𝗗𝗶𝘀𝗸 𝗨𝘀𝗮𝗴𝗲: ${systemInfo.diskUsage}
📶| 𝗡𝗲𝘁𝘄𝗼𝗿𝗸 𝗜𝗻𝗳: ${Object.keys(systemInfo.networkInterfaces).join(', ')}`;

    return api.sendMessage(message, event.threadID, event.messageID);
  } catch (error) {
    console.error('Error executing uptime command:', error.message);
    return api.sendMessage("❌ An error occurred while fetching server details. Please try again later.", event.threadID, event.messageID);
  }
};
