require("./utils/extensions");
require("dotenv").config();

const { Client, Intents } = require("discord.js");

const { processTextMessage } = require("./managers/commandManager.js");
const { processInteraction } = require("./managers/interactionManager.js");

async function configureAndLaunchBot()
{
    const botClient = new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_PRESENCES,
            Intents.FLAGS.GUILD_VOICE_STATES,
        ]
    });

    botClient.on('messageCreate', async (message) =>
    {
        if (message.author.bot) return;

        processTextMessage(message);
    });

    botClient.on("interactionCreate", async (interaction) =>
    {
        processInteraction(interaction);
    });

    botClient.login(process.env.DISCORDJS_BOT_TOKEN);
}

configureAndLaunchBot();