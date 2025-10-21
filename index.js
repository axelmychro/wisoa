const fs = require("node:fs"); // import file system module for reading files
const path = require("node:path"); // import path module for handling file paths
const { Client, Collection, GatewayIntentBits } = require("discord.js"); // import discord.js classes for bot
const { token } = require("./config.json"); // import bot token from config file

const client = new Client({ intents: [GatewayIntentBits.Guilds] }); // create new discord client with guild intents

client.commands = new Collection(); // command cd
client.cooldowns = new Collection(); // collection for cd

const foldersPath = path.join(__dirname, "commands"); // path to commands folder
const commandFolders = fs.readdirSync(foldersPath); // read all subfolders in commands folder

// for each folder in commands
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder); // path to this command folder
  const commandFiles = fs // read all files in this folder
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js")); // filter js files

  // for each command file
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file); // full path to command file
    const command = require(filePath); // require command module

    if ("data" in command && "execute" in command) {
      // check required properties
      client.commands.set(command.data.name, command); // add command to collection by name
    } else {
      console.log(
        `the command at ${filePath} is missing a required "data" or "execute" property`
      ); // log error if missing
    }
  }
}

// event handling
const eventsPath = path.join(__dirname, "events"); // path to events folder
const eventFiles = fs // read all files in events folder
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js")); // filter js files

// for each event file
for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file); // full path to event file
  const event = require(filePath); // require event module

  if (event.once) {
    // if event is once-only
    client.once(event.name, (...args) => event.execute(...args)); // listen once
  } else {
    client.on(event.name, (...args) => event.execute(...args)); // listen normally
  }
}

client.login(token); // login
