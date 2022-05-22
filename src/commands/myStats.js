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
        let targetPlayerId = message.author.id;
        let targetGameId = 102001 // Hard Coded to SC2 For now, need to create game selection screen

        let discordIdToPlayerStatisticsMap = await getPlayerStatistics([targetPlayerId], [targetGameId]);
        let targetPlayerStatisticsWrapper = discordIdToPlayerStatisticsMap.get(targetPlayerId);
        let statisticsScreen = new PlayerStatisticsScreen(targetPlayerStatisticsWrapper);

        return statisticsScreen.getPlayerStatisticsScreen();
    }
}

module.exports = MyStatsCommand.getExportObject();