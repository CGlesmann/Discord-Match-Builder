const { BaseCommand } = require("../commandStructure/baseCommand.js");
const { constructEmbeddedDiscordMessage } = require("../modules/discordPrinter.js");
const teamBuilder = require("../modules/teamBuilder.js");

class GenerateTeamCommand extends BaseCommand
{
    constructor()
    {
        super();

        this.COMMAND_NAME = "generateTeams";
        this.COMMAND_ARGS = {
            // p: {
            //     helpText: "A comma seperated list of human players to use",
            //     validateErrorText: "Enter a comma seperated list of player names (must match the name in the config)",
            //     validate: function (agrumentStringValue)
            //     {
            //         let argumentStringArray = agrumentStringValue.split(",");
            //         let amountOfValidNumbers = 0;

            //         argumentStringArray.forEach((value) =>
            //         {
            //             if (value)
            //             {
            //                 amountOfValidNumbers++;
            //             }
            //         })

            //         return (
            //             argumentStringArray &&
            //             argumentStringArray.length > 0 &&
            //             amountOfValidNumbers === argumentStringArray.length
            //         );
            //     }
            // },
            // a: {
            //     helpText: "A whole number representing the AI Count",
            //     validateErrorText: "Enter a whole number thats equal or more than 0",
            //     validate: function (agrumentStringValue)
            //     {
            //         return agrumentStringValue && !isNaN(Number(agrumentStringValue));
            //     }
            // }
        }
    }

    async run(receivedCommandArgs, message, applicationCache)
    {
        let teamRosterObject = this.getTeamRosterObject(message);
        return constructEmbeddedDiscordMessage(teamRosterObject.getDisplayObjects());
    }

    async getTeamRosterObject(message)
    {
        let playersToUse = Array.from(message.mentions.users, (([userId, userObject]) => userId));
        return await teamBuilder.run(playersToUse);
    }
}

module.exports = GenerateTeamCommand.getExportObject();