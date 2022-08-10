const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require("discord.js");
const { ApplicationCacheManager } = require("../../managers/applicationCacheManager");
const { InteractionLabelBuilder, InteractionLabelInfo } = require("../../interactions/base/InteractionLabelBuilder");

const { APPLICATION_CACHE_KEYS } = require("../../utils/Constants.js");

class SelectGameScreen
{
    selectGameScreenOptions
    message;

    gameIdToGameInfoMap;
    selectGameOptionWrappers;

    constructor(selectGameScreenOptions)
    {
        this.selectGameScreenOptions = selectGameScreenOptions;
    }

    async getSelectGameScreenDisplay(message)
    {
        this.message = message;
        await this.constructScreenFromMessage();

        const gameSelectComponent = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId(InteractionLabelBuilder.getInteractionLabel(new InteractionLabelInfo(this.selectGameScreenOptions.baseInteractionLabel, [message.id])))
                .setPlaceholder('Select a Game')
                .addOptions(this.selectGameOptionWrappers)
        );

        const selectGameMessageEmbed = new MessageEmbed();
        selectGameMessageEmbed.setTitle('Select Game');
        selectGameMessageEmbed.setDescription(`${this.selectGameOptionWrappers.length} games were found. Please select a game in order to continue.`);

        return {
            embeds: [selectGameMessageEmbed],
            components: [gameSelectComponent]
        };
    }

    async constructScreenFromMessage()
    {
        if (this.noGameReturned())
        {
            this.displayNoAvailableGamesMessage();
            return;
        }

        this.processGameDataServerResponse();
    }

    noGameReturned()
    {
        return (!this.selectGameScreenOptions.availableGameData || this.selectGameScreenOptions.availableGameData.length === 0);
    }

    displayNoAvailableGamesMessage()
    {
        const testEmbed = new MessageEmbed();
        testEmbed.setTitle('No Games');
        testEmbed.setDescription(`No games were found on the server that can be played with ${this.message.mentions.users.size} player(s)`);

        this.message.channel.send({
            embeds: [testEmbed]
        });
    }

    processGameDataServerResponse()
    {
        this.gameIdToGameInfoMap = ApplicationCacheManager.retrieveCacheData(APPLICATION_CACHE_KEYS.ALL_GAME_DATA) || new Map();
        this.selectGameOptionWrappers = [];

        for (let game of this.selectGameScreenOptions.availableGameData)
        {
            let playerCountString = this.getGamePlayerCountDisplayValue(game);

            this.gameIdToGameInfoMap.set(`${game.gameId}`, game);
            this.selectGameOptionWrappers.push({
                label: `${game.gameName} (${playerCountString})`,
                value: `${game.gameId}`,
                description: `${game.gameDescription}`
            });
        }

        ApplicationCacheManager.addDataToCache(
            APPLICATION_CACHE_KEYS.ALL_GAME_DATA,
            this.gameIdToGameInfoMap
        );
    }

    getGamePlayerCountDisplayValue(game)
    {
        if (Number(game.minPlayerCount) != Number(game.maxPlayerCount))
        {
            return `${game.minPlayerCount} - ${game.maxPlayerCount} Players`;
        }

        // For games that don't support a range of players, just display one number
        return `${game.maxPlayerCount} Players`;
    }
}

class SelectGameScreenOptions
{
    availableGameData;
    baseInteractionLabel;

    minimumGamesToSelect;
    maximumGamesToSelect;

    constructor(availableGameData, baseInteractionLabel)
    {
        this.availableGameData = availableGameData;
        this.baseInteractionLabel = baseInteractionLabel;

        this.minimumGamesToSelect = 1;
        this.maximumGamesToSelect = 1;
    }

    setMinGameSelectCount(newMinGameCount) { this.minimumGamesToSelect = newMinGameCount; }
    setMaxGameSelectCount(newMaxGameCount) { this.maximumGamesToSelect = newMaxGameCount; }
}

module.exports = { SelectGameScreen, SelectGameScreenOptions }