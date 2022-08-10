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

    getPlayerStatisticsScreenGraphs()
    {
        return this.playerStatistics.getStatisticGraphImages();
    }
}

module.exports = { PlayerStatisticsScreen }