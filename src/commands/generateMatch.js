const { constructEmbeddedDiscordMessage } = require("../modules/discordPrinter.js");

const generateTeams = require("./generateTeams.js");
const generateMap = require("./generateMap.js");

const COMMAND_ARGS = {
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
    },
    c: {
        helpText: "The amount of players the map needs to accommodate",
        validateErrorText: "Enter a whole number greater than 0",
        validate: function (agrumentStringValue)
        {
            let numericValue = Number(agrumentStringValue);
            return (numericValue && numericValue > 0);
        }
    }
}

async function run(commandArgs)
{
    let messagePromises = [];

    messagePromises.push(generateMap.run(commandArgs));
    messagePromises.push(generateTeams.run(commandArgs));

    return await Promise.all(messagePromises);
}

function help()
{
    return constructEmbeddedDiscordMessage(
        "",
        {
            name: "$generateMatch",
            value: Object.keys(COMMAND_ARGS).map((value) => { return `${value} - ${COMMAND_ARGS[value].helpText}` })
        }
    );
}

function validate(commandArgs)
{
    if (commandArgs.size !== Object.keys(COMMAND_ARGS).length)
    {
        let commaSeperatedArgumentList = Object.keys(COMMAND_ARGS).reduce((accumulator, currentValue) => accumulator += `${currentValue},`, "");
        commaSeperatedArgumentList = commaSeperatedArgumentList.slice(0, commaSeperatedArgumentList.length - 2);

        return constructEmbeddedDiscordMessage(
            "Command Error",
            {
                name: "Missing Arguments",
                value: [
                    `Please ensure all the following commands are provided along with valid values for each: ${commaSeperatedArgumentList}`
                ]
            }
        );
    }

    for (let expectedArgumentKey in COMMAND_ARGS)
    {
        let stringArgumentValue = commandArgs.get(expectedArgumentKey);
        let validateCallback = COMMAND_ARGS[expectedArgumentKey].validate;

        if (validateCallback && !validateCallback(stringArgumentValue))
        {
            return constructEmbeddedDiscordMessage(
                "Command Error",
                {
                    name: "Invalid Argument Value",
                    value: [
                        `Invalid value for the ${expectedArgumentKey} argument: ${COMMAND_ARGS[expectedArgumentKey].validateErrorText}`
                    ]
                }
            );;
        }
    }

    return null;
}

function getCommandArgument(argumentKey, commandArgs, parseCallbackFunction)
{
    return parseCallbackFunction(commandArgs.get(argumentKey));
}

module.exports = { run, help, validate };