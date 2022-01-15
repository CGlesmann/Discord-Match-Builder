require("dotenv").config();

const NodeCache = require("node-cache");
const { Client, Intents } = require("discord.js");

const { checkUserMessageForCommand } = require("./modules/commandParser.js");
const { processInteraction } = require("./modules/interactionProcessor.js");

/*
    stdTTL: 0 (Infinity)
    useClones: everything will be retrieved by reference
*/
const applicationCache = new NodeCache({ stdTTL: 0, useClones: false });
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

    checkUserMessageForCommand(message, applicationCache);
});

botClient.on("interactionCreate", async (interaction) =>
{
    try
    {
        processInteraction(interaction, applicationCache);
    }
    catch (e)
    {
        console.log(`Error while processing interaction ${interaction.customId}`);
        console.log(e);
    }
});

botClient.login(process.env.DISCORDJS_BOT_TOKEN);