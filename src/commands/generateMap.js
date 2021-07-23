const { constructEmbeddedDiscordMessage } = require("../modules/discordPrinter.js");
const { getAllApprovedMaps } = require("../modules/salesforceDataReader.js");

const COMMAND_ARGS = {
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
    let commandKeys = Object.keys(COMMAND_ARGS);

    let playerCount = getCommandArgument(commandKeys[0], commandArgs, (argumentString) => { return Number(argumentString); });
    let approvedMapArray = await getAllApprovedMaps(), selectedMap = "", closetIndex = -1, closetDifference = Infinity;
    for (let i = 0; i < approvedMapArray.length; i++)
    {
        let value = approvedMapArray[i];
        let difference = playerCount - value.maxPlayerCount;

        if (difference == 0)
        {
            selectedMap = value.mapNames[Math.floor(Math.random() * value.mapNames.length)];
            break;
        }
        else if (difference < 0)
        {
            if (Math.abs(difference) < closetDifference)
            {
                closetIndex = i;
                closetDifference = Math.abs(difference);
            }
        }
    };

    if (!selectedMap)
    {
        selectedMap = approvedMapArray[closetIndex].mapNames[Math.floor(Math.random() * approvedMapArray[closetIndex].mapNames.length)];
    }

    return constructEmbeddedDiscordMessage(
        "",
        {
            name: "Map",
            value: [
                `${selectedMap}`
            ]
        }
    );
}

function help()
{
    return constructEmbeddedDiscordMessage(
        "",
        {
            name: "$generateMap",
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