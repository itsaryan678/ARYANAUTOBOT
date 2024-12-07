const axios = require('axios');

function apply(text, fontMap) {
  return text.replace(/[a-zA-Z0-9]/g, (char) => fontMap[char] || char);
}

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
  name: "ai",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  usage: 'ai [promt]',
  description: 'Ask questions',
  credits: 'Aryan Chauhan',
  cooldown: 5
};

module.exports.run = async function({
  api,
  event,
  args
}) {
  try {
    const query = args.join(" ");
    if (!query) {
      await api.sendMessage(`𝖧𝖾𝗅𝗅𝗈! 𝖧𝗈𝗐 𝖼𝖺𝗇 𝖨 𝖺𝗌𝗌𝗂𝗌𝗍 𝗒𝗈𝗎 𝗍𝗈𝖽𝖺𝗒 ?`, event.threadID, event.messageID);
    } else {
      const response = await axios.get(`https://aryanchauhanapi.onrender.com/chat/coral?prompt=${encodeURIComponent(query)}`);

      if (response.data && response.data.response) {
        const answer = apply(response.data.response, sans);
        await api.sendMessage(answer, event.threadID, event.messageID);
        console.log(`Sent Ai response to the user`);
      } else {
        throw new Error(`Invalid or missing response from Ai API`);
      }
    }
  } catch (error) {
    console.error(`❌ | Failed to get Ai API response: ${error.message}`);
    api.sendMessage(`❌ | An error occurred. You can try typing your query again or resending it. There might be an issue with the server that's causing the problem, and it might resolve on retrying.`, event.threadID);
  }
};
