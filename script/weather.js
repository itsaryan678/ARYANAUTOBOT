const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "weather",
  version: "1.0.0",
  aliases: ['weatherinfo', 'weatherforecast'],
  description: "Displays detailed current weather information for a specified city.",
  usage: "weather <city_name>",
  cooldown: 5
};

module.exports.run = async ({ api, event, args }) => {
  try {
    const city = args.join(" ");
    if (!city) {
      return api.sendMessage("❌ Please provide a valid city name.", event.threadID, event.messageID);
    }

    const response = await axios.get(`https://aryanchauhanapi.onrender.com/weather?city=${city}`);
    const weatherData = response.data;

    const location = weatherData.location;
    const current = weatherData.current;

    const message = `
🌤️ 𝗪𝗲𝗮𝘁𝗵𝗲𝗿 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻

📍| 𝗖𝗶𝘁𝘆: ${location.name}, ${location.region}, ${location.country}
🕒| 𝗟𝗼𝗰𝗮𝗹 𝗧𝗶𝗺𝗲: ${location.localtime}
🌡️| 𝗧𝗲𝗺𝗽: ${current.temp_c}°C (${current.temp_f}°F})
☀️| 𝗖𝗼𝗻𝗱𝗶𝘁𝗶𝗼𝗻: ${current.condition.text}
💨| 𝗪𝗶𝗻𝗱: ${current.wind_kph} kph (${current.wind_mph} mph) ${current.wind_dir}
🌫️| 𝗛𝘂𝗺𝗶𝗱𝗶𝘁𝘆: ${current.humidity}%
🧊| 𝗙𝗲𝗲𝗹𝘀 𝗹𝗶𝗸𝗲: ${current.feelslike_c}°C (${current.feelslike_f}°F})
🌀| 𝗪𝗶𝗻𝗱 𝗖𝗵𝗶𝗹𝗹: ${current.windchill_c}°C (${current.windchill_f}°F})
🌨️| 𝗗𝗲𝘄 𝗣𝗼𝗶𝗻𝘁: ${current.dewpoint_c}°C (${current.dewpoint_f}°F})
🔍| 𝗩𝗶𝘀𝗶𝗯𝗶𝗹𝗶𝘁𝘆: ${current.vis_km} km (${current.vis_miles} miles)
💨| 𝗪𝗶𝗻𝗱 𝗚𝘂𝘀𝘁: ${current.gust_kph} kph (${current.gust_mph} mph)
🌞| 𝗨𝗩 𝗜𝗻𝗱𝗲𝘅: ${current.uv}`;

    const cacheDir = path.join(__dirname, 'script', 'cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const iconUrl = `https:${current.condition.icon}`;
    const iconPath = path.join(cacheDir, 'weather_icon.png');

    const { data } = await axios.get(iconUrl, { responseType: 'stream' });
    const writer = fs.createWriteStream(iconPath);

    data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage(
        { 
          body: message, 
          attachment: fs.createReadStream(iconPath) 
        },
        event.threadID,
        event.messageID,
        () => fs.unlinkSync(iconPath) // Cleanup the cached image after sending
      );
    });

    writer.on('error', (error) => {
      console.error('Error downloading weather icon:', error.message);
      api.sendMessage("❌ An error occurred while fetching the weather icon. Please try again later.", event.threadID, event.messageID);
    });

  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    api.sendMessage("❌ An error occurred while fetching the weather data. Please try again later.", event.threadID, event.messageID);
  }
};
