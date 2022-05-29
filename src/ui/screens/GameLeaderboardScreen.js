const { getLeaderboardInfo } = require("../../interfaces/databaseInterface");
const { constructEmbeddedDiscordMessage } = require("../../interfaces/discordInterface");

class GameLeaderboardScreen
{
    targetPlayerIds;
    targetGameId;
    leaderboardData;

    async loadLeaderboardData(targetPlayerIds, targetGameId)
    {
        this.targetPlayerIds = targetPlayerIds;
        this.targetGameId = targetGameId;

        this.leaderboardData = await getLeaderboardInfo(this.targetPlayerIds, this.targetGameId);
    }

    getLeaderboardDataScreen()
    {
        // If no Leaderboard Data, send special warning
        if (!this.leaderboardData || !this.leaderboardData.length)
        {
            let noLeaderboardDataEmbed = constructEmbeddedDiscordMessage([{
                title: "No Leaderboard Data",
                description: "This is no leaderboard data for the selected game."
            }]);

            return { embeds: noLeaderboardDataEmbed };
        }

        let leaderboardEmbedBody = "";
        let counter = 1;

        for(let leaderboardPlacement of this.leaderboardData)
        {
            leaderboardEmbedBody += `#${counter} - ${leaderboardPlacement.player.name} (${leaderboardPlacement.role.name}) - ${leaderboardPlacement.value}\n`;
            counter++;
        }

        let leaderboardEmbed = constructEmbeddedDiscordMessage([{
            title: `${this.leaderboardData[0].game.name} Leaderboard`,
            description: leaderboardEmbedBody
        }]);

        return { embeds: leaderboardEmbed };
    }
}

module.exports = { GameLeaderboardScreen }