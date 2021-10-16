const { constructEmbeddedDiscordMessage, sendEmbeddedDiscordMessage } = require("./discordPrinter.js");

const COMMAND_PREFIX = "$";
const COMMAND_CLASS_KEY = "commandClass";
const COMMAND_NOT_FOUND_CODE = "MODULE_NOT_FOUND";

function checkUserMessageForCommand(message, applicationCache)
{
    if (isCommandMessage(message.content))
    {
        const [commandName, ...commandArgs] = parseUserMessageContent(message.content);
        tryRunCommand(message, commandName, constructCommandArgumentMap(commandArgs), applicationCache);
    }
}

function isCommandMessage(content)
{
    return content.startsWith(COMMAND_PREFIX);
}

function parseUserMessageContent(content)
{
    return content.trim()
        .substring(COMMAND_PREFIX.length)
        .split(/\s+/);
}

async function tryRunCommand(message, commandName, commandArgsMap, applicationCache)
{
    try
    {
        const COMMAND_MODULE_OBJECT = require(`../commands/${commandName}.js`);
        const COMMAND_CLASS = COMMAND_MODULE_OBJECT[COMMAND_CLASS_KEY];
        const COMMAND = new COMMAND_CLASS();

        const validateCommandResult = COMMAND.validate(commandArgsMap);
        if (validateCommandResult)
        {
            message.channel.send({
                embeds: validateCommandResult
            });
            return;
        }

        let commandOutput = await COMMAND.run(commandArgsMap, message, applicationCache);
        if (commandOutput)
        {
            message.channel.send(commandOutput);
            return;
        }
    }
    catch (commandError)
    {
        //console.log(commandError);
        handleCommandError(message.channel, commandName, commandError);
    }
}

function constructCommandArgumentMap(argumentArray)
{
    let argsMap = new Map();
    argumentArray.forEach((value) =>
    {
        let argsKeyValuePair = value.split(":");
        if (isValidArgument(argsKeyValuePair))
        {
            argsMap.set(argsKeyValuePair[0], argsKeyValuePair[1]);
        }
    });

    return argsMap;
}

function isValidArgument(argsKeyValuePair)
{
    return (argsKeyValuePair.length === 2 && argsKeyValuePair[0] && argsKeyValuePair[1]);
}

function handleCommandError(channel, commandName, commandError)
{
    if (commandError.code === COMMAND_NOT_FOUND_CODE)
    {
        let embeddedErrorMessage = constructEmbeddedDiscordMessage([{
            title: "Command Not Found",
            description: `Couldn't find a command named ${commandName}`
        }]);

        // sendEmbeddedDiscordMessage(embeddedErrorMessage, channel);
        channel.send({
            embeds: embeddedErrorMessage
        });
    }
    else
    {
        console.log(commandError);

        let embeddedErrorMessage = constructEmbeddedDiscordMessage([{
            title: "Unexpected Error",
            description: `Uncaught error while running the ${commandName} command \n\n${commandError.message}. \n\nSee logs for more info.`
        }]);

        // sendEmbeddedDiscordMessage(embeddedErrorMessage, channel);
        channel.send({
            embeds: embeddedErrorMessage
        });
    }
}

module.exports = {
    COMMAND_PREFIX, COMMAND_CLASS_KEY,
    checkUserMessageForCommand, parseUserMessageContent, constructCommandArgumentMap
};