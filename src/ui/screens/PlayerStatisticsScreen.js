const { constructEmbeddedDiscordMessage } = require("../../interfaces/discordInterface");

class PlayerStatisticsScreen
{
    playerStatistics;

    constructor(playerStatisticsWrapper)
    {
        this.playerStatistics = playerStatisticsWrapper;
    }

    getPlayerStatisticsScreenEmbeds()
    {
        return this.playerStatistics.getStatisticEmbeds();
    }
}

module.exports = { PlayerStatisticsScreen }