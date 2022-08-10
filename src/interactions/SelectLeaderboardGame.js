

const { BaseInteraction } = require("./base/BaseInteraction");
const { GameLeaderboardScreen } = require("../ui/screens/GameLeaderboardScreen");

class SelectLeaderboardGameInteraction extends BaseInteraction
{
    async executeInteraction(interactionObject, interactionInfo)
    {
        const targetGameId = interactionObject.values[0];
        const targetMemberIds = this.retrieveAllServerMemberIds(interactionObject.guild);

        let gameLeaderboardScreen = new GameLeaderboardScreen();
        await gameLeaderboardScreen.loadLeaderboardData(targetMemberIds, targetGameId);

        interactionObject.update(gameLeaderboardScreen.getLeaderboardDataScreen());
    }

    retrieveAllServerMemberIds(guild)
    {
        let guildMemberCacheMap = guild.members.cache;
        let guildMemberIds = [];

        for(let [guildMemberId, guildMember] of guildMemberCacheMap)
        {
            if (!guildMember.user.bot)
            {
                guildMemberIds.push(guildMemberId);
            }
        }

        return guildMemberIds;
    }
}

module.exports = SelectLeaderboardGameInteraction.buildExportObject();