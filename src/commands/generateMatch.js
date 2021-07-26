const { BaseCommand } = require("../commandStructure/baseCommand.js");
const { COMMAND_CLASS_KEY } = require("../modules/commandParser.js");

const generateMapModule = require("./generateMap.js");
const generateTeamModule = require("./generateTeams.js");

class GenerateMatchCommand extends BaseCommand
{
    constructor()
    {
        super();

        this.COMMAND_NAME = "generateMatch";
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
                        if (value)
                        {
                            if (!isNaN(Number(value)))
                            {
                                amountOfValidNumbers++;
                            }
                        }
                    });

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
        let messagePromises = [];

        const generateMap = new generateMapModule[COMMAND_CLASS_KEY]();
        messagePromises.push(generateMap.run(this.getPlayerCountMap(receivedCommandArgs)));

        const generateTeams = new generateTeamModule[COMMAND_CLASS_KEY]();
        messagePromises.push(generateTeams.run(receivedCommandArgs));

        return await Promise.all(messagePromises);
    }

    getPlayerCountMap(receivedCommandArgs)
    {
        let constructedArguments = new Map();

        let commandKeys = Object.keys(this.COMMAND_ARGS);
        constructedArguments.set("c", this.getCommandArgument(commandKeys[2], receivedCommandArgs, (argumentString) =>
        {
            let stringArray = argumentString.split(",");
            return stringArray.reduce((accumulator, currentValue) => accumulator + Number(currentValue), 0);
        }));

        return constructedArguments;
    }
}

module.exports = GenerateMatchCommand.getExportObject();