const { BaseCommand } = require("./base/baseCommand.js")
const { PlayerStatisticsScreen } = require("../ui/screens/PlayerStatisticsScreen.js");
const { SelectGameScreen, SelectGameScreenOptions } = require("../ui/screens/SelectGameScreen.js");

const { getPlayerStatistics } = require("../modules/playerStatisticsGenerator");
const { getAllGames } = require("../interfaces/databaseInterface");

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

        return await this.constructStatisticsGameSelectScreen(message);
    }

    async constructStatisticsGameSelectScreen(message)
    {
        let targetGameData = await getAllGames();
        let selectGameScreenOptions = new SelectGameScreenOptions(targetGameData, 'SelectStatisticsGame');

        this.selectGameScreenInstance = new SelectGameScreen(selectGameScreenOptions);
        return await this.selectGameScreenInstance.getSelectGameScreenDisplay(message);
    }
}

module.exports = MyStatsCommand.getExportObject();