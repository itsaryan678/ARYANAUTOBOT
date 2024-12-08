const axios = require("axios");
const path = require("path");
const fs = require("fs");

module.exports.config = {
  name: "pexel",
  version: "1.0.0",
  aliases: ['px'],
  description: "Search for images on PEXEL based on a query and fetch a specified number of images (1-100).",
  cooldown: 5,
};

module.exports.run = async ({ api, event, args }) => {
  const cacheDir = path.join(__dirname, "cache");

  try {
    const keySearch = args.join(" ").trim();
    if (!keySearch.includes("-")) {
      return api.sendMessage(
        "Please enter your search query followed by a hyphen (`-`) and the number of images to fetch (e.g., `cats -5`).",
        event.threadID,
        event.messageID
      );
    }

    const keySearchs = keySearch.substr(0, keySearch.indexOf("-")).trim();
    let numberSearch = parseInt(keySearch.split("-").pop());
    if (isNaN(numberSearch) || numberSearch < 1 || numberSearch > 100) {
      return api.sendMessage(
        "Please specify a valid number of images (1-100).",
        event.threadID,
        event.messageID
      );
    }

    // Fetch image URLs
    const apiUrl = `https://aryanchauhanapi.onrender.com/api/pexels?query=${encodeURIComponent(keySearchs)}&number=${numberSearch}`;
    const res = await axios.get(apiUrl);
    const data = res.data.images;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return api.sendMessage(
        `No results found for "${keySearchs}". Please try another query.`,
        event.threadID,
        event.messageID
      );
    }

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    const imgData = [];
    for (let i = 0; i < Math.min(numberSearch, data.length); i++) {
      try {
        const imgResponse = await axios.get(data[i], {
          responseType: "arraybuffer",
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        });

        const imgPath = path.join(cacheDir, `${i + 1}.jpg`);
        await fs.promises.writeFile(imgPath, imgResponse.data);
        imgData.push(fs.createReadStream(imgPath));
      } catch (error) {
        console.error(`Error downloading image ${data[i]}:`, error.message);
      }
    }

    if (imgData.length === 0) {
      return api.sendMessage(
        `Failed to download any images for "${keySearchs}". Please try again.`,
        event.threadID,
        event.messageID
      );
    }

    await api.sendMessage(
      {
        body: `Here are the top ${imgData.length} results for your query "${keySearchs}":`,
        attachment: imgData,
      },
      event.threadID,
      event.messageID
    );
  } catch (error) {
    console.error(error);
    return api.sendMessage(
      `An error occurred while processing your request: ${error.message}`,
      event.threadID,
      event.messageID
    );
  } finally {
    if (fs.existsSync(cacheDir)) {
      await fs.promises.rm(cacheDir, { recursive: true, force: true });
    }
  }
};
