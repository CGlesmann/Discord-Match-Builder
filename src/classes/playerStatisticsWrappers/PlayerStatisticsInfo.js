const { PlayerGameStatisticsInfo } = require("./PlayerGameStatisticsInfo");

class PlayerStatisticsInfo
{
    playerInfo;
    gameIdToGameStatistics;

    constructor(playerInfoWrapper)
    {
        this.playerInfo = playerInfoWrapper;
        this.gameIdToGameStatistics = new Map();
    }

    addMatchResult(matchResultWrapper) 
    {
        let targetGameId = matchResultWrapper.player_match_result[0].player_role_rating.game.id;
        let targetGameStatisticsWrapper = this.gameIdToGameStatistics.get(targetGameId);

        if (!targetGameStatisticsWrapper)
        {
            targetGameStatisticsWrapper = new PlayerGameStatisticsInfo(
                this.playerInfo, 
                matchResultWrapper.player_match_result[0].player_role_rating.game
            );
        }

        targetGameStatisticsWrapper.addMatchResult(matchResultWrapper);
        this.gameIdToGameStatistics.set(targetGameId, targetGameStatisticsWrapper);
    }

    getStatisticEmbeds()
    {
        let statisticEmbeds = [];

        for(let gameStatisticsWrapper of this.gameIdToGameStatistics.values())
        {
            statisticEmbeds.push(gameStatisticsWrapper.getGameStatisticsEmbed());
        }

        return statisticEmbeds;
    }

    getStatisticGraphImages()
    {
        let graphFiles = [];

        for(let gameStatisticsWrapper of this.gameIdToGameStatistics.values())
        {
            graphFiles.push(gameStatisticsWrapper.getGameRoleRatingChangeGraph());
        }

        return graphFiles;
    }
}

module.exports = { PlayerStatisticsInfo };