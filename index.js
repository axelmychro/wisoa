const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
} = require("discord.js");
const { token, errMsg } = require("./config.json");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.cmds = new Collection();
const foldersPath = path.join(__dirname, "cmds");
const cmdFolders = fs.readdirSync(foldersPath);

for (const folder of cmdFolders) {
  const cmdsPath = path.join(foldersPath, folder);
  const cmdFiles = fs
    .readdirSync(cmdsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of cmdFiles) {
    const filePath = path.join(cmdsPath, file);
    const cmd = require(filePath);
    if ("data" in cmd && "execute" in cmd) {
      client.cmds.set(cmd.data.name, cmd);
    } else {
      console.log(
        `[WARNING] The cmd at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`${readyClient.user.tag} online,`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = interaction.client.cmds.get(interaction.cmdName);

  if (!cmd) {
    console.error(`cmd:${interaction.cmdName} is not real,`);
    return;
  }

  try {
    await cmd.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: errMsg,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: errMsg,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

client.login(token);
