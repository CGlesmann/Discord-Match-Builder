const { BaseCommand } = require("../commandStructure/baseCommand.js");
const { MessageSelectMenu, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { COMMAND_CLASS_KEY } = require("../modules/commandParser.js");

const generateMapModule = require("./generateMap.js");
const generateTeamModule = require("./generateTeams.js");

const { moveDiscordMembersToTeamVoiceChannels } = require("../modules/discordVoiceChannelManager.js");
const { constructEmbeddedDiscordMessage } = require("../modules/discordPrinter.js");
const { getAllGames } = require("../modules/salesforceDataReader.js");

const { GENERATED_TEAMS_CACHE_KEY, ALL_GAMES_CACHE_KEY } = require("../utils/Constants.js");

class GenerateMatchCommand extends BaseCommand
{
    constructor()
    {
        super();

        this.COMMAND_NAME = "generateMatch";
        this.COMMAND_ARGS = {
            // p: {
            //     helpText: "A comma seperated list of human players to use",
            //     validateErrorText: "Enter a comma seperated list of player names (must match the name in the config)",
            //     validate: function (agrumentStringValue)
            //     {
            //         let argumentStringArray = agrumentStringValue.split(",");
            //         let amountOfValidNumbers = 0;

            //         argumentStringArray.forEach((value) =>
            //         {
            //             if (value)
            //             {
            //                 amountOfValidNumbers++;
            //             }
            //         })

            //         return (
            //             argumentStringArray &&
            //             argumentStringArray.length > 0 &&
            //             amountOfValidNumbers === argumentStringArray.length
            //         );
            //     }
            // }
        }
    }

    async run(receivedCommandArgs, message, applicationCache)
    {
        if (!message.mentions.users || message.mentions.users.size === 0)
        {
            throw { message: "Please Tag at least 1 User" };
        }

        let lastGeneratedMatches = applicationCache.get(GENERATED_TEAMS_CACHE_KEY)?.get(message.id);
        if (lastGeneratedMatches && lastGeneratedMatches.generatedTeams)
        {
            let targetGameData = lastGeneratedMatches.generatedTeams[0].game;

            let { generatedMatch } = await this.generateMatchData(receivedCommandArgs, message, targetGameData);

            this.addGeneratedTeamsToCache(applicationCache, message.id, generatedMatch);
            let currentMatchCount = this.getMatchCountByMessageId(applicationCache, message.id);

            return {
                embeds: [this.generateMatchDisplayEmbed(currentMatchCount, generatedMatch)],
                components: [this.generateVoiceChatActionRow(message.id)]
            }
        }

        let gameSelectScreen = await this.constructGameSelectScreen(message, applicationCache);
        if (!gameSelectScreen) { return; }

        let filter = (interaction) => interaction.isSelectMenu() && interaction.customId === 'SelectGame';
        let collector = message.channel.createMessageComponentCollector({ filter, max: "1" })

        collector.on('collect', async (interaction) =>
        {
            let targetGameId = interaction.values[0];
            let targetGameData = applicationCache.get(ALL_GAMES_CACHE_KEY).get(targetGameId);

            let { generatedMatch } = await this.generateMatchData(receivedCommandArgs, message, targetGameData);

            this.addGeneratedTeamsToCache(applicationCache, message.id, generatedMatch);
            let currentMatchCount = this.getMatchCountByMessageId(applicationCache, message.id);

            interaction.update({
                embeds: [this.generateMatchDisplayEmbed(currentMatchCount, generatedMatch)],
                components: [this.generateVoiceChatActionRow(message.id)]
            });
        });

        return gameSelectScreen;
    }

    async constructGameSelectScreen(message, applicationCache)
    {
        let requiredPlayerCount = message.mentions.users.size;
        let allGames = await getAllGames(requiredPlayerCount);

        if (!allGames || allGames.length === 0)
        {
            const testEmbed = new MessageEmbed();
            testEmbed.setTitle('No Games');
            testEmbed.setDescription(`No games were found on the server that can be played with ${requiredPlayerCount} player(s)`);

            message.channel.send({
                embeds: [testEmbed]
            });

            return null;
        }

        let options = [];

        let gameIdToGameInfoMap = new Map();
        for (let game of allGames)
        {
            console.log(`${game.gameDescription} (${game.minTeamSize * game.minTeamCount} - ${game.maxTeamSize * game.maxTeamCount} Players)`);
            gameIdToGameInfoMap.set(game.gameId, game);
            options.push({
                label: game.gameName,
                value: game.gameId,
                description: `${game.gameDescription} (${game.minTeamSize * game.minTeamCount} - ${game.maxTeamSize * game.maxTeamCount} Players)`
            });
        }
        applicationCache.set(ALL_GAMES_CACHE_KEY, gameIdToGameInfoMap);

        const testMultiSelectMenu = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId('SelectGame')
                .setPlaceholder('Select a Game')
                .addOptions(options)
        );

        const testEmbed = new MessageEmbed();
        testEmbed.setTitle('Select Game');
        testEmbed.setDescription(`${allGames.length} games were found. Please select a game in order to generate a match.`);

        return {
            embeds: [testEmbed],
            components: [testMultiSelectMenu]
        };
    }

    async generateMatchData(receivedCommandArgs, message, targetGameData)
    {
        let messagePromises = [];

        const generateMap = new generateMapModule[COMMAND_CLASS_KEY]();
        messagePromises.push(generateMap.getRandomMap(this.getPlayerCount(message), targetGameData.gameId));

        const generateTeams = new generateTeamModule[COMMAND_CLASS_KEY]();
        messagePromises.push(generateTeams.getTeamRosterObject(message, targetGameData));

        let allGeneratedObjects = await Promise.all(messagePromises); // Each command returns their own array, combine the two arrays into one

        allGeneratedObjects[1].setMap(allGeneratedObjects[0]);
        return {
            generatedMatch: allGeneratedObjects[1]
        };
    }

    generateMatchDisplayEmbed(currentMatchCount, generatedMatch)
    {
        const matchDisplayEmbed = constructEmbeddedDiscordMessage([{
            title: `(${currentMatchCount}/${currentMatchCount}) New Match - ${generatedMatch.game.gameName}`,
            description: "Waiting for the match to begin... Select 'Start Game' to send all the players to their respective voice chats. Alternatively, select \"Generate Another Set\" to create additional team options"
        }])[0];

        matchDisplayEmbed.addFields(generatedMatch.getMatchDisplay());

        // Check for nick and lance
        for (let generatedTeam of generatedMatch.teams)
        {
            let nickPresent = false, lancePresent = false;
            for (let generatedPlayer of generatedTeam.teamMembers)
            {
                if (generatedPlayer.teamMemberName === 'Lance')
                    lancePresent = true
                if (generatedPlayer.teamMemberName === 'Nick')
                    nickPresent = true
            }

            if (nickPresent && lancePresent)
            {
                matchDisplayEmbed.addField("⚠ WARNING ⚠", "NICK AND LANCE ARE ON THE SAME TEAM, REGENERATION RECOMMENDED", false);
            }
        }


        matchDisplayEmbed.setThumbnail(`${generatedMatch.game.gameLogoURL}`);

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

    getPlayerCount(message)
    {
        return message.mentions.users.size;
        // let commandKeys = Object.keys(this.COMMAND_ARGS);
        // return this.getCommandArgument(commandKeys[0], receivedCommandArgs, (argumentString) =>
        // {
        //     let stringArray = argumentString.split(",");
        //     return stringArray.length;
        // });
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