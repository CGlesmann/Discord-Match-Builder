const { getPlayerStatisticsInfo } = require("../interfaces/databaseInterface");
const { PlayerStatisticsInfo } = require("../classes/playerStatisticsWrappers/PlayerStatisticsInfo");

async function getPlayerStatistics(targetPlayerIds, targetGameIds) {
    let allTargetMatches = await getPlayerStatisticsInfo(targetPlayerIds, targetGameIds);
    if (allTargetMatches.error) {
        console.log(allTargetMatches.error);
        return null;
    }

    if (!allTargetMatches) {
        return null;
    }

    let discordIdToPlayerStatistics = new Map();
    for(let match of allTargetMatches.data)
    {
        for(let playerMatchResult of match.player_match_result)
        {
            let targetDiscordId = playerMatchResult.player_role_rating.player.discord_id;
            let playerStatisticsWrapper = discordIdToPlayerStatistics.get(targetDiscordId);

            if (!playerStatisticsWrapper)
            {
                playerStatisticsWrapper = new PlayerStatisticsInfo(playerMatchResult.player_role_rating.player);
            }

            playerStatisticsWrapper.addMatchResult(playerMatchResult);
            discordIdToPlayerStatistics.set(targetDiscordId, playerStatisticsWrapper);
        }
    }

    return discordIdToPlayerStatistics;
}

module.exports = { getPlayerStatistics }