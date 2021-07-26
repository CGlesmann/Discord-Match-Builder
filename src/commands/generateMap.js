const { BaseCommand } = require("../commandStructure/baseCommand.js");
const { constructEmbeddedDiscordMessage } = require("../modules/discordPrinter.js");
const { getAllApprovedMaps } = require("../modules/salesforceDataReader.js");

class GenerateMapCommand extends BaseCommand
{
    constructor()
    {
        super();

        this.COMMAND_NAME = "generateMap";
        this.COMMAND_ARGS = {
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
    }

    async run(receivedCommandArgs)
    {
        let commandKeys = Object.keys(this.COMMAND_ARGS);

        let playerCount = this.getCommandArgument(commandKeys[0], receivedCommandArgs, (argumentString) => { return Number(argumentString); });
        let approvedMapArray = await getAllApprovedMaps();

        return constructEmbeddedDiscordMessage(
            "",
            {
                name: "Map",
                value: [
                    `${this.getRandomMap(approvedMapArray, playerCount)}`
                ]
            }
        );
    }

    getRandomMap(allApprovedMapObjects, playerCount)
    {
        let selectedMap = "", closetIndex = -1, closetDifference = Infinity;

        for (let i = 0; i < allApprovedMapObjects.length; i++)
        {
            let value = allApprovedMapObjects[i];
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
            selectedMap = allApprovedMapObjects[closetIndex].mapNames[Math.floor(Math.random() * allApprovedMapObjects[closetIndex].mapNames.length)];
        }

        return selectedMap;
    }
}

module.exports = GenerateMapCommand.getExportObject();