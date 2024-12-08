const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "greetings",
  version: "1.2.6",
};

const quotes = [
  "🌟 The only way to do great work is to love what you do. – Steve Jobs",
  "💡 The best way to predict the future is to create it. – Peter Drucker",
  "🚀 Success usually comes to those who are too busy to be looking for it. – Henry David Thoreau",
  "⌛ Don’t watch the clock; do what it does. Keep going. – Sam Levenson",
  "🌈 Believe you can and you're halfway there. – Theodore Roosevelt",
  "💖 Be not afraid of life. Believe that life is worth living, and your belief will help create the fact. – William James",
  "🏃 It does not matter how slowly you go as long as you do not stop. – Confucius",
  "🌳 The best time to plant a tree was 20 years ago. The second best time is now. – Chinese Proverb",
  "🛤️ Your life does not get better by chance, it gets better by change. – Jim Rohn",
  "✨ The purpose of our lives is to be happy. – Dalai Lama",
  "🌞 Good Morning! Start your day with a positive attitude.",
  "☀️ Good Afternoon! Keep shining and spreading joy.",
  "🌆 Good Evening! The best is yet to come.",
  "🌜 Good Night! Rest well and dream big.",
  "🖤 Never give up on a dream just because of the time it will take to accomplish it. The time will pass anyway. – Earl Nightingale",
  "🌠 Shoot for the moon. Even if you miss, you'll land among the stars. – Les Brown",
  "💪 Strength does not come from what you can do; it comes from overcoming the things you once thought you couldn't. – Rikki Rogers",
  "🗝️ Don’t be pushed around by the fears in your mind. Be led by the dreams in your heart. – Roy T. Bennett",
  "🌟 Every day is a second chance. – Richie Norton",
  "🎈 The only limit to our realization of tomorrow will be our doubts of today. – Franklin D. Roosevelt",
  "🌱 Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle. – Christian D. Larson",
  "🔥 Success is not how high you have climbed, but how you make a positive difference to the world. – Roy T. Bennett",
  "🔮 You are never too old to set another goal or to dream a new dream. – C.S. Lewis",
  "🌠 Do not wait to strike till the iron is hot; but make it hot by striking. – William Butler Yeats",
  "🌻 Life is 10% what happens to us and 90% how we react to it. – Charles R. Swindoll",
  "💖 A journey of a thousand miles begins with a single step. – Lao Tzu",
  "🕊️ When everything seems to be going against you, remember that the airplane takes off against the wind, not with it. – Henry Ford",
  "🌊 The best time to plant a tree was 20 years ago. The second best time is now. – Chinese Proverb",
  "🌠 Success is not measured by what you accomplish, but by the opposition you have encountered, and the courage with which you have maintained the struggle against overwhelming odds. – Orison Swett Marden",
  "🛤️ The road to success and the road to failure are almost exactly the same. – Colin R. Davis",
  "🗺️ The biggest adventure you can take is to live the life of your dreams. – Oprah Winfrey",
  "🌞 Good Morning! Rise and shine, it’s a new day filled with new opportunities.",
  "🌠 The only way to achieve the impossible is to believe it is possible. – Charles Kingsleigh",
  "🌟 The future belongs to those who believe in the beauty of their dreams. – Eleanor Roosevelt"
];

module.exports.handleEvent = () => {
  setInterval(async () => {
    try {
      // Assuming `api` is an instance of your bot's API client
      const userInfo = await api.getThreadList(1000, null, ["INBOX"]); // Get all groups where the bot is a member
      const threadIDs = userInfo.map(thread => thread.threadID); // Extract all group IDs

      const currentHour = new Date();
      const hour = currentHour.getHours();
      const minute = currentHour.getMinutes();
      let greeting;

      if (hour >= 5 && hour < 12) {
        greeting = "🌞 Good Morning!";
      } else if (hour >= 12 && hour < 17) {
        greeting = "☀️ Good Afternoon!";
      } else if (hour >= 17 && hour < 21) {
        greeting = "🌆 Good Evening!";
      } else {
        greeting = "🌜 Good Night!";
      }

      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

      const timeString = `${hour < 10 ? '0' : ''}${hour}:${minute < 10 ? '0' : ''}${minute}`;

      for (const threadID of threadIDs) {
        await api.sendMessage(`😉 ${greeting}\n⏰ It's now ${timeString}\nHere's a quote for you: "${randomQuote}"`, threadID);
      }

    } catch (error) {
      console.error(`❌ | Failed to send hourly greeting with quote: ${error.message}`);
    }
  }, 3600000); // 3600000ms = 1 hour
};
