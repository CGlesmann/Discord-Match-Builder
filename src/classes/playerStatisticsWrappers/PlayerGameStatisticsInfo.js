const { PlayerRoleStatisticsInfo } = require("./PlayerRoleStatisticsInfo");
const { constructEmbeddedDiscordMessage } = require("../../interfaces/discordInterface");
const { DATABASE_KEYWORDS } = require("../../utils/Constants");

const PLAYER_NAME_KEY = "playerName";
const RELATED_STAT_DESCRIPTION_KEY = "statDescription";

class PlayerGameStatisticsInfo
{
    playerInfo;
    gameInfo;

    playerRoleRatingIdToRoleStatistics;
    discordIdToRelatedPlayerStatistics;

    constructor(playerInfo, gameInfo)
    {
        this.playerInfo = playerInfo;
        this.gameInfo = gameInfo;

        this.playerRoleRatingIdToRoleStatistics = new Map();
        this.discordIdToRelatedPlayerStatistics = new Map();
    }

    addMatchResult(matchResultWrapper)
    {
        // Find the current player's match result first
        // This is needed for calculating related player statistics
        // (I.e need to know what team the current player is on for close acquaintance)
        let currentPlayersMatchResult = matchResultWrapper.player_match_result.filter((playerMatchResult) => {
            return (playerMatchResult.player_role_rating.player.id === this.playerInfo.id);
        })[0];

        // Process the currentPlayersMatchResult before calculating related player stats
        let targetPlayerRoleRatingId = currentPlayersMatchResult.player_role_rating.id;
        let targetPlayerRoleRatingStatisticsWrapper = this.playerRoleRatingIdToRoleStatistics.get(targetPlayerRoleRatingId);

        if (!targetPlayerRoleRatingStatisticsWrapper)
        {
            targetPlayerRoleRatingStatisticsWrapper = new PlayerRoleStatisticsInfo(
                currentPlayersMatchResult.player_role_rating.role.name, 
                currentPlayersMatchResult.player_role_rating.value
            )
        }

        targetPlayerRoleRatingStatisticsWrapper.addMatchResult(currentPlayersMatchResult);
        this.playerRoleRatingIdToRoleStatistics.set(
            targetPlayerRoleRatingId, 
            targetPlayerRoleRatingStatisticsWrapper
        );

        // Process Related Stats
        for(let otherPlayerMatchResult of matchResultWrapper.player_match_result)
        {
            if (otherPlayerMatchResult.player_role_rating.player.id !== this.playerInfo.id)
            {
                this.calculateRelatedPlayerStatistics(currentPlayersMatchResult, otherPlayerMatchResult);
            }
        }
    }

    calculateRelatedPlayerStatistics(currentPlayersMatchResult, relatedPlayersMatchResult)
    {
        let currentPlayerTeam = currentPlayersMatchResult.game_team;
        let otherPlayerTeam = relatedPlayersMatchResult.game_team;

        if (currentPlayerTeam !== otherPlayerTeam)
        {
            this.addRelatedPlayerStatMarker("Standard Enemy", relatedPlayersMatchResult);

            // Not on the same team, check for arch nemisis
            if (currentPlayersMatchResult.match_result === DATABASE_KEYWORDS.MATCH_RESULT.LOST)
            {
                this.addRelatedPlayerStatMarker("Arch Nemisis", relatedPlayersMatchResult);
            }
        }
        else
        {
            this.addRelatedPlayerStatMarker("Close Acquaintance", relatedPlayersMatchResult);

            // If on the same team and won, put a mark for best friend
            if (currentPlayersMatchResult.match_result === DATABASE_KEYWORDS.MATCH_RESULT.WON)
            {
                this.addRelatedPlayerStatMarker("Best Friend", relatedPlayersMatchResult);
            }
        }
    }

    addRelatedPlayerStatMarker(relatedStatKey, relatedPlayersMatchResult)
    {
        let targetPlayerDiscordId = relatedPlayersMatchResult.player_role_rating.player.discord_id;
        let relatedStatWrapper = this.discordIdToRelatedPlayerStatistics.get(targetPlayerDiscordId);

        if (!relatedStatWrapper)
        {
            relatedStatWrapper = {
                [PLAYER_NAME_KEY]: relatedPlayersMatchResult.player_role_rating.player.name,
                "Close Acquaintance": {
                    [RELATED_STAT_DESCRIPTION_KEY]: "Played With The Most ",
                    value: 0
                },
                "Standard Enemy": {
                    [RELATED_STAT_DESCRIPTION_KEY]: "Played Against The Most ",
                    value: 0
                },
                "Best Friend": {
                    [RELATED_STAT_DESCRIPTION_KEY]: "Won With The Most ",
                    value: 0
                },
                "Arch Nemisis": {
                    [RELATED_STAT_DESCRIPTION_KEY]: "Lost Most To ",
                    value: 0
                }
            }
        }

        relatedStatWrapper[relatedStatKey].value += 1;
        this.discordIdToRelatedPlayerStatistics.set(targetPlayerDiscordId, relatedStatWrapper);
    }

    getGameStatisticsEmbed()
    {
        let baseEmbed = constructEmbeddedDiscordMessage([
            {
                title: `${this.playerInfo.name}'s ${this.gameInfo.name} Stats`,
                description: ""
            }
        ])[0];

        // If there is no data, so a special embed
        if (!this.playerRoleRatingIdToRoleStatistics.size &&
            !this.discordIdToRelatedPlayerStatistics.size)
        {
            baseEmbed.setDescription(`${this.playerInfo.name} has no available match data for ${this.gameInfo.name}.`);
            return baseEmbed;
        }

        // Role Related Fields
        let roleStatisticsFields = [];

        let playerRoleRatingStatisticsArray = Array.from(this.playerRoleRatingIdToRoleStatistics.values());
        playerRoleRatingStatisticsArray.sort((a, b) => {
            if (a.roleName > b.roleName)
            {
                return -1;
            }

            if (a.roleName < b.roleName)
            {
                return 1;
            }

            return 0;
        });

        for(let gameRoleStatisticsWrapper of playerRoleRatingStatisticsArray)
        {
            roleStatisticsFields.push(gameRoleStatisticsWrapper.getStatisticField());
        }

        // Related Player Stats Field
        roleStatisticsFields.push(this.constructRelatedPlayerStatsField());

        baseEmbed.addFields(roleStatisticsFields);
        return baseEmbed;
    }

    constructRelatedPlayerStatsField()
    {
        let relatedStatKeyToHighestPlayerInfo = new Map();
        for(let relatedPlayerInfo of this.discordIdToRelatedPlayerStatistics.values())
        {
            for(let relatedStatKey of Object.keys(relatedPlayerInfo))
            {
                // Ignore Hard Coded Player Name Key
                if (relatedStatKey === PLAYER_NAME_KEY || relatedStatKey === RELATED_STAT_DESCRIPTION_KEY) { continue; }

                // A Record Holder for the current stat hasn't been set
                // Default to the first player to hold it
                let relatedStatHighestPlayerInfo = relatedStatKeyToHighestPlayerInfo.get(relatedStatKey);
                if (!relatedStatHighestPlayerInfo)
                {
                    relatedStatKeyToHighestPlayerInfo.set(relatedStatKey, {
                        [PLAYER_NAME_KEY]: relatedPlayerInfo[PLAYER_NAME_KEY],
                        [RELATED_STAT_DESCRIPTION_KEY]: relatedPlayerInfo[relatedStatKey][RELATED_STAT_DESCRIPTION_KEY],
                        "value": relatedPlayerInfo[relatedStatKey].value
                    });

                    continue;
                }

                // A record holder for the current stat has been recorded
                // Make sure the player we are currently iterating over has a higher mark than the record holder
                if (relatedPlayerInfo[relatedStatKey].value > relatedStatHighestPlayerInfo.value)
                {
                    relatedStatKeyToHighestPlayerInfo.set(relatedStatKey, {
                        [PLAYER_NAME_KEY]: relatedPlayerInfo[PLAYER_NAME_KEY],
                        [RELATED_STAT_DESCRIPTION_KEY]: relatedPlayerInfo[relatedStatKey][RELATED_STAT_DESCRIPTION_KEY],
                        "value": relatedPlayerInfo[relatedStatKey].value
                    });
                }
            }
        }

        let relatedPlayerStatsFieldBody = "";
        for(let playerInfo of relatedStatKeyToHighestPlayerInfo.values())
        {
            relatedPlayerStatsFieldBody += `${playerInfo[RELATED_STAT_DESCRIPTION_KEY]} - ${playerInfo[PLAYER_NAME_KEY]} (${playerInfo.value} games)\n`;
        }

        return { 
            name: "Related Player Stats", 
            value: relatedPlayerStatsFieldBody, 
            inline: false 
        };
    }
}

module.exports = { PlayerGameStatisticsInfo };