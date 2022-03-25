const { BaseCommand } = require("./base/baseCommand.js");
const { MessageSelectMenu, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { COMMAND_CLASS_KEY } = require("../managers/commandManager.js");

const generateMapModule = require("./generateMap.js");
const generateTeamModule = require("./generateTeams.js");

const { ApplicationCacheManager } = require('../managers/applicationCacheManager.js');
const { SelectGameScreen } = require("../ui/screens/SelectGameScreen");
const { constructEmbeddedDiscordMessage } = require("../modules/discordPrinter.js");

const { APPLICATION_CACHE_KEYS } = require("../utils/Constants.js");
const { MatchGenerationRequest } = require("../classes/applicationCacheWrappers/MatchGenerationRequest.js");
const { MatchGenerationRequestList } = require("../classes/applicationCacheWrappers/MatchGenerationRequestList.js");

class GenerateMatchCommand extends BaseCommand
{
    selectGameScreenInstance;

    constructor()
    {
        super();

        this.COMMAND_NAME = "generateMatch";
        this.COMMAND_ARGS = {}
    }

    async run(receivedCommandArgs, message)
    {
        if (!message.mentions.users || message.mentions.users.size === 0)
        {
            throw { message: "Please Tag at least 1 User" };
        }

        this.createMatchGenerationRequest(receivedCommandArgs, message);
        return await this.constructGameSelectScreen(message);

        // let lastGeneratedMatches = ApplicationCacheManager.retrieveCacheData(APPLICATION_CACHE_KEYS.GENERATED_TEAMS)?.get(message.id);
        // if (lastGeneratedMatches && lastGeneratedMatches.generatedTeams)
        // {
        //     let targetGameData = lastGeneratedMatches.generatedTeams[0].game;

        //     let { generatedMatch } = await this.generateMatchData(receivedCommandArgs, message, targetGameData);

        //     this.addGeneratedTeamsToCache(message.id, generatedMatch);
        //     let currentMatchCount = this.getMatchCountByMessageId(message.id);

        //     return {
        //         embeds: [this.generateMatchDisplayEmbed(currentMatchCount, generatedMatch)],
        //         components: [this.generateVoiceChatActionRow(message.id)]
        //     }
        // }

        // let gameSelectScreen = await this.constructGameSelectScreen(message);
        // if (!gameSelectScreen) { return; }

        // let filter = (interaction) => interaction.isSelectMenu() && interaction.customId === 'SelectGame';
        // let collector = message.channel.createMessageComponentCollector({ filter, max: "1" })

        // collector.on('collect', async (interaction) =>
        // {
        //     let targetGameId = interaction.values[0];
        //     let targetGameData = ApplicationCacheManager.retrieveCacheData(APPLICATION_CACHE_KEYS.ALL_GAME_DATA).get(targetGameId);

        //     let { generatedMatch } = await this.generateMatchData(receivedCommandArgs, message, targetGameData);

        //     this.addGeneratedTeamsToCache(message.id, generatedMatch);
        //     let currentMatchCount = this.getMatchCountByMessageId(message.id);

        //     interaction.update({
        //         embeds: [this.generateMatchDisplayEmbed(currentMatchCount, generatedMatch)],
        //         components: [this.generateVoiceChatActionRow(message.id)]
        //     });
        // });

        // return gameSelectScreen;
    }

    createMatchGenerationRequest(receivedCommandArgs, message)
    {
        const newMatchGenerationRequest = new MatchGenerationRequest(receivedCommandArgs, message);

        let matchGenerationList = ApplicationCacheManager.retrieveCacheData(APPLICATION_CACHE_KEYS.MATCH_GENERATION_REQUESTS);
        if (!matchGenerationList)
        {
            matchGenerationList = new MatchGenerationRequestList();

            matchGenerationList.addMatchGenerationRequest(message.id, newMatchGenerationRequest);
            ApplicationCacheManager.addDataToCache(
                APPLICATION_CACHE_KEYS.MATCH_GENERATION_REQUESTS,
                matchGenerationList,
                0
            );

            return;
        }

        matchGenerationList.addMatchGenerationRequest(newMatchGenerationRequest);
        return;
    }

    async constructGameSelectScreen(message)
    {
        this.selectGameScreenInstance = new SelectGameScreen();
        return await this.selectGameScreenInstance.getSelectGameScreenDisplay(message);
    }

    async generateMatchData(receivedCommandArgs, message, targetGameData)
    {
        let messagePromises = [];

        const generateMap = new generateMapModule[COMMAND_CLASS_KEY]();
        messagePromises.push(generateMap.getRandomMap(this.getPlayerCount(message), targetGameData.gameId));

        const generateTeams = new generateTeamModule[COMMAND_CLASS_KEY]();
        messagePromises.push(generateTeams.getTeamRosterObject(message, targetGameData));

        let [generatedMap, generatedMatch] = await Promise.all(messagePromises); // Each command returns their own array, combine the two arrays into one

        generatedMatch.setMap(generatedMap);
        return {
            generatedMatch: generatedMatch
        };
    }

    // generateMatchDisplayEmbed(currentMatchCount, generatedMatch)
    // {
    //     const matchDisplayEmbed = constructEmbeddedDiscordMessage([{
    //         title: `(${currentMatchCount}/${currentMatchCount}) New Match - ${generatedMatch.game.gameName}`,
    //         description: "Waiting for the match to begin... Select 'Start Game' to send all the players to their respective voice chats. Alternatively, select \"Generate Another Set\" to create additional team options"
    //     }])[0];

    //     matchDisplayEmbed.addFields(generatedMatch.getMatchDisplay());
    //     matchDisplayEmbed.setThumbnail(`${generatedMatch.game.gameLogoURL}`);

    //     return matchDisplayEmbed;
    // }

    // generateVoiceChatActionRow(messageId)
    // {
    //     const actionRow = new MessageActionRow()
    //         .addComponents(new MessageButton()
    //             .setCustomId('ScrollTeamViewLeft:' + messageId)
    //             .setLabel('◀')
    //             .setStyle("PRIMARY")
    //             .setDisabled(true)
    //         ).addComponents(new MessageButton()
    //             .setCustomId('RegenerateTeams:' + messageId)
    //             .setLabel('Generate Another Set')
    //             .setStyle("PRIMARY")
    //         ).addComponents(new MessageButton()
    //             .setCustomId('ScrollTeamViewRight:' + messageId)
    //             .setLabel('▶')
    //             .setStyle("PRIMARY")
    //             .setDisabled(true)
    //         ).addComponents(new MessageButton()
    //             .setCustomId('ConfigureVoiceChat:' + messageId)
    //             .setLabel('Start Game')
    //             .setStyle("SUCCESS")
    //         );

    //     return actionRow;
    // }

    getPlayerCount(message)
    {
        return message.mentions.users.size;
    }

    // getMatchCountByMessageId(messageId)
    // {
    //     let currentGeneratedTeamsMap = ApplicationCacheManager.retrieveCacheData(APPLICATION_CACHE_KEYS.GENERATED_TEAMS);
    //     if (currentGeneratedTeamsMap === undefined) { return 0; }

    //     let currentTeamsByMessageId = currentGeneratedTeamsMap.get(messageId);
    //     if (currentTeamsByMessageId === undefined || !currentTeamsByMessageId.generatedTeams.length) { return 0; }

    //     return currentTeamsByMessageId.generatedTeams.length;
    // }

    // addGeneratedTeamsToCache(messageId, generatedTeams)
    // {
    //     let currentGeneratedTeamsMap = ApplicationCacheManager.retrieveCacheData(APPLICATION_CACHE_KEYS.GENERATED_TEAMS);
    //     if (!currentGeneratedTeamsMap)
    //     {
    //         let newGeneratedTeamsMap = new Map();

    //         newGeneratedTeamsMap.set(messageId, {
    //             currentDisplayedTeamIndex: 0,
    //             generatedTeams: [generatedTeams],
    //         });

    //         ApplicationCacheManager.addDataToCache(APPLICATION_CACHE_KEYS.GENERATED_TEAMS, newGeneratedTeamsMap);
    //         return;
    //     }

    //     let generatedTeamObject = currentGeneratedTeamsMap.get(messageId);
    //     if (!generatedTeamObject)
    //     {
    //         let newGeneratedTeamObject = {
    //             currentDisplayedTeamIndex: 0,
    //             generatedTeams: [generatedTeams]
    //         };
    //         currentGeneratedTeamsMap.set(messageId, newGeneratedTeamObject);
    //         return;
    //     }

    //     let generatedTeamsArray = generatedTeamObject.generatedTeams;
    //     generatedTeamsArray.push(generatedTeams);
    //     generatedTeamObject.currentDisplayedTeamIndex = generatedTeamsArray.length - 1;

    //     return;
    // }
}

module.exports = GenerateMatchCommand.getExportObject();