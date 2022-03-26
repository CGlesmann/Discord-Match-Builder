const { MessageActionRow, MessageButton } = require("discord.js");
const { InteractionLabelBuilder, InteractionLabelInfo } = require("../../interactions/base/InteractionLabelBuilder");
const { constructEmbeddedDiscordMessage } = require("../../interfaces/discordInterface");
const { MATCH_CAROUSEL_SCROLL_DIRECTION } = require("../../utils/Constants");

class MatchGeneratorScreen
{
    matchGenerationRequest;

    constructor(matchGenerationRequest)
    {
        this.matchGenerationRequest = matchGenerationRequest;
    }

    getMatchGeneratorScreen()
    {
        const matchToDisplay = this.matchGenerationRequest.getCurrentlyDisplayedMatch();

        return {
            embeds: [this.generateMatchDisplayEmbed(matchToDisplay)],
            components: [this.generateMatchGenerationActionRow(this.matchGenerationRequest.message.id)]
        };
    }

    generateMatchDisplayEmbed(matchToDisplay)
    {
        const currentMatchCount = this.matchGenerationRequest.generatedMatches.length;

        const matchDisplayEmbed = constructEmbeddedDiscordMessage([{
            title: `(${this.matchGenerationRequest.currentlyDisplayedMatchIndex + 1}/${currentMatchCount}) New Match - ${matchToDisplay.game.gameName}`,
            description: "Waiting for the match to begin... Select 'Start Game' to send all the players to their respective voice chats. Alternatively, select \"Generate Another Set\" to create additional match options"
        }])[0];

        matchDisplayEmbed.addFields(matchToDisplay.getMatchDisplay());
        matchDisplayEmbed.setThumbnail(`${matchToDisplay.game.gameLogoURL}`);

        return matchDisplayEmbed;
    }

    generateMatchGenerationActionRow(messageId)
    {
        const actionRow = new MessageActionRow()
            .addComponents(new MessageButton()
                .setCustomId(InteractionLabelBuilder.getInteractionLabel(new InteractionLabelInfo("ScrollMatchCarousel", [messageId, MATCH_CAROUSEL_SCROLL_DIRECTION.LEFT])))
                .setLabel('◀')
                .setStyle("PRIMARY")
                .setDisabled(this.displayLeftScrollButton())
            ).addComponents(new MessageButton()
                .setCustomId(InteractionLabelBuilder.getInteractionLabel(new InteractionLabelInfo("GenerateAnotherMatch", [messageId])))
                .setLabel('Generate Another Set')
                .setStyle("PRIMARY")
            ).addComponents(new MessageButton()
                .setCustomId(InteractionLabelBuilder.getInteractionLabel(new InteractionLabelInfo("ScrollMatchCarousel", [messageId, MATCH_CAROUSEL_SCROLL_DIRECTION.RIGHT])))
                .setLabel('▶')
                .setStyle("PRIMARY")
                .setDisabled(this.displayRightScrollButton())
            ).addComponents(new MessageButton()
                .setCustomId(InteractionLabelBuilder.getInteractionLabel(new InteractionLabelInfo("StartMatch", [messageId])))
                .setLabel('Start Game')
                .setStyle("SUCCESS")
            );

        return actionRow;
    }

    displayLeftScrollButton()
    {
        return !(
            this.matchGenerationRequest.currentlyDisplayedMatchIndex > 0
        );
    }

    displayRightScrollButton()
    {
        let amountOfGeneratedMatches = this.matchGenerationRequest.generatedMatches.length;

        return !(
            this.matchGenerationRequest.currentlyDisplayedMatchIndex < amountOfGeneratedMatches - 1
        );
    }
}

module.exports = { MatchGeneratorScreen };