const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "movieinfo",
  version: "1.0.0",
  description: "Fetches essential information about a movie including title, overview, release date, genres, rating, and poster.",
  usage: "movieinfo <movie_title>",
  cooldown: 5
};

module.exports.run = async ({ api, event, args }) => {
  try {
    if (args.length === 0) {
      return api.sendMessage('Please provide a movie title. Usage: {p}movieinfo <movie_title>', event.threadID, event.messageID);
    }

    const movieTitle = args.join(' ');
    const response = await axios.get(`https://aryanchauhanapi.onrender.com/api/movieinfo?title=${movieTitle}`);
    
    if (!response.data) {
      return api.sendMessage('No information found for this movie. Please try a different title.', event.threadID, event.messageID);
    }

    const movie = response.data;
    const posterUrl = `${movie.imageBase}${movie.poster_path}`;
    const posterPath = path.join(__dirname, '..', 'cache', `${movie.id}_poster.jpg`);
    const writer = fs.createWriteStream(posterPath);

    const { data: imageStream } = await axios.get(posterUrl, { responseType: 'stream' });
    imageStream.pipe(writer);

    writer.on('finish', () => {
      const posterAttachment = fs.createReadStream(posterPath);

      const message = `
🔎| 𝗧𝗶𝘁𝗹𝗲 ${movie.title}
📝| 𝗢𝗿𝗶𝗴𝗶𝗻𝗮𝗹 𝗧𝗶𝘁𝗹𝗲 ${movie.original_title}
👀| 𝗢𝘃𝗲𝗿𝘃𝗶𝗲𝘄 ${movie.overview}
📅| 𝗥𝗲𝗹𝗲𝗮𝘀𝗲 𝗗𝗮𝘁𝗲 ${new Date(movie.release_date).toDateString()}
🔄| 𝗚𝗲𝗻𝗿𝗲(𝘀) ${movie.genre_ids.join(', ')}
🌐| 𝗟𝗮𝗻𝗴𝘂𝗮𝗴𝗲 ${movie.original_language}
🌟| 𝗥𝗮𝘁𝗶𝗻𝗴 ${movie.vote_average} (${movie.vote_count} votes)
👫| 𝗣𝗼𝗽𝘂𝗹𝗮𝗿𝗶𝘁𝘆 ${movie.popularity.toFixed(1)}
      `;

      api.sendMessage({ body: message, attachment: posterAttachment }, event.threadID, event.messageID, () => {
        fs.unlinkSync(posterPath); // Clean up the temporary file
      });
    });

    writer.on('error', (err) => {
      console.error('Error writing poster image:', err.message);
      api.sendMessage('An error occurred while fetching the movie poster image. Please try again later.', event.threadID, event.messageID);
    });

  } catch (error) {
    console.error('Error fetching movie information:', error.message);
    api.sendMessage('An error occurred while fetching the movie information. Please try again later.', event.threadID, event.messageID);
  }
};
