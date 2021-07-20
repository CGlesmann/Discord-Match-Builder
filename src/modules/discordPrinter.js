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
    embeddedMessages.forEach(element =>
    {
        channel.send(element);
    });
}

module.exports = { constructEmbeddedDiscordMessage, sendEmbeddedDiscordMessage };