const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { postMatchResult } = require("../interfaces/databaseInterface.js");
const { contructMatchResultWrapper } = require("./eloRatingManager.js");

const generateMatchModule = require("../commands/generateMatch.js");
const { COMMAND_CLASS_KEY, parseUserMessageContent, constructCommandArgumentMap } = require("./commandManager.js");
const { APPLICATION_CACHE_KEYS } = require("../utils/Constants.js");
const { InteractionLabelBuilder } = require('../interactions/base/InteractionLabelBuilder');
const { constructEmbeddedDiscordMessage } = require('../interfaces/discordInterface');

const INTERACTION_CLASS_KEY = 'INTERACTION_CLASS';

async function processInteraction(interaction)
{
    const interactionInfo = InteractionLabelBuilder.parseInteractionLabel(interaction.customId);

    try
    {
        const INTERACTION_MODULE_OBJECT = require(`../interactions/${interactionInfo.label}.js`);
        const INTERACTION_CLASS = INTERACTION_MODULE_OBJECT[INTERACTION_CLASS_KEY];
        const INTERACTION = new INTERACTION_CLASS();

        let interactionOutput = await INTERACTION.executeInteraction(interaction, interactionInfo);
        if (interactionOutput)
        {
            message.channel.send(interactionOutput);
            return;
        }
    }
    catch (interactionError)
    {
        console.log(interactionError);
        handleInteractionError(interaction, interactionInfo, interactionError);
    }
}

function handleInteractionError(interaction, interactionInfo, interactionError)
{
    interaction.channel.send({
        embeds: constructEmbeddedDiscordMessage([{
            title: "Unexpected Error",
            description: `Error while running the ${interactionInfo.label} interaction \n\n${interactionError.message}. \n\nSee logs for more info.`
        }])
    });
}

module.exports = { INTERACTION_CLASS_KEY, processInteraction };