const { MessageEmbed } = require("discord.js");
const EMBEDDED_MESSAGE_COLOR = '#DAF7A6';

function constructEmbeddedDiscordMessage(messageTitle, messageValues)
{
    let embed = new MessageEmbed();
    if (messageTitle)
    {
        embed.setTitle(messageTitle);
    }

    embed.setColor(EMBEDDED_MESSAGE_COLOR);
    embed.addFields(messageValues);

    return embed;
}

function sendEmbeddedDiscordMessage(embeddedMessages, channel)
{
    console.log(embeddedMessages[Symbol.iterator]);
    if (typeof embeddedMessages[Symbol.iterator] !== "function")
    {
        channel.send(embeddedMessages);
        return
    }

    embeddedMessages.forEach(embeddedMessage => { channel.send(embeddedMessage); });
}

module.exports = { constructEmbeddedDiscordMessage, sendEmbeddedDiscordMessage };