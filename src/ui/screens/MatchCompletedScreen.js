const { MessageEmbed } = require("discord.js");

class MatchCompletedScreen
{
    inProgressMatchTracker
    generatedMatchResult;

    constructor(inProgressMatchTracker, generatedMatchResult)
    {
        this.inProgressMatchTracker = inProgressMatchTracker;
        this.generatedMatchResult = generatedMatchResult;
    }

    getCompletedMatchScreen(inProgressScreenEmbed)
    {
        const completedMatchScreenEmbed = new MessageEmbed(inProgressScreenEmbed);

        this.updateEmbedHeader(completedMatchScreenEmbed);
        this.updateTeamEmbedFieldsWithScores(completedMatchScreenEmbed);

        return {
            embeds: [completedMatchScreenEmbed],
            components: [] // Empty Array is required to remove existing components
        };
    }

    updateEmbedHeader(completedMatchScreenEmbed)
    {
        let winningTeamHeaderText = `${this.generatedMatchResult.winningTeam  !==-1 ? `Congrats to "${this.inProgressMatchTracker.match.teams[this.generatedMatchResult.winningTeamIndex].teamName}" for winning!` : "Its a draw."}`;

        completedMatchScreenEmbed.title = `Match Finished - ${this.inProgressMatchTracker.match.game.gameName}`;
        completedMatchScreenEmbed.description = `${winningTeamHeaderText} The match result/rating changes have been recorded.`;
    }

    updateTeamEmbedFieldsWithScores(completedMatchScreenEmbed)
    {
        let targetFieldIndex = 1; // 0 = Map Field, 1 = First Team Field
        for (let teamResult of this.generatedMatchResult.teamResults)
        {
            let targetField = completedMatchScreenEmbed.fields[targetFieldIndex];
            if (teamResult.result === "Won")
                targetField.name += ' - Winner!';

            let playerDisplays = targetField.value.split("\n");
            let newPlayerDisplays = [], currentDisplayIndex = 0;

            for (let playerDisplay of playerDisplays)
            {
                let changeSign = Math.sign(teamResult.roleRatingUpdates[currentDisplayIndex].role_rating_change) === 1 ? "+" : "";

                newPlayerDisplays.push(`${playerDisplay} : (${changeSign}${teamResult.roleRatingUpdates[currentDisplayIndex].role_rating_change})`)
                currentDisplayIndex += 1;
            }

            targetFieldIndex += 1;
            targetField.value = newPlayerDisplays.join("\n");
        }
    }
}

module.exports = { MatchCompletedScreen }