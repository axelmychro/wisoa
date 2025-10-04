const { REST, Routes } = require("discord.js");
const { clientId, guildId, token } = require("./config.json");
const fs = require("node:fs");
const path = require("node:path");

const cmds = [];
// Grab all the cmd folders from the cmds directory you created earlier
const foldersPath = path.join(__dirname, "cmds");
const cmdFolders = fs.readdirSync(foldersPath);

for (const folder of cmdFolders) {
  // Grab all the cmd files from the cmds directory you created earlier
  const cmdsPath = path.join(foldersPath, folder);
  const cmdFiles = fs
    .readdirSync(cmdsPath)
    .filter((file) => file.endsWith(".js"));
  // Grab the SlashcmdBuilder#toJSON() output of each cmd's data for deployment
  for (const file of cmdFiles) {
    const filePath = path.join(cmdsPath, file);
    const cmd = require(filePath);
    if ("data" in cmd && "execute" in cmd) {
      cmds.push(cmd.data.toJSON());
    } else {
      console.log(
        `[WARNING] The cmd at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your cmds!
(async () => {
  try {
    console.log(`Started refreshing ${cmds.length} application (/) cmds.`);

    // The put method is used to fully refresh all cmds in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: cmds }
    );

    console.log(`Successfully reloaded ${data.length} application (/) cmds.`);
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
