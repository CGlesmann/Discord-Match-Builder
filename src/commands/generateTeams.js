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
            p: {
                helpText: "A comma seperated list of human players to use",
                validateErrorText: "Enter a comma seperated list of player names (must match the name in the config)",
                validate: function (agrumentStringValue)
                {
                    let argumentStringArray = agrumentStringValue.split(",");
                    let amountOfValidNumbers = 0;

                    argumentStringArray.forEach((value) =>
                    {
                        if (value)
                        {
                            amountOfValidNumbers++;
                        }
                    })

                    return (
                        argumentStringArray &&
                        argumentStringArray.length > 0 &&
                        amountOfValidNumbers === argumentStringArray.length
                    );
                }
            },
            a: {
                helpText: "A whole number representing the AI Count",
                validateErrorText: "Enter a whole number thats equal or more than 0",
                validate: function (agrumentStringValue)
                {
                    return agrumentStringValue && !isNaN(Number(agrumentStringValue));
                }
            },
            t: {
                helpText: "A comma seperated list of team sizes",
                validateErrorText: "Enter a comma seperated list of whole number above 0",
                validate: function (agrumentStringValue)
                {
                    let argumentStringArray = agrumentStringValue.split(",");
                    let amountOfValidNumbers = 0;

                    argumentStringArray.forEach((value) =>
                    {
                        if (!isNaN(Number(value)))
                        {
                            amountOfValidNumbers++;
                        }
                    })

                    return (
                        argumentStringArray &&
                        argumentStringArray.length > 0 &&
                        amountOfValidNumbers === argumentStringArray.length
                    );
                }
            }
        }
    }

    async run(receivedCommandArgs)
    {
        let commandKeys = Object.keys(this.COMMAND_ARGS);

        let playersToUse = this.getCommandArgument(commandKeys[0], receivedCommandArgs, (argumentString) => { return argumentString.split(","); });
        let amountOfAI = this.getCommandArgument(commandKeys[1], receivedCommandArgs, (argumentString) => { return Number(argumentString); });
        let teamRosterConfig = this.getCommandArgument(commandKeys[2], receivedCommandArgs, (argumentString) =>
        {
            let stringArray = argumentString.split(",");
            return stringArray.map((value) => Number(value));
        });

        let resultTeamValues = await teamBuilder.run(playersToUse, teamRosterConfig, { aiCount: amountOfAI });
        return constructEmbeddedDiscordMessage("Generated Teams", resultTeamValues);
    }
}

module.exports = GenerateTeamCommand.getExportObject();