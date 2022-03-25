const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { InteractionLabelBuilder, InteractionLabelInfo } = require("../../interactions/base/InteractionLabelBuilder");
const { NO_TEAM_WON_INDEX } = require("../../utils/Constants");

class MatchInProgressScreen
{   
    inProgressMatchTracker;

    constructor(inProgressMatchTracker)
    {
        this.inProgressMatchTracker = inProgressMatchTracker;
    }

    getMatchInProgressScreen(matchGenerationScreenEmbed)
    {
        const inProgressMessageEmbed = new MessageEmbed(matchGenerationScreenEmbed);

        inProgressMessageEmbed.title = `In Progress - ${this.inProgressMatchTracker.match.game.gameName}`;
        inProgressMessageEmbed.description = "Good luck to everyone! Use the buttons to report the winner.";

        return { 
            embeds: [inProgressMessageEmbed], 
            components: [this.generateInProgressActionRow()] 
        };
    }

    generateInProgressActionRow()
    {
        let messageId = this.inProgressMatchTracker.message.id;

        const inProgressActionRow = new MessageActionRow()
            .addComponents(new MessageButton()
                .setCustomId(InteractionLabelBuilder.getInteractionLabel(new InteractionLabelInfo("ReportMatchResult", [NO_TEAM_WON_INDEX, messageId]))) 
                .setLabel('Draw')
                .setStyle("DANGER")
            );

        for (let i = 0; i < this.inProgressMatchTracker.match.teams.length; i++)
        {
            let currentTeamIndex = i;
            inProgressActionRow.addComponents(new MessageButton()
                .setCustomId(InteractionLabelBuilder.getInteractionLabel(new InteractionLabelInfo("ReportMatchResult", [currentTeamIndex, messageId])))
                .setLabel(`${this.inProgressMatchTracker.match.teams[currentTeamIndex].teamName} Won`)
                .setStyle("SUCCESS")
            )
        }

        return inProgressActionRow;
    }
}

module.exports = { MatchInProgressScreen }