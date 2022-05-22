const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const EMBEDDED_MESSAGE_COLOR = '#DAF7A6';

/*
    Expected Input - Array of Message object
    Message - {
        title       - String
        description - String
    }
*/
function constructEmbeddedDiscordMessage(messagesToCreate)
{
    if (!Array.isArray(messagesToCreate))
    {
        throw 'constructEmbeddedDiscordMessage expects an array of objects as input';
    }

    let embeddedMessageArray = [];
    for (let messageToCreate of messagesToCreate)
    {
        const embed = new MessageEmbed();

        embed.setTitle(messageToCreate.title);
        embed.setDescription(messageToCreate.description);
        embed.setColor(EMBEDDED_MESSAGE_COLOR);

        embeddedMessageArray.push(embed);
    }

    return embeddedMessageArray;
}

module.exports = { constructEmbeddedDiscordMessage };