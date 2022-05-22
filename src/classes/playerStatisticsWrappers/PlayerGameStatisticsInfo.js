const { PlayerRoleStatisticsInfo } = require("./PlayerRoleStatisticsInfo");
const { constructEmbeddedDiscordMessage } = require("../../interfaces/discordInterface");

class PlayerGameStatisticsInfo
{
    gameInfo;
    playerRoleRatingIdToRoleStatistics;

    constructor(gameInfo)
    {
        this.gameInfo = gameInfo;
        this.playerRoleRatingIdToRoleStatistics = new Map();
    }

    addMatchResult(matchResultWrapper)
    {
        let targetPlayerRoleRatingId = matchResultWrapper.player_role_rating.id;
        let targetPlayerRoleRatingStatisticsWrapper = this.playerRoleRatingIdToRoleStatistics.get(targetPlayerRoleRatingId);

        if (!targetPlayerRoleRatingStatisticsWrapper)
        {
            targetPlayerRoleRatingStatisticsWrapper = new PlayerRoleStatisticsInfo(
                matchResultWrapper.player_role_rating.role.name, 
                matchResultWrapper.player_role_rating.value
            )
        }

        targetPlayerRoleRatingStatisticsWrapper.addMatchResult(matchResultWrapper);
        this.playerRoleRatingIdToRoleStatistics.set(
            targetPlayerRoleRatingId, 
            targetPlayerRoleRatingStatisticsWrapper
        );
    }

    getGameStatisticsEmbed()
    {
        let baseEmbed = constructEmbeddedDiscordMessage([
            {
                title: `${this.gameInfo.name} Stats`,
                description: ""
            }
        ])[0];

        let roleStatisticsFields = [];
        for(let gameRoleStatisticsWrapper of this.playerRoleRatingIdToRoleStatistics.values())
        {
            roleStatisticsFields.push(gameRoleStatisticsWrapper.getStatisticField());
        }

        baseEmbed.addFields(roleStatisticsFields);
        return baseEmbed;
    }
}

module.exports = { PlayerGameStatisticsInfo };