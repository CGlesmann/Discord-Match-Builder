const { constructEmbeddedDiscordMessage, sendEmbeddedDiscordMessage } = require("./discordPrinter.js");

const COMMAND_PREFIX = "$";
const COMMAND_NOT_FOUND_CODE = "MODULE_NOT_FOUND";

function checkUserMessageForCommand(message)
{
    if (isCommandMessage(message.content))
    {
        const [commandName, ...commandArgs] = parseUserMessageContent(message.content);
        tryRunCommand(message, commandName, constructCommandArgumentMap(commandArgs));
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

function tryRunCommand(message, commandName, commandArgsMap)
{
    try
    {
        const command = require(`../commands/${commandName}.js`);

        const validateCommandResult = command.validate(commandArgsMap);
        if (validateCommandResult)
        {
            sendEmbeddedDiscordMessage([validateCommandResult], message.channel);
            return;
        }

        let commandOutput = command.run(commandArgsMap);
        if (commandOutput)
        {
            sendEmbeddedDiscordMessage([commandOutput], message.channel);
            return;
        }
    }
    catch (commandError)
    {
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
        let embeddedErrorMessage = constructEmbeddedDiscordMessage("Command Error", {
            name: "Command Not Found",
            value: [`Couldn't find a command named ${commandName}`]
        });
        sendEmbeddedDiscordMessage([embeddedErrorMessage], channel);
    }
    else
    {
        console.log(commandError);

        let embeddedErrorMessage = constructEmbeddedDiscordMessage("Command Error", {
            name: "Unexpected Error",
            value: [`Uncaught error while running the ${commandName} command: ${commandError.message}. See logs for me info.`]
        });
        sendEmbeddedDiscordMessage([embeddedErrorMessage], channel);
    }
}

module.exports = { checkUserMessageForCommand };