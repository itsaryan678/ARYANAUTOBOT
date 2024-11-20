const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const login = require('./fb-chat-api/index');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const script = path.join(__dirname, 'script');

// Connect to MongoDB
mongoose.connect('mongodb+srv://orochibestbot:xNFYv3Hz0d3Bi2u6@testing.dbn4ekz.mongodb.net/?retryWrites=true&w=majority&appName=Testing', { useNewUrlParser: true, useUnifiedTopology: true });

// Define the schema for the User model
const userSchema = new mongoose.Schema({
  userid: String,
  name: String,
  profileUrl: String,
  thumbSrc: String,
  time: Number,
  enableCommands: Array,
  prefix: String,
  admin: Array,
  blacklist: Array
});

// Define the schema for the Command model
const commandSchema = new mongoose.Schema({
  name: String,
  role: String,
  run: String,
  aliases: Array,
  description: String,
  usage: String,
  version: String,
  hasPrefix: Boolean,
  credits: String,
  cooldown: Number
});

// Define the schema for the Thread model
const threadSchema = new mongoose.Schema({
  threadID: String,
  adminIDs: Array
});

// Define the schema for the Config model
const configSchema = new mongoose.Schema({
  masterKey: {
    admin: Array,
    devMode: Boolean,
    database: Boolean,
    restartTime: Number
  },
  fcaOption: {
    forceLogin: Boolean,
    listenEvents: Boolean,
    logLevel: String,
    updatePresence: Boolean,
    selfListen: Boolean,
    userAgent: String,
    online: Boolean,
    autoMarkDelivery: Boolean,
    autoMarkRead: Boolean
  }
});

// Create the models
const User = mongoose.model('User', userSchema);
const Command = mongoose.model('Command', commandSchema);
const Thread = mongoose.model('Thread', threadSchema);
const Config = mongoose.model('Config', configSchema);

// Define the routes
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(express.json());

// Login route
app.post('/login', async (req, res) => {
  const { state, enableCommands, prefix, admin } = req.body;
  try {
    const user = await User.findOne({ userid: state.find(item => item.key === 'c_user').value });
    if (user) {
      console.log(`User ${user.userid} is already logged in`);
      return res.status(400).json({ error: false, message: "Active user session detected; already logged in", user });
    } else {
      try {
        await accountLogin(state, enableCommands, prefix, admin);
        res.status(200).json({ success: true, message: 'Authentication process completed successfully; login achieved.' });
      } catch (error) {
        console.error(error);
        res.status(400).json({ error: true, message: error.message });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: true, message: 'Error logging in' });
  }
});

// Account login function
async function accountLogin(state, enableCommands, prefix, admin) {
  try {
    const user = new User({
      userid: state.find(item => item.key === 'c_user').value,
      enableCommands,
      prefix,
      admin,
      blacklist: []
    });
    await user.save();
    // Login to Facebook API
    const api = await login({ appState: state });
    // Set up event listener
    api.listenMqtt(async (error, event) => {
      // Handle events
      if (error) {
        console.error('Error during API listen:', error);
      }
      let database = await Thread.findOne({ threadID: event.threadID });
      let data = database? database.adminIDs : [];
      let adminIDS = data? data : await createThread(event.threadID, api);
      let blacklist = (await User.findOne({ userid: state.find(item => item.key === 'c_user').value })).blacklist;
      let hasPrefix = (event.body && aliases((event.body || '')?.trim().toLowerCase().split(/ +/).shift())?.hasPrefix == false)? '' : prefix;
      let [command,...args] = ((event.body || '').trim().toLowerCase().startsWith(hasPrefix?.toLowerCase())? (event.body || '').trim().substring(hasPrefix?.length).trim().split(/\s+/).map(arg => arg.trim()) : []);
      if (hasPrefix && aliases(command)?.hasPrefix === false) {
        api.sendMessage(`Invalid usage this command doesn't need a prefix`, event.threadID, event.messageID);
        return;
      }
      if (event.body && aliases(command)?.name) {
        const role = aliases(command)?.role?? 0;
        const isAdmin = admin.includes(event.senderID);
        const isThreadAdmin = isAdmin || ((Array.isArray(adminIDS)? adminIDS.find(admin => Object.keys(admin)[0] === event.threadID) : {})?.[event.threadID] || []).some(admin => admin.id === event.senderID);
        if ((role == 1 &&!isAdmin) || (role == 2 &&!isThreadAdmin) || (role == 3 &&!admin.includes(event.senderID))) {
          api.sendMessage(`You don't have permission to use this command.`, event.threadID, event.messageID);
          return;
        }
      }
      if (event.body && event.body?.toLowerCase().startsWith(prefix.toLowerCase()) && aliases(command)?.name) {
        if (blacklist.includes(event.senderID)) {
          api.sendMessage("We're sorry, but you've been banned from using bot. If you believe this is a mistake or would like to appeal, please contact one of the bot admins for further assistance.", event.threadID, event.messageID);
          return;
        }
      }
      if (event.body && aliases(command)?.name) {
        const now = Date.now();
        const name = aliases(command)?.name;
        const sender = await getCooldown(event.senderID, name);
        const delay = aliases(command)?.cooldown?? 0;
        if (!sender || (now - sender.timestamp) >= delay * 1000) {
          await setCooldown(event.senderID, name, now);
        } else {
          const active = Math.ceil((sender.timestamp + delay * 1000 - now) / 1000);
          api.sendMessage(`Please wait ${active} seconds before using the "${name}" command again.`, event.threadID, event.messageID);
          return;
        }
      }
      if (event.body &&!command && event.body?.toLowerCase().startsWith(prefix.toLowerCase())) {
        api.sendMessage(`Invalid command please use ${prefix}help to see the list of available commands.`, event.threadID, event.messageID);
        return;
      }
      if (event.body && command && prefix && event.body?.toLowerCase().startsWith(prefix.toLowerCase()) &&!aliases(command)?.name) {
        api.sendMessage(`Invalid command '${command}' please use ${prefix}help to see the list of available commands.`, event.threadID, event.messageID);
        return;
      }
      for (const {
          handleEvent,
          name
        }
        of await getHandleEvents()) {
        if (handleEvent && name && (
            (enableCommands[1].handleEvent || []).includes(name) || (enableCommands[0].commands || []).includes(name))) {
          handleEvent({
            api,
            event,
            enableCommands,
            admin,
            prefix,
            blacklist
          });
        }
      }
      switch (event.type) {
        case 'message':
        case 'message_reply':
        case 'message_unsend':
        case 'message_reaction':
          if (enableCommands[0].commands.includes(aliases(command?.toLowerCase())?.name)) {
            await ((aliases(command?.toLowerCase())?.run || (() => {}))({
              api,
              event,
              args,
              enableCommands,
              admin,
              prefix,
              blacklist,
              await getUtils()
            }));
          }
          break;
      }
    });
  } catch (error) {
    console.error('Error during API listen, outside of listen');
    return;
  }
});

// Create thread function
async function createThread(threadID, api) {
  try {
    let threadInfo = await api.getThreadInfo(threadID);
    let adminIDs = threadInfo? threadInfo.adminIDs : [];
    const thread = new Thread({
      threadID,
      adminIDs
    });
    await thread.save();
    return thread.adminIDs;
  } catch (error) {
    console.error(error);
  }
}

// Get cooldown function
async function getCooldown(senderID, name) {
  try {
    const cooldown = await Cooldown.findOne({ senderID, name });
    return cooldown;
  } catch (error) {
    console.error(error);
  }
}

// Set cooldown function
async function setCooldown(senderID, name, timestamp) {
  try {
    const cooldown = await Cooldown.findOne({ senderID, name });
    if (cooldown) {
      cooldown.timestamp = timestamp;
      await cooldown.save();
    } else {
      const newCooldown = new Cooldown({
        senderID,
        name,
        timestamp
      });
      await newCooldown.save();
    }
  } catch (error) {
    console.error(error);
  }
}

// Get handle events function
async function getHandleEvents() {
  try {
    const handleEvents = await Command.find({ handleEvent: { $exists: true } });
    return handleEvents;
  } catch (error) {
    console.error(error);
  }
}

// Get utils function
async function getUtils() {
  try {
    const utils = await Command.find();
    return utils;
  } catch (error) {
    console.error(error);
  }
}

// Get aliases function
async function aliases(command) {
  try {
    const aliases = await Command.findOne({ name: command });
    return aliases;
  } catch (error) {
    console.error(error);
  }
}

// Create config function
async function createConfig() {
  try {
    const config = new Config({
      masterKey: {
        admin: [],
        devMode: false,
        database: false,
        restartTime: 15
      },
      fcaOption: {
        forceLogin: true,
        listenEvents: true,
        logLevel: "silent",
        updatePresence: true,
        selfListen: true,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64",
        online: true,
        autoMarkDelivery: false,
        autoMarkRead: false
      }
    });
    await config.save();
    return config;
  } catch (error) {
    console.error(error);
  }
}

// Create database function
async function createDatabase() {
  try {
    const database = await Thread.find();
    return database;
  } catch (error) {
    console.error(error);
  }
}

// Main function
async function main() {
  try {
    const configFile = './data/config.json';
    const config = await Config.findOne();
    if (!config) {
      await createConfig();
    }
    const databaseFile = './data/database.json';
    const database = await createDatabase();
    if (!database) {
      await createDatabase();
    }
    const commands = await Command.find();
    if (!commands) {
      await createCommands();
    }
    const utils = await getUtils();
    for (const file of fs.readdirSync(script)) {
      const scripts = path.join(script, file);
      const stats = fs.statSync(scripts);
      if (stats.isDirectory()) {
        fs.readdirSync(scripts).forEach((file) => {
          try {
            const {
              config,
              run,
              handleEvent
            } = require(path.join(scripts, file));
            if (config) {
              const {
                name = [], role = '0', version = '1.0.0', hasPrefix = true, aliases = [], description = '', usage = '', credits = '', cooldown = '5'
              } = Object.fromEntries(Object.entries(config).map(([key, value]) => [key.toLowerCase(), value]));
              aliases.push(name);
              if (run) {
                const command = new Command({
                  name,
                  role,
                  run,
                  aliases,
                  description,
                  usage,
                  version,
                  hasPrefix,
                  credits,
                  cooldown
                });
                command.save();
              }
              if (handleEvent) {
                const handleEventCommand = new Command({
                  name,
                  handleEvent,
                  role,
                  description,
                  usage,
                  version,
                  hasPrefix,
                  credits,
                  cooldown
                });
                handleEventCommand.save();
              }
            }
          } catch (error) {
            console.error(chalk.red(`Error installing command from file ${file}: ${error.message}`));
          }
        });
      } else {
        try {
          const {
            config,
            run,
            handleEvent
          } = require(scripts);
          if (config) {
            const {
              name = [], role = '0', version = '1.0.0', hasPrefix = true, aliases = [], description = '', usage = '', credits = '', cooldown = '5'
            } = Object.fromEntries(Object.entries(config).map(([key, value]) => [key.toLowerCase(), value]));
            aliases.push(name);
            if (run) {
              const command = new Command({
                name,
                role,
                run,
                aliases,
                description,
                usage,
                version,
                hasPrefix,
                credits,
                cooldown
              });
              command.save();
            }
            if (handleEvent) {
              const handleEventCommand = new Command({
                name,
                handleEvent,
                role,
                description,
                usage,
                version,
                hasPrefix,
                credits,
                cooldown
              });
              handleEventCommand.save();
            }
          }
        } catch (error) {
          console.error(chalk.red(`Error installing command from file ${file}: ${error.message}`));
        }
      }
    }
    const cronJob = cron.schedule(`*/${config.masterKey.restartTime} * * * *`, async () => {
      const history = await User.find();
      for (const user of history) {
        const update = await User.findOne({ userid: user.userid });
        if (update) {
          user.time = update.time;
          await user.save();
        }
      }
    });
  } catch (error) {
    console.error(error);
  }
}

main();

// Start the server
app.listen(3000, () => {
  console.log(`Server is running at http://localhost:3000`);
});
