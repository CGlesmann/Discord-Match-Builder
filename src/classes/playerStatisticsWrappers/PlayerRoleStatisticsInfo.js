const { DATABASE_KEYWORDS } = require("../../utils/Constants.js");

class PlayerRoleStatisticsInfo
{
    roleName;
    roleRating;

    rolePlayedCount; // Amount of games a player played as a role
    roleWinCount;    // Amount of games a player won as a role
    roleLostCount;   // Amount of games a player won as a role

    constructor(roleName, roleRating)
    {
        this.roleName = roleName;
        this.roleRating = roleRating;

        this.rolePlayedCount = 0;
        this.roleWinCount = 0;
        this.roleLostCount = 0;
    }

    addMatchResult(playerMatchResultWrapper)
    {
        this.rolePlayedCount += 1;

        let playerMatchResultKeyword = playerMatchResultWrapper.match_result;
        if (playerMatchResultKeyword === DATABASE_KEYWORDS.MATCH_RESULT.WON)
        {
            this.roleWinCount += 1;
        } 
        else if (playerMatchResultKeyword === DATABASE_KEYWORDS.MATCH_RESULT.LOST)
        {
            this.roleLostCount += 1;
        }
    }

    getStatisticField()
    {
        let roleListDisplay = `Role Rating - ${this.roleRating}\n`;
        roleListDisplay += `Games Played - ${this.rolePlayedCount}\n\n`;
        roleListDisplay += `Wins - ${this.roleWinCount} (${((this.roleWinCount / this.rolePlayedCount) * 100).toFixed(0)}%)\n`;
        roleListDisplay += `Loses - ${this.roleLostCount} (${((this.roleLostCount / this.rolePlayedCount) * 100).toFixed(0)}%)\n`;

        return { 
            name: `${this.roleName} Stats`, 
            value: roleListDisplay, 
            inline: true
        }
    }
}

module.exports = { PlayerRoleStatisticsInfo };