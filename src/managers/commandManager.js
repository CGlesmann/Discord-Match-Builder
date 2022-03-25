const { constructEmbeddedDiscordMessage, sendEmbeddedDiscordMessage } = require("../modules/discordPrinter.js");

const COMMAND_PREFIX = "$";
const COMMAND_CLASS_KEY = "commandClass";
const COMMAND_NOT_FOUND_CODE = "MODULE_NOT_FOUND";

async function processTextMessage(message)
{
    if (isCommandMessage(message.content))
    {
        const [commandName, ...commandArgs] = parseUserMessageContent(message.content);

        const commandOutput = await validateAndExecuteCommand(message, commandName, constructCommandArgumentMap(commandArgs));
        if (commandOutput)
        {
            message.channel.send(commandOutput);
            return;
        }
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

async function validateAndExecuteCommand(message, commandName, commandArgsMap)
{
    const commandClassInstance = fetchCommandClassInstance(message, commandName);
    if (isCommandInputValid(message, commandClassInstance, commandArgsMap))
    {
        return await executeCommand(message, commandClassInstance, commandArgsMap);
    }

    return null;
}

function fetchCommandClassInstance(message, commandName)
{
    let COMMAND_INSTANCE;
    try
    {
        const COMMAND_MODULE_OBJECT = require(`../commands/${commandName}.js`);
        const COMMAND_CLASS = COMMAND_MODULE_OBJECT[COMMAND_CLASS_KEY];

        COMMAND_INSTANCE = new COMMAND_CLASS();
    }
    catch (commandError)
    {
        console.log(commandError);
        handleCommandError(message.channel, commandName, commandError);
    }

    return COMMAND_INSTANCE;
}

function isCommandInputValid(message, commandClassInstance, commandArgsMap)
{
    const validateCommandResult = commandClassInstance.validate(commandArgsMap);
    if (validateCommandResult)
    {
        message.channel.send({
            embeds: validateCommandResult
        });

        return false;
    }

    return true;
}

async function executeCommand(message, commandClassInstance, commandArgsMap)
{
    return await commandClassInstance.run(commandArgsMap, message);
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
        channel.send({
            embeds: constructEmbeddedDiscordMessage([{
                title: "Command Not Found",
                description: `Couldn't find a command named ${commandName}`
            }])
        });
    }
    else
    {
        channel.send({
            embeds: constructEmbeddedDiscordMessage([{
                title: "Unexpected Error",
                description: `Error while running the ${commandName} command \n\n${commandError.message}. \n\nSee logs for more info.`
            }])
        });
    }
}

module.exports = {
    COMMAND_PREFIX, COMMAND_CLASS_KEY,
    fetchCommandClassInstance, processTextMessage,
    parseUserMessageContent, constructCommandArgumentMap
};