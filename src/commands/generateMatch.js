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
            }
        }
    }

    async run(receivedCommandArgs, message, applicationCache)
    {
        let { generatedMatch } = await this.generateMatchData(receivedCommandArgs);

        this.addGeneratedTeamsToCache(applicationCache, message.id, generatedMatch);
        let currentMatchCount = this.getMatchCountByMessageId(applicationCache, message.id);

        return {
            embeds: [this.generateMatchDisplayEmbed(currentMatchCount, generatedMatch)],
            components: [this.generateVoiceChatActionRow(message.id)]
        };
    }

    async generateMatchData(receivedCommandArgs)
    {
        let messagePromises = [];

        const generateMap = new generateMapModule[COMMAND_CLASS_KEY]();
        messagePromises.push(generateMap.getRandomMap(this.getPlayerCount(receivedCommandArgs)));

        const generateTeams = new generateTeamModule[COMMAND_CLASS_KEY]();
        messagePromises.push(generateTeams.getTeamRosterObject(receivedCommandArgs));

        let allGeneratedObjects = await Promise.all(messagePromises); // Each command returns their own array, combine the two arrays into one

        allGeneratedObjects[1].setMap(allGeneratedObjects[0]);
        return {
            generatedMatch: allGeneratedObjects[1]
        };
    }

    generateMatchDisplayEmbed(currentMatchCount, generatedMatch)
    {
        const matchDisplayEmbed = constructEmbeddedDiscordMessage([{
            title: `(${currentMatchCount}/${currentMatchCount}) New Match - Starcraft 2`,
            description: "Waiting for the match to begin... Select 'Start Game' to send all the players to their respective voice chats. Alternatively, select \"Generate Another Set\" to create additional team options"
        }])[0];

        matchDisplayEmbed.addFields(generatedMatch.getMatchDisplay());
        matchDisplayEmbed.setThumbnail('https://www.vhv.rs/dpng/d/544-5444215_logo-starcraft-2-hd-png-download.png');

        return matchDisplayEmbed;
    }

    generateVoiceChatActionRow(messageId)
    {
        const actionRow = new MessageActionRow()
            .addComponents(new MessageButton()
                .setCustomId('ScrollTeamViewLeft:' + messageId)
                .setLabel('◀')
                .setStyle("PRIMARY")
                .setDisabled(true)
            ).addComponents(new MessageButton()
                .setCustomId('RegenerateTeams:' + messageId)
                .setLabel('Generate Another Set')
                .setStyle("PRIMARY")
            ).addComponents(new MessageButton()
                .setCustomId('ScrollTeamViewRight:' + messageId)
                .setLabel('▶')
                .setStyle("PRIMARY")
                .setDisabled(true)
            ).addComponents(new MessageButton()
                .setCustomId('ConfigureVoiceChat:' + messageId)
                .setLabel('Start Game')
                .setStyle("SUCCESS")
            );

        return actionRow;
    }

    getPlayerCount(receivedCommandArgs)
    {
        let commandKeys = Object.keys(this.COMMAND_ARGS);
        return this.getCommandArgument(commandKeys[0], receivedCommandArgs, (argumentString) =>
        {
            let stringArray = argumentString.split(",");
            return stringArray.length;
        });
    }

    getMatchCountByMessageId(applicationCache, messageId)
    {
        let currentGeneratedTeamsMap = applicationCache.get(GENERATED_TEAMS_CACHE_KEY);
        if (currentGeneratedTeamsMap === undefined) { return 0; }

        let currentTeamsByMessageId = currentGeneratedTeamsMap.get(messageId);
        if (currentTeamsByMessageId === undefined || !currentTeamsByMessageId.generatedTeams.length) { return 0; }

        return currentTeamsByMessageId.generatedTeams.length;
    }

    addGeneratedTeamsToCache(applicationCache, messageId, generatedTeams)
    {
        let currentGeneratedTeamsMap = applicationCache.get(GENERATED_TEAMS_CACHE_KEY);
        if (currentGeneratedTeamsMap === undefined)
        {
            let newGeneratedTeamsMap = new Map();

            newGeneratedTeamsMap.set(messageId, {
                currentDisplayedTeamIndex: 0,
                generatedTeams: [generatedTeams],
            });
            applicationCache.set(GENERATED_TEAMS_CACHE_KEY, newGeneratedTeamsMap);

            return;
        }

        let generatedTeamObject = currentGeneratedTeamsMap.get(messageId);
        if (generatedTeamObject === undefined)
        {
            let newGeneratedTeamObject = {
                currentDisplayedTeamIndex: 0,
                generatedTeams: [generatedTeams]
            };
            currentGeneratedTeamsMap.set(messageId, newGeneratedTeamObject);
            return;
        }

        let generatedTeamsArray = generatedTeamObject.generatedTeams;
        generatedTeamsArray.push(generatedTeams);
        generatedTeamObject.currentDisplayedTeamIndex = generatedTeamsArray.length - 1;

        return;
    }
}

module.exports = GenerateMatchCommand.getExportObject();