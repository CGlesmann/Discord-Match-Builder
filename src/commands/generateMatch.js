const { BaseCommand } = require("../commandStructure/baseCommand.js");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { COMMAND_CLASS_KEY } = require("../modules/commandParser.js");

const generateMapModule = require("./generateMap.js");
const generateTeamModule = require("./generateTeams.js");

const { moveDiscordMembersToTeamVoiceChannels } = require("../modules/discordVoiceChannelManager.js");
const { constructEmbeddedDiscordMessage } = require("../modules/discordPrinter.js");

const GENERATED_TEAMS_CACHE_KEY = "generatedTeams";

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

    async run(receivedCommandArgs, message, applicationCache)
    {
        let messagePromises = [];

        const generateMap = new generateMapModule[COMMAND_CLASS_KEY]();
        messagePromises.push(generateMap.run(this.getPlayerCountMap(receivedCommandArgs)));

        const generateTeams = new generateTeamModule[COMMAND_CLASS_KEY]();
        messagePromises.push(generateTeams.getTeamRosterObject(receivedCommandArgs));

        let allGeneratedObjects = await Promise.all(messagePromises); // Each command returns their own array, combine the two arrays into one
        this.addGeneratedTeamsToCache(applicationCache, message.id, allGeneratedObjects[1].finalTeams);

        const actionRow = this.generateVoiceChatActionRow(message.id);
        const baseEmbed = constructEmbeddedDiscordMessage(allGeneratedObjects[0])[0]; //constructEmbeddedDiscordMessage(allGeneratedObjects[0].concat(allGeneratedObjects[1].getDisplayObjects())),

        for (let teamDisplayObject of allGeneratedObjects[1].getDisplayObjects())
        {
            baseEmbed.addField(teamDisplayObject.title, teamDisplayObject.description, true);
        }

        baseEmbed.addField("Waiting for the match to begin...", "Select 'Start Game' to send all the players to their respective voice chats", false);
        baseEmbed.setThumbnail('https://www.vhv.rs/dpng/d/544-5444215_logo-starcraft-2-hd-png-download.png');

        return {
            embeds: [baseEmbed],
            components: [actionRow]
        };
    }

    generateVoiceChatActionRow(messageId)
    {
        const actionRow = new MessageActionRow()
            .addComponents(new MessageButton()
                .setCustomId('RegenerateTeams:' + messageId)
                .setLabel('Regenerate Teams')
                .setStyle("PRIMARY")
            ).addComponents(new MessageButton()
                .setCustomId('ConfigureVoiceChat:' + messageId)
                .setLabel('Start Game')
                .setStyle("SUCCESS")
            );

        return actionRow;
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

    addGeneratedTeamsToCache(applicationCache, messageId, generatedTeams)
    {
        let generatedTeamsMap = applicationCache.get(GENERATED_TEAMS_CACHE_KEY);
        if (generatedTeamsMap === undefined)
        {
            generatedTeamsMap = new Map();

            generatedTeamsMap.set(messageId, generatedTeams);
            applicationCache.set(GENERATED_TEAMS_CACHE_KEY, generatedTeamsMap);

            return;
        }

        generatedTeamsMap.set(messageId, generatedTeams);
        return;
    }
}

module.exports = GenerateMatchCommand.getExportObject();