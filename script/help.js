const bold = {
  'a': "𝗮", 'b': "𝗯", 'c': "𝗰", 'd': "𝗱", 'e': "𝗲", 'f': "𝗳", 'g': "𝗴", 'h': "𝗵",
  'i': "𝗶", 'j': "𝗷", 'k': "𝗸", 'l': "𝗹", 'm': "𝗺", 'n': "𝗻", 'o': "𝗼", 'p': "𝗽", 'q': "𝗾",
  'r': "𝗿", 's': "𝘀", 't': "𝘁", 'u': "𝘂", 'v': "𝘃", 'w': "𝘄", 'x': "𝘅", 'y': "𝘆", 'z': "𝘇",
  'A': "𝗔", 'B': "𝗕", 'C': "𝗖", 'D': "𝗗", 'E': "𝗘", 'F': "𝗙", 'G': "𝗚", 'H': "𝗛",
  'I': "𝗜", 'J': "𝗝", 'K': "𝗞", 'L': "𝗟", 'M': "𝗠", 'N': "𝗡", 'O': "𝗢", 'P': "𝗣", 'Q': "𝗤",
  'R': "𝗥", 'S': "𝗦", 'T': "𝗧", 'U': "𝗨", 'V': "𝗩", 'W': "𝗪", 'X': "𝗫", 'Y': "𝗬", 'Z': "𝗭", '1': "𝟭", '2': "𝟮", '3': "𝟯", '4': "𝟰", '5': "𝟱", '6': "𝟲", '7': "𝟳", '8': "𝟴", '9': "𝟵",
};

const sans = {
  a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁",
  i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉",
  q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑",
  y: "𝗒", z: "𝗓", A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥",
  G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬", N: "𝖭",
  O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵",
  W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹", "0": "𝟢", "1": "𝟣", "2": "𝟤", "3": "𝟥",
  "4": "𝟦", "5": "𝟧", "6": "𝟨", "7": "𝟩", "8": "𝟪", "9": "𝟫",
};

module.exports.config = {
  name: 'help',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: ['info'],
  description: "Beginner's guide",
  usage: "Help [page] or [command]",
  credits: 'Developer',
};

module.exports.run = async function({
  api,
  event,
  enableCommands,
  args,
  Utils,
  prefix
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
        helpMessage += `\t➜ ${bold[prefix]}${sans[commands[i]]}\n`;
      }
      helpMessage += '\nEvent List:\n\n';
      eventCommands.forEach((eventCommand, index) => {
        helpMessage += `\t➜ ${bold[prefix]}${sans[eventCommand]}\n`;
      });
      helpMessage += `\nPage ${page}/${Math.ceil(commands.length / pages)}. To view the next page, type '${bold[prefix]}help page number'. To view information about a specific command, type '${bold[prefix]}help command name'.`;
      api.sendMessage(helpMessage, event.threadID, event.messageID);
    } else if (!isNaN(input)) {
      const page = parseInt(input);
      const pages = 20;
      let start = (page - 1) * pages;
      let end = start + pages;
      let helpMessage = `${sans["C"]}𝗢𝗠𝗠𝗔𝗡𝗗 𝗟𝗜𝗦𝗧\n\n`;
      for (let i = start; i < Math.min(end, commands.length); i++) {
        helpMessage += `\t➜ ${bold[prefix]}${sans[commands[i]]}\n`;
      }
      helpMessage += '\nEvent List:\n\n';
      eventCommands.forEach((eventCommand, index) => {
        helpMessage += `\t➜ ${bold[prefix]}${sans[eventCommand]}\n`;
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
        const aliasesMessage = aliases.length ? `➛ Aliases: ${aliases.map(alias => bold[alias.toLowerCase()]).join(', ')}\n` : '';
        const descriptionMessage = description ? `Description: ${sans[description]}\n` : '';
        const usageMessage = usage ? `➛ Usage: ${sans[usage]}\n` : '';
        const creditsMessage = credits ? `➛ Credits: ${sans[credits]}\n` : '';
        const versionMessage = version ? `➛ Version: ${version}\n` : '';
        const cooldownMessage = cooldown ? `➛ Cooldown: ${cooldown} second(s)\n` : '';
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
module.exports.handleEvent = async function({
  api,
  event,
  prefix
}) {
  const {
    threadID,
    messageID,
    body
  } = event;
  const message = prefix ? 'This is my prefix: ' + prefix : "Sorry i don't have prefix";
  if (body?.toLowerCase().startsWith('prefix')) {
    api.sendMessage(message, threadID, messageID);
  }
};
