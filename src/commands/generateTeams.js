const { BaseCommand } = require("./base/baseCommand.js");
const { constructEmbeddedDiscordMessage } = require("../interfaces/discordInterface.js");
const teamBuilder = require("../modules/matchTeamGenerator.js");

class GenerateTeamCommand extends BaseCommand
{
    constructor()
    {
        super();

        this.COMMAND_NAME = "generateTeams";
        this.COMMAND_ARGS = {}
    }

    async run(receivedCommandArgs, message)
    {
        let teamRosterObject = this.getTeamRosterObject(message);
        return constructEmbeddedDiscordMessage(teamRosterObject.getDisplayObjects());
    }

    async getTeamRosterObject(message, targetGameData)
    {
        let playersToUse = Array.from(message.mentions.users, (([userId, userObject]) => userId));
        return await teamBuilder.run(playersToUse, targetGameData);
    }
}

module.exports = GenerateTeamCommand.getExportObject();