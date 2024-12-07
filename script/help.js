const bold = {
  'a': "𝗮", 'b': "𝗯", 'c': "𝗰", 'd': "𝗱", 'e': "𝗲", 'f': "𝗳", 'g': "𝗴", 'h': "𝗵",
  'i': "𝗶", 'j': "𝗷", 'k': "𝗸", 'l': "𝗹", 'm': "𝗺", 'n': "𝗻", 'o': "𝗼", 'p': "𝗽", 'q': "𝗾",
  'r': "𝗿", 's': "𝘀", 't': "𝘁", 'u': "𝘂", 'v': "𝘃", 'w': "𝘄", 'x': "𝘅", 'y': "𝘆", 'z': "𝘇",
  'A': "𝗔", 'B': "𝗕", 'C': "𝗖", 'D': "𝗗", 'E': "𝗘", 'F': "𝗙", 'G': "𝗚", 'H': "𝗛",
  'I': "𝗜", 'J': "𝗝", 'K': "𝗞", 'L': "𝗟", 'M': "𝗠", 'N': "𝗡", 'O': "𝗢", 'P': "𝗣", 'Q': "𝗤",
  'R': "𝗥", 'S': "𝗦", 'T': "𝗧", 'U': "𝗨", 'V': "𝗩", 'W': "𝗪", 'X': "𝗫", 'Y': "𝗬", 'Z': "𝗭", '1': "𝟭", '2': "𝟮", '3': "𝟯", '4': "𝟰", '5': "𝟱", '6': "𝟲", '7': "𝟳", '8': "𝟴", '9': "𝟵",
};

module.exports.config = {
  name: 'help',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: ['info'],
  description: "Beginner's guide",
  usage: "Help [page] or [command]",
  credits: 'Develeoper',
};

module.exports.run = async function({
  api,
  event,
  enableCommands,
  args,
  Utils
}) {
  const input = args.join(' ');
  try {
    const eventCommands = enableCommands[1].handleEvent;
    const commands = enableCommands[0].commands;
    if (!input) {
      const pages = 20;
      let page = 1;
      let start = (page - 1) * pages;
      let end = start + pages;
      let helpMessage = `📚| 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗟𝗜𝗦𝗧\n\n`;
      for (let i = start; i < Math.min(end, commands.length); i++) {
        helpMessage += `\t➜ ${bold[commands[i].toLowerCase()]} : ${bold[commands[i].description]}\n`;
      }
      helpMessage += '\nEvent List:\n\n';
      eventCommands.forEach((eventCommand, index) => {
        helpMessage += `\t➜ ${bold[eventCommand.toLowerCase()]} : ${bold[eventCommand.description]}\n`;
      });
      helpMessage += `\nPage ${page}/${Math.ceil(commands.length / pages)}. To view the next page, type 'help page number'. To view information about a specific command, type 'help command name'.`;
      api.sendMessage(helpMessage, event.threadID, event.messageID);
    } else if (!isNaN(input)) {
      const page = parseInt(input);
      const pages = 20;
      let start = (page - 1) * pages;
      let end = start + pages;
      let helpMessage = `📚| 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗟𝗜𝗦𝗧\n\n`;
      for (let i = start; i < Math.min(end, commands.length); i++) {
        helpMessage += `\t➜ ${bold[commands[i].toLowerCase()]} : ${bold[commands[i].description]}\n`;
      }
      helpMessage += '\nEvent List:\n\n';
      eventCommands.forEach((eventCommand, index) => {
        helpMessage += `\t➜ ${bold[eventCommand.toLowerCase()]} : ${bold[eventCommand.description]}\n`;
      });
      helpMessage += `\nPage ${page} of ${Math.ceil(commands.length / pages)}`;
      api.sendMessage(helpMessage, event.threadID, event.messageID);
    } else {
      const command = [...Utils.handleEvent, ...Utils.commands].find(([key]) => key.includes(input?.toLowerCase()))?.[1];
      if (command) {
        const {
          name,
          version,
          role,
          aliases = [],
          description,
          usage,
          credits,
          cooldown,
          hasPrefix
        } = command;
        const roleMessage = role !== undefined ? (role === 0 ? '➛ Permission: user' : (role === 1 ? '➛ Permission: admin' : (role === 2 ? '➛ Permission: thread Admin' : (role === 3 ? '➛ Permission: super Admin' : '')))) : '';
        const aliasesMessage = aliases.length ? `🔎 Aliases: ${aliases.map(alias => bold[alias.toLowerCase()]).join(', ')}\n` : '';
        const descriptionMessage = description ? `Description: ${bold[description]}\n` : '';
        const usageMessage = usage ? `📚 Usage: ${bold[usage]}\n` : '';
        const creditsMessage = credits ? `🏷️ Credits: ${bold[credits]}\n` : '';
        const versionMessage = version ? `📦 Version: ${version}\n` : '';
        const cooldownMessage = cooldown ? `⏰ Cooldown: ${cooldown} second(s)\n` : '';
        const message = `${bold[name]}\n\n${versionMessage}${roleMessage}\n${aliasesMessage}${descriptionMessage}${usageMessage}${creditsMessage}${cooldownMessage}`;
        api.sendMessage(message, event.threadID, event.messageID);
      } else {
        api.sendMessage('Command not found.', event.threadID, event.messageID);
      }
    }
  } catch (error) {
    console.log(error);
  }
};
