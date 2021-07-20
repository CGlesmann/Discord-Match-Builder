require("dotenv").config();

const { checkUserMessageForCommand } = require("./modules/commandParser.js");
const { Client } = require("discord.js");

const botClient = new Client();
botClient.on('message', (message) =>
{
    if (message.author.bot) return;
    checkUserMessageForCommand(message);
});

botClient.login(process.env.DISCORDJS_BOT_TOKEN);