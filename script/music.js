const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const yts = require('yt-search');

const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
}

async function downloadFile(url, filePath) {
    const writer = fs.createWriteStream(filePath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

module.exports = {
    config: {
        name: "sing",
        version: "2.0.0",
        role: 0,
        hasPrefix: true,
        aliases: ['play', 'music'],
        usage: '{pn} <search query>',
        description: 'Search and download music from YouTube',
        credits: 'Team Clayx | Developer',
        cooldown: 5
    },
    run: async function({ api, event, args }) {
        const query = args.join(' ');

        if (!query) {
            return api.sendMessage("❌ | Please provide a search query!\nUsage: {pn} <search query>", event.threadID);
        }

        let loadingMessageId;

        try {
            const loadingMessage = await api.sendMessage(`🎧 Searching for "${query}"...`, event.threadID);
            loadingMessageId = loadingMessage.messageID;

            const searchResults = await yts(query);

            if (!searchResults.videos.length) {
                return api.sendMessage("❌ | No videos found for the given query.", event.threadID);
            }

            const topVideo = searchResults.videos[0];
            const videoURL = topVideo.url;

            const downloadBaseURL = "https://ytb-team-calyx-pxdf.onrender.com";
            const downloadURL = `${downloadBaseURL}/download?url=${encodeURIComponent(videoURL)}&type=mp3`;

            const { data: downloadData } = await axios.get(downloadURL);

            if (!downloadData.download_url) {
                throw new Error("❌ | Error getting download URL from external service.");
            }

            const fileName = downloadData.download_url.split("/").pop();
            const filePath = path.join(tmpDir, fileName);

            const fileDownloadURL = `${downloadBaseURL}/${downloadData.download_url}`;

            await downloadFile(fileDownloadURL, filePath);

            api.sendMessage({
                body: `🎵 ${topVideo.title}\nDuration: ${topVideo.timestamp}`,
                attachment: fs.createReadStream(filePath),
            }, event.threadID, () => {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        } catch (error) {
            console.error("Error:", error.message);

            return api.sendMessage(`❌ | An unexpected error occurred: ${error.message}`, event.threadID);
        }
    }
};
