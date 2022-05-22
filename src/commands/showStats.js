const { BaseCommand } = require("./base/baseCommand.js")
const { getPlayerStatistics } = require("../modules/playerStatisticsGenerator");
const { PlayerStatisticsScreen } = require("../ui/screens/PlayerStatisticsScreen.js");

class MyStatsCommand extends BaseCommand
{
    constructor()
    {
        super();
        this.COMMAND_ARGS = { }
    }

    async run(receivedCommandArgs, message)
    {
        if (!message.mentions.users || message.mentions.users.size === 0)
        {
            throw { message: "Please Tag at least 1 User" };
        }

        let targetPlayerIds = Array.from(message.mentions.users, (([userId, userObject]) => userId));
        let targetGameId = 102001 // Hard Coded to SC2 For now, need to create game selection screen

        let discordIdToPlayerStatisticsMap = await getPlayerStatistics(targetPlayerIds, [targetGameId]);

        for(let targetPlayer of targetPlayerIds)
        {
            let targetPlayerStatisticsWrapper = discordIdToPlayerStatisticsMap.get(targetPlayer);
            let statisticsScreen = new PlayerStatisticsScreen(targetPlayerStatisticsWrapper);

            message.channel.send(statisticsScreen.getPlayerStatisticsScreen());
        }
        
        return null;
    }
}

module.exports = MyStatsCommand.getExportObject();