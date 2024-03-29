const { constructEmbeddedDiscordMessage } = require("../../interfaces/discordInterface.js");
const { COMMAND_CLASS_KEY, COMMAND_PREFIX } = require("../../managers/commandManager.js");

class BaseCommand
{
    constructor()
    {
        this.COMMAND_ARGS = {};
        this.COMMAND_NAME = "baseCommand";
    }

    static getExportObject()
    {
        let exportObject = {};
        exportObject[COMMAND_CLASS_KEY] = this;

        return exportObject;
    }

    async run()
    {
        throw { message: "This command has not been implemented!" };
    }

    help()
    {
        return constructEmbeddedDiscordMessage(
            [
                {
                    title: `${COMMAND_PREFIX}${this.COMMAND_NAME}`,
                    description: Object.keys(this.COMMAND_ARGS).map((commandKey) => { return `${commandKey} - ${this.COMMAND_ARGS[commandKey].helpText}` }).join()
                }
            ]
        );
    }

    validate(receivedCommands)
    {
        if (receivedCommands.size !== Object.keys(this.COMMAND_ARGS).length)
        {
            let commaSeperatedArgumentList = Object.keys(this.COMMAND_ARGS).reduce((accumulator, currentValue) => accumulator += `${currentValue},`, "");
            commaSeperatedArgumentList = commaSeperatedArgumentList.slice(0, commaSeperatedArgumentList.length - 1);

            return constructEmbeddedDiscordMessage(
                [
                    {
                        title: "Missing Arguments",
                        description: `Please ensure all the following commands are provided along with valid values for each: ${commaSeperatedArgumentList}`
                    }
                ]
            );
        }

        for (let expectedArgumentKey in this.COMMAND_ARGS)
        {
            let stringArgumentValue = receivedCommands.get(expectedArgumentKey);
            let validateCallback = this.COMMAND_ARGS[expectedArgumentKey].validate;

            if (validateCallback && !validateCallback(stringArgumentValue))
            {
                return constructEmbeddedDiscordMessage(
                    [
                        {
                            title: "Invalid Argument Value",
                            description: `Invalid value for the ${expectedArgumentKey} argument: ${this.COMMAND_ARGS[expectedArgumentKey].validateErrorText}`
                        }
                    ]
                );
            }
        }

        return null;
    }

    getCommandArgument(argumentKey, commandArgs, parseCallbackFunction)
    {
        return parseCallbackFunction(commandArgs.get(argumentKey));
    }
}

module.exports = { BaseCommand }