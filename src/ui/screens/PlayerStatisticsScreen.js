const { constructEmbeddedDiscordMessage } = require("../../interfaces/discordInterface");

class PlayerStatisticsScreen
{
    playerStatistics;

    constructor(playerStatisticsWrapper)
    {
        this.playerStatistics = playerStatisticsWrapper;
    }

    getPlayerStatisticsScreen()
    {
        return {
            embeds: this.playerStatistics.getStatisticEmbeds()
        }
    }
}

module.exports = { PlayerStatisticsScreen }