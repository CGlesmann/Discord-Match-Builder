const { BaseCommand } = require("./base/baseCommand.js");
const { SelectGameScreen, SelectGameScreenOptions } = require("../ui/screens/SelectGameScreen.js");

const { getAllGames } = require("../interfaces/databaseInterface");

class ShowLeaderboardCommand extends BaseCommand
{
    constructor()
    {
        super();
        this.COMMAND_ARGS = { }
    }

    async run(receivedCommandArgs, message)
    {
        return await this.constructGameLeaderboardSelectScreen(message);
    }

    async constructGameLeaderboardSelectScreen(message)
    {
        let targetGameData = await getAllGames();
        let selectGameScreenOptions = new SelectGameScreenOptions(targetGameData, 'SelectLeaderboardGame');

        let selectGameScreenInstance = new SelectGameScreen(selectGameScreenOptions);
        return await selectGameScreenInstance.getSelectGameScreenDisplay(message);
    }
}

module.exports = ShowLeaderboardCommand.getExportObject();