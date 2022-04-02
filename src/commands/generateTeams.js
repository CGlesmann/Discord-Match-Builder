const { BaseCommand } = require("./base/baseCommand.js");
const { constructEmbeddedDiscordMessage } = require("../interfaces/discordInterface.js");

const teamBuilder = require("../modules/matchTeamGenerator.js");
const { MatchTeamGenerator } = require("../modules/matchTeamGeneratorV2");
// const { run } = require("../../testScripts/calculatePermutationsTest.js");

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
        let gen = new MatchTeamGenerator();
        
        return await gen.run(playersToUse, targetGameData);
        // return await run(playersToUse, targetGameData);
        // return await teamBuilder.run(playersToUse, targetGameData);
    }
}

module.exports = GenerateTeamCommand.getExportObject();